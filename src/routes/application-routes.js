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
router.get("/toDashboard", verifyAuthenticated, function (req, res) {

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
    try {
        await blogDao.addArticle(title, content, userid, categoryid);
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
    let { content, timeDate, articleid, commentid } = req.body;
    try {
        if ((articleid == null || commentid == null) && (articleid + commentid > 0)) {
            await blogDao.addComment(userid, timeDate, content, articleid, commentid);
            res.send({
                code: 204,
                msg: "Add Comment successful",
            })
        }
        else {
            res.send({
                code: 402,
                msg: "id conflict"
            })
        }
    } catch (error) {
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});


  router.get('/article/:id', async (req, res) => {
    try {
        const articleId = req.params.id;
        const article = await blogDao.getArticleById(articleId);
        res.render('articlePage', { article }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');

    }
});
router.get('/_token', async (req, res) => {
    res.render('home');
});

module.exports = router;