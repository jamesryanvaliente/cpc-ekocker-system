const connection = require('../database/connection');

const getAllLockers = async (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM lockers';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        const [rows] = await connection.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
};

module.exports = getAllLockers;