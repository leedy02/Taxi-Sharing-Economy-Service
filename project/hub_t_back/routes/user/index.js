const router = require('express').Router()
const controller = require('./controller');

router.post('/destination',controller.destination);
router.put('/land',controller.land);

module.exports = router;