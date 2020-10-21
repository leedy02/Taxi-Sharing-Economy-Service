module.exports={
    get_user : "select * from user where id = ?",
    get_phone : "select * from user where phone = ?",
    post_user : "insert into user(id,pwd,phone,card,age,sex) values(?,?,?,?,?,?)",
    post_pref : "insert into pref_user(id,age_min,age_max,sex) values(?,?,?,?)"
}