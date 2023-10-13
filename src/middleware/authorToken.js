const blogDao = require('../models/blog-dao');

async function verifyAuthenticated(req,res,next){
    if(res.locals.user){
        next();
    } else {
        res.redirect("/login")
    }
}

async function addUserToLocals(req, res, next) {
    const user = blogDao.userAuthenticatorToken(req.cookies.authToken);
    console.log(req.cookies.authToken)
    res.locals.user = user;
    next();
}

module.exports = {
    addUserToLocals,
    verifyAuthenticated
}

