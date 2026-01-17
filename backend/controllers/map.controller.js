const mapsService = require('../services/maps.service');
const { validationResult } = require('express-validator');

module.exports.coordinates = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.query;
    try{
        const coordinates = await mapsService.getAddressCoordinates(address);
        res.status(200).json(coordinates);
    }catch(error){
        console.log(error);
        return res.status(404).json({ error: 'Address not found' });
    }
}

module.exports.distanceTime = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        const { origin, destination } = req.query;
        const distanceTime = await mapsService.getDistanceTime(origin, destination);
        if(!distanceTime){
            return res.status(404).json({ error: 'Error getting distance time' });
        }
        res.status(200).json(distanceTime);
    }catch(err){
        console.log(err);
        return res.status(404).json({ error: 'Error getting distance time' });
    }
}

module.exports.suggestions = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        const { input } = req.query;
        const suggestions = await mapsService.getAddressSuggestions(input);
        if(!suggestions){
            return res.status(404).json({ error: 'Error getting address suggestions' });
        }
        res.status(200).json(suggestions);
    }catch(err){
        console.log(err);
        return res.status(404).json({ error: 'Error getting address suggestions' });
    }
}