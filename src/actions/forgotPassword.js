const connection = require('../database/connection');
const bcrypt = require('bcrypt');

const forgotPassword = async (req, res) => {
  const { stud_id, newPassword } = req.body;

  if(!stud_id || !newPassword){
    return res.status(400).json({error: 'Student ID and new password are required!'});
  }

  if(newPassword.length < 6){
    return res.status(400).json({error: 'Password must be at least 6 characters long!'});
  }

  try {
    const [rows] = await connection.query(`
      SELECT accounts.account_id, accounts.username FROM users
      JOIN accounts ON users.account_id = accounts.account_id
      WHERE users.stud_id = ?`, [stud_id]);

      if(rows.length === 0) {
        return res.status(404).json({error: 'Student ID not found!'});
      }

      const account_id = rows[0].account_id;
      const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await connection.query(
      'UPDATE accounts SET password = ? WHERE account_id = ?',
      [hashedPassword, account_id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update password' });
    }
    
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = forgotPassword;