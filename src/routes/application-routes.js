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


module.exports = router;
