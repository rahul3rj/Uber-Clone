const rideModel = require('../models/ride.model');
const mapService = require('../services/maps.service');
const crypto = require('crypto');

async function getFare(pickup, destination){
    if(!pickup || !destination) throw new Error('Pickup and destination are required');

    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    if(!distanceTime) throw new Error('Error getting distance time');

    const parseDistanceKm = (text) => {
        const s = String(text || '').toLowerCase().replace(/,/g, '').trim();
        let n = parseFloat(s);
        if (s.includes('km')) return isNaN(n) ? 0 : n;
        if (s.includes('m')) return isNaN(n) ? 0 : n / 1000;
        if (s.includes('mi')) return isNaN(n) ? 0 : n * 1.60934;
        return isNaN(n) ? 0 : n;
    };

    const parseDurationMin = (text) => {
        const s = String(text || '').toLowerCase();
        const days = s.match(/(\d+)\s*day/);
        const hours = s.match(/(\d+)\s*hour/);
        const mins = s.match(/(\d+)\s*min/);
        let total = 0;
        if (days) total += parseInt(days[1], 10) * 24 * 60;
        if (hours) total += parseInt(hours[1], 10) * 60;
        if (mins) total += parseInt(mins[1], 10);
        if (!days && !hours && !mins) {
            const n = parseFloat(s);
            total += isNaN(n) ? 0 : n;
        }
        return total;
    };

    const distance = parseDistanceKm(distanceTime.distance);
    const time = parseDurationMin(distanceTime.time);

    const rates = {
        motorcycle: { base: 25, perKm: 8,  perMin: 1.5 },
        auto:       { base: 35, perKm: 12, perMin: 2 },
        car:        { base: 50, perKm: 16, perMin: 2.5 }
    };

    const fare = {};
    for (const [vehicle, rate] of Object.entries(rates)) {
        fare[vehicle] = Math.round(
            rate.base + (distance * rate.perKm) + (time * rate.perMin)
        );
    }
    fare.__distanceKm = distance;
    fare.__timeMin = time;
    return fare;
}

function getOtp(num) {
    const otp = crypto.randomInt(Math.pow(10, num-1), Math.pow(10, num));
    return otp.toString().padStart(num, '0');
}


module.exports.createRide = async ( { user, vehicleType, pickup, destination } ) =>{
    if(!user || !vehicleType || !pickup || !destination) throw new Error('User, vehicleType, pickup, and destination are required');
    const fare = await getFare(pickup, destination);
    if(!fare || typeof fare[vehicleType] !== 'number' || isNaN(fare[vehicleType])) throw new Error('Invalid vehicle type or fare calculation failed');
    const ride = new rideModel({
        user,
        pickup,
        destination,
        otp: getOtp(4),
        fare: fare[vehicleType],
        duration: Math.round(fare.__timeMin * 60),
        distance: Math.round(fare.__distanceKm * 1000),
    });
    await ride.save();
    return ride;
}
