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
);

insert into user(id,account,password) values
    (1,'Sean','123456'),
    (2,'Demo','456234'),
    (3,'Clarke','abcdefg'),
    (4,'Admin','1wde356fg')
