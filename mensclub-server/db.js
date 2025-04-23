
const mysql = require("mysql2");

const db = mysql.createPool({
    connectionLimit: 10,
    host: '172.16.221.208',       
    user: 'YUEN',             
    password: '1234',
    port: 3306,
    database: 'user_info' 
  });
  

  db.connect((err) => {
    if (err) {
      console.error('❌ MySQL 연결 실패:', err);
      return;
    }
    console.log('✅ MySQL 연결 성공!');
  });


module.exports = db;
  