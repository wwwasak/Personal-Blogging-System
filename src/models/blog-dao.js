const SQL = require('sql-template-strings');
const {dbPromise} = require('../db/database.js');

async function searchUsersByAccount(userName,password){
    const db = await dbPromise;
    const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password}`);
    return result;
}
async function searchArticlesByKeyword(keyword) {
    const db = await dbPromise;
    return db.all(SQL`
      SELECT * FROM article WHERE LOWER(title) LIKE ${'%' + keyword.toLowerCase() + '%'}
    `);
  }

async function searchUserArticlesByKeyword(userid, keyword) {
    const db = await dbPromise;
    return db.all(SQL`
      SELECT * FROM article WHERE user_id = ${userid} AND LOWER(title) LIKE ${'%' + keyword.toLowerCase() + '%'}
    `);
  }
  
  

// Export functions.
module.exports = {
    searchUsersByAccount,
    searchArticlesByKeyword,
    searchUserArticlesByKeyword
};
