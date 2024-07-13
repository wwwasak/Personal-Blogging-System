# Personal Blogging System(first project)

**Final project - Blog Management System**

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/0ee28524-6828-447a-a9ff-0cc1174b532d)

## Database init

The server should automatically initialize the database if it needs to (commented code provided in src/db/database.js).
And the tables can be created by running the sql documents.

We have also uploaded a database with articles which can be used to test the function.

npm run dev to start in dev mode

## Libraries & Technologies currently used

These Technologies have been used in this project:

- HTTP Server:
  - express
  - morgan
  - express-handlebars
  - multer
  - cookie-parser 
  - uuid 
- Database:
  - sqlite
  - sqlite-template-strings 
- Development Tooling:
  - nodemon

## Functions


### User

Users can click "login" in the home page and enter their own dashboard.

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/12d895bc-0d99-4849-bd6b-ae407c6f6c21)

If they don't have an account, they can use the link under the submit to create a new account. They can enter their information and pick up an image for their own account.

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/ed9f7f4a-6f33-4c8e-9650-418cc0ef3fe9)

In the dashboard, they can add an article, check their subscribe list and edit their information in their profile. The table and chart in the dashboard will show how popular their articles are. And they can check their notifications by clicking the "envelope" icons.

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/5c14b633-bd6a-4b81-9483-e7225aad4cc2)

They can also edit their articles by an editor after they add their first articles.

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/2d1c54d6-aa5a-4f8b-ac3c-1246fc9d0317)


### Article

Users can browse different categories and choose which kind of articles they like before they login.

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/b50b53dd-fba9-4623-8e49-9f38786e5053)

They can read the article by click the bar.

And in the article reader they can put a comment, reply others comments, press like and subscribe the author. But they need to login to use these functions.  

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/20b2a695-6342-48bc-870a-156247ed8940)

They can also delete the comment from themselves, but they cannot delete others' comments.

### Admin

Normally users can only change their own articles, comments and other related things.

But there is an admin account which can process all the things in this system.

You can login the admin page by click "login" and use the login form besides the general users'.

![image](https://github.com/UOA-PGCIT-FULLTIME/group-6-s2-23-v1/assets/82685227/965c9952-6132-4cb2-a896-bae1907f9f19)

In the admin page, you can change all the users, categories and articles.


