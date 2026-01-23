import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
import RideSelection from "./pages/RideSelection.jsx";
import CaptainRideDetail from "./pages/CaptainRideDetail.jsx";
import PickupLocation from "./pages/PickupLocation.jsx";
import Chat from "./pages/Chat.jsx";
import Loader from "./components/Loader.jsx";


const App = () => {
  const ans = useContext(UserDataContext);
  console.log(ans);

  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);
  const [loaderKey, setLoaderKey] = useState(0);

  useEffect(() => {
    const shouldShow = location.pathname === "/Home" || location.pathname === "/CaptainHome";
    if (shouldShow) {
      setShowLoader(true);
      setLoaderKey((k) => k + 1);
    } else {
      setShowLoader(false);
    }
  }, [location.pathname]);

  return (
    <div>
      {showLoader && (
        <Loader
          key={loaderKey}
          onFinish={() => {
            setShowLoader(false);
          }}
        />
      )}
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/user/login" element={<Userlogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/captain/login" element={<CaptainLogin />} />
        <Route path="/captain/signup" element={<CaptainSignup />} />
        <Route path="/Home" element={<UserProtectWrapper><Home /></UserProtectWrapper>} />
        <Route path="/user/logout" element={<UserProtectWrapper><UserLogout /></UserProtectWrapper>} />
        <Route path="/CaptainHome" element={<CaptainProtectWrapper><CaptainHome /></CaptainProtectWrapper>} />
        <Route path="/CaptainRideDetail" element={<CaptainProtectWrapper><CaptainRideDetail /></CaptainProtectWrapper>} />
        <Route path="/PickupLocation" element={<CaptainProtectWrapper><PickupLocation /></CaptainProtectWrapper>} />
        <Route path="/captain/chat" element={<CaptainProtectWrapper><Chat /></CaptainProtectWrapper>} />
        <Route path="/user/chat" element={<UserProtectWrapper><Chat /></UserProtectWrapper>} />
        <Route path="/RideSelection" element={<RideSelection />} />
      </Routes>
    </div>
  );
};

export default App;


// all completed
