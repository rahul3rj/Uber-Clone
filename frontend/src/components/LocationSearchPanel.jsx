import React, { useState } from 'react'

const addressDataSet = [
  {
    id: 1,
    name: 'Home',
    address: '123 Main St, San Francisco, CA 94105',
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    id: 2,
    name: 'Work',
    address: '456 Market St, San Francisco, CA 94103',
    lat: 37.7897,
    lng: -122.3972,
  },
  {
    id: 3,
    name: 'SFO Airport',
    address: 'San Francisco International Airport, San Francisco, CA 94128',
    lat: 37.6213,
    lng: -122.379,
  },
  {
    id: 4,
    name: 'Golden Gate Park',
    address: 'Golden Gate Park, San Francisco, CA 94121',
    lat: 37.7694,
    lng: -122.4862,
  },
  {
    id: 5,
    name: 'Union Square',
    address: 'Union Square, San Francisco, CA 94108',
    lat: 37.788,
    lng: -122.4074,
  },
];


const LocationSearchPanel = ({ selected, setSelected }) => {
  return (
    <div className='h-auto w-full flex flex-col items-center justify-start text-black gap-2'>
        {addressDataSet.map((item) => (
          <div onClick={() => setSelected(item)} key={item.id} className={`h-[7vh] w-[98%] flex justify-center items-center gap-3 cursor-pointer hover:bg-zinc-100    ${selected === item ? 'bg-zinc-100 border-2 border-black rounded-xl' : 'rounded-md'}`}  >
            <div className='h-[5vh] w-[5vh] bg-zinc-200 rounded-full flex items-center justify-center ml-1'>
              <i className="ri-map-pin-fill text-black"></i>
            </div>
            <div className='h-[7vh] w-[75vw] flex flex-col items-start justify-center'>
              <h1 className='text-md uber-move truncate'>{item.name}</h1>
              <p className='text-sm w-[65vw] text-zinc-500 truncate'>{item.address}</p>
            </div>
          </div>
        ))}
    </div>
  )
}

export default LocationSearchPanel