const express = require('express');
const router = express.Router();
const {dbPromise} = require('../db/database.js');

const blogDao = require('../models/blog-dao.js');

const userid = 1;
router.post('/user', async function (req, res) {
    let {account,password} = req.body;
    let userDetails = await blogDao.searchUsersByAccount(account, password)
    console.log(userDetails)
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
});

//route post.article create by zliu442
router.post('/article', async function (req, res) {
    let {title,content,categoryid} = req.body;
    let addArticle = await blogDao.addArticle(title, content, userid, categoryid);
    if (addArticle.length > 0) {
        res.send({
            code: 204,
            msg: "Add Article successful",
        })
    } else {
        res.send({
            code: 401,
            msg: "Add Article failed"
        })
    }
});

//route post.comment create by zliu442
router.post('/comment', async function (req, res) {
    let addComment;
    let {content,timeDate, articleid, commentid} = req.body;
    if (articleid * commentid == null)
    {addComment = await blogDao.addComment(userid, timeDate, content, articleid, commentid );}
    if (addComment.length > 0) {
        res.send({
            code: 204,
            msg: "Add Comment successful",
        })
    } else {
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});


module.exports = router;
