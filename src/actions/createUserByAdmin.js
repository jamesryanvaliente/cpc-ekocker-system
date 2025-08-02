const connection = require('../database/connection');
const bcrypt = require('bcrypt');

const createUser = async (username, password, stud_id, f_name, m_name, l_name, gender, course, email, role = 'student') => {
  const conn = await connection.getConnection();
  await conn.beginTransaction();


  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    //console.log('🚀 inserting into accounts...');
    const [accountResult] = await conn.query(
      'INSERT INTO accounts (username, password, role) VALUES (?,?,?)',
      [username, hashedPassword, role]
    );
    const account_id = accountResult.insertId;
    //console.log('✅ account_id:', account_id);

    //console.log('🔍 checking course existence...');
    let [courseRows] = await conn.query(
      'SELECT course_id FROM courses WHERE course_name = ?',
      [course]
    );

    let course_id;
    if (courseRows.length > 0) {
      course_id = courseRows[0].course_id;
      //console.log('✅ existing course_id:', course_id);
    }else {
      //console.log('📥 inserting new course...');
      const [courseResult] = await conn.query(
        'INSERT INTO courses (course_name) VALUES (?)',
        [course]
      );
      course_id = courseResult.insertId;
      //console.log('✅ new course_id:', course_id);
    }
    
    //console.log('👤 inserting user profile...');
    const [userResult] = await conn.query(
      'INSERT INTO users (account_id, course_id, stud_id, f_name, m_name, l_name, gender, email) VALUES (?,?,?,?,?,?,?,?)',
      [account_id, course_id, stud_id, f_name, m_name, l_name, gender, email]
    );

    await conn.commit();
    conn.release();

    //console.log('🎉 user created successfully');
    return {
      user_id: userResult.insertId,
      username, password, stud_id, f_name, m_name, l_name, gender, course, email
    };
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('Error creating account:', error);

    if(error.code === 'ER_DUP_ENTRY'){
      let errorMessage = 'a unique field';
      if(error.message.includes('username')) duplicateField = 'username';
      else if(error.message.includes('email')) duplicateField = 'email';
      else if(error.message.includes('stud_id')) duplicateField = 'student ID';

      return {error: `${duplicateField} already exists`};
    }
    //console.error('❌ Error creating normalized user:', error.sqlMessage || error.message);
    return null;
  }
};

module.exports = createUser;
