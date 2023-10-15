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
async function updateToken(id,token){
  const db = await dbPromise;
  const result = await db.run(SQL`UPDATE user SET token = ${token} WHERE id = ${id};`);
  return result;
}
async function userAuthenticatorToken(token) {
  const db = await dbPromise;
  const result = await db.run(SQL`SELECT * FROM user WHERE token = ${token};`);
  return result;
}

async function updateArticle(userid, articleId, title, content, categoryid) {
  const db = await dbPromise;
  const result = await db.run(SQL`update article set title = ${title}, content = ${content}, categoryid = ${categoryid} where userid = ${userid} and id = ${articleId}`);
  return result;
}

// delete article by id  ------txu470
async function deleteArticleById(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`delete from article where id = ${id}`);
  return result;
}

// delete comment by id  ------txu470
async function deleteCommentById(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`delete from comments where id = ${id}`);
  return result;
}

async function searchArticlesByKeyword(keyword) {
  const db = await dbPromise;
  return db.all(SQL`
      SELECT * FROM article WHERE LOWER(title) LIKE ${'%' + keyword.toLowerCase() + '%'}
    `);
}
  const getArticleById = async (articleId) => {
    const db = await dbPromise;
    const article = await db.get(SQL`SELECT * FROM article WHERE id = ${articleId}`);
    return article;
};

const getAllArticles = async () => {
  const db = await dbPromise;
  const articles = await db.all(SQL`SELECT * FROM article`); 
  return articles;
};

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

async function getAllCategories() {
  const db = await dbPromise;
  const result = await db.all(`SELECT * FROM category`);
  return result;
}



//function addArticle by zliu442
async function addArticle(title, content, timedate, userid, categoryid) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into article (title, content, postdate, userid, categoryid) values
    (${title}, ${content}, ${timedate}, ${userid}, ${categoryid})`);
  return result;
}

//function addComment by zliu442
async function addComment(userid, timeDate, content, articleid) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into comments (user_id, timeDate, content, article_id) values
    (${userid}, ${timeDate}, ${content}, ${articleid})`);
  return result;
}

async function addSubComment(userid, timeDate, content, parentComment) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into comments (user_id, timeDate, content, parentComment) values
    (${userid}, ${timeDate}, ${content}, ${parentComment})`);
  return result;
}

//function checkarticlebyid, userbyid and categorybyid by zliu442 - use for handlebar of articlereader 2023/10/12
async function searchArticleById(id) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT * FROM article WHERE id = ${id}`);
  return result;
}

async function searchCommentById(id) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT * FROM comments WHERE id = ${id}`);
  return result;
}

async function searchUserById(id) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT * FROM user WHERE id = ${id}`);
  return result;
}

async function searchCategoryById(id) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT * FROM category WHERE id = ${id}`);
  return result;
}

async function searchCommentByArticleID(articleid){
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT * FROM comments WHERE article_id = ${articleid}`);
  return result;
}

async function searchSubCommentByCommentID(commentid){
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT * FROM comments WHERE parentComment = ${commentid}`);
  return result;
}

async function searchArticleByCommentid(commentid){
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT article_id FROM comments WHERE id = ${commentid}`);
  return result;
}

//create subscribebylist and subscribetolist function by zliu442
async function subscribebyList(userid){
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT user.id, user.account FROM subscribes JOIN user ON subscribes.subscribe_by_userid = user.id WHERE subscribe_to_userid = ${userid}`);
  return result;
}

async function subscribetoList(userid){
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT user.id, user.account FROM subscribes JOIN user ON subscribes.subscribe_to_userid = user.id WHERE subscribe_by_userid = ${userid}`);
  return result;
}

//create add, delete and check subscribe relationship functions by zliu442
async function addSubscribe(subscribe_by_userid, subscribe_to_userid) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into subscribes (subscribe_by_userid, subscribe_to_userid) values
    (${subscribe_by_userid}, ${subscribe_to_userid})`);
  return result;
}

async function deleteSubscribe(subscribe_by_userid, subscribe_to_userid) {
  const db = await dbPromise;
  const result = await db.run(SQL`delete from subscribes where subscribe_by_userid = ${subscribe_by_userid} and subscribe_to_userid = ${subscribe_to_userid} `);
  return result;
}

async function checkSubscribe(subscribe_by_userid, subscribe_to_userid) {
  const db = await dbPromise;
  const result = await db.get(SQL`
  SELECT COUNT(*) as count 
  FROM subscribes 
  WHERE subscribe_by_userid = ${subscribe_by_userid} AND subscribe_to_userid = ${subscribe_to_userid}`);
return result.count > 0;
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
  updateToken,
  userAuthenticatorToken,
  updateArticle,
  deleteArticleById,
  deleteCommentById,
  searchArticlesByUserAccount,
  searchArticlesByCategoryName,
  addArticle,
  addComment,
  checkCategory,
  searchArticleById,
  searchCommentById,
  searchUserById,
  searchCategoryById,
  searchCommentByArticleID,
  searchSubCommentByCommentID,
  addSubComment,
  searchArticleByCommentid,
  getArticleById,
  getAllCategories,
  getAllArticles,
  subscribebyList,
  subscribetoList,
  addSubscribe,
  deleteSubscribe,
  checkSubscribe
};

