const mysql = require('mysql');
const get_connection = require('../../config/database');
const getQuery = require('./query');
const jwt = require('jsonwebtoken')
const secret_key = require('../../config/secret_key.json');

exports.login = function (req, res) {
    var user_info = {
        id : req.body.id,
        pwd : req.body.pwd
    };
    get_connection((conn) => {
        conn.query(getQuery.get_user, [user_info.id], function (err, rows, fields) {
            if (err) {
                conn.release();
                throw err;
            }
            else {
                if (rows.length > 0) {
                    if (rows[0].pwd == user_info.pwd) {
                        const token =jwt.sign({id : rows[0].id, name : rows[0].name},secret_key.secret_key,{
                            expiresIn:'6h',subject:'user_info'
                        });
                        res.cookie(rows[0].id,token);
                        res.send({
                            "code": 200,
                            "success": "login successful",
                            "token": token
                        });
                    }
                    else {
                        res.send({
                            "code": 401,
                            "failed": "not match password"
                        });
                    }
                }
                else {
                    res.send({
                        "code": 401,
                        "failed": "not match ID or Password"
                    });
                }
            }
        });
        conn.release();
    })
}

//login -> id/password part 
exports.signin = function (req, res) {
    var body = req.body;
    var user_obj = [
        body.user_info.id,
        body.user_info.pwd,
        body.profile.phone,
        body.profile.card,
        body.profile.age,
        body.profile.sex
    ]//user table insert value
    var pref_obj = [
        body.user_info.id,
        body.pref.age_min,
        body.pref.age_max,
        body.pref.sex
    ]//pref table insert value
    var sql_pref = mysql.format(getQuery.post_user, pref_obj);
    var sql_user = mysql.format(getQuery.post_user, user_obj);
    var sql_phone = mysql.format(getQuery.get_phone, body.profile.phone);
    //make sql format

    get_connection((conn) => {
        conn.query(sql_phone, function (err, rows, field) {
            if (rows[0] == 0) {
                //user_table id,pwd,phone,card,age,sex insert
                conn.query(sql_user + sql_pref, function (err, rows, field) {
                    if (err) {
                        conn.release();
                        throw err;
                    }
                    else {
                        res.send({
                            "code": 200,
                            "success": "insert pref, user"
                        })
                    }
                })
            } else {
                res.send({
                    "code": 401,
                    "failed": "already sign in"
                })
            }
        })
        conn.release();
    })
}

exports.check_id = function (req, res) {
    var id = req.body.id;
    get_connection((conn) => {
        conn.query(getQuery.get_user, [id], function (err, rows, field) {
            if (err) {
                conn.release();
                throw err;
            }
            else {
                if (rows.length == 0) {
                    res.send({
                        "code": 200,
                        "success": "아이디 중복확인"
                    });
                }
                else {
                    res.send({
                        "code": 401,
                        "failed": "아이디 중복"
                    })
                }
            }
        })
        conn.release();
    })
}
