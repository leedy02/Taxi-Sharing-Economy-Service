const get_connection = require('../../config/database');

module.exports = {
    login :function (req, res) {
        get_connection((conn)=>{
            conn.query("select * from user",function (err, rows, fields) {
                res.json({
                    token: "adsfasdfad",
                    row : rows
                });
            });
            conn.release();
        })
       
    },
    signin : function (req, res) {
        res.send("nope");
    }
};
