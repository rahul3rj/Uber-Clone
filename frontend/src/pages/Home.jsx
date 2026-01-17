import React, { useState } from "react";
import BottomSlider from "../components/BottomSlider";
import LocationSearchPanel from "../components/LocationSearchPanel";
import RideSelection from "../pages/RideSelection";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [sliderOpen, setSliderOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        <img
          onClick={() => {
            window.location.href = "/Home";
          }}
          src="/Uber-Logo.png"
          alt=""
          className="h-12 absolute top-10 left-7 cursor-pointer"
        />
        <div className="h-[70vh] w-full bg-white">
          <img
            src="/bg-map.jpeg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="shadow-md h-[5vh] w-[5vh] rounded-full absolute top-10 right-10 cursor-pointer">
          <div className="h-[5vh] w-[5vh] rounded-full bg-black flex items-center justify-center overflow-hidden border border-white border-2 ">
            <img
              src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"
              alt=""
              className="h-full w-full object-cover "
            />
          </div>
        </div>
        <div className="h-[5vh] w-[5vh] rounded-full bg-white absolute bottom-80 right-10 flex items-center justify-center shadow-md hover:shadow-xl transition-all ease-in-out cursor-pointer">
          <i className="ri-navigation-fill text-xl"></i>
        </div>
        <div className="h-[30vh] w-full bg-white">
          <BottomSlider
            collapsedPeek={280}
            onOpenChange={(open) => {
              setSliderOpen(open);
            }}
          >
            <div className="h-[95vh] w-full text-white flex flex-col items-start justify-start">
              <h1 className="text-2xl w-full text-black uber-move-bold font-[600] pt-2">
                Set your destination
              </h1>
              <p className="text-sm text-zinc-500 uber-text">
                Drag map to move the pin
              </p>
              <form
                onSubmit={(e) => {
                  submitHandler(e);
                }}
                className="w-full"
              >
                <div className="h-auto w-full flex flex-col items-center justify-start gap-3 mt-5 ">
                  <div className="h-[5vh] w-full flex items-center justify-between">
                    <div className="h-[5vh] w-[5vh] flex items-center justify-center relative">
                      <div className="h-3 w-3 rounded-full bg-black flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                      </div>
                      <div className="h-9 w-1 bg-black absolute left-1/2 -translate-x-1/2 -bottom-6 rounded-full"></div>
                    </div>
                    <input
                      onChange={(e) => {
                        setPickup(e.target.value);
                      }}
                      value={pickup}
                      type="text"
                      placeholder="Add a pick-up location"
                      className="h-[5vh] w-[90%] text-black bg-zinc-100 px-5 rounded-md uber-text focus:outline-none"
                    />
                  </div>
                  <div className="h-[5vh] w-full flex items-center justify-between">
                    <div className="h-[5vh] w-[5vh] flex items-center justify-center">
                      <div className="h-3 w-3 rounded-xs bg-black flex items-center justify-center">
                        <div className="h-1 w-1 rounded-xs bg-white"></div>
                      </div>
                    </div>
                    <input
                      onChange={(e) => {
                        setDestination(e.target.value);
                      }}
                      value={destination}
                      type="text"
                      placeholder="Enter your destination"
                      className="h-[5vh] w-[90%] text-black bg-zinc-100 px-5 rounded-md uber-text focus:outline-none"
                    />
                  </div>
                  <div
                    className={`w-full flex items-center justify-center overflow-hidden transition-all duration-200 ease-in-out ${
                      sliderOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {/* // hidden because it is not used in the current version of the app */}
                    <LocationSearchPanel
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </div>
                  <div className="h-[5vh] w-full flex items-center justify-center">
                    <button
                      onClick={() => {
                        window.location.href = "/RideSelection";
                      }}
                      className="h-[5vh] w-full text-white bg-black px-5 rounded-md uber-text font-[600] hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
                    >
                      Find a ride
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </BottomSlider>
        </div>
      </div>
    </div>
  );
};

export default Home;
