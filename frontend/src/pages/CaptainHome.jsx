import React, { useState, useEffect, useContext, useRef } from 'react'
import BottomSlider from '../components/BottomSlider'
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext.jsx'
import { CaptainDataContext } from '../context/CaptainContext.jsx'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext.jsx';




const CaptainHome = () => {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [rides, setRides] = useState([]);
  const { sendMessage, receiveMessage, off } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [ProfileActive, setProfileActive] = useState(false);
  const [trips, setTrips] = useState(0);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const gpsMarkerRef = useRef(null);
  const gpsLatestRef = useRef(null);
  const [followGps, setFollowGps] = useState(true);
  const [center, setCenter] = useState({ lat: typeof captain?.location?.lat === 'number' ? captain.location.lat : 37.7749, lng: typeof captain?.location?.lng === 'number' ? captain.location.lng : -122.4194 });

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) return resolve();
      const existing = document.querySelector('script[data-gmaps="true"]');
      if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', (e) => reject(e)); return; }
      const key = import.meta.env.VITE_GOOGLE_MAPS_JS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!key) { console.warn('Google Maps API key missing'); return reject(new Error('No key')); }
      const s = document.createElement('script'); s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`; s.async = true; s.defer = true; s.dataset.gmaps = 'true'; s.onload = () => resolve(); s.onerror = (e) => reject(e); document.head.appendChild(s);
    });
  };

  useEffect(() => {
    let map; let watchId = null;
    loadGoogleMaps().then(() => {
      const google = window.google;
      if (!mapRef.current) return;
      map = new google.maps.Map(mapRef.current, { center, zoom: 15, disableDefaultUI: true });
      mapInstanceRef.current = map;
      markerRef.current = new google.maps.Marker({ position: center, map, clickable: false });
      gpsMarkerRef.current = new google.maps.Marker({ position: center, map, clickable: false });
      const update = () => { const c = map.getCenter(); const next = { lat: c.lat(), lng: c.lng() }; setCenter(next); if (markerRef.current) markerRef.current.setPosition(next); };
      map.addListener('idle', update);
      map.addListener('dragstart', () => setFollowGps(false));
      navigator.geolocation?.getCurrentPosition((pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; gpsLatestRef.current = p; setCenter(p); map.setCenter(p); gpsMarkerRef.current?.setPosition(p); });
      watchId = navigator.geolocation?.watchPosition((pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; gpsLatestRef.current = p; gpsMarkerRef.current?.setPosition(p); if (followGps) map.setCenter(p); }, undefined, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
    }).catch(() => {});
    return () => { if (watchId) try { navigator.geolocation.clearWatch(watchId) } catch (e) {} };
  }, []);
 
  const submitHandler = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const parseDistanceKm = (text) => {
      const s = String(text || '').toLowerCase().replace(/,/g, '').trim();
      let n = parseFloat(s);
      if (s.includes('km')) return isNaN(n) ? 0 : n;
      if (s.includes('m')) return isNaN(n) ? 0 : n / 1000;
      if (s.includes('mi')) return isNaN(n) ? 0 : n * 1.60934;
      return isNaN(n) ? 0 : n;
    };
    const handler = (data) => {
      const n = data?.userName?.firstname ? `${data.userName.firstname} ${data.userName.lastname || ''}`.trim() : 'New Ride';
      const mapped = {
        id: data.rideId,
        name: n,
        fare: data.fare,
        pickup: data.pickup,
        dropoff: data.destination,
        rideFare: data.fare,
      };
      setRides((prev) => prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev]);
      const token = localStorage.getItem('captain') || localStorage.getItem('user');
      axios.get(`${import.meta.env.VITE_BASE_URL}/maps/distanceTime`, {
        params: { origin: data.pickup, destination: data.destination },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then((res) => {
        const km = parseDistanceKm(res.data?.distance);
        setRides((prev) => prev.map((r) => r.id === mapped.id ? { ...r, distance: km } : r));
      }).catch(() => {});
    };
    receiveMessage('ride:offer', handler);
    return () => off('ride:offer', handler);
  }, [receiveMessage, off]);

  useEffect(() => {
    const cancelHandler = (payload) => {
      const id = payload?.rideId;
      if (!id) return;
      setRides((prev) => prev.filter((r) => r.id !== id));
    };
    receiveMessage('ride:cancelled', cancelHandler);
    return () => off('ride:cancelled', cancelHandler);
  }, [receiveMessage, off]);

  useEffect(() => {
    const acceptedHandler = (payload) => {
      const id = payload?.rideId;
      if (!id) return;
      setRides((prev) => prev.filter((r) => r.id !== id));
    };
    receiveMessage('ride:accepted', acceptedHandler);
    return () => off('ride:accepted', acceptedHandler);
  }, [receiveMessage, off]);

  useEffect(() => {
    const token = localStorage.getItem('captain');
    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/stats/trips`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then((res) => setTrips(res.data?.trips || 0)).catch(() => {});
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="h-screen w-full md:w-[25%] flex flex-col items-center justify-start relative">
        <div className="w-auto flex items-center justify-center absolute z-9 top-10 left-7 cursor-pointer">
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
        <div className="h-full w-full bg-white relative">
          <div ref={mapRef} className="h-full w-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
            <i className="ri-map-pin-2-fill text-4xl text-red-600 drop-shadow-md"></i>
          </div>
        </div>
        <div
          onMouseEnter={() => setProfileActive(true)}
          className=" shadow-md h-[5vh] w-[5vh] rounded-full absolute top-10 right-10 cursor-pointer flex items-center justify-center gap-2"
        >
          <div
            onClick={() => setProfileActive((p) => !p)}
            className="h-[5vh] w-[5vh] rounded-full bg-black flex items-center justify-center overflow-hidden border border-white border-2 "
          >
            <img
              src={captain?.profileImage || "https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"}
              alt=""
              className="h-full w-full object-cover "
            />
          </div>
          {ProfileActive && (
            <div className="absolute top-0 right-0 mt-[6vh] ml-0 z-50 bg-white rounded-lg shadow-lg p-4 w-56 flex flex-col items-center justify-center gap-2">
              <div className='w-[8vh] h-[8vh] rounded-full flex items-center justify-center relative'>
                <img
                  src={captain?.profileImage || "https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"}
                  alt=""
                  className="h-full w-full object-cover rounded-full"
                />
                <label className='absolute -bottom-2 -right-2 bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center shadow-md cursor-pointer'>
                  <i className="ri-pencil-fill text-black text-xl"></i>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const token = localStorage.getItem('captain') || localStorage.getItem('user');
                        axios.post(`${import.meta.env.VITE_BASE_URL}/captains/profile/image`, { imageData: String(reader.result) }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).catch(() => {});
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <p className="text-black text-sm uber-text-medium capitalize">{captain?.fullname?.firstname} {captain?.fullname?.lastname || 'Ooye'}</p>
              <p className="text-zinc-600 text-xs uber-text">Trips: {trips}</p>
              <button
                onClick={() => {
                  const token = localStorage.getItem('captain') || localStorage.getItem('user');
                  axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
                    .then(() => { localStorage.removeItem('captain'); window.location.href = '/captain/login'; })
                    .catch(() => {});
                }}
                className="px-18 py-3 rounded-md bg-black hover:bg-red-500 transition-all ease-in-out duration-300 text-white text-xs mt-1 flex items-center justify-center gap-2"
              >
                Logout <i className="ri-logout-box-line"></i>
              </button>
            </div>
          )}
        </div>
        <div onClick={() => { setFollowGps(true); if (gpsLatestRef.current && mapInstanceRef.current) { mapInstanceRef.current.setCenter(gpsLatestRef.current); setCenter(gpsLatestRef.current); } else { navigator.geolocation?.getCurrentPosition((pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; gpsLatestRef.current = p; mapInstanceRef.current?.setCenter(p); setCenter(p); }); } }} className="h-[5vh] w-[5vh] rounded-full bg-white absolute bottom-45 right-10 flex items-center justify-center shadow-md hover:shadow-xl transition-all ease-in-out cursor-pointer">
          <i className="ri-navigation-fill text-xl"></i>
        </div>
        <div className="h-[20vh] w-full bg-white">
          <BottomSlider
            collapsedPeek={150}
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
                  onClick={() => {
                    const next = !isToggleOn;
                    setIsToggleOn(next);
                    sendMessage("captain:availability", {
                      captainId: captain?._id,
                      available: next,
                    });
                  }}
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
                {rides.map((ride) => (
                  <div
                    key={ride.id}
                    className="w-full flex flex-col items-start justify-start rounded-md transition-all ease-in-out duration-300 cursor-pointer bg-white border border-zinc-300 hover:border-zinc-500 "
                  >
                    <div className="h-[6vh] w-full flex flex-1 items-center justify-start px-5 gap-3 py-3">
                      <div className="h-[5vh] w-[5vh] rounded-full flex items-center justify-center hover:bg-zinc-100 overflow-hidden cursor-pointer">
                        <img
                          src={ride?.profileImage || "https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="h-auto flex-1 flex flex-col items-start justify-between">
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
                        <h1 className="truncate w-[100%] text-black text-sm uber-text-medium">
                          {ride.pickup}
                        </h1>
                      </div>
                      <div className="h-[7vh] w-full flex flex-col items-start justify-center gap-1">
                        <h1 className="text-zinc-400 text-xs uber-text font-[600]">
                          DROP OFF
                        </h1>
                        <h1 className="truncate w-[100%] text-black text-sm uber-text-medium">
                          {ride.dropoff}
                        </h1>
                      </div>
                      <div className="h-[5vh] w-full flex flex-col items-start justify-center gap-1">
                        <button
                          onClick={() => {
                            if (!isToggleOn) return;
                            sendMessage("ride:accept", {
                              rideId: ride.id,
                              captainId: captain?._id,
                            });
                            navigate("/CaptainRideDetail", {
                              state: { acceptedRide: ride },
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