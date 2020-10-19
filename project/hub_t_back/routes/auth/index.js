const router = require('express').Router()
const controller = require('./controller');

router.post('/login',controller.login,);
router.post('/signin',controller.signin);

module.exports = router;