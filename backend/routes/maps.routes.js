const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapsController = require('../controllers/map.controller');
const { query } = require('express-validator');

router.get('/coordinates',
    query('address').isString().isLength({min: 3}),
    authMiddleware.authUser, mapsController.coordinates
);

router.get('/distanceTime',
    query('origin').isString().isLength({min: 3}),
    query('destination').isString().isLength({min: 3}),
    authMiddleware.authUser, mapsController.distanceTime
);

router.get('/suggestions',
    query('input').isString().isLength({min: 3}),
    authMiddleware.authUser, mapsController.suggestions
);

module.exports = router;