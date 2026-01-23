const express = require('express');
const router = express.Router();
const { body, validationResult, query, param } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create', 
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Pickup address is not valid'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Destination address is not valid'),
    body('vehicleType').isIn(['motorcycle','auto','car']).withMessage('Vehicle type is not valid'),
    rideController.createRide,
)

router.get('/fare', 
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Pickup address is not valid'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Destination address is not valid'),
    rideController.getFare,
)

router.get('/:id',
    authMiddleware.authUser,
    param('id').isString().isLength({ min: 1 }).withMessage('Ride id is required'),
    rideController.getRideById,
)

router.post('/cancel-open',
    authMiddleware.authUser,
    rideController.cancelOpenRide,
)

module.exports = router;
