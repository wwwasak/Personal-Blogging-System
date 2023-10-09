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