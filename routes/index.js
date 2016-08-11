var express = require('express');
var router = express.Router();
var redis = require('../model/redis');

/* GET drifter bottom. */
router.route('/').get(function (req, res, next) {
    res.render('index')
});
router.route('/api')
    .get(function (req, res, next) {
        if (req.query.owner) {
            if (req.query.type && (["male", "female"].indexOf(req.query.type) != -1)) {
                redis.pick(req.query, function (result) {
                    res.json(result);
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

module.exports = router;
