const SQL = require('sql-template-strings');
const { dbPromise } = require('../db/database.js');

// user search, register and delete -------yji413
async function searchUsersByAccount(userName, password) {
  const db = await dbPromise;
  const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password}`);
  return result;
}
async function registerUser(account, password, birthday, description) {
  const db = await dbPromise;
  const result = await db.run(SQL`INSERT INTO user (account,password,birthday,description) values (${account},${password},${birthday},${description});`);
  return result;
}
async function deleteUser(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`DELETE FROM user WHERE id = ${id};`);
  return result;
}

async function updateArticle(userid, title, content, categoryid) {
  const db = await dbPromise;
  const result = await db.run(SQL`update article set title = ${title}, content = ${content}, categoryid = ${categoryid} where userid = ${userid}`);
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

async function searchArticlesByKeyword(keyword) {
  const db = await dbPromise;
  return db.all(SQL`
      SELECT * FROM article WHERE LOWER(title) LIKE ${'%' + keyword.toLowerCase() + '%'}
    `);
}

async function searchArticlesByUserAccount(userAccount) {
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT * FROM article WHERE userid = ${userAccount}`);
  return result;
}
async function searchArticlesByCategoryName(categoryName) {
  const db = await dbPromise;
  const result = await db.all(SQL`
      SELECT article.* 
      FROM article 
      JOIN category ON article.categoryid = category.id 
      WHERE category.name = ${categoryName}
  `);
  return result;
}


//function addArticle by zliu442
async function addArticle(title, content, userid, categoryid) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into article (title, content, userid, categoryid) values
    (${title}, ${content}, ${userid}, ${categoryid})`);
  return result;
}

//function addComment by zliu442
async function addComment(userid, timeDate, content, articleid, commentid) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into comments (user_id, timeDate, content, parentComment, article_id) values
    (${userid}, ${timeDate}, ${content}, ${commentid}, ${articleid})`);
  return result;
}

//function checkCategory by zliu442 - use for handlebar of add article 2023/10/11
async function checkCategory() {
  const db = await dbPromise;
  return db.all(SQL`
      SELECT id, name FROM category
    `);
}



module.exports = {
  searchUsersByAccount,
  searchArticlesByKeyword,
  searchUsersByAccount,
  registerUser,
  deleteUser,
  updateArticle,
  deleteArticleById,
  searchArticleById,
  deleteCommentById,
  searchCommentById,
  searchArticlesByUserAccount,
  searchArticlesByCategoryName,
  addArticle,
  addComment,
  checkCategory
};

