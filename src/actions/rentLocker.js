const connection = require('../database/connection');

const rentLocker = async (req, res) => {
  const { locker_id, months, paid_months, payment_method} = req.body;
  const user_id = req.user.user_id;

  if(!locker_id || !months || !paid_months || !payment_method) {
    return res.status(400).json({error: 'All fields are required'});
  }

  const ratePerMonth = 60;
  const total = months * ratePerMonth;
  const paid = paid_months * ratePerMonth;
  const balance = total - paid;

  const rentStatus = payment_method === 'qr' ? 'active' : 'pending';
  const lockerStatus = payment_method === 'qr' ? 'rented' : 'pending';

  try {
    //check if the user has 2 rented/pending lockers
    const [userLockers] = await connection.query(
        'SELECT COUNT(*) AS count FROM lockers WHERE assigned_to = ? and status = "rented"',
        [user_id]
    );

    if(userLockers[0].count >= 2) {
        return res.status(400).json({error: 'You have reached the maximum locker rental limit (2)'});
    }

    //check is the locker exists
    const [lockerRows] = await connection.query(
        'SELECT * FROM lockers WHERE locker_id = ?',
        [locker_id]
    );

    if(lockerRows.length === 0) {
        return res.status(404).json({error: 'Locker not found'});
    }

    const locker = lockerRows[0];

    if(locker.status === 'rented') {
        return res.status(400).json({error: 'Locker is already rented'});
    }

    // prevent renting if the locker is reserved
    if(locker.status === 'reserved' && locker.assigned_to !== user_id) {
        return res.status(400).json({error: 'Locker is reserved by another user'});
    }

    // update locker status to rented
    await connection.query(
        `UPDATE lockers
        SET status = ?,
        assigned_to = ?,
        rented_date = NOW(),
        due_date = DATE_ADD(NOW(), INTERVAL ? MONTH)
        WHERE locker_id = ?`,
        [lockerStatus, user_id, months, locker_id]
    );

    //insert into rental lockers
    await connection.query(
      `INSERT INTO locker_rentals
      (locker_id,
      user_id,
      months,
      start_date,
      due_date,
      total_amount,
      paid_amount,
      balance,
      payment_method,
      status)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MONTH), ?, ?, ?, ?, ?)`,
      [locker_id, user_id, months, months, total, paid, balance, payment_method, rentStatus]
    );

    return res.status(200).json({message: `Locker rent ${rentStatus === 'active' ? 'completed' : 'pending approval'}`});

  } catch (error) {
    console.error('Error renting locker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = rentLocker;