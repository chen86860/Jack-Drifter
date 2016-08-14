var express = require('express');
var router = express.Router();
var redis = require('../model/redis');
var mongodb = require('../model/mongoose');

/* GET drifter bottom. */
router.route('/').get(function (req, res, next) {
    if (req.session.username) {
        res.render('index')
    } else {
        res.redirect('/user/login')
    }
});

router.route('/bottle/:_id').get(function (req, res, next) {
    mongodb.getOne(req.params._id, function (result) {
        res.json(result);
    });
});

router.route('/reply')
    .post(function (req, res, next) {
        req.body.user = req.session.username;
        if (req.body.content) {
            mongodb.reply(req.body._id, req.body, function (err, result) {
                if (err) {
                    console.error(result)
                } else {
                    return res.json(result);
                }
            })
        } else {
            return res.json({code: 0, msg: '回复信息不完整呀～'});
        }
    });

router.route('/api')
    .get(function (req, res, next) {
        req.body.type = ['male', 'female'][Math.round(Math.random())];
        req.body.user = req.session.username;
        redis.pick(req.body, function (result) {
            if (result.code === 1) {
                //获取瓶子，如果获取到，则保存到数据库中
                mongodb.save(req.session.username, result.msg, function (err, obj) {
                    if (err) {
                        res.json({code: 0, msg: "获取信息失败"});
                    }
                    else {

                        res.json({
                            result: result,
                            id: obj.id
                        });
                    }
                })
            } else {
                res.json(result);
            }

        })
    })
    .post(function (req, res, next) {
        req.body.owner = req.session.username;

        //性别先用随机函数，后期应从注册的用户信息里获取
        req.body.type = ['male', 'female'][Math.round(Math.random())];
        if (( req.body)) {
            redis.throw(req.body, function (result) {
                res.json(result);
            })
        }
        else {
            return res.json({"code": 0, "msg": '信息不完整2'});
        }
    });

router.route('/userBottle/:user')
    .get(function (req, res, next) {
        mongodb.getAll(req.params.user, function (err, result) {
            if (err) {
                return console.log(result);
            }
            {
                res.json(result);
            }
        })
    });

module.exports = router;
