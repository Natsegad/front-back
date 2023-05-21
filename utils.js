const crypto = require('crypto')

const slat = "iXAhyJ7YfA0wLxPMDAh6856R3FU/LV0JOBYKZYmoSn/W2mSCqOp82Ih9D/4AG3fzfW+UFZ+by4n78Dkq516U/Wb6RZs+vA6Fl83QXDO74ZmjGodfYt88IKoRbfao0cLKxyKaQV/iPk3HA5MO6TbsbSxvxJ7AeJUm8TEJXRf/bdo=";

exports.crypt_password = (password) => crypto.pbkdf2Sync(password, slat, 10000, 512, 'sha512').toString('hex');
exports.compare_password = (hash, password) => {
    const encryptHash = crypto.pbkdf2Sync(password, slat, 10000, 512, 'sha512')
    return encryptHash.toString('hex') === hash
}
exports.get_req_data = (req) => {
    return new Promise((resolve, reject) => {
        try {
            let body = "";
            // listen to data sent by client
            req.on("data", (chunk) => {
                // append the string version to the body
                body += chunk.toString();
            });
            // listen till the end
            req.on("end", () => {
                // send back the data
                resolve(body);
            });
        } catch (error) {
            reject(error);
        }
    });
}
exports.parse_cookie = (request) => {
    const list = {};
    console.log(request.headers?.cookie)
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}
exports.new_session = (user_id, hours) => {

    let d = new Date(Date.now())
    d.setUTCSeconds(d.getSeconds() + hours * 3600)

    let session = {
        user_id: 0,
        time: new Date(Date.now() + 1 * 3600),
        session_id: 0,
        toString: () => {
            return JSON.stringify(session)
        },
        crypt: () => {
            return Buffer.from(session.toString()).toString("base64")
        }
    }

    session.user_id = user_id;
    session.session_id = this.random_number(0, 1000000);
    session.time = d

    return session;
}
exports.decrypt_session = (session) => {
    return Buffer.from(session, 'base64').toString()
}
exports.random_number = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

exports.query = (db, command, values) => {
    return new Promise((resolve, reject) => {
        db.query(command, values, (err, result) => {
            if (err) {
                console.log("Error")
                return reject(err)
            }else{
                console.log("ok")
                return resolve(result)
            }
        })
    })
}