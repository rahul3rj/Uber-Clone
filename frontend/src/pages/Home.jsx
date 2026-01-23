import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomSlider from "../components/BottomSlider";
import LocationSearchPanel from "../components/LocationSearchPanel";
import RideSelection from "../pages/RideSelection";
import axios from 'axios';
import { UserDataContext } from '../context/UserContext.jsx';

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [sliderOpen, setSliderOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeField, setActiveField] = useState('pickup');
  const [ProfileActive, setProfileActive] = useState(false);
  const [trips, setTrips] = useState(0);
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) return resolve();
      const existing = document.querySelector('script[data-gmaps="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }
      const key = import.meta.env.VITE_GOOGLE_MAPS_JS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.defer = true;
      s.dataset.gmaps = 'true';
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  };

  useEffect(() => {
    let map;
    loadGoogleMaps().then(() => {
      const google = window.google;
      if (!mapRef.current) return;
      map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        disableDefaultUI: true,
      });
      mapInstanceRef.current = map;
      markerRef.current = new google.maps.Marker({
        position: center,
        map,
        clickable: false,
      });
      const update = () => {
        const c = map.getCenter();
        const next = { lat: c.lat(), lng: c.lng() };
        setCenter(next);
        if (markerRef.current) markerRef.current.setPosition(next);
      };
      map.addListener('idle', update);
      navigator.geolocation?.getCurrentPosition((pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(p);
        map.setCenter(p);
        if (markerRef.current) markerRef.current.setPosition(p);
      });
    }).catch(() => {});
    return () => { };
  }, []);

  useEffect(() => {
    const text = (activeField === 'pickup' ? pickup : destination) || '';
    const token = localStorage.getItem('user') || localStorage.getItem('captain');
    if (!text || !mapInstanceRef.current) return;
    axios.get(`${import.meta.env.VITE_BASE_URL}/maps/coordinates`, {
      params: { address: text },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }).then((res) => {
      const loc = res.data;
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        mapInstanceRef.current.setCenter(loc);
        setCenter(loc);
        if (markerRef.current) markerRef.current.setPosition(loc);
      }
    }).catch(() => {});
  }, [pickup, destination, activeField]);
  const submitHandler = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const token = localStorage.getItem('user');
    axios.get(`${import.meta.env.VITE_BASE_URL}/users/stats/trips`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then((res) => setTrips(res.data?.trips || 0)).catch(() => {});
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        <img
          onClick={() => {
            window.location.href = "/Home";
          }}
          src="/Uber-Logo.png"
          alt=""
          className="h-12 absolute z-9 top-10 left-7 cursor-pointer"
        />
        <div className="h-[70vh] w-full bg-white relative">
          <div ref={mapRef} className="h-full w-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
            <i className="ri-map-pin-2-fill text-4xl text-red-600 drop-shadow-md"></i>
          </div>
        </div>
       <div className="shadow-md h-[5vh] w-[5vh] rounded-full top-10 right-10 cursor-pointer">
          <div
          onMouseEnter={() => setProfileActive(true)}
          className="shadow-md h-[5vh] w-[5vh] rounded-full absolute top-10 right-10 cursor-pointer flex items-center justify-center gap-2"
        >
          <div
            onClick={() => setProfileActive((p) => !p)}
            className="h-[5vh] w-[5vh] rounded-full flex items-center justify-center overflow-hidden border border-white border-2 "
          >
            <img
              src={user?.profileImage || "https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"}
              alt=""
              className="h-full w-full object-cover "
            />
          </div>
          {ProfileActive && (
            <div className="absolute top-0 right-0 mt-[6vh] ml-0 z-50 bg-white rounded-lg shadow-lg p-4 w-56 flex flex-col items-center justify-center gap-3">
              <div className='w-[8vh] h-[8vh] rounded-full flex items-center justify-center relative'>
                <img
                  src={user?.profileImage || "https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"}
                  alt=""
                  className="h-full w-full object-cover rounded-full"
                />
                <label className='absolute -bottom-2 -right-2 bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center shadow-md cursor-pointer'>
                  <i className="ri-pencil-fill text-black text-xl"></i>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => { const token = localStorage.getItem('user'); axios.post(`${import.meta.env.VITE_BASE_URL}/users/profile/image`, { imageData: String(reader.result) }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).catch(() => {}); }; reader.readAsDataURL(f); }} />
                </label>
              </div>
              <p className="text-black text-sm uber-text-medium capitalize">{user?.fullname?.firstname} {user?.fullname?.lastname || ''}</p>
              <p className="text-zinc-600 text-xs uber-text">Trips: {trips}</p>
              <button onClick={() => { const token = localStorage.getItem('user'); axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then(() => { localStorage.removeItem('user'); window.location.href = '/user/login'; }).catch(() => {}); }} className="px-18 py-3 rounded-md bg-black hover:bg-red-500 transition-all ease-in-out duration-300 text-white text-xs flex items-center justify-center gap-2">Logout <i className="ri-logout-box-line"></i></button>
            </div>
          )}
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
                      onFocus={() => { setActiveField('pickup'); setSliderOpen(true); }}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setSliderOpen(true);
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
                      onFocus={() => { setActiveField('destination'); setSliderOpen(true); }}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setSliderOpen(true);
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
                    {/* suggestions panel */}
                    <LocationSearchPanel
                      selected={selected}
                      setSelected={setSelected}
                      searchText={activeField === 'pickup' ? pickup : destination}
                      onSelectSuggestion={(item) => {
                        const text = item?.address || item?.description || item?.name || '';
                        if (activeField === 'pickup') setPickup(text);
                        else setDestination(text);
                      }}
                    />
                  </div>
                  <div className="h-[5vh] w-full flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (!pickup || !destination) return;
                        navigate('/RideSelection', { state: { pickup, destination, pickupLat: center.lat, pickupLng: center.lng } });
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
