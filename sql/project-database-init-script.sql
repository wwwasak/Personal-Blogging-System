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
drop table if exists test;

create table test (
    id integer not null primary key,
    stuff text  
);

insert into test (stuff) values
    ('Things'),
    ('More things')

/* comments table created and 4 rows data filled ---- txu470 */
DROP TABLE if exists comments;
CREATE TABLE comments (
    id integer not null PRIMARY KEY,
    user_id integer,
    timeDate TIMESTAMP,
    content TEXT, 
    parentComment integer,
    article_id integer,
    FOREIGN KEY (user_id) REFERENCES users(id), 
    FOREIGN KEY (article_id) REFERENCES articles(id) 
);
INSERT INTO comments (user_id, timeDate, parentComment, article_id)
VALUES
    (1, '2023-10-01 14:30:00', NULL, 1),
    (2, '2023-10-02 15:15:00', NULL, 2),
    (3, '2023-10-03 16:00:00', 1, 1), 
    (4, '2023-10-04 16:45:00', 2, 2); 
