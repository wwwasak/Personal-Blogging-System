const SQL = require('sql-template-strings');
const { dbPromise } = require('../db/database.js');

// user search, register and delete -------yji413
async function searchUsersByAccount(userName) {
  const db = await dbPromise;
  const result = await db.all(SQL`select * from user where account = ${userName}`);
  return result;
}

async function registerUser(account, realname,password, birthday,userImage, description) {
  const db = await dbPromise;
  const result = await db.run(SQL`INSERT INTO user (account,realname,password,birthday,userimage,description) values (${account},${realname},${password},${birthday},${userImage},${description});`);
  return result;
}
async function deleteUser(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`DELETE FROM user WHERE id = ${id};`);
  return result;
}
async function updateToken(id, token) {
  const db = await dbPromise;
  const result = await db.run(SQL`UPDATE user SET token = ${token} WHERE id = ${id};`);
  return result;
}
async function userAuthenticatorToken(token) {
  const db = await dbPromise;
  const user = await db.get(SQL`SELECT * FROM user WHERE token = ${token};`);
  return user;
}


async function updateArticle(userid, articleId, title, content, categoryid, imagepath) {
  const db = await dbPromise;
  const result = await db.run(SQL`update article set title = ${title}, content = ${content}, categoryid = ${categoryid}, imagename = ${imagepath} where userid = ${userid} and id = ${articleId}`);
  return result;
}

// delete article and it's comments by articleid  ------txu470
async function deleteArticleById(id) {
  const db = await dbPromise;
  const result =await db.run(SQL`DELETE FROM article WHERE id = ${id}`);
  await db.run(SQL`DELETE FROM comments WHERE article_id = ${id}`);
  return result;
}

//delete all comment for a article zliu442
async function deleteCommentByArticleID(id){
  const db = await dbPromise;
  const result = await db.run(SQL`delete from comments where article_id = ${id}`);
  return result;
}

async function deleteCommentByParentCommentID(id){
  const db = await dbPromise;
  const result = await db.run(SQL`delete from comments where parentComment = ${id}`);
  return result;
}

// delete comment by id  ------txu470
async function deleteCommentById(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`delete from comments where id = ${id}`);
  return result;
}


//search by keywords -----zli178
async function searchArticlesByKeyword(keyword) {
  const db = await dbPromise;
  const result = await db.all(SQL`
      SELECT * FROM article WHERE LOWER(title) LIKE ${'%' + keyword.toLowerCase() + '%'}`);
  return result;
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


async function hasUserLikedArticle(userId, articleId) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT * FROM userlike WHERE user_id = ${userId} AND article_id = ${articleId}`);
  return result ? true : false;
}


async function likeArticle(userId, articleId) {
  const db = await dbPromise;
  const result = await db.run(SQL`INSERT INTO userlike (user_id,article_id) VALUES (${userId},${articleId})`);
  return result;
}

async function unlikeArticle(userId, articleId) {
  const db = await dbPromise;
  const result = await db.run(SQL`DELETE FROM userlike WHERE user_id = ${userId} AND article_id = ${articleId}`);
  return result;
}


async function countLikesForArticle(articleId) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT COUNT(*) as likesCount FROM userlike WHERE article_id = ${articleId}`);
  return result.likesCount;
}


async function getArticlesLikedByUser(userId) {
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT article.* FROM article INNER JOIN userlike ON article.id = userlike.article_id WHERE userlike.user_id = ${userId}`);
  return result;
}
async function getUsersWhoLikedArticle(articleId) {
  const db = await dbPromise;
  const result = await db.all(SQL`
      SELECT user.id, user.account FROM user 
      JOIN userlike ON user.id = userlike.user_id 
      WHERE userlike.article_id = ${articleId}
  `);
  return result;
}


async function getAllUsersWithArticleCount() {
  const db = await dbPromise;
  const query = `
      SELECT user.*, COUNT(article.id) as articleCount 
      FROM user 
      LEFT JOIN article ON user.id = article.userid
      GROUP BY user.id;
  `;
  const users = await db.all(query);
  return users;
}


async function deleteUserAndRelatedData(userId) {
  const db = await dbPromise;

  await db.run("DELETE FROM article WHERE userid = ?", [userId]);

  await db.run("DELETE FROM comments WHERE user_id = ?", [userId]);

  await db.run("DELETE FROM user WHERE id = ?", [userId]);
}




//function addArticle by zliu442
async function addArticle(title, content, timedate, userid, categoryid, imagepath) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into article (title, content, postdate, userid, categoryid, imagename) values
    (${title}, ${content}, ${timedate}, ${userid}, ${categoryid}, ${imagepath})`);
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

