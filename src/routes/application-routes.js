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
})

module.exports = router;


