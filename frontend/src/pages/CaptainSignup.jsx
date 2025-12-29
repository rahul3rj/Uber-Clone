import React, { useState } from 'react'
import axios from 'axios'
import { useContext } from 'react'
import { CaptainDataContext } from '../context/CaptainContext.jsx'
import { useNavigate } from 'react-router-dom'

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [CaptainData, setCaptainData] = useState({});

  const navigate = useNavigate();
  const {captain, setCaptain} = useContext(CaptainDataContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const capacity = vehicleType === 'motorcycle' ? 1 : vehicleType === 'auto' ? 2 : vehicleType === 'car' ? 3 : 0;
    const CaptainSignupData = ({
      email: email,
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      password: createPassword,
      vehicle:{
        plate: vehiclePlate,
        vehicleType: vehicleType,
        capacity: capacity,
        color: vehicleColor,
      }
    });
    // console.log(CaptainData); //comment it before uploading
    if (createPassword !== confirmPassword) {
      const popup = document.createElement("div");
      popup.textContent = "Passwords do not match";
      popup.style.position = "fixed";
      popup.style.top = "20px";
      popup.style.left = "50%";
      popup.style.transform = "translateX(-50%)";
      popup.style.backgroundColor = "red";
      popup.style.color = "white";
      popup.style.padding = "10px 20px";
      popup.style.borderRadius = "5px";
      popup.style.zIndex = "9999";
      document.body.appendChild(popup);
      setTimeout(() => document.body.removeChild(popup), 3000);
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        CaptainSignupData
      );
      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("captain", data.token);
        navigate("/CaptainHome");
      }
    } catch (error) {
      console.error(error);
      // Optional: show user-friendly error feedback
    }
    setEmail("");
    setFirstName("");
    setLastName("");
    setCreatePassword("");
    setConfirmPassword("");
    setVehiclePlate("");
    setVehicleType("");
    setVehicleCapacity("");
    setVehicleColor("");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        <div className='h-12 absolute top-10 left-7 w-auto flex items-center justify-start'>
          <img
          onClick={() => {
            window.location.href = "/";
          }}
          src="/Uber-Logo.png"
          alt=""
          className="h-12"
        />
        <h1 className='text-md text-[#3B864E] poppins-medium'>Captain</h1>
        </div>
        <div className="h-auto w-[85vw] flex flex-col items-center justify-center gap-3 mt-25">
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-3">
            <h1 className="text-sm w-full text-black poppins-medium">
              What's your name?
            </h1>
            <div className="w-[85vw] h-[5vh] flex items-center justify-center gap-3">
                <input
              required
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              type="text"
              placeholder="First name"
              className="h-[5vh] w-1/2 bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />
            <input
              required
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              type="text"
              placeholder="Last name"
              className="h-[5vh] w-1/2 bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />
            </div>
            <h1 className="text-sm w-full text-black poppins-medium">
              What's your email?
            </h1>
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              placeholder="example@email.com"
              className="h-[5vh] w-[85vw] bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />
            <h1 className="text-sm w-full text-black poppins-medium">
              Create password
            </h1>
            <div className="w-[85vw] h-[5vh] flex items-center justify-center gap-3 relative">
                <input
              required
              value={createPassword}
              onChange={(e) => {
                setCreatePassword(e.target.value);
              }}
              id="createPw"
              type={showCreatePw ? "text" : "password"}
              placeholder="Create password"
              className="h-[5vh] w-[85vw] bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />
            <i
              onClick={() => setShowCreatePw(!showCreatePw)}
              className={`absolute top-[50%] right-5 transform -translate-y-1/2 cursor-pointer ${showCreatePw ? "ri-eye-fill" : "ri-eye-off-fill"}`}
            ></i>
            </div>
            <h1 className="text-sm w-full text-black poppins-medium">
              Confirm password
            </h1>
            <div className="w-[85vw] h-[5vh] flex items-center justify-center gap-3 relative">
                <input
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              id="confirmPw"
              type={showConfirmPw ? "text" : "password"}
              placeholder="Confirm password"
              className="h-[5vh] w-[85vw] bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />
            <i
              onClick={() => setShowConfirmPw(!showConfirmPw)}
              className={`absolute top-[50%] right-5 transform -translate-y-1/2 cursor-pointer ${showConfirmPw ? "ri-eye-fill" : "ri-eye-off-fill"}`}
            ></i>
            </div>
            <h1 className="text-sm w-full text-black poppins-medium">
                  Vehicle Information
                </h1>
            <div className="w-full flex items-start justify-between gap-3">
              <div className="w-1/2 flex flex-col gap-3">
                
                <input
                  required
                  value={vehiclePlate}
                  onChange={(e) => {
                    setVehiclePlate(e.target.value);
                  }}
                  type="text"
                  placeholder="Vehicle plate number"
                  className="h-[5vh] w-full bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
                />
              </div>
              <div className="w-1/2 flex flex-col gap-3">
                
                <div className="relative">
                  <select
                    required
                    value={vehicleColor}
                    onChange={(e) => {
                      setVehicleColor(e.target.value);
                    }}
                    className="h-[5vh] w-full bg-[#f2f2f2] rounded-md pl-5 pr-10 outline-none text-sm poppins-medium text-gray-500 appearance-none"
                  >
                    <option value="" disabled hidden>Vehicle Color</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="white">White</option>
                    <option value="grey">Grey</option>
                    <option value="black">Black</option>
                    <option value="other">Other...</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute top-1/2 right-5 transform -translate-y-1/2 text-black pointer-events-none"></i>
                </div>
              </div>
            </div>
            <div className="w-full flex items-start justify-between gap-3">
              <div className="w-1/2 flex flex-col gap-3">
                
                <div className="relative">
                  <select
                    required
                    value={vehicleType}
                    onChange={(e) => {
                      setVehicleType(e.target.value);
                    }}
                    className="h-[5vh] w-full bg-[#f2f2f2] rounded-md pl-5 pr-10 outline-none text-sm poppins-medium text-gray-500 appearance-none"
                  >
                    <option value="" disabled hidden>Vehicle Type</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="auto">Auto</option>
                    <option value="car">Car</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                </div>
              </div>
              <div className="w-1/2 flex flex-col gap-3">
                <input
                  readOnly
                  required
                  value={vehicleType === "motorcycle" ? 1 : vehicleType === "auto" ? 2 : vehicleType === "car" ? 3 : ""}
                  type="number"
                  placeholder="Vehicle capacity"
                  className="h-[5vh] w-full bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
                />
              </div>
            </div>
            
            
            <button
              type="submit"
              className="h-[6vh] w-[85vw] mt-5 bg-[#3B864E] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#50AC67] transition-all duration-200"
            >
              Sign up
            </button>
          </form>

          <button
            onClick={() => {
              window.location.href = "/user/signup";
            }}
            className="h-[6vh] w-[85vw] mt-3 bg-[#000] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#222] transition-all duration-200"
          >
            Sign up as User
          </button>
          <h2 className="text-sm w-full text-center text-black/60 poppins-medium">
            Already a captian?{" "}
            <span
              onClick={() => {
                window.location.href = "/captain/login";
              }}
              className="text-[#000] cursor-pointer poppins-medium hover:underline transition-all duration-200"
            >
              Log in
            </span>
          </h2>
        </div>
      </div>
    </div>
  )
}

export default CaptainSignup