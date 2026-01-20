import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext.jsx";
import Chat from './Chat.jsx';

const CaptainRideDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { sendMessage, receiveMessage, off } = useContext(SocketContext);

  const acceptedRide = state?.acceptedRide;
  const rideId = acceptedRide?.id;
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const cancelHandler = (payload) => {
      if (!payload || payload.rideId !== rideId) return;
      try { localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
      navigate('/CaptainHome');
    };
    receiveMessage('ride:cancelled', cancelHandler);
    const completedHandler = (payload) => {
      if (!payload || payload.rideId !== rideId) return;
      try { localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
      navigate('/CaptainHome');
    };
    receiveMessage('ride:completed', completedHandler);
    return () => { off('ride:cancelled', cancelHandler); off('ride:completed', completedHandler); };
  }, [rideId, receiveMessage, off, navigate]);

  useEffect(() => {
    if (!rideId) return;
    const chatHandler = (m) => {
      if (!m?.rideId || m.rideId !== rideId) return;
      const key = `chat:${rideId}`;
      try {
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        const next = Array.isArray(prev) ? [...prev, m] : [m];
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {}
    };
    receiveMessage('chat:message', chatHandler);
    return () => off('chat:message', chatHandler);
  }, [rideId, receiveMessage, off]);

  // Safety guard
  if (!acceptedRide) {
    navigate("/CaptainHome");
    return null;
  }
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        <div className="h-[7vh] w-full flex items-center justify-center px-5 border-b border-b-zinc-300">
          <button
            onClick={() => { sendMessage('ride:cancel', { rideId: acceptedRide.id, by: 'captain' }); navigate('/CaptainHome'); }}
            className="text-black text-md uber-text font-[600] cursor-pointer transition-all duration-300 ease-in-out absolute left-5"
          >
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <h1 className="text-black text-lg uber-move-bold">Ride Accepted</h1>
        </div>
        <div
          key={acceptedRide.id}
          className="w-full flex flex-col items-start justify-start bg-white "
        >
          <div className="h-[6vh] w-full flex flex-1 items-center justify-start px-5 gap-3 py-3">
            <div className="h-[5vh] w-[5vh] rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-auto w-[80vw] flex flex-col items-start justify-between">
              <div className="h-auto w-full flex items-start justify-between">
                <h1 className="text-black text-md uber-move-bold">
                  {acceptedRide.name}
                </h1>
                <h1 className="text-black text-md uber-move font-[300]">
                  ₹{acceptedRide.rideFare}
                </h1>
              </div>
              <div className="h-auto w-full flex items-center justify-end">
                <h1 className="text-zinc-400 text-sm uber-move font-[300]">
                  {acceptedRide.distance} km
                </h1>
              </div>
            </div>
          </div>
          <div className="w-full h-auto flex flex-col items-center justify-start px-5">
            <div className="h-[10vh] w-full flex flex-col items-start justify-center gap-1 border-b border-zinc-300">
              <h1 className="text-zinc-400 text-xs uber-text font-[600]">
                PICK UP
              </h1>
              <h1 className="text-black text-md uber-text-medium">
                {acceptedRide.pickup}
              </h1>
            </div>
            <div className="h-[10vh] w-full flex flex-col items-start justify-center gap-1 border-b border-zinc-300">
              <h1 className="text-zinc-400 text-xs uber-text font-[600]">
                DROP OFF
              </h1>
              <h1 className="text-black text-md uber-text-medium">
                {acceptedRide.dropoff}
              </h1>
            </div>
            <div className="h-[20vh] w-full flex flex-col items-start justify-center gap-2">
              <h1 className="text-zinc-400 text-xs uber-text font-[600] mb-2">
                TRIP FARE
              </h1>
              <div className="h-auto w-full flex items-center justify-between gap-2 ">
                <h1 className="text-black text-sm uber-text-medium">
                  Ride Fare
                </h1>
                <h1 className="text-black text-sm uber-text-medium">
                  ₹{acceptedRide.fare}
                </h1>
              </div>
              <div className="h-auto w-full flex items-center justify-between gap-2 ">
                <h1 className="text-black text-sm uber-text-medium">Tip</h1>
                <h1 className="text-black text-sm uber-text-medium">
                  ₹{acceptedRide.tip}
                </h1>
              </div>
              <div className="h-auto w-full flex items-center justify-between gap-2 ">
                <h1 className="text-black text-sm uber-text-medium">
                  GST (18%)
                </h1>
                <h1 className="text-black text-sm uber-text-medium">
                  ₹{acceptedRide.gst}
                </h1>
              </div>
              <div className="h-[1px] w-full bg-zinc-300"></div>
              <div className="h-auto w-full flex items-center justify-between gap-2 ">
                <h1 className="text-black text-sm uber-text-medium">
                  Total Fare
                </h1>
                <h1 className="text-black text-sm uber-text-medium">
                  ₹{acceptedRide.rideFare}
                </h1>
              </div>
            </div>
            <div className="h-[10vh] w-full flex flex-1 items-center justify-between gap-5">
              <div className="h-[8vh] w-full flex flex-col items-center justify-center bg-[#3B864E] text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-[#3B864E]/90 transition-all duration-300 ease-in-out">
                <i className="ri-phone-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Call
                </h1>
              </div>
              <div onClick={() => setChatOpen(true)} className="h-[8vh] w-full flex flex-col items-center justify-center bg-black text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-zinc-700 transition-all duration-300 ease-in-out">
                <i className="ri-message-2-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Message
                </h1>
              </div>
              <div onClick={() => { sendMessage('ride:cancel', { rideId: acceptedRide.id, by: 'captain' }); navigate('/CaptainHome'); }} className="h-[8vh] w-full flex flex-col items-center justify-center bg-zinc-400 text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-red-500 transition-all duration-300 ease-in-out">
                <i className="ri-delete-bin-6-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Cancel
                </h1>
              </div>

            </div>
            <div className="h-[25vh] w-full flex flex-col items-center justify-center mt-5 rounded-lg overflow-hidden">
              <img
                src="https://i.pinimg.com/originals/0c/a9/a9/0ca9a912149840edebd299271e8fbc56.gif"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <button onClick={() => navigate('/PickupLocation', { state: { acceptedRide } })} className="h-[6vh] w-[90vw] flex flex-col items-center justify-center bg-black text-white text-sm uber-text-medium rounded-md cursor-pointer absolute bottom-5 hover:bg-zinc-700 transition-all duration-300 ease-in-out">
              <h1 className="text-white text-md uber-move-bold">
                Go To Pickup Location
              </h1>
            </button>
          {chatOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setChatOpen(false)}></div>
              <div className="relative z-[70] w-full max-w-md bg-white shadow-lg">
                <Chat rideId={rideId} role={'captain'} onClose={() => setChatOpen(false)} />
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaptainRideDetail