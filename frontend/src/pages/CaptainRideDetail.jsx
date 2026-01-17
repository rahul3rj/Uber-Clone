import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CaptainRideDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const acceptedRide = state?.acceptedRide;

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
            onClick={() => navigate("/CaptainHome")}
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
              <div className="h-[8vh] w-full flex flex-col items-center justify-center bg-black text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-zinc-700 transition-all duration-300 ease-in-out">
                <i class="ri-message-2-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Message
                </h1>
              </div>
              <div className="h-[8vh] w-full flex flex-col items-center justify-center bg-zinc-400 text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-red-500 transition-all duration-300 ease-in-out">
                <i class="ri-delete-bin-6-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Cancle
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaptainRideDetail