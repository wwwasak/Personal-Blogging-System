/* User table created and 4 rows data filled ---- yji413 */

drop table if exists user;

create table user (
    id integer not null primary key,
    account text,
    password text,
	birthday text,
	description text,
    token text
);

insert into user (id,account,password,birthday,description) values
    (1,'Sean','123456','1983/02/24','This is the first user'),
    (2,'Demo','456234','1990/05/27','This is the second user'),
    (3,'Clarke','abcdefg','1995/04/23','This is the third user'),
    (4,'Admin','1wde356fg','1993/02/23','This is the fourth user');



/* create table named category ---- gli300 */
DROP TABLE if exists category;
  
create table category (

 id integer NOT NULL PRIMARY KEY,

 name varchar(50) NOT NULL,

 description varchar(1000) NOT NULL
 
);
insert into category (id, name, description) values 
(1, 'fiction', 'a type of literature that describes imaginary people and events, not real ones'), 
(2, 'Science', 'Science'),
(3, 'Sports', 'Sports'),
(4, 'Financial', 'Financial');



 /*table article: More info in interface.md; by zipei liu*/
drop table if exists article;

create table article(
    id integer not null primary key,
    title text not null,
    content text not null,
    postdate integer,
    userid integer,
    categoryid integer,
    foreign key (userid) references user(id),
    foreign key (categoryid) references category(id)
);
insert into article (id, title, content, postdate, userid, categoryid) values
    (1, 'Love', '<strong>I love you!</strong>' ,562767818, 3,1),
    (2, 'Boy', '<em>I am a boy!</em>' , 172881287,2,1),
    (4, 'Love', '<strong>I love you!</strong>' ,217886129, 3,1),
    (5, 'Love', '<strong>I love you!</strong>' ,261812711, 3,1),
    (6, 'Love', '<strong>I love you!</strong>' ,187212111, 3,1),
    (3, 'Game', 'I love play game',176281721,1,1 );



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



/* comments table created and 4 rows data filled ---- txu470 */
DROP TABLE if exists comments;
CREATE TABLE comments (
    id integer not null PRIMARY KEY,
    user_id integer,
    timeDate integer,
    content TEXT, 
    parentComment integer,
    article_id integer,
    FOREIGN KEY (user_id) REFERENCES user(id), 
    FOREIGN KEY (article_id) REFERENCES article(id)
    FOREIGN KEY (parentComment) REFERENCES comments(id)
);
INSERT INTO comments (user_id,content,parentComment, article_id)
VALUES
    (1,'This is the first comment.', NULL, 1),
    (2,'Here is the second comment.', NULL, 2),
    (3,'A reply to the first comment.', 1, NULL), 
    (4,'A reply to the second comment.',3, NULL); 

-- subscribe table create and test data filled--zliu442
DROP TABLE if exists subscribes;
CREATE TABLE subscribes(
    id integer not null PRIMARY KEY,
    subscribe_by_userid integer,
    subscribe_to_userid integer,
    FOREIGN KEY (subscribe_by_userid) REFERENCES user(id), 
    FOREIGN KEY (subscribe_to_userid) REFERENCES user(id)
);

INSERT INTO subscribes (id, subscribe_by_userid, subscribe_to_userid) 
VALUES
    (7,1,5)
    (1,1,2),
    (2,1,3),
    (3,1,4),
    (4,2,1),
    (5,3,1),
    (6,4,1)

