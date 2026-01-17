import React, { useState } from 'react'
import BottomSlider from '../components/BottomSlider'
import { useNavigate } from 'react-router-dom';



const Rides = [
  {
    id: 1,
    name: "Alice Johnson",
    fare: 1250,
    distance: 3.2,
    pickup: "123 Main St, Downtown",
    dropoff: "456 Park Ave, Uptown",
    pickupTime: "10:30 AM",
    tip: 250,
    discount: 150,
    gst: 125,
    rideFare: 1475
  },
  {
    id: 2,
    name: "Bob Smith",
    fare: 875,
    distance: 2.1,
    pickup: "789 Elm St, Westside",
    dropoff: "321 Oak Rd, Eastside",
    pickupTime: "11:15 AM",
    tip: 125,
    discount: 75,
    gst: 88,
    rideFare: 1075
  },
  {
    id: 3,
    name: "Carol White",
    fare: 1500,
    distance: 4.5,
    pickup: "555 Pine Blvd, Northgate",
    dropoff: "999 Maple Dr, Southgate",
    pickupTime: "12:00 PM",
    tip: 300,
    discount: 200,
    gst: 150,
    rideFare: 1725
  },
  {
    id: 4,
    name: "David Brown",
    fare: 625,
    distance: 1.3,
    pickup: "111 First Ave, City Center",
    dropoff: "222 Second St, City Center",
    pickupTime: "12:45 PM",
    tip: 50,
    discount: 50,
    gst: 62,
    rideFare: 745
  },
  {
    id: 5,
    name: "Eva Green",
    fare: 2000,
    distance: 6.0,
    pickup: "333 River Rd, Riverside",
    dropoff: "777 Hilltop Ln, Hill District",
    pickupTime: "1:30 PM",
    tip: 100,
    discount: 300,
    gst: 200,
    rideFare: 2300
  }
];

const CaptainHome = () => {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        <div className="w-auto flex items-center justify-center absolute top-10 left-7 cursor-pointer">
          <img
            onClick={() => {
              window.location.href = "/CaptainHome";
            }}
            src="/Uber-Logo.png"
            alt=""
            className="h-12 "
          />
          <h1 className="text-md text-[#3B864E] poppins-medium">Captain</h1>
        </div>
        <div className="h-[70vh] w-full bg-white">
          <img
            src="/bg-map.jpeg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="shadow-md h-[5vh] w-[5vh] rounded-full absolute top-10 right-10 cursor-pointer flex items-center justify-center gap-2">
          <div className="h-[5vh] w-[5vh] rounded-full bg-black flex items-center justify-center overflow-hidden border border-white border-2 ">
            <img
              src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"
              alt=""
              className="h-full w-full object-cover "
            />
          </div>
        </div>
        <div className="h-[5vh] w-[5vh] rounded-full bg-white absolute bottom-100 right-10 flex items-center justify-center shadow-md hover:shadow-xl transition-all ease-in-out cursor-pointer">
          <i className="ri-navigation-fill text-xl"></i>
        </div>
        <div className="h-[30vh] w-full bg-white">
          <BottomSlider
            collapsedPeek={380}
            onOpenChange={(open) => {
              setSliderOpen(open);
            }}
          >
            <div className="h-[95vh] w-full text-white flex flex-col items-start justify-start">
              <div className="w-full flex items-center justify-between">
                <h1 className="text-2xl w-full text-black uber-move-bold font-[600] pt-2">
                  {isToggleOn ? "Online" : "Offline"}
                </h1>
                <button
                  onClick={() => setIsToggleOn(!isToggleOn)}
                  className={`h-[3vh] w-[6vh] rounded-full flex items-center transition-all duration-300 ease-in-out cursor-pointer shadow-md hover:shadow-lg  ${
                    isToggleOn ? "bg-[#3B864E]" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`h-[2.5vh] w-[2.5vh] rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                      isToggleOn ? "translate-x-[2.5vh]" : "translate-x-1"
                    }`}
                  ></span>
                </button>
              </div>
              <div className="h-auto w-full flex items-center justify-start">
                <h1 className="text-black text-md">
                  {isToggleOn ? "Accepting Rides" : "Not Accepting Rides"}
                </h1>
              </div>
              <div className="w-full flex-1 overflow-y-auto no-scrollbar mt-5 gap-3 flex flex-col items-center justify-start">
                {Rides.map((ride) => (
                  <div
                    key={ride.id}
                    className="w-full flex flex-col items-start justify-start rounded-md transition-all ease-in-out duration-300 cursor-pointer bg-white border border-zinc-300 hover:border-zinc-500 "
                  >
                    <div className="h-[6vh] w-full flex flex-1 items-center justify-start px-5 gap-3 py-3">
                      <div className="h-[5vh] w-[5vh] rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="h-auto w-[70vw] flex flex-col items-start justify-between">
                        <div className="h-auto w-full flex items-start justify-between">
                          <h1 className="text-black text-md uber-move-bold">
                            {ride.name}
                          </h1>
                          <h1 className="text-black text-md uber-move font-[300]">
                            ₹{ride.rideFare}
                          </h1>
                        </div>
                        <div className="h-auto w-full flex items-center justify-end">
                          <h1 className="text-zinc-400 text-sm uber-move font-[300]">
                            {ride.distance} km
                          </h1>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-[20vh] flex flex-col items-center justify-start px-5">
                      <div className="h-[7vh] w-full flex flex-col items-start justify-center gap-1 border-b border-zinc-300">
                        <h1 className="text-zinc-400 text-xs uber-text font-[600]">
                          PICK UP
                        </h1>
                        <h1 className="text-black text-sm uber-text-medium">
                          {ride.pickup}
                        </h1>
                      </div>
                      <div className="h-[7vh] w-full flex flex-col items-start justify-center gap-1">
                        <h1 className="text-zinc-400 text-xs uber-text font-[600]">
                          DROP OFF
                        </h1>
                        <h1 className="text-black text-sm uber-text-medium">
                          {ride.dropoff}
                        </h1>
                      </div>
                      <div className="h-[5vh] w-full flex flex-col items-start justify-center gap-1">
                        <button
                          onClick={() => {
                            if (!isToggleOn) return;

                            navigate("/CaptainRideDetail", {
                              state: {
                                acceptedRide: ride,
                              },
                            });
                          }}
                          className={`h-[4vh] w-full rounded-lg text-white text-md uber-text font-[600] cursor-pointer transition-all duration-300 ease-in-out ${
                            isToggleOn
                              ? "bg-[#3B864E] hover:bg-black"
                              : "bg-zinc-400"
                          }`}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BottomSlider>
        </div>
      </div>
    </div>
  );
}

export default CaptainHome