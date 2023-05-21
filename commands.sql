create table test.users(
    user_id serial primary key,
    login varchar(50) unique,
    password text,
    name varchar(50),
    photo text,
    date_of_birth date
);
create index indx_users on test.users(login);
create table test.sessions(session_id serial, session text);