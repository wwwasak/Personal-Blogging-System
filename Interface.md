## Database

blog-database.db
user {id-Integer,account-Text,password-Text,token-Text} 
article {id-Integer, title-Text, content-Text, imagelocation-Text, postdate-Date,*(user)userid,Integer, *(user)account-Text}
userlike  {user_id, article_id}
comment 
category 

## Frontend



## Backend

method:
add - post
update - put
delete - delete
search - get

