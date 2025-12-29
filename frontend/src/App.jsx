import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Start from "./pages/Start.jsx";
import Home from "./pages/Home.jsx";
import Userlogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainSignup from "./pages/CaptainSignup";
import { UserDataContext } from "./context/UserContext.jsx";
import UserProtectWrapper from "./pages/UserProtectWrapper.jsx";
import CaptainProtectWrapper from "./pages/CaptainProtectWrapper.jsx";
import UserLogout from "./pages/UserLogout.jsx";
import CaptainHome from "./pages/CaptainHome.jsx";

const App = () => {
  const ans = useContext(UserDataContext);
  console.log(ans);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/user/login" element={<Userlogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/captain/login" element={<CaptainLogin />} />
        <Route path="/captain/signup" element={<CaptainSignup />} />
        <Route path="/Home" element={<UserProtectWrapper><Home /></UserProtectWrapper>} />
        <Route path="/user/logout" element={<UserProtectWrapper><UserLogout /></UserProtectWrapper>} />
        <Route path="/CaptainHome" element={<CaptainProtectWrapper><CaptainHome /></CaptainProtectWrapper>} />
      </Routes>
    </div>
  );
};

export default App;
