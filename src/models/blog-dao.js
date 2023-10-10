const SQL = require('sql-template-strings');
const {dbPromise} = require('../db/database.js');

async function searchUsersByAccount(userName,password){
    const db = await dbPromise;
    const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password}`);
    return result;
}
async function registerUser(account,password,birthday,description){
    const db = await dbPromise;
    const result = await db.run(SQL`INSERT INTO user (account,password,birthday,description) values (${account},${password},${birthday},${description});`);
    return result;
}

async function deleteUser(id){
    const db = await dbPromise;
    const result = await db.run(SQL`DELETE FROM user WHERE id = ${id};`);
    return result;
}
// Export functions.
module.exports = {
    searchUsersByAccount,
    registerUser,
    deleteUser
};
