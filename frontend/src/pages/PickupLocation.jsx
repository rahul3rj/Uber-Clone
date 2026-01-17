import React, { useState } from 'react'
import BottomSlider from '../components/BottomSlider';
import { useNavigate } from 'react-router-dom';


const PickupLocation = () => {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
  };
  return (
    <div className='h-screen w-full flex items-center justify-center overflow-hidden'>
      <div className='h-screen w-full flex flex-col items-center justify-start relative'>
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
        <div className="h-screen w-full bg-white">
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
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="h-[10vh] w-full bg-white">
          <BottomSlider
            collapsedPeek={120}
            onOpenChange={(open) => {
              setSliderOpen(open);
            }}
          >
            <div className="h-[30vh] w-full text-white flex flex-col items-start justify-start">
              <div className="h-[8vh] w-full flex items-center justify-center flex items-center justify-between gap-5 border-b border-zinc-200">
                <div className='h-[5vh] w-[5vh] rounded-full flex items-center justify-center bg-zinc-100'>
                  <i className="ri-map-pin-2-fill text-2xl text-black"></i>
                </div>
                <div className='h-[5vh] w-[75vw] '>
                  <p className='text-zinc-500 text-sm'>Pick up at</p>
                  <h1 className='text-black text-lg uber-move-bold'>123, Main St, New York, NY 10001</h1>
                </div>
              </div>
              <div className='h-[20vh] w-full flex flex-col items-center justify-center border-b border-zinc-200'>
                <div className='h-[10vh] w-full flex items-center justify-between'>
                  <div className='h-[8vh] w-[30vw] flex flex-col items-center justify-center'>
                    <p className='text-zinc-500 text-sm'>EST</p>
                    <h1 className='text-black text-lg uber-move-bold'>10:00 AM</h1>
                  </div>
                  <div className='h-[8vh] w-[30vw] flex flex-col items-center justify-center'>
                    <p className='text-zinc-500 text-sm'>Distance</p>
                    <h1 className='text-black text-lg uber-move-bold'>10.2 km</h1>
                  </div>
                  <div className='h-[8vh] w-[30vw] flex flex-col items-center justify-center'>
                    <p className='text-zinc-500 text-sm'>Fare</p>
                    <h1 className='text-black text-lg uber-move-bold'>₹1000</h1>
                  </div>
                </div>
                <button
                    onClick={() => {
                      navigate("/CaptainHome");
                    }}
                    className="h-[5vh] w-[85vw] mt-3 bg-[#3B864E] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#50AC67] transition-all duration-200"
                  >
                    Drop off
                  </button>
              </div>
            </div>
          </BottomSlider>
        </div>
      </div>
    </div>
  )
}

export default PickupLocation