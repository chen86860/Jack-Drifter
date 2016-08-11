var redis = require('redis');
var uuid = require('uuid');
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
    name: 'redisPool',
    create: function (callback) {
        var client = redis.createClient();
        callback(null, client)
    },
    destory: function (client) {
        client.quit();
    },
    max: 100,
    min: 5,
    idleTimeoutMillis: 30000
    // log: true
});

//扔一个瓶子
function throwOneBottle(bottle, callback) {
    bottle.time = bottle.time || Date.now();
    //为每个瓶子生成唯一的id
    var bottleId = uuid.v4();
    var type = {male: 0, female: 1};
    pool.acquire(function (err, client) {
        if (err)return callback({"code": 0, "msg": err});
        client.select(type[bottle.type], function () {
            //以hash类型保存漂流瓶对象
            //将类别不同的漂流瓶放在不同的数据库，方便后期随机获取
            //HMSET key field value [field value ...]
            client.HMSET(bottleId, bottle, function (err, result) {
                if (err)return callback({"code": 0, "msg": "过会儿再试试吧～"})
                client.EXPIRE(bottleId, 86400, function () {
                    pool.release(client)
                })
            })
        })
    })
}


function pickOneBottle(info, callback) {
    var type = {all: Math.round(Math.random()), male: 0, female: 1};
    info.type = info.type || 'all';
    pool.acquire(function (err, client) {
        if (err)return callback({"code": 0, "msg": err})
        //根据请求类型从不同的数据库中取
        client.select(type[info.type], function () {
            //随机返回一个瓶子id
            client.randomkey(function (err, bottleId) {
                if (err)return callback({code: 0, msg: err});
                if (!bottleId) return callback({code: 0, msg: "大海空空如也。。。"})
                client.hgetall(bottleId, function (err, bottle) {
                    if (err)return callback({code: 0, msg: "漂流瓶破损了。。。"})
                    //从redis中删除漂流瓶
                    client.del(bottleId, function () {
                        pool.release(client);
                    });
                    callback({code: 1, msg: bottle})
                })
            });

        });
    });
}

exports.throw = function (bottle, callback) {
    throwOneBottle(bottle, function (result) {
        callback(result);
    })
};

exports.pick = function (info, callback) {
    pickOneBottle(info, function (result) {
        callback(result);
    });
};

