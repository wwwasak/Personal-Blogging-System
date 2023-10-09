## Database

blog-database.db
user {id-Integer,account-Text,password-Text,token-Text}   
comment {id-Integer,user_id-Integer,content-TEXT,timeDate-TIMESTAMP,parentComment-Integer, article_id-Integer}
article {id-Integer, title-Text, content-Text, imagelocation-Text, postdate-Date,*(user)userid,Integer, *(user)account-Text}
userlike  {user_id, article_id}
category 

## Frontend



## Backend

method:
add - post
update - put
delete - delete
search - get

