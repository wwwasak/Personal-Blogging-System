/* User table created and 4 rows data filled ---- yji413 */

drop table if exists user;

create table user (
    id integer not null primary key,
    account text,
    password text,
	birthday text,
	description text,
    token text,
    isAdmin BOOLEAN DEFAULT FALSE 
);

insert into user (id,account,password,birthday,description,isAdmin) values
    (1,'Sean','123456','1983/02/24','This is the first user',FALSE),
    (2,'Demo','456234','1990/05/27','This is the second user',FALSE),
    (3,'Clarke','abcdefg','1995/04/23','This is the third user',FALSE),
    (4,'Admin','1wde356fg','1993/02/23','This is the fourth user',TRUE),
    (5,'zliu442','20000721','2000/07/21','This is the fifth user',FALSE);



/* create table named category ---- gli300 */
DROP TABLE if exists category;
  
create table category (

 id integer NOT NULL PRIMARY KEY,

 name varchar(50) NOT NULL,

 description varchar(1000) NOT NULL
 
);
insert into category (id, name, description) values 
(1, 'Fiction', 'a type of literature that describes imaginary people and events, not real ones'), 
(2, 'Science', 'knowledge about the structure and behaviour of the natural and physical world, based on facts that you can prove, for example by experiments'),
(3, 'Sports', 'activity that you do for pleasure and that needs physical effort or skill, usually done in a special area and according to fixed rules'),
(4, 'Financial', 'the activity of managing money, especially by a government or commercial organization'),
(5, 'Financial', 'the activity of managing money, especially by a government or commercial organization'),
(6, 'Financial', 'the activity of managing money, especially by a government or commercial organization');



 /*table article: More info in interface.md; by zipei liu*/
drop table if exists article;

create table article(
    id integer not null primary key,
    title text not null,
    content text not null,
    postdate integer,
    userid integer,
    categoryid integer,
    imagename text,
    foreign key (userid) references user(id),
    foreign key (categoryid) references category(id)
);
insert into article (id, title, content, postdate,imagename, userid, categoryid) values
    (1, 'Love', '<strong>I love you!</strong>' ,562767818,'',3,1),
    (2, 'Boy', '<em>I am a boy!</em>' , 172881287,'',2,1),
    (4, 'Love', '<strong>I love you!</strong>' ,217886129, '',3,1),
    (5, 'Love', '<strong>I love you!</strong>' ,261812711, '',3,1),
    (6, 'Love', '<strong>I love you!</strong>' ,187212111,'' ,3,1),
    (3, 'Game', 'I love play game',176281721,'',1,1 );



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
    FOREIGN KEY (article_id) REFERENCES article(id),
    FOREIGN KEY (parentComment) REFERENCES comments(id)
);
INSERT INTO comments (user_id,content,parentComment, article_id)
VALUES
    (1,'This is the first comment.', NULL, 1),
    (2,'Here is the second comment.', NULL, 2),
    (3,'A reply to the first comment.', 1, NULL), 
    (4,'A reply to the second comment.',3, NULL); 

-- add Notification related database----txu470
DROP TABLE if exists notifications;
CREATE TABLE notifications (
    id INT NOT NULL PRIMARY KEY,
    recipient_id INT, 
    notification_type TEXT CHECK (notifications.notification_type IN ('newBlog', 'newComment', 'newLike','newSubscriber')),
    related_object_id INT, 
    sender_id INT, 
    content TEXT,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES user(id),
    FOREIGN KEY (sender_id) REFERENCES user(id)
);


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
    (7,1,5),
    (1,1,2),
    (2,1,3),
    (3,1,4),
    (4,2,1),
    (5,3,1),
    (6,4,1);



