const connection = require('../database/connection');

const expireReservations = async () => {
  try {
    // clear reservations that passed expiry date
    await connection.query(`
      UPDATE lockers
      SET status = 'available',
          reserved_date = NULL,
          reserve_expiry = NULL,
          assigned_to = NULL
      WHERE status = 'reserved' AND reserve_expiry <= NOW()
    `);
    console.log('Expired reservations cleared');
  } catch (error) {
    console.error('Error expiring reservations:', error);
  }
};

module.exports = expireReservations;
