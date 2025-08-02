const connection = require('../database/connection');

const addLocker = async (req, res) => {
    const {locker_number, location, remarks} = req.body;

    if(!locker_number) {
        return res.status(400).json({error: 'Locker number is required'});
    }

    try {
        await connection.query(
            'INSERT INTO lockers (locker_number, location, status, remarks) VALUES (?, ?, ?, ?)',
            [locker_number, location || null,  'available', remarks || null]
        );

        res.status(201).json({message: 'Locker added successfully'});

    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({error: 'Locker number already exist'});
        }

        console.error('Error adding locker:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = addLocker