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

create table category (

 id integer NOT NULL PRIMARY KEY,

 name varchar(50) NOT NULL,

 description varchar(1000) NOT NULL,

 FOREIGN KEY (user_id) REFERENCES user (id)
);

insert into category (id, name, description) values (1, 'fiction', 'a type of literature that describes imaginary people and events, not real ones');