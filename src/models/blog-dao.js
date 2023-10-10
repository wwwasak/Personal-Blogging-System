const SQL = require('sql-template-strings');
const {dbPromise} = require('../db/database.js');

async function searchUsersByAccount(userName,password){
    const db = await dbPromise;
    const result = await db.all(SQL`select * from user where account = ${userName} AND password = ${password}`);
    return result;
}

//function addArticle by zliu442
async function addArticle(title, content, userid, categoryid){
    const db = await dbPromise;
    const result = await db.run(`insert into article (title, content, userid, categoryid) values
    (${title}, ${content}, ${userid}, ${categoryid})`);
    console.log(`Article with title "${title}" was inserted`);
    console.log(`Newly added article has id ${result.lastID}`);
    return result;
}

//function addComment by zliu442
async function addComment(userid, timeDate, content, articleid, commentid){
    const db = await dbPromise;
    const result = await db.run(`insert into article (user_id, timeDate, content, parentComment, article_id) values
    (${userid}, ${timeDate}, ${content}, ${commentid}, ${articleid})`);
    console.log(`Comment with content "${content}" was inserted`);
    console.log(`Newly added comment has id ${result.lastID}`);
    return result;
}

// Export functions.
module.exports = {
    searchUsersByAccount,
    addArticle,
    addComment
};
