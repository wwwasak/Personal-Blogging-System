const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { verifyAuthenticated } = require("../middleware/authorToken.js");
const blogDao = require('../models/blog-dao.js');
const bcrypt = require('bcryptjs');

//for image upload
const multer = require("multer");
const path = require('path');
const upload = multer({ dest: path.join(__dirname, "public/images/articleimages") });
const fs = require("fs");


let userid;

router.use(express.static('public'));

router.get('/', async (req, res) => {
    try {
        const categories = await blogDao.getAllCategories();
        const articles = await blogDao.getAllArticles();
        articles.forEach(article => {
            article.content = article.content.substring(0, 50) + '...';
            article.postdate = formatTimestamp(article.postdate);
        });
        res.locals.userid = userid;
        res.render('home', { categories, articles });
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
router.get("/toAdd", async function (req, res) {
    let categories = await blogDao.getAllCategories()
    res.locals.category = categories;
    res.render("addarticle")
});
router.get("/toProfile", async function (req, res) {
    let userAccount = await blogDao.searchUserById(userid);
    res.locals.user = userAccount;
    res.render("profile")
});


router.post('/userLogin', async function (req, res) {
    let { account, password } = req.body;
    try {
        let userDetails = await blogDao.searchUsersByAccount(account)
        let isMatch = await bcrypt.compare(password, userDetails[0].password)
        if (userDetails.length > 0 && isMatch) {
            let loginToken = uuidv4();
            await blogDao.updateToken(userDetails[0].id, loginToken)
            userid = userDetails[0].id
            res.cookie("authToken", loginToken)
            res.locals.user = userDetails;
            res.redirect("/")
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

//admin login create by zliu442
router.post('/adminLogin', async function (req, res) {
    let { admin_account, admin_password } = req.body;
    console.log({ admin_account, admin_password })
    try {
        let userDetails = await blogDao.searchAdminByAccount(admin_account, admin_password);
        if (userDetails.length > 0) {
            res.redirect("/adminpage")
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.send({
            code: 500,
            msg: "Login failed"
        })
    }
});

router.get('/adminpage', async function (req, res) {
    res.locals.category = await blogDao.getAllCategories();

    //article raleted
    const articleList = await blogDao.getAllArticles();
    let promises = articleList.map(async item => {
        item.category = await blogDao.searchCategoryById(item.categoryid);
        item.authorid = item.userid;
        item.author = (await blogDao.searchUserById(item.userid)).account;
        item.dateTime = formatTimestamp(item.postdate);
    });
    await Promise.all(promises);

    res.locals.user = await blogDao.getAllUsers();
    res.locals.article = articleList;
    res.render("adminPage");
});

//category handle backend functions create by zliu442
router.get('/addcategory', async (req, res) => {
    try {
        const name = req.query.name;
        const description = req.query.description;
        await blogDao.addCategory(name, description);
        res.redirect(`/adminpage`);
    } catch (error) {
        console.error(error);
        res.status(500).send('add category error');
    }
});

router.get('/deletecategory', async (req, res) => {
    try {
        const id = req.query.id;
        await blogDao.deleteCategory(id);
        res.redirect(`/adminpage`);
    } catch (error) {
        console.error(error);
        res.status(500).send('delete category error');
    }
});

//routers create by zliu442
router.get('/deletearticle', async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id)
        const commentlist = await blogDao.searchCommentByArticleID(id);
        console.log(commentlist)
        for (let item of commentlist) {
            await blogDao.deleteCommentByParentCommentID(item.id);
        }
        await blogDao.deleteCommentByArticleID(id);
        await blogDao.deleteArticleById(id);
        res.redirect(`/adminpage`);
    } catch (error) {
        console.error(error);
        res.status(500).send('delete article error');
    }

});

router.get('/updatecategory', async (req, res) => {
    try {
        const id = req.query.id;
        const updatename = req.query.updatename;
        const updatedes = req.query.updatedescription;
        await blogDao.updateCategory(id, updatename, updatedes);
        res.redirect(`/adminpage`);
    } catch (error) {
        console.error(error);
        res.status(500).send('update category error');
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
    let userArticles = await blogDao.searchArticlesByUserAccount(userid);
    userArticles.forEach(item => {
        item.postdate = formatTimestamp(item.postdate);
    });
    res.locals.articles = userArticles;

    //following lines are related to analytics function create by zliu442 10/16
    res.locals.followerNum = (await blogDao.followerNum(userInfo.id));
    //get total comment number and like number and send to handlebar
    let commentNumber = 0;
    let likeNumber = 0;
    let promises = userArticles.map(async item => {
        let commentForTheArticle = await blogDao.articleCommentNum(item.id);
        let likeForTheArticle = await blogDao.articleLikeNum(item.id);
        commentNumber += commentForTheArticle;
        likeNumber += likeForTheArticle;
        item.commentForTheArticle = commentForTheArticle;
        item.likeForTheArticle = likeForTheArticle;
        item.popularIndex = popularindex(commentForTheArticle, likeForTheArticle);
        item.postDate = formatTimestamp(item.postdate);
    });
    await Promise.all(promises);
    //choose top 3 rank articles
    const sortedArticleArray = userArticles.sort((a, b) => b.popularIndex - a.popularIndex);
    const topThreeArticles = sortedArticleArray.slice(0, 3);
    topThreeArticles.forEach((item, index) => {
        item.rank = index + 1;
    });

    //for histogram chart

    // send to front end
    res.locals.toparticle = topThreeArticles;
    res.locals.commentNum = commentNumber;
    res.locals.likeNum = likeNumber;

    //for draw histogram comment
    const lastTendays = getLastTenDays();
    res.locals.lastTendays = lastTendays;
    const tenDayTimeStamp = getTendayTimeStamp();
    const commentNumTendays = await commentNumInTimeRanges(userInfo.id, tenDayTimeStamp);
    res.locals.commentNumTendays = commentNumTendays;

    res.render("dashboard");
});

//get prior 10 days zliu442
function getLastTenDays() {
    let dates = [];
    let today = new Date();
    // Set the date to 10 days ago
    today.setDate(today.getDate() - 9);
    for (let i = 0; i < 10; i++) {
        // Format the date as yyyy/mm/dd
        let formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        dates.push(formattedDate);
        // Increase the day by one
        today.setDate(today.getDate() + 1);
    }
    return dates;
}

function getTendayTimeStamp() {
    let today = new Date();
    today.setDate(today.getDate() - 9);
    let dateRanges = [];
    for (let i = 0; i < 10; i++) {
        let startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime();
        let endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
        dateRanges.push([startOfDay, endOfDay]);
        today.setDate(today.getDate() + 1);
    }
    return dateRanges;
}

//get comment num by each day zliu442
async function commentNumInTimeRanges(userid, timeRanges) {
    const results = await Promise.all(timeRanges.map(async (range) => {
        const [starttime, endtime] = range;
        return await blogDao.commentNumOnUserAday(userid, starttime, endtime);
    }));

    return results;
}

//define popularity calculator
function popularindex(commentNum, likeNum) {
    popularNum = commentNum * 1.7 + likeNum;
    return popularNum;
}

router.post('/userRegister', async function (req, res) {
    let { account,realname, password, repassword, birthday,userImage, description } = req.body;
    console.log(req.body)
    try {
        if (password == repassword) {

            let hashedPassword = await bcrypt.hash(password, 8)
            await blogDao.registerUser(account,realname, hashedPassword, birthday,userImage, description)
            res.redirect("/login");

        } else {
            res.send({
                code: 400,
                msg: "Please enter the same password!!"
            })
        }
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
        await blogDao.deleteUser(id);
        res.redirect("/login");
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

router.get('/updatearticle', async function (req, res) {
    const articleId = req.query.articleId;
    res.locals.userid = userid;
    res.locals.articleId = articleId;
    res.locals.category = await blogDao.getAllCategories();
    const article = await blogDao.searchArticleById(articleId);
    article.category = await blogDao.searchCategoryById(article.categoryid);
    res.locals.article = article;
    res.render("updatearticle")
})
// This is a router to get the request of update article from users, modify by zliu442
router.post('/updateArticleRoutes', upload.single("imageFile"), async function (req, res) {
    try {
        const { articleId, title, content, categoryid, currentimage } = req.body;
        const imageFile = req.file;
        if (imageFile != null) {
            let fileInfo = req.file;
            let oldpath = fileInfo.path;
            let newpath = `./public/images/articleimages/${fileInfo.originalname}`;
            fs.renameSync(oldpath, newpath);
            let imagepath = `/images/articleimages/${fileInfo.originalname}`;
            const result = await blogDao.updateArticle(userid, articleId, title, content, categoryid, imagepath);
        }
        else {
            let imagepath = currentimage;
            const result = await blogDao.updateArticle(userid, articleId, title, content, categoryid, imagepath);
        }
        // return successful response
        res.redirect('/toDashboard');
    } catch (error) {
        // deal error message
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/article/:id', async function (req, res) {
    let id = req.params.id;
    console.log(userid, id);
    if (!await isArticleOwner(userid, id)) {
        // If user is not the owner of the article
        return res.status(403).send({ code: 403, msg: 'Forbidden' });
    }
    const commentlist = await blogDao.searchCommentByArticleID(id);
    console.log(commentlist)
    for (let item of commentlist) {
        await blogDao.deleteCommentByParentCommentID(item.id);
    }
    await blogDao.deleteCommentByArticleID(id);
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

router.delete('/notification/:id', async function (req, res) {
    let id = req.params.id;
    console.log(userid, id);
    try{
        await blogDao.deleteNotification(id);
        res.send({
            code: 200,
            msg: "Delete successful"
        })
    } catch (error){
        res.send({
            code: 500,
            msg: "Delete failed"
        })
    }
});
//commenter delete comment by id  ------txu470
// async function isCommentOwner(userid, commentId) {
//     let result = await blogDao.searchCommentById(commentId);
//     if (result) {
//         if (result.user_id == userid) {
//             return true;
//         }
//     }
//     return false;
// }

//ArticleOwner delete comment by id  ------txu470
async function isArticleOwner(userid, articleId) {
    let result = await blogDao.searchArticleById(articleId);
    if (result) {
        if (result.userid == userid) {
            return true;
        }
    }
    return false;
}


// no use now -zliu442
// router.delete('/article/:id/comment/:commentid', async function (req, res) {
//     let id = req.params.id;
//     let commentid = req.params.commentid;
//     if (!await isArticleOwner(userid, id) && (!await isCommentOwner(userid, commentid))) {
//         // If user is not the owner of the article and comment
//         return res.status(403).send({ code: 403, msg: 'Forbidden' });
//     }
//     let result = await blogDao.deleteCommentById(commentid);
//     if (result.changes > 0) {
//         res.send({
//             code: 200,
//             msg: "Delete successful"
//         })
//     } else {
//         res.send({
//             code: 500,
//             msg: "Delete failed"
//         })
//     }
// });



//search by zli178
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



router.get('/hasUserLikedArticle', async (req, res) => {
    const { userId, articleId } = req.query;
    const hasLiked = await blogDao.hasUserLikedArticle(userId, articleId);
    res.json(hasLiked);
});


router.get('/likeArticle', async (req, res) => {
    const { userId, articleId } = req.query;
    try {
        await blogDao.likeArticle(userId, articleId);
        const otherUser = await blogDao.searchUserByArticleID(articleId);
        const otherUserId = otherUser[0].userid;
        const article = await blogDao.searchArticleById(articleId);
        const articleTitle = article.title;
        const user = await blogDao.searchUserById(userId);
        const userName = user.account;
        const content = "Congratulation!" + userName + " has liked your Article " + articleTitle;
        await blogDao.addNotification(userId, otherUserId, 'newLike', articleId, content)
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/unlikeArticle', async (req, res) => {
    const { userId, articleId } = req.query;
    try {
        await blogDao.unlikeArticle(userId, articleId);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/countLikesForArticle', async (req, res) => {
    const { articleId } = req.query;
    const count = await blogDao.countLikesForArticle(articleId);
    res.json({ count });
});

router.get('/whoLikedArticle', async (req, res) => {
    const { articleId } = req.query;
    const users = await blogDao.getUsersWhoLikedArticle(articleId);
    res.json(users);
});




//route post.article create by zliu442
//when add new article, will notify subscribers---txu470
router.post('/addarticle', upload.single("imageFile"), async function (req, res) {
    let { title, content, categoryid } = req.body;
    let fileInfo = req.file;
    let imagepath;
    if (fileInfo != null) {
        let oldpath = fileInfo.path;
        let newpath = `./public/images/articleimages/${fileInfo.originalname}`;
        fs.renameSync(oldpath, newpath);
        imagepath = `/images/articleimages/${fileInfo.originalname}`;
    }
    else {
        imagepath = null;
    }
    const timeStamp = generateTimestamp();
    try {
        if ((userid != null)) {
            const result = await blogDao.addArticle(title, content, timeStamp, userid, categoryid, imagepath);
            articleId = result.lastID;
            const subscribers = await blogDao.subscribebyList(userid);
            subscribers.forEach(async subscriber => {
                await blogDao.addNotification(userid, subscriber.id, 'newBlog', articleId, 'Your subscription has a new article!');
            });
            res.redirect('/toDashboard');
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

//modified byzliu442 10/17
router.get('/comment/', async function (req, res) {
    let id = req.query.articleId;
    let article = await blogDao.searchArticleById(id);
    article.author = await blogDao.searchUserById(article.userid);
    res.locals.article = article;
    res.render("addComment")
});

//create by zliu442 10/17
router.get('/subcomment/', async function (req, res) {
    let articleid = req.query.articleid;
    let article = await blogDao.searchArticleById(articleid);
    article.author = await blogDao.searchUserById(article.userid);
    let commentid = req.query.commentid;
    let comment = await blogDao.searchCommentById(commentid);
    comment.author = await blogDao.searchUserById(comment.user_id);
    res.locals.article = article;
    res.locals.comment = comment;
    res.render("addsubComment")
});

//create by zliu442 10/17
router.get('/subsubcomment/', async function (req, res) {
    let subcommentid = req.query.subcommentid;
    let subcomment = await blogDao.searchCommentById(subcommentid);
    subcomment.author = await blogDao.searchUserById(subcomment.user_id);
    let commentid = req.query.commentid;
    let comment = await blogDao.searchCommentById(commentid);
    comment.author = await blogDao.searchUserById(comment.user_id);
    let articleid = req.query.articleid;
    let article = await blogDao.searchArticleById(articleid);
    article.author = await blogDao.searchUserById(article.userid);
    let replyTo = req.query.replyto;
    let replyToUser = await blogDao.searchUserById(replyTo);
    subcomment.content = formatCommentStr(subcomment.content);
    res.locals.article = article;
    res.locals.comment = comment;
    res.locals.replyto = replyToUser;
    res.locals.subcomment = subcomment;
    res.render("addsubsubComment")
});

//route post.comment create by zliu442
//when add new comment, will notify subscribers---txu470
router.post('/addcomment', async function (req, res) {
    let { content, articleid } = req.body;
    const timeStamp = generateTimestamp();
    try {
        if ((articleid != null && userid != null)) {
            const result = await blogDao.addComment(userid, timeStamp, content, articleid);
            commentId = result.lastID;
            const author = await blogDao.searchUserByArticleID(articleid);
            const subscribers = await blogDao.subscribebyList(author[0].userid);
            subscribers.forEach(async subscriber => {
                await blogDao.addNotification(author[0].userid, subscriber.id, 'newComment', commentId, 'Your subscription article has a new comment!');
            });
            res.redirect(`/article/${articleid}`);
        }
        else if (userid == null) {
            res.send({
                code: 408,
                msg: "no user id"
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
    let { content, commentid, articleid } = req.body;
    const article = await blogDao.getArticleById(articleid);
    const parentComment = await blogDao.searchCommentById(commentid);
    const parentCommentContent = parentComment.content;
    const parentCommentAccount = (await blogDao.searchUserById(parentComment.user_id)).account;
    const parentCommentId = (await blogDao.searchUserById(parentComment.user_id)).id;
    content = `<p>Reply to <a href='/othersProfile/${parentCommentId}'>${parentCommentAccount}</a> for "${parentCommentContent}" with <strong>${content}</strong> `
    const timeStamp = generateTimestamp();

    try {
        if ((commentid != null && userid != null)) {
            await blogDao.addSubComment(userid, timeStamp, content, commentid);
            const author = await blogDao.searchUserByArticleID(articleid);
            const subscribers = await blogDao.subscribebyList(author[0].userid);
            subscribers.forEach(async subscriber => {
                await blogDao.addNotification(author[0].userid, subscriber.id, 'newComment', commentid, 'Your subscription article comment has a new reply!');
            });
            res.redirect(`/article/${articleid}`);
        }
        else if (userid == null) {
            res.send({
                code: 408,
                msg: "no user id"
            })
        }
        else {
            res.send({
                code: 402,
                msg: "no parent comment id"
            })
        }

    } catch (error) {
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});

router.post('/addsubsubcomment', async function (req, res) {
    let { content, commentid, subcommentid, replytoid, articleid } = req.body;
    const parentComment = await blogDao.searchCommentById(subcommentid);
    const parentCommentContent = formatCommentStr(parentComment.content);
    const parentCommentAccount = (await blogDao.searchUserById(parentComment.user_id)).account;
    const parentCommentId = (await blogDao.searchUserById(parentComment.user_id)).id;
    content = `<p>Reply to <a href='/othersProfile/${parentCommentId}'>${parentCommentAccount}</a> for "${parentCommentContent}" with <strong>${content}</strong> `
    const timeStamp = generateTimestamp();

    try {
        if ((commentid != null && userid != null)) {
            await blogDao.addSubComment(userid, timeStamp, content, commentid);
            res.redirect(`/article/${articleid}`);
        }
        else if (userid == null) {
            res.send({
                code: 408,
                msg: "no user id"
            })
        }
        else {
            res.send({
                code: 402,
                msg: "no parent comment id"
            })
        }

    } catch (error) {
        res.send({
            code: 401,
            msg: "Add Comment failed"
        })
    }
});

function formatCommentStr(string) {
    let regex = /<strong>(.+?)<\/strong>/;
    let match = string.match(regex);
    if (match && match[1]) {
        return match[1];
    } else {
        return string;
    }
}

//add read article feature and add comments here by zliu442 2023/10/13

router.get('/article/:id', async (req, res) => {

    try {
        const articleid = req.params.id;
        const articleInfo = await blogDao.searchArticleById(articleid);
        const articleTime = formatTimestamp(articleInfo.postdate);
        const authorInfo = await blogDao.searchUserById(articleInfo.userid);
        const categoryInfo = await blogDao.searchCategoryById(articleInfo.categoryid);
        const hasLiked = await blogDao.hasUserLikedArticle(userid, articleid);
        const likeCount = await blogDao.countLikesForArticle(articleid);
        const likeUsers = await blogDao.getUsersWhoLikedArticle(articleid);
        const article = {
            id: articleid,
            title: articleInfo.title,
            author: authorInfo.account,
            authorid: authorInfo.id,
            dateTime: articleTime,
            categoryInfo: categoryInfo,
            content: articleInfo.content,
            imagename: articleInfo.imagename,
            hasLiked: hasLiked,
            likeColor: hasLiked ? 'red' : 'black',
            likeCount: likeCount,
            usersLiked: likeUsers,
            currentUser: {
                id: userid
            }
        }

        const processedComments = await processComments(article, articleid);

        //check if subscribed
        res.locals.isSubscribed = await ifSubscribed(userid, article.authorid);

        res.locals.userid = userid;
        res.locals.comment = processedComments;
        res.locals.article = article;
        res.render('articlereader');


    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/deletecomment', async (req, res) => {
    try {
        const commentid = req.query.commentid;
        const articleid = req.query.articleid;
        await blogDao.deleteCommentByParentCommentID(commentid);
        await blogDao.deleteCommentById(commentid);
        res.redirect(`/article/${articleid}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('update category error');
    }

});

//function processComments use for print comment list by zliu442
async function processComments(article, articleid) {
    const comment = await blogDao.searchCommentByArticleID(articleid);

    for (let item of comment) {
        item.author = await blogDao.searchUserById(item.user_id);
        item.timeDate = formatTimestamp(item.timeDate);
        item.replyee = article.author;
        item.replyeeid = article.authorid;
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
router.get('/subscribelist/:userid', async (req, res) => {
    try {
        const userId = req.params.userid;
        const subscriber = await blogDao.subscribetoList(userId);
        const follower = await blogDao.subscribebyList(userId);
        res.locals.subscriber = subscriber;
        res.locals.follower = follower;
        res.locals.user = await blogDao.searchUserById(userId);
        let articleList = [];
        for (let item of subscriber) {
            Array.prototype.push.apply(articleList, await blogDao.searchArticlesByUserAccount(item.id));
        }
        //sort the articlelist in the order of time reverse
        articleList.sort((a, b) => b.postdate - a.postdate);
        for (let item of articleList) {
            item.postdate = formatTimestamp(item.postdate);
            item.author = await blogDao.searchUserById(item.userid);
        }
        res.locals.subscribeArticle = articleList;
        res.render('subscribelist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
router.get('/article/:id', async (req, res) => {

    const articleId = req.params.id;
    const article = await blogDao.getArticleById(articleId);
    res.render('articlePage', { article });
});
//to otherprofile router create by zliu442
router.get('/othersProfile/:otheruserid', async (req, res) => {
    try {
        const otherUserId = req.params.otheruserid;
        const otherUser = await blogDao.searchUserById(otherUserId);
        res.locals.isSubscribed = await ifSubscribed(userid, otherUserId);
        res.locals.userid = userid;
        res.locals.otheruser = otherUser;
        const articleList = await blogDao.searchArticlesByUserAccount(otherUserId);
        articleList.forEach(item => {
            item.postdate = formatTimestamp(item.postdate);
        })
        res.locals.articles = articleList;
        res.render('othersProfile');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//subscribe route create by zliu442
router.get('/subscribe', async (req, res) => {
    try {
        const userid = req.query.userid;
        const otheruserid = req.query.otheruserid;
        await blogDao.addSubscribe(userid, otheruserid);
        const user = await blogDao.searchUserById(userid);
        console.log(user)
        const otherUser = await blogDao.searchUserById(otheruserid);
        const userName = user.account;
        const otherUserName = otherUser.account;
        const content = "Congratulation!" + otherUserName + "," + userName + " has subscribed to you!";
        await blogDao.addNotification(userid, otheruserid, "newSubscriber", 0, content)
        res.redirect(`othersProfile/${otheruserid}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('add subscribe error');
    }
});

router.get('/unsubscribe', async (req, res) => {
    try {
        const userid = req.query.userid;
        const otheruserid = req.query.otheruserid;
        await blogDao.deleteSubscribe(userid, otheruserid);
        res.redirect(`othersProfile/${otheruserid}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('delete subscribe error');
    }
});
//check if subscribe by zliu442
async function ifSubscribed(userid, otherUserId) {
    //check if subscribed
    if (userid != null) {
        const isSubscribed = await blogDao.checkSubscribe(userid, otherUserId);
        return isSubscribed;
    }

}

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





//api create by zli178
router.post('/api/login', async function (req, res) {
    let { account, password } = req.body;

    try {
        let userDetails = await blogDao.searchUsersByAccount(account, password);

        if (userDetails.length > 0) {
            let loginToken = uuidv4();
            await blogDao.updateToken(userDetails[0].id, loginToken);
            res.cookie('authToken', loginToken);
            res.status(204).end();
        } else {
            res.status(401).json({ message: 'Authentication failed!' });
        }
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});



router.get("/api/logout", function (req, res) {
    res.clearCookie("authToken");
    res.status(204).end();
});

router.get("/api/users", async function (req, res) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
    }

    const user = await blogDao.userAuthenticatorToken(token);
    console.log('Queried User:', user);
    if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const usersWithArticleCount = await blogDao.getAllUsersWithArticleCount();
    res.json(usersWithArticleCount);
});

router.delete('/api/users/:id', async function (req, res) {
    const token = req.cookies.authToken;
    const userIdToDelete = req.params.id;

    try {
        if (!token) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const user = await blogDao.userAuthenticatorToken(token);
        if (!user || !user.isAdmin) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await blogDao.deleteUserAndRelatedData(userIdToDelete);

        res.status(204).end();
    } catch (error) {
        console.error("Error during user deletion:", error);
        res.status(500).json({ message: "Delete failed" });
    }
});



router.get('/notification/:userid', async (req, res) => {
    try {
        const userId = req.params.userid;
        const notifications = await blogDao.searchNotificationsByUserID(userId);
        res.locals.notifications = notifications;
        res.render('notification');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});





module.exports = router;