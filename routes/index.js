var express = require('express');
var router = express.Router();
var redis = require('../model/redis');
var mongodb = require('../model/mongoose');


//输入检查
function checkInput(input) {
    var patrn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;
    if (patrn.test(input)) {
        return false;
    }
    return true;
}
/* GET drifter bottom. */
router.route('/').get(function (req, res, next) {
    if (req.session.username) {
        res.render('index')
    } else {
        res.redirect('/user/login')
    }
});

router.route('/bottle').post(function (req, res, next) {
    if (!req.session.username) {
        res.json({code: 302, msg: "error"});
    } else {
        mongodb.getOne(req.body.id, function (result) {
            res.json(result);
        });
    }
});

router.route('/reply')
    .post(function (req, res, next) {
        if (!req.session.username) {
            res.json({code: 302, msg: "error"});
        } else {
            req.body.user = req.session.username;            
            if(checkInput(req.body.content)) {
                mongodb.reply(req.body.id, req.body, function (err, result) {
                    if (err) {
                        res.json({code: 0, msg: "succeed"});
                    } else {
                        res.json({code: 1, msg: "succeed"});
                    }
                })
            } else {
                return res.json({code: 0, msg: '回复信息不完整呀～'});
            }
        }
    });

router.route('/api')
    .get(function (req, res, next) {
        if (!req.session.username) {
            res.json({code: 302, msg: "error"});
        } else {
            req.body.type = ['male', 'female'][Math.round(Math.random())];
            req.body.user = req.session.username;
            redis.pick(req.body, function (result) {
                if (result.msg.owner) {
                    //获取瓶子，如果获取到，则保存到数据库中
                    mongodb.save(req.session.username, result.msg, function (err, obj) {
                        if (err) {
                            res.json({code: 0, msg: "获取信息失败"});
                        }
                        else {
                            res.json({
                                owner: result.owner,
                                result: result,
                                id: obj.id
                            });
                        }
                    })
                } else {
                    res.json(result);
                }
            })
        }
    })
    .post(function (req, res, next) {
        if (!req.session.username) {
            res.json({code: 302, msg: "error"});
        } else {
            req.body.owner = req.session.username;
            //性别先用随机函数，后期应从注册的用户信息里获取
            req.body.type = ['male', 'female'][Math.round(Math.random())];
            if (checkInput(req.body.content)) {
                redis.throw(req.body, function (err, result) {
                    if (err) {
                        res.json({code: 0, msg: "Oops,some thing has wrong"});
                    } else {
                        res.json({code: 1, msg: "succeed"});
                    }
                })
            }
            else {
                return res.json({"code": 0, "msg": '信息不完整2'});
            }
        }
    });

router.route('/userBottle')
    .get(function (req, res, next) {
        if (!req.session.username) {
            res.json({code: 302, msg: "error"});
        } else {
            mongodb.getAll(req.session.username, function (err, result) {
                if (err) {
                    console.error(result);
                }
                {
                    res.json(result);
                }
            })
        }
    });

module.exports = router;
