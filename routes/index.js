var express = require('express');
var router = express.Router();
var redis = require('../model/redis');
var mongodb = require('../model/mongoose');

/* GET drifter bottom. */
router.route('/').get(function (req, res, next) {
    res.render('index')
});

router.route('/bottle/:_id').get(function (req, res, next) {
    mongodb.getOne(req.params._id, function (result) {
        res.json(result);
    });
});

router.route('/reply/:_id')
    .post(function (req, res, next) {
        if (req.body.user && req.body.content) {
            mongodb.reply(req.params._id, req.body, function (result) {
                res.json(result);
            })
        } else {
            return callback({code: 0, msg: '回复信息不完整呀～'});
        }
    });

router.route('/api')
    .get(function (req, res, next) {
        if (req.query.user) {
            if (req.query.type && (["male", "female"].indexOf(req.query.type) != -1)) {
                redis.pick(req.query, function (result) {
                    if (result.code === 1) {
                        mongodb.save(req.query.user, result.msg, function (err) {
                            if (err) {
                                res.json({code: 0, msg: "获取信息失败"});
                            }
                            else {
                                res.json(result);
                            }
                        })
                    } else {
                        res.json(result);
                    }

                })
            } else {
                return res.json({"code": 0, "msg": "类型错误"})
            }
        } else {
            return res.json({"code": 0, "msg": "信息不完整1"})
        }
    })
    .post(function (req, res, next) {
        if ((req.body.owner && req.body.type && req.body)) {
            if (req.body.type && (['male', 'female'].indexOf(req.body.type)) != -1) {
                redis.throw(req.body, function (result) {
                    res.json(result);
                })
            } else {
                return res.json({"code": 0, "msg": "类型选择错误"})
            }
        }
        else {
            return res.json({"code": 0, "msg": '信息不完整2'});
        }
    });
router.route('/user/:user').get(function (req, res, next) {
    mongodb.getAll(req.params.user, function (err, result) {
        res.json(result)
    })
});

module.exports = router;