async function searchCommentByArticleID(articleid) {
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT * FROM comments WHERE article_id = ${articleid}`);
  return result;
}

async function searchUserByArticleID(articleid) {
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT * FROM user LEFT JOIN article ON user.id = article.userid where article.id=${articleid}`);
  return result;
}
async function searchSubCommentByCommentID(commentid) {
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT * FROM comments WHERE parentComment = ${commentid}`);
  return result;
}

async function searchArticleByCommentid(commentid) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT article_id FROM comments WHERE id = ${commentid}`);
  return result;
}

//create subscribebylist and subscribetolist function by zliu442
async function subscribebyList(userid) {
  const db = await dbPromise;
  const result = await db.all(SQL`SELECT user.id, user.account FROM subscribes JOIN user ON subscribes.subscribe_by_userid = user.id WHERE subscribe_to_userid = ${userid}`);
  return result;
}

async function subscribetoList(userid) {
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

//get subscribers by userid---txu470
async function getSubscribers(userid) {
  const db = await dbPromise;
  return db.all(SQL`
      SELECT * FROM subscribers WHERE userid = ${userid}
    `);
}
async function addNotification(sender_id, recipient_id, notification_type, related_object_id, content) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into notifications (sender_id,recipient_id,notification_type,related_object_id,content) values
    (${sender_id}, ${recipient_id}, ${notification_type}, ${related_object_id}, ${content})`);
  return result;
}

//analytic functions create by zliu442
async function followerNum(userid) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT COUNT(*) FROM subscribes WHERE subscribe_to_userid = ${userid}`);
  return result['COUNT(*)'];
}

async function articleCommentNum(articleid) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT COUNT(*) FROM comments WHERE article_id = ${articleid}`);
  return result['COUNT(*)'];
}

async function articleLikeNum(articleid) {
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT COUNT(*) FROM userlike WHERE article_id = ${articleid}`);
  return result['COUNT(*)'];
}

// admin search-------zliu442
async function searchAdminByAccount(userName, password) {
  const db = await dbPromise;
  const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password} AND isAdmin = 1`);
  return result;
}

//category admin functions --zliu442
async function addCategory(name, des) {
  const db = await dbPromise;
  const result = await db.run(SQL`insert into category (name, description, userid) values
  (${name}, ${des}, 4)`);
  return result;
}

async function deleteCategory(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`delete from category where id = ${id} `);
  return result;
}

async function deleteNotification(id) {
  const db = await dbPromise;
  const result = await db.run(SQL`delete from notifications where id = ${id} `);
  return result;
}
async function updateCategory(id, updatename, updatedes) {
  const db = await dbPromise;
  const result = await db.run(SQL`update category set name = ${updatename}, description = ${updatedes} where id = ${id} `);
  return result;
}

//count comment to one user in a day
async function commentNumOnUserAday(userid, starttime, endtime){
  const db = await dbPromise;
  const result = await db.get(SQL`SELECT COUNT(*) 
  FROM comments AS c
  JOIN article AS a ON c.article_id = a.id
  WHERE a.userid = ${userid}
  AND c.timeDate BETWEEN ${starttime} AND ${endtime}`);
  return result['COUNT(*)'];
}

//create by zliu442
async function getAllUsers() {
  const db = await dbPromise;
  const result = await db.all(`SELECT * FROM user`);
  return result;
}
async function searchNotificationsByUserID(userid) {
  const db = await dbPromise;
  const result = await db.all(SQL`select * from notifications where recipient_id = ${userid}`);
  return result;
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
  getSubscribers,
  addNotification,
  getArticleById,
  getAllCategories,
  getAllArticles,
  subscribebyList,
  subscribetoList,
  addSubscribe,
  deleteSubscribe,
  checkSubscribe,
  hasUserLikedArticle,
  likeArticle,
  unlikeArticle,
  countLikesForArticle,
  getArticlesLikedByUser,
  getUsersWhoLikedArticle,
  getAllUsersWithArticleCount,
  deleteUserAndRelatedData,
  followerNum,
  articleCommentNum,
  articleLikeNum,
  searchAdminByAccount,
  addCategory,
  deleteCategory,
  updateCategory,
  getAllUsers,
  getArticleById,
  getAllCategories,
  getAllArticles,
  commentNumOnUserAday,
  searchNotificationsByUserID,
  deleteCommentByParentCommentID,
  deleteCommentByArticleID,
  searchUserByArticleID,
  deleteNotification
};

