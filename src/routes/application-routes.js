const express = require('express');
const router = express.Router();

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

// This is a router to get the request of update article from users
router.put('/update-article/:userid', async function(req, res) {
    try {
        const { userid } = req.params;
        const { title, content, categoryid } = req.body;

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


module.exports = router;
