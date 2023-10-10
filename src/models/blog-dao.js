const SQL = require('sql-template-strings');
const { dbPromise } = require('../db/database.js');

async function searchUsersByAccount(userName, password) {
    const db = await dbPromise;
    const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password}`);
    return result;
}
// delete article by id  ------txu470
async function deleteArticleById(id) {
    const db = await dbPromise;
    const result = await db.run(SQL`delete from article where id = ${id}`);
    return result;
}
async function searchArticleById(id) {
    const db = await dbPromise;
    const result = await db.all(SQL`select * from article where id = ${id}`);
    return result;
}
// delete comment by id  ------txu470
async function deleteCommentById(id) {
    const db = await dbPromise;
    const result = await db.run(SQL`delete from comments where id = ${id}`);
    return result;
}
async function searchCommentById(id) {
    const db = await dbPromise;
    const result = await db.all(SQL`select * from comments where id = ${id}`);
    return result;
}


// Export functions.
module.exports = {
    searchUsersByAccount,
    deleteArticleById,
    searchArticleById,
    deleteCommentById,
    searchCommentById
};
