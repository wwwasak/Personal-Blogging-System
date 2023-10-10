const SQL = require('sql-template-strings');
const {dbPromise} = require('../db/database.js');

async function searchUsersByAccount(userName,password){
    const db = await dbPromise;
    const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password}`);
    return result;
}

//
async function updateArticle(userid, title, content, categoryid){
    const db = await dbPromise;
    const result = await db.run(SQL`update article set title = ${title}, content = ${content},categoryid = ${categoryid} where userid = ${userid}`);
    return result;
}

// Export functions.
module.exports = {
    searchUsersByAccount,
    updateArticle
};
