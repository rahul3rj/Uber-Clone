const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const  {fullname, email, password, vehicle } = req.body;

    const isCaptainExist = await captainModel.findOne({ email });
    if(isCaptainExist){
        return res.status(400).json({ errors: [{msg: "Captain already exist"}] });
    }

    const hashedPassword = await captainModel.hashPassword(password);
    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
    })
    const token = captain.generateAuthToken();
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(201).json({
        message: "Captain registered successfully",
        captain,
        token,
    });
}

module.exports.loginCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const captain = await captainModel.findOne({ email }).select("+password");
    if(!captain){
        return res.status(400).json({ errors: [{msg: "Invalid credentials"}] });
    }
    const isPasswordMatch = await captain.comparePassword(password);
    if(!isPasswordMatch){
        return res.status(400).json({ errors: [{msg: "Invalid credentials"}] });
    }
    const token = captain.generateAuthToken();
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.status(200).json({
        message: "Captain logged in successfully",
        captain,
        token,
    });
}

module.exports.getCaptainProfile = async (req, res) => {
    const captain = req.captain;
    res.status(200).json({
        message: "Captain profile retrieved successfully",
        captain,
    });
}

module.exports.logoutCaptain = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({ errors: [{msg: "No token, authorization denied"}] });
    }
    const blacklistToken = await blacklistTokenModel.create({ token });
    res.clearCookie("token");
    res.status(200).json({
        message: "Captain logged out successfully",
    });
}
