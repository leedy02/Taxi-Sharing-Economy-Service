const router = require('express').Router()
const controller = require('./controller');

router.put('/accept',controller.accept);
router.get('/available_taxi',controller.available_taxi);
router.put('/deny',controller.deny);
router.get('/new_taxi',controller.new_taxi);
router.put('/not_anymore',controller.not_anymore);

module.exports = router;