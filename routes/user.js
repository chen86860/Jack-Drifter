var express = require('express');
var router = express.Router();
var mongoose = require('../model/mongoose');

/* GET users listing. */
router.route('/')
    .get(function (req, res, next) {
        res.render('login')
    });

router.route('/login')
    .get(function (req, res, next) {
        res.render('login')
    })
    .post(function (req, res, next) {
        if (req.body.username && req.body.password) {
            mongoose.userlog(req.body, function (err, result) {
                if (err) {
                    res.json(result);
                } else {
                    //生成session
                    req.session.username = req.body.username;
                    res.json(result)
                }
            })
        }
    });

router.route('/signup')
    .get(function (req, res, next) {
        res.render('signup');
    })
    .post(function (req, res, next) {
        if (req.body.username && req.body.password && req.body.email) {
            mongoose.userreg(req.body, function (err, result) {
                if (err) {
                    return res.json(result);
                } else {
                    //生成session
                    req.session.username = req.body.username;
                    res.json(result);
                }
            })
        }
    });

module.exports = router;
