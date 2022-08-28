const express = require('express');
const router = express.Router();
const passport = require('passport');

const user = require('../controllers/user');

router.route('/register')
    .get(user.renderRegister)
    .post(user.register);

router.route('/login')
    .get(user.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login' }), user.login) // hier mit flash: failureFlash: true,

router.get('/logout', user.logout)

module.exports = router;