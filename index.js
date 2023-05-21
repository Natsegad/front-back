const http = require('http')
const url = require('url')
const mysql = require('mysql')
const utils = require('./utils.js')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test",
    password: "13134777r"
})

connection.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("Db connect ok")
    }
})


let server = new http.Server(async (req, res) => {
    try {
        var jsonString = '';
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Credentials', ' true');
        if (req.method === "OPTIONS") {

            res.writeHead(200)
            res.end()
            return
        }
        var u = url.parse(req.url, true);
        var p = u.pathname;
        console.log(u, p)
        switch (p) {
            case "/ssdelete": {
                if (req.method === "DELETE") {

                    const query = u.query;
                    const user_id = query.user_id;
                    const ssid = req.headers["authorization"];
                    if (!user_id || !ssid) {
                        throw new Error("Invalid input parameters");
                    }

                    const find_session_sql = "select * from sessions where session_id= ?;";
                    let user_session = await utils.query(connection, find_session_sql, [ssid])
                    const db_session = user_session[0]?.session;

                    if (db_session === undefined) {
                        throw new Error("ss not found");
                    }

                    const dec_session = JSON.parse(utils.decrypt_session(db_session));
                    if (!dec_session) {
                        throw new Error("Error server");
                    }

                    if (dec_session.user_id.toString() !== user_id) {
                        throw new Error("Session user error !");
                    }

                    const delete_user_session = "delete from sessions where session_id=?"
                    await utils.query(connection, delete_user_session, [ssid])

                    res.writeHead(200);
                    res.end('ok');
                }
                return;
            }
            case "/": {
                if (req.method === "GET") {

                    const query = u.query;
                    const user_login = query.login;
                    const user_password = query.password;

                    if (!user_login || !user_password) {
                        throw new Error("Invalid input parameters");
                    }

                    const user_result = await utils.query(connection, "select * from users where login=?", [user_login]);
                    const db_password = user_result[0]?.password;

                    if (db_password === undefined || !utils.compare_password(db_password, user_password)) {
                        throw new Error("Invalid login or password");
                    }

                    const user_id = user_result[0].user_id;
                    const session = utils.new_session(user_id, 2);

                    await utils.query(connection, "insert into sessions (session_id, session) values (?, ?)", [session.session_id, session.crypt()]);

                    res.setHeader("Authorization", `${session.session_id}`);
                    res.setHeader("Set-Cookie", `SSID=${session.session_id}`);
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(200);
                    res.end(JSON.stringify(user_id));


                }
                return
            }
            case "/user": {
                if (req.method === "GET") {

                    const query = u.query;
                    const user_id = query.user_id;
                    const ssid = req.headers["authorization"];

                    if (user_id === undefined || ssid === undefined) {
                        throw new Error("error url");
                    }

                    await connection.beginTransaction();

                    const session_result = await utils.query(connection, "select * from sessions where session_id=?", [ssid]);
                    const db_session = session_result[0]?.session;

                    if (db_session === undefined) {
                        throw new Error("ss not found");
                    }

                    const dec_session = JSON.parse(utils.decrypt_session(db_session));

                    if (dec_session.user_id.toString() !== user_id) {
                        throw new Error("Error user");
                    }

                    const session_time = new Date(dec_session.time);
                    const current_time = Date.now();

                    if (session_time > current_time) {
                        const userResult = await utils.query(connection, "select * from users where user_id=?", [user_id]);

                        const db_user = userResult[0];
                        const user_info = {
                            name: db_user?.name || "",
                            image: db_user?.photo || "",
                            birth_date: db_user?.date_of_birth || "",
                        };

                        res.writeHead(200);
                        res.end(JSON.stringify(user_info));
                    } else {
                        throw new Error("Logout");
                    }

                    await connection.commit();

                }
                return
            }
            case "/create": {
                if (req.method === "POST") {

                    const data = JSON.parse(await utils.get_req_data(req));
                    const password = utils.crypt_password(data.password);

                    const insert_user_query = 'insert users (name, login, password, photo, date_of_birth) values (?, ?, ?, ?, ?)';
                    const select_user_id_query = 'select user_id from users where login = ?';
                    const insert_session_query = 'insert into sessions (session_id, session) values (?, ?)';

                    await connection.beginTransaction();

                    const insert_user_result = await utils.query(connection, insert_user_query, [data.name, data.login, password, data.photo, new Date(data.date_of_birth)]);
                    console.log(insert_user_result)
                    const select_user_id_result = await utils.query(connection, select_user_id_query, [data.login]);

                    const user_id = select_user_id_result[0].user_id;
                    const session = utils.new_session(user_id, 2);

                    await utils.query(connection, insert_session_query, [session.session_id, session.crypt()]);

                    await connection.commit();

                    res.setHeader("Authorization", `${session.session_id}`);
                    res.setHeader("Set-Cookie", `SSID=${session.session_id}`);
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(200);
                    res.end(`${user_id}`);

                }
                break;
            }

        }

    } catch (error) {
        await connection.rollback();
        console.log("eRROR", error)
        const errorMessage = `{ error: ${error} }`;
        res.writeHead(400);
        res.end(errorMessage);
    }
});
server.listen(8000, 'localhost');