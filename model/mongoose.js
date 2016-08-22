var mongoose = require('mongoose');
var md5 = require('md5');

mongoose.connect('mongodb://localhost/Jack_drifter', {server: {poolSoze: 10}});

//定义漂流瓶模型，病设置数据存储到bottles集合
var bottleModel = mongoose.model('Bottle', new mongoose.Schema(
    {
        owner: String,
        picker: String,
        bottle: Array,
        message: Array
    }, {
        collection: 'bottles'
    }
));


// //Schema
// {
//     bottle:["$picker","$owner"],
//     message:[
//         ["$owner"，"$time","$content"],
//         ["$picker"，"$time","$content"]
// ]
// }

//userprofile
var userInfo = mongoose.model('userinfo', new mongoose.Schema({
        username: String,
        password: String,
        email: String,
        regTime: String
    }, {
        collection: "userinfo"
    }
));

//signup
exports.userreg = function (regbody, callback) {
    var time = Date.now();
    var newuser = {};
    newuser.username = regbody.username;
    //check user
    userInfo.find({username: regbody.username}, function (err, result) {
        if (err) {
            callback(true, {code: 202, msg: "username is exist"})
        } else {
            if (result.length > 0) {
                callback(true, {code: 202, msg: "username is exist"})
            } else {

                newuser.password = md5(regbody.password);
                newuser.email = regbody.email;
                newuser.time = time;
                newuser = new userInfo(newuser);

                //save to db
                newuser.save(function (err, result) {
                    if (err) {
                        callback(true, {code: 201, msg: "connect err"});
                    } else {
                        callback(false, {code: 200, msg: "success"});
                    }
                })
            }
        }
    })
};

exports.userlog = function (logbody, callback) {
    userInfo.find({
        username: logbody.username,
        password: md5(logbody.password)
    }, function (err, result) {
        if (err) {
            callback(true, {code: 201, msg: "login failed"});
        }
        else {
            if (result.length > 0) {
                callback(false, {code: 200, msg: "success"})
            } else {
                callback(true, {code: 202, msg: "username or passwords is not match"})
            }
        }
    })
};

exports.save = function (picker, _bottle, callback) {
    var bottle = {owner: "", bottle: [], message: []};
    bottle.bottle.push(picker);
    bottle.owner = _bottle.owner;
    bottle.pciker = '';
    bottle.message.push([_bottle.owner, _bottle.time, _bottle.content]);
    bottle = new bottleModel(bottle);

    //mongoose保存的方法
    bottle.save(function (err, result) {
        callback(err, result)
    });
};


//获取指定id的漂流瓶
exports.getOne = function (_id, callback) {
    //通过id获取指定的漂流瓶
    bottleModel.findById(_id, function (err, bottle) {
        if (err) return callback({code: 0, msg: "读取漂流瓶失败..."});
        callback({code: 1, msg: bottle})
    })
};

exports.reply = function (_id, reply, callback) {
    reply.time = reply.time || Date.now();
    //通过ID找到回复的漂流瓶
    bottleModel.findById(_id, function (err, _bottle) {
        if (err) {
            return callback(true, {code: 0, msg: "回复漂流瓶失败"});
        }
        else {
            var newBottle = {};
            newBottle.bottle = _bottle.bottle;
            newBottle.picker = reply.user;
            newBottle.message = _bottle.message;
            //如果已经回复，则在bottle键添加漂流瓶主人
            //如果已经回复过漂流瓶，则不再添加
            if (newBottle.bottle.length === 1) {
                newBottle.bottle.push(_bottle.message[0][0]);
            }
            //在message添加回复信息
            newBottle.message.push([reply.user, reply.time, reply.content]);
            //更新数据库中该漂流瓶的信息
            bottleModel.findByIdAndUpdate(_id, newBottle, null, function (err, bottle) {
                if (err) {
                    return callback(true, {code: 0, msg: "回复漂流瓶失败..."});
                }
                //返回漂流瓶信息
                return callback(false, {code: 1, msg: bottle});
            });
        }
    });
};

//获取瓶子列表
exports.getAll = function (user, callback) {
    //{"owner":user,"bottle":{$exists:true},$where:'this.bottle.length>1'}
    bottleModel.find({
        "picker": user,
        "bottle": {$exists: true},
        $where: 'this.bottle.length>1'
    }, function (err, result) {
        if (err) {
            return callback(true, {code: 0, msg: "获取漂流瓶列表失败..."});
        }
        else {

            return callback(false, {code: 1, msg: result});
        }
    });
};