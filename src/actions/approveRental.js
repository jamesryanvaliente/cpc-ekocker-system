const connection = require('../database/connection');

const approveRental = async (req, res) => {
    const {rental_id} = req.body;

    if(!rental_id){
        return res.status(400).json({error: 'Rental ID is required'});
    }

    try {
        //check if rental exist and pending
        const [rows] = await connection.query(
        'SELECT * FROM locker_rentals WHERE rental_id = ? AND status = "pending"',
        [rental_id]);

        if(rows.length === 0){
            return res.status(404).json({error: 'Pending rental is not found'});
        }

        const rental = rows[0];

        //update the rental status on locker_rentals
        await connection.query(
            'UPDATE locker_rentals SET status = "active" WHERE rental_id = ?',
            [rental_id]
        );

        //update the rental status on lockers
        await connection.query(
            `UPDATE lockers
            SET status = "rented",
            assigned_to = ?,
            rented_date = ?,
            due_date = ?
            WHERE locker_id = ?`,
            [rental.user_id, rental.start_date, rental.due_date, rental.locker_id]
        );

        res.status(200).json({message: 'Rental approved successfully'});
    } catch (error) {
        console.error('Error approving rental:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = approveRental;