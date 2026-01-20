const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const captainModel = require('../models/captain.model');
const { emitToSocketIds } = require('../socket');
const rideModel = require('../models/ride.model');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;
    try {
        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType,
        });
        const available = await captainModel.find({ status: 'available', socketId: { $ne: null }, 'vehicle.vehicleType': vehicleType }, { socketId: 1 });
        const socketIds = available.map(c => c.socketId).filter(Boolean);
        emitToSocketIds('ride:offer', {
            rideId: String(ride._id),
            pickup: ride.pickup,
            destination: ride.destination,
            fare: ride.fare,
            userId: String(req.user._id),
            userName: req.user.fullname,
        }, socketIds);
        res.status(201).json({ ride });
    } catch (error) {
        res.status(400).json({ errors: [{ msg: error.message }] });
    }
}


module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const { pickup, destination } = req.query;
    try {
        const fare = await rideService.getFare(pickup, destination);
        res.status(200).json({ fare });
    } catch (error) {
        res.status(400).json({ errors: [{ msg: error.message }] });
    }
}

module.exports.getRideById = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    try {
        const ride = await rideModel.findById(id).populate('captain');
        if(!ride) return res.status(404).json({ errors: [{ msg: 'Ride not found' }] });
        res.status(200).json({ ride });
    } catch (error) {
        res.status(400).json({ errors: [{ msg: error.message }] });
    }
}