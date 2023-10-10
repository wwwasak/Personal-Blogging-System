const express = require('express');
const router = express.Router();
const { dbPromise } = require('../db/database.js');


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



router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const articles = await blogDao.searchArticlesByKeyword(keyword);
        res.json({ articles });
    } catch (error) {
        console.error(error);
        res.status(200).json({ msg: "Error" }); 
    }
});

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



module.exports = router;
