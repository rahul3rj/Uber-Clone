const axios = require('axios');
module.exports.getAddressCoordinates = async (address) => {
    const apikey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apikey}`;
    try{
        const response = await axios.get(url);
        const data = response.data;
        if(data.status === 'OK'){
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
            }
        }else{
            throw new Error('Error getting address coordinates');
        }
    }
    catch(error){
        console.log(error);
        return null;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if(!origin || !destination) throw new Error('Origin and destination are required');
    const apikey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apikey}`;
    try{
        const response = await axios.get(url);
        const data = response.data;
        if(data.status === 'OK'){
            const distance = data.rows[0].elements[0].distance.text;
            const time = data.rows[0].elements[0].duration.text;
            return {
                distance,
                time,
            }
        }else{
            throw new Error('Error getting distance time');
        }
    }
    catch(error){
        console.log(error);
        return null;
    }
}

module.exports.getAddressSuggestions = async (input) => {
    if(!input) throw new Error('Input is required');
    const apikey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apikey}`;
    try{
        const response = await axios.get(url);
        const data = response.data;
        if(data.status === 'OK'){
            return data.predictions;
        }else{
            throw new Error('Error getting address suggestions');
        }
    }
    catch(error){
        console.log(error);
        return null;
    }
}
