const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create', 
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Pickup address is not valid'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Destination address is not valid'),
    body('vehicleType').isIn(['motorcycle','auto','car']).withMessage('Vehicle type is not valid'),
    rideController.createRide,
)


module.exports = router;
