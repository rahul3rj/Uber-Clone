import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { UserDataContext } from "../context/UserContext.jsx";
import { useContext } from "react";

const Userlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [UserData, setUserData] = useState({});
  const [showPw, setShowPw] = useState(false);

  const navigate = useNavigate();

  const {user, setUser} = useContext(UserDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    const userLoginData = {
      email,
      password,
    };
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userLoginData);
    if(response.status === 200){
      const data = response.data;
      setUser(data.user);
      localStorage.setItem("user", data.token);
      navigate("/Home");
    }
    // console.log(UserData); //comment it before uploading
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center bg-black">
      <div className="min-h-screen min-h-[100dvh] w-full md:w-[25%] flex flex-col items-center justify-start relative bg-white">
        <img
          onClick={() => {
            window.location.href = "/";
          }}
          src="/Uber-Logo.png"
          alt=""
          className="h-12 absolute top-10 left-7"
        />
        <div className="h-auto w-full flex flex-col items-center justify-center gap-3 mt-25 px-5">
          <h1 className="text-sm w-full text-black poppins-medium">
            What's your email?
          </h1>
          <form onSubmit={submitHandler} className="w-full">
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              placeholder="example@email.com"
              className="h-[5vh] w-full bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />

            <h1 className="text-sm w-full text-black poppins-medium my-3">
              Password
            </h1>
            <div className="w-full h-[5vh] flex items-center justify-center gap-3 relative">
                <input
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              id="createPw"
              type={showPw ? "text" : "password"}
              placeholder="Password"
              className="h-[5vh] w-[85vw] bg-[#f2f2f2] rounded-md px-5 outline-none text-sm poppins-medium"
            />
            <i
              onClick={() => setShowPw(!showPw)}
              className={`absolute top-[50%] right-5 transform -translate-y-1/2 cursor-pointer ${showPw ? "ri-eye-fill" : "ri-eye-off-fill"}`}
            ></i>
            </div>
            <button
              type="submit"
              className="h-[6vh] w-full mt-7 bg-[#000] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#222] transition-all duration-200"
            >
              Log in
            </button>
          </form>

          <button
            onClick={() => {
              window.location.href = "/captain/login";
            }}
            className="h-[6vh] w-full mt-3 bg-[#3B864E] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#50AC67] transition-all duration-200"
          >
            Log in as Captain
          </button>
          <h2 className="text-sm w-full text-center text-black/60 poppins-medium">
            New user?{" "}
            <span
              onClick={() => {
                window.location.href = "/user/signup";
              }}
              className="text-[#000] cursor-pointer poppins-medium hover:underline transition-all duration-200"
            >
              Create an account
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Userlogin;
