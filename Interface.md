## Database

blog-database.db
user {id-Integer,account-Text,password-Text,token-Text}   
comment {id-Integer,user_id-Integer,content-TEXT,timeDate-TIMESTAMP,parentComment-Integer, article_id-Integer}
article {id-Integer, title-Text, content-Text, imagelocation-Text, postdate-Date,categoryid-Integer*(user)userid,Integer}
userlike  {user_id, article_id}
category 

## Frontend



## Backend

method:
add - post
update - put
delete - delete
search - get

Add Article : 1. add articles with title, category, content, userid
Add comment: 1. add comments with userid, comment id, article id

Delete Article: 1. delete articles with userid
Delete comment: 1. delete comments with userid

search Article: 1. search article with keyword, categoryid

update Article: 1. update article with userid, category id, title, content

router/Dao method
