/*
 * Upon submission, this file should contain the SQL script to initialize your database.
 * It should contain all DROP TABLE and CREATE TABLE statments, and any INSERT statements
 * required.
 * 
 * It is recommened for your server automatically create & init the database
 * 
 * However this script will serve as documentation / backup for how your database is designed
 */

/* User table created and 4 rows data filled ---- yji413 */
drop table if exists user;

create table user (
    id integer not null primary key,
    account text,
    password text,
    token text  
  
insert into user(id,account,password) values
    (1,'Sean','123456'),
    (2,'Demo','456234'),
    (3,'Clarke','abcdefg'),
    (4,'Admin','1wde356fg')
  
 
 /* User table created and 4 rows data filled ---- Ricky */
DROP TABLE if exists userlike;

CREATE TABLE userlike (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id INTEGER,
    article_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (article_id) REFERENCES article(id),
    UNIQUE(user_id, article_id) 
 );
INSERT INTO userlike (user_id, article_id) VALUES (1, 1);
INSERT INTO userlike (user_id, article_id) VALUES (2, 3);
INSERT INTO userlike (user_id, article_id) VALUES (3, 2);
INSERT INTO userlike (user_id, article_id) VALUES (1, 2);

  
/* create table named category ---- gli300 */
DROP TABLE if exists category;
  
create table category (

 id integer NOT NULL PRIMARY KEY,

 name varchar(50) NOT NULL,

 description varchar(1000) NOT NULL,

 FOREIGN KEY (user_id) REFERENCES user (id)
);
insert into category (id, name, description) values (1, 'fiction', 'a type of literature that describes imaginary people and events, not real ones');  
  
/*table article: More info in interface.md; by zipei liu*/
create table artical (
    id integer not null primary key,
    title text not null,
    content text not null,
    imagelocation text like '/images/%',  
    postdate date not null like'_____-__-__',
    userid integer,
    account text,
    foreign key userid references user(id),
    foreign key account references user(account)
);

insert into artical(id, title, content,imagelocation, postdate, userid, account, userid, account)values
    (0, 'Love', '<strong>I love you!</strong>', , '2023-10-9', 3, 'Zipei Liu')
    (1, 'Boy', '<em>I am a boy!</em>','/images/boy.jpeg' , '2023-10-16', 5, 'Guanzhuo Li')
    (2, 'Game', 'I love play game', ,,'2023-10-8',1,'Clarke' )  
