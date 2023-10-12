const express = require('express');
const router = express.Router();
const { dbPromise } = require('../db/database.js');

const blogDao = require('../models/blog-dao.js');

const userid = 1;
router.get('/', (req, res) => {
    res.render('home');
});

// user router created, register, delete ----- yji413

router.get("/", function (req, res) {
    res.render("login");
});
router.get("/toRegister", function (req, res) {
    res.render("register");
});
router.get("/toDelete", function (req, res) {
    res.render("deleteuser");
});
router.post('/userLogin', async function (req, res) {
    let { account, password } = req.body;
    try {
        let userDetails = await blogDao.searchUsersByAccount(account, password)
        if (userDetails.length > 0) {
            res.send({
                code: 200,
                msg: "Login successful",
                data: userDetails[0]
            })
        } else {
            res.send({
                code: 500,
                msg: "Login failed"
            })

        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "Login failed"
        })
    }
});

router.post('/userRegister', async function (req, res) {
    let { account, password, birthday, description } = req.body;
    try {
        await blogDao.registerUser(account, password, birthday, description)
        res.send({
            code: 200,
            msg: "Register successful",
        })
    } catch (error) {
        res.send({
            code: 500,
            msg: "Register failed"
        })
    }
});
router.get('/userDelete',async function(req,res){
    let id = req.query.userid;
    try {
        await blogDao.deleteUser(id)
        res.send({
            code: 200,
            msg: "Delete successful",
        })
    } catch (error) {
        res.send({
            code: 500,
            msg: "Delete failed"
        })
    }
});


// This is a router to get the request of update article from users
router.get('/updateArticleRoutes', async function(req, res) {
    try {
        const { title, content, categoryid } = req.query;
        // const title = req.query.title;
        // const content = req.query.content;
        // const categoryid = req.query.categoryid;
        // console.log(title);
        // console.log(content);
        // console.log(categoryid);
        // Call updateArticle() to undate articel details
        const result = await blogDao.updateArticle(userid, title, content, categoryid);
       // return successful response
        res.send({ message: 'Article updated successfully', result });
    } catch (error) {
        // deal error message
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/article/:id', async function (req, res) {
    let id = req.params.id;
    if (!await isArticleOwner(userid, id)) {
        // If user is not the owner of the article
        return res.status(403).send({ code: 403, msg: 'Forbidden' });
    }
    let result = await blogDao.deleteArticleById(id);
    if (result.changes > 0) {
        res.send({
            code: 200,
            msg: "Delete successful"
        })
    } else {
        res.send({
            code: 500,
            msg: "Delete failed"
        })
    }
});

//commenter delete comment by id  ------txu470
async function isCommentOwner(userid, commentId) {
    let result = await blogDao.searchCommentById(commentId);
    if (result.length > 0) {
        if (result[0].user_id == userid) {
            return true;
        }
    }
    return false;
}

//ArticleOwner delete comment by id  ------txu470
async function isArticleOwner(userid, articleId) {
    let result = await blogDao.searchArticleById(articleId);
    if (result.length > 0) {
        if (result[0].userid == userid) {
            return true;
        }
    }
    return false;
}
router.delete('/article/:id/comment/:commentid', async function (req, res) {
    let id = req.params.id;
    let commentid = req.params.commentid;
    if (!await isArticleOwner(userid, id) && (!await isCommentOwner(userid, commentid))) {
        // If user is not the owner of the article and comment
        return res.status(403).send({ code: 403, msg: 'Forbidden' });
    }
    let result = await blogDao.deleteCommentById(commentid);
    if (result.changes > 0) {
        res.send({
            code: 200,
            msg: "Delete successful"
        })
    } else {
        res.send({
            code: 500,
            msg: "Delete failed"
        })
    }
});
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const articles = await blogDao.searchArticlesByKeyword(keyword);
        res.render('searchResults', { articles });
    } catch (error) {
        console.error(error);
        res.status(200).json({ msg: "Error" });
    }
});
//route post.article create by zliu442, modified 2023/10/12 for add time Stamp
router.post('/addarticle', async function (req, res) {
    let { title, content, categoryid } = req.body;
    const timeStamp = generateTimestamp();
    try {
        await blogDao.addArticle(title, content, timeStamp, userid, categoryid);
        res.send({
            code: 204,
            msg: "Add Article successful",
        })
    } catch (error) {
        res.send({
            code: 401,
            msg: "Add Article failed"
        })
    }
});


//route post.comment create by zliu442
router.post('/addcomment', async function (req, res) {
    let {content, articleid} = req.body;
    const timeStamp = generateTimestamp();
    try {
        if ((articleid != null )) {
            await blogDao.addComment(userid, timeStamp, content, articleid);
            res.redirect(`/articlereader/${articleid}`);
        }
        else {
            res.send({
                code: 402,
                msg: "no article id"
            })
        }
        
    } catch (error) {
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});

//route post.subcomment create by zliu442 2023/10/13
router.post('/addsubcomment', async function (req, res) {
    let {content, parentComment} = req.body;
    const articleid = (await blogDao.searchArticleByCommentid(parentComment)).article_id;
    const timeStamp = generateTimestamp();
    try {
        if ((parentComment != null )) {
            await blogDao.addSubComment(userid, timeStamp, content, parentComment);
            res.redirect(`/articlereader/${articleid}`);
        }
        else {
            res.send({
                code: 402,
                msg: "no comment id"
            })
        }
        
    } catch (error) {
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});

//add read article feature and add comments here by zliu442 2023/10/13
router.get('/articlereader/:id', async(req,res) => {
    const articleid = req.params.id;
    const articleInfo = await blogDao.searchArticleById(articleid);
    const articleTime = formatTimestamp(articleInfo.postdate);
    const authorInfo = await blogDao.searchUserById(articleInfo.userid);
    const categoryInfo = await blogDao.searchCategoryById(articleInfo.categoryid);
    const article = {
        id : articleid,
        title : articleInfo.title,
        author : authorInfo.account, 
        dateTime : articleTime,
        category : categoryInfo.name,
        content : articleInfo.content
    }
    const processedComments = await processComments(article,articleid);  
    res.locals.comment = processedComments;
    res.render('articlereader',{article:article});
});

//function processComments use for print comment list by zliu442
async function processComments(article,articleid) {
    const comment = await blogDao.searchCommentByArticleID(articleid);
    
    for (let item of comment) {
        item.author = await blogDao.searchUserById(item.user_id);
        item.timeDate = formatTimestamp(item.timeDate);
        item.replyee = article.author;
        const subcommentInfo = await blogDao.searchSubCommentByCommentID(item.id);
        const processedSubcomments = await Promise.all(subcommentInfo.map(async subitem => {
            subitem.author = await blogDao.searchUserById(subitem.user_id);
            subitem.timeDate = formatTimestamp(subitem.timeDate);
            subitem.replyee = item.author;
            return subitem; 
        }));
        item.subcomment = processedSubcomments;
    }
    return comment;
}




router.get('/user/search', async (req, res) => {
    try {
        if (!req.session.userid) {
            return res.status(403).json({ msg: "User not logged in" });
        }
        const keyword = req.query.keyword;
        const articles = await blogDao.searchUserArticlesByKeyword(req.session.userid, keyword);
        res.json({ articles });
    } catch (error) {
        console.error(error);
        res.status(200).json({ msg: "Error" });
    }
});
router.get('/', async (req, res) => {
    res.render('home');
});

// return time create by zliu442
function generateTimestamp() {
    return Date.now();
}

//format time create by zliu442
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

module.exports = router;