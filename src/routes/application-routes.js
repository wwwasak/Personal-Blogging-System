const express = require('express');
const router = express.Router();
const { dbPromise } = require('../db/database.js');
const { v4: uuidv4 } = require("uuid");
const { verifyAuthenticated } = require("../middleware/authorToken.js");
const blogDao = require('../models/blog-dao.js');

let userid;


router.use(express.static('public'));

router.get('/', async (req, res) => {
    try {
        const categories = await blogDao.getAllCategories();
        const articles = await blogDao.getAllArticles();
        articles.forEach(article => {
            article.content = article.content.substring(0, 50) + '...';
        });
        res.render('home', { categories , articles });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


// user router created, register, delete ----- yji413

router.get("/login", function (req, res) {
    res.render("userLogin");
});

router.get("/toRegister", function (req, res) {
    res.render("register");
});

router.get("/toDelete", function (req, res) {
    res.render("deleteuser");
});
router.get("/toAdd",async function(req,res){
    let categories = await blogDao.getAllCategories()
    res.locals.category = categories;
    res.render("addarticle")
});
router.get("/toProfile",async function(req,res){
    let userAccount = await blogDao.searchUserById(userid);
    console.log(userAccount)
    res.locals.user = userAccount;
    res.render("profile")
});
router.post('/userLogin', async function (req, res) {
    let { account, password } = req.body;
    try {
        let userDetails = await blogDao.searchUsersByAccount(account, password)
        console.log(userDetails)
        if (userDetails.length > 0) {
            let loginToken = uuidv4();
            await blogDao.updateToken(userDetails[0].id, loginToken)
            userid = userDetails[0].id
            res.cookie("authToken", loginToken)
            res.locals.user = userDetails;
            res.redirect("/toDashboard")
        } else {
            res.locals.user = null;
            res.setToastMessage("Authentication failed!");
            res.redirect("/login");

        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "Login failed"
        })
    }
});

router.get("/logout", function (req, res) {
    res.clearCookie("authToken");
    res.setToastMessage("Successfully logged out!");
    res.redirect("/login");
});
router.get("/toDashboard", verifyAuthenticated, async function (req, res) {
    let userInfo = await blogDao.searchUserById(userid);
    let userName = userInfo.account;
    res.locals.userid = userInfo.id;
    res.locals.name = userName;
    let userArticles = await blogDao.searchArticlesByUserAccount(userid)
    res.locals.articles = userArticles; 
    res.render("dashboard");
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
router.get('/userDelete', async function (req, res) {
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
router.get('/updateArticleRoutes', async function (req, res) {
    try {
       const { articleId ,title, content, categoryid } = req.query;
        const result = await blogDao.updateArticle(userid, articleId, title, content, categoryid);
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
        articles.forEach(article => {
            article.content = article.content.substring(0, 50) + '...';
        });
        res.render('searchResults', { articles });
    } catch (error) {
        console.error(error);
        res.status(200).json({ msg: "Error" });
    }
});

router.get('/category/:categoryName', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const articles = await blogDao.searchArticlesByCategoryName(categoryName);
        
      
        articles.forEach(article => {
            article.content = article.content.substring(0, 50) + '...';
        });

        res.render('categoryPage', { articles, categoryName }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//route post.article create by zliu442

router.post('/addarticle', async function (req, res) {
    let { title, content, categoryid } = req.body;
    const timeStamp = generateTimestamp();
    try {
        if ((userid != null )) {
            await blogDao.addArticle(title, content, timeStamp, userid, categoryid);
            res.send({
                code: 204,
                msg: "Add Article successful",
            })
        }
        else {
            res.send({
                code: 402,
                msg: "no user id"
            })
        }
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
        if ((articleid != null && userid != null )) {
            await blogDao.addComment(userid, timeStamp, content, articleid);
            res.redirect(`/article/${articleid}`);
        }
        else if (userid == null){
            res.send({
                code: 408,
                msg: "no or user id"
            })
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
    try {
        const articleId = req.params.id;
        const article = await blogDao.getArticleById(articleId);
        res.render('articlePage', { article }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
    let {content, parentComment} = req.body;
    const articleid = (await blogDao.searchArticleByCommentid(parentComment)).article_id;
    const timeStamp = generateTimestamp();
    try {
        if ((parentComment != null && userid != null)) {
            await blogDao.addSubComment(userid, timeStamp, content, parentComment);
            res.redirect(`/article/${articleid}`);
        }
        else if (userid == null){
            res.send({
                code: 408,
                msg: "no user id"
            })
        }
        else {
            res.send({
                code: 402,
                msg: "no father comment id"
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
router.get('/article/:id', async(req,res) => {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
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


//subscribelist route create by zliu442
router.get('/subscribelist/:userid', async(req,res) => {  
    try {
        const userId = req.params.userid;
        const subscriber = await blogDao.subscribetoList(userId);
        const follower = await blogDao.subscribebyList(userId);
     
        res.locals.subscriber = subscriber;
        res.locals.follower = follower;
        res.locals.user = await blogDao.searchUserById(userId);
        res.render('subscribelist'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
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