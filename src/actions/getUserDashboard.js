const connection = require('../database/connection');

const getUserDashboard = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [row] = await connection.query(`
      SELECT users.*, accounts.username, accounts.role, courses.course_name FROM users
      JOIN accounts ON users.account_id = accounts.account_id
      JOIN courses ON users.course_id = courses.course_id
      WHERE users.user_id = ?`, [user_id]);

    if (row.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = row[0];

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getUserDashboard;