const connection = require('../database/connection');

// get all locker statuses for a logged-in user
const getLockerStatuses = async (req, res) => {
    try {
        const userId = req.params.userId; // or from auth middleware

        const query = `
            SELECT 
                lr.rental_id,
                lr.locker_id,
                l.locker_number,
                l.location,
                l.status AS locker_status,
                lr.start_date,
                lr.due_date,
                lr.status AS rental_status,
                lr.payment_method,
                lr.total_amount,
                lr.paid_amount,
                lr.balance,
                u.user_id,
                u.stud_id,
                u.f_name,
                u.l_name,
                u.email,
                c.course_name,
                CONCAT('/uploads/profile_pics/', u.user_id, '.jpg') AS profile_pic -- example path
            FROM locker_rentals lr
            JOIN lockers l ON lr.locker_id = l.locker_id
            JOIN users u ON lr.user_id = u.user_id
            JOIN courses c ON u.course_id = c.course_id
            WHERE lr.user_id = ?
            ORDER BY lr.start_date DESC
        `;

        const [rows] = await connection.query(query, [userId]);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
};

// cancel reservation with reason
const cancelReservation = async (req, res) => {
    try {
        const { rentalId, userId, reason } = req.body;

        // update rental status to cancelled
        await connection.query(
            'UPDATE locker_rentals SET status = ? WHERE rental_id = ? AND user_id = ?',
            ['cancelled', rentalId, userId]
        );

        // insert cancellation reason
        await connection.query(
            'INSERT INTO cancellation_reasons (rental_id, user_id, reason) VALUES (?, ?, ?)',
            [rentalId, userId, reason]
        );

        res.json({ message: 'reservation cancelled successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
};

// get payment history
const getPaymentHistory = async (req, res) => {
    try {
        const { rentalId } = req.params;

        const query = `
            SELECT
                status,
                DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
                payment_method,
                balance,
                paid_amount,
                total_amount
            FROM locker_rentals
            WHERE rental_id = ?
        `;

        const [rows] = await connection.query(query, [rentalId]);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
};

module.exports = {
    getLockerStatuses,
    cancelReservation,
    getPaymentHistory
};