import React, { useState } from 'react'

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [CaptainData, setCaptainData] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setCaptainData({
      email: email,
      fullName: {
        firstName: firstName,
        lastName: lastName,
      },
      createPassword: createPassword,
      confirmPassword: confirmPassword,
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
    setEmail("");
    setFirstName("");
    setLastName("");
    setCreatePassword("");
    setConfirmPassword("");
    window.location.href = "/";
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