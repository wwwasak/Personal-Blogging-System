const express = require('express');
const router = express.Router();

const blogDao = require('../models/blog-dao.js');

const userid = 1;

// user router created ----- yji413
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
router.delete('/userDelete',async function(req,res){
    let id = req.query.id;
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
router.put('/updatearticle', async function(req, res) {
    try {
        const { title, content, categoryid } = req.body;
        console.log(req.body);
        // Call updateArticle() to undate articel details
        const result = await blogDao.updateArticle(userid, title, content, categoryid);

        // return successful response
        res.json({ message: 'Article updated successfully', result });
    } catch (error) {
        // deal error message
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/article/:id', async function (req, res) {
    let id = req.params.id;
    if (!await isOwner(userid, id)) {
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
// check if the user is the owner of the article with articleId----txu470
async function isOwner(userid, articleId) {
    let result = await blogDao.searchArticleById(articleId);
    if (result.length > 0) {
        if (result[0].userid == userid) {
            return true;
        }
    }
    return false;
}
//commenter delete comment by id  ------txu470
async function isCommentOwner(userid, commentId) {
    let result = await blogDao.searchCommentById(commentId);
    if (result.length > 0) {
        if (result[0].userid == userid) {
            return true;
        }
    }
    return false;
}
router.delete('/comment/:id', async function (req, res) {
    let id = req.params.id;
    if (!await isCommentOwner(userid, id)) {
        // If user is not the owner of the comment
        return res.status(403).send({ code: 403, msg: 'Forbidden' });
    }
    let result = await blogDao.deleteCommentById(id);
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
    if (!await isArticleOwner(userid, id)) {
        // If user is not the owner of the article
        return res.status(403).send({ code: 403, msg: 'Forbidden' });
    }
    let result = await blogDao.deleteCommentById(commentid);
    if (result.changes > 0) {
        res.send({
            code: 200,
            msg: "Delete successful"
        })
    } else {res.send({
            code: 500,
            msg: "Delete failed"
        })
    }
  
module.exports = router;


