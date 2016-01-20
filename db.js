'use strict';

var pg          = require('pg');
var conString   = "postgres://russell:@localhost:5432/hostels";

var knex = require('knex')({  
  client: 'pg',
  connection: conString,
});

exports.knex = knex;

/* 
SQL for Table Structure

CREATE TABLE hostelworld (
    id bigserial primary key,
    name text,
    email text,
    website text,
    country text,
    city text,
    reviews varchar(20),
    rating varchar(20),
    source text,
    date_created timestamp default NULL
);
ALTER TABLE hostelworld ALTER COLUMN reviews TYPE integer USING (trim(reviews)::integer);
*/