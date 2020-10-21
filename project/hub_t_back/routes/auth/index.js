const router = require('express').Router()
const controller = require('./controller');

router.post('/login',controller.login,);
router.get('/check_id',controller.check_id);
router.post('/signin',controller.signin);

module.exports = router;