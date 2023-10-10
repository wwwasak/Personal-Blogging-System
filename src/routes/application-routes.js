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
router.post('/addarticle', async function (req, res) {
    let {title,content,categoryid} = req.body;
    try{
        await blogDao.addArticle(title, content, userid, categoryid);
        res.send({
            code: 204,
            msg: "Add Article successful",
        })
    }catch(error){
        res.send({
            code: 401,
            msg: "Add Article failed"
        })
    }
});

//route post.comment create by zliu442
router.post('/addcomment', async function (req, res) {
    let {content,timeDate, articleid, commentid} = req.body;
    try{
        if ((articleid == null || commentid == null)&&(articleid + commentid > 0)){
            await blogDao.addComment(userid, timeDate, content, articleid, commentid );
            res.send({
                code: 204,
                msg: "Add Comment successful",
            })
        }
        else{
            res.send({
                code: 402,
                msg: "id conflict"
            })
        }
    }catch(error){
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});


module.exports = router;
