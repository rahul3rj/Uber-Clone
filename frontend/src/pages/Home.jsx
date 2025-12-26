import React from 'react'

const Home = () => {
  return (
    <div className='h-screen w-full flex items-center justify-center'>
        <div className='h-screen w-full flex flex-col items-center justify-start relative'>
            <img onClick={() => {window.location.href = "/"}} src="/Uber-Logo.png" alt="" className='h-12 absolute top-10 left-7 invert'/>
            <div className='h-[80vh] w-full bg-white'>
                <img src="/bg.gif" alt="" className='h-full w-full object-cover'/>
            </div>
            <div className='h-auto w-[90vw] bg-white flex flex-col items-center justify-center gap-2'>
                <h1 className='text-3xl w-full text-black font-[UberMoveBold] py-5'>Get started with Uber</h1>
                <button onClick={() => {window.location.href = "/user/signup"}} className='h-[6vh] w-[90vw] bg-[#000] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#222] transition-all duration-200'>Continue
                <i className="ri-arrow-right-line text-2xl absolute top-1/2 right-5 transform -translate-y-1/2"></i>
                </button>
            </div>
        </div>
    </div>
  )
}

export default Home