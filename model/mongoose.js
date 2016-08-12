var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/Jack_drifter', {server: {poolSoze: 10}});

//定义漂流瓶模型，病设置数据存储到bottles集合
var bottleModel = mongoose.model('Bottle', new mongoose.Schema(
    {
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

exports.save = function (picker, _bottle, callback) {
    var bottle = {bottle: [], message: []};
    bottle.bottle.push(picker);
    bottle.message.push([_bottle.owner, _bottle.time, _bottle.content]);
    bottle = new bottleModel(bottle);

    //mongoose保存的方法
    bottle.save(function (err) {
        callback(err)
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
            return callback({code: 0, msg: "回复漂流瓶失败"});
        }
        else {
            var newBottle = {};
            newBottle.bottle = _bottle.bottle;
            newBottle.message = _bottle.message;
            //如果已经回复，则在bottle键添加漂流瓶主人
            //如果已经回复过漂流瓶，则不再添加
            if (newBottle.bottle.length === 1) {
                newBottle.bottle.push(_bottle.message[0][0]);
            }
            //在message添加回复信息
            newBottle.message.push([reply.user, reply.time, reply.content]);
            //更新数据库中该漂流瓶的信息
            bottleModel.findByIdAndUpdate(_id, newBottle, function (err, bottle) {
                if (err) {
                    return callback({code: 0, msg: "回复漂流瓶失败..."});
                }
                //返回漂流瓶信息
                callback({code: 1, msg: bottle});
            });
        }
    });
};

exports.getAll = function (user, callback) {
    console.log(user);
    bottleModel.find({bottle:user},function(err,result){
        if (err) return callback({code: 0, msg: "获取漂流瓶列表失败..."});
        callback({code: 1, msg: result});
    })
    // bottleModel.find({bottle: user.toString()}, function (err, bottles) {
    //     if (err) return callback({code: 0, msg: "获取漂流瓶列表失败..."});
    //     callback({code: 1, msg: bottles});
    // });
};