const connection = require('../database/connection');

const getUserByStudId = async (req, res) => {
    const {stud_id} = req.params;

    try {
        const [rows] = await connection.query(`
            SELECT users.*, accounts.account_id, accounts.username FROM users
            JOIN accounts ON users.account_id = accounts.account_id
            WHERE users.stud_id = ?`, [stud_id]);

            if (rows.length === 0) {
                return res.status(404).json({error: 'Student ID not found'});
            }

            res.status(200).json({account: rows[0]});
    } catch (error) {
        console.error('Error fetching user by student ID:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = getUserByStudId;