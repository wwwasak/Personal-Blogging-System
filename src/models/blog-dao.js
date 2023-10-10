const SQL = require('sql-template-strings');
const { dbPromise } = require('../db/database.js');

async function searchUsersByAccount(userName, password) {
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

async function updateArticle(userid, title, content, categoryid){
    const db = await dbPromise;
    const result = await db.run(SQL`update article set title = ${title}, content = ${content},categoryid = ${categoryid} where userid = ${userid}`);
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

module.exports = {
    searchUsersByAccount,
  registerUser,
    deleteUser,
  updateArticle,
  deleteArticleById,
    searchArticleById,
    deleteCommentById,
    searchCommentById
};

