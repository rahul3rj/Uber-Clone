import React, { useState, useEffect, useContext, useRef } from 'react'
import BottomSlider from '../components/BottomSlider';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext.jsx';
import { CaptainDataContext } from '../context/CaptainContext.jsx';


const PickupLocation = () => {
  const [sliderOpen, setSliderOpen] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [pin, setPin] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const acceptedRide = state?.acceptedRide;
  const rideId = acceptedRide?.id;
  const { sendMessage, receiveMessage, off } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);
  const [otpVals, setOtpVals] = useState(['','','','']);
  const [otpErr, setOtpErr] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [durationMin, setDurationMin] = useState(null);
  const [arrivalTime, setArrivalTime] = useState('');
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
      navigator.geolocation?.getCurrentPosition((pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; gpsLatestRef.current = p; setCenter(p); map.setCenter(p); gpsMarkerRef.current?.setPosition(p); });
      watchId = navigator.geolocation?.watchPosition((pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; gpsLatestRef.current = p; gpsMarkerRef.current?.setPosition(p); if (followGps) map.setCenter(p); }, undefined, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
    }).catch(() => {});
    return () => { if (watchId) try { navigator.geolocation.clearWatch(watchId) } catch (e) {} };
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const parseDistanceKm = (text) => {
    const s = String(text || '').toLowerCase().replace(/,/g, '').trim();
    let n = parseFloat(s);
    if (s.includes('km')) return isNaN(n) ? 0 : n;
    if (s.includes('m')) return isNaN(n) ? 0 : n / 1000;
    if (s.includes('mi')) return isNaN(n) ? 0 : n * 1.60934;
    return isNaN(n) ? 0 : n;
  };
  const parseDurationMin = (text) => {
    const s = String(text || '').toLowerCase();
    const days = s.match(/(\d+)\s*day/);
    const hours = s.match(/(\d+)\s*hour/);
    const mins = s.match(/(\d+)\s*min/);
    let total = 0;
    if (days) total += parseInt(days[1], 10) * 24 * 60;
    if (hours) total += parseInt(hours[1], 10) * 60;
    if (mins) total += parseInt(mins[1], 10);
    if (!days && !hours && !mins) { const n = parseFloat(s); total += isNaN(n) ? 0 : n; }
    return total;
  };

  useEffect(() => {
    if (!acceptedRide?.pickup || !acceptedRide?.dropoff) return;
    const token = localStorage.getItem('captain') || localStorage.getItem('user');
    
    const updateDistance = () => {
        const currentLoc = gpsLatestRef.current;
        if (!currentLoc) return;
        
        const origin = `${currentLoc.lat},${currentLoc.lng}`;
        const destination = isOngoing ? acceptedRide.dropoff : acceptedRide.pickup;

        axios.get(`${import.meta.env.VITE_BASE_URL}/maps/distanceTime`, {
        params: { origin, destination },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }).then((res) => {
        const km = parseDistanceKm(res.data?.distance);
        const min = parseDurationMin(res.data?.duration);
        setDistanceKm(km);
        setDurationMin(min);
        const startedAt = parseInt(localStorage.getItem(`ride:${rideId}:startedAt`) || '0', 10);
        if (startedAt && min) setArrivalTime(new Date(startedAt + min * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
        }).catch(() => {});
    };

    updateDistance();
    const interval = setInterval(updateDistance, 10000); // Update every 10 seconds
    return () => clearInterval(interval);

  }, [acceptedRide, isOngoing]);

  useEffect(() => {
    const ongoingHandler = (p) => { if (!p || p.rideId !== rideId) return; setIsOngoing(true); setPin(false); setOtpErr(''); try { localStorage.setItem(`ride:${rideId}:startedAt`, String(Date.now())); } catch (e) {} if (durationMin) setArrivalTime(new Date(Date.now() + durationMin * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })); };
    receiveMessage('ride:ongoing', ongoingHandler);
    const invalidHandler = (p) => { if (!p || p.rideId !== rideId) return; setOtpErr('Pin is wrong. Try again'); };
    receiveMessage('ride:otp:invalid', invalidHandler);
    const completedHandler = (p) => { if (!p || p.rideId !== rideId) return; navigate('/CaptainHome'); };
    receiveMessage('ride:completed', completedHandler);
    return () => { off('ride:ongoing', ongoingHandler); off('ride:otp:invalid', invalidHandler); off('ride:completed', completedHandler); };
  }, [rideId, receiveMessage, off, durationMin, navigate]);
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        {pin && (
          <div className="absolute inset-0 bg-black/20 shadow-md flex items-center justify-center z-[99]">
            <div className='relative h-auto w-[90%] max-w-md bg-white rounded-lg flex flex-col items-center justify-center gap-4 p-5'>
              <button onClick={() => setPin(false)} className='absolute top-2 right-2 h-8 w-8 rounded-full bg-zinc-200 text-black flex items-center justify-center'>×</button>
              <h1 className='text-xl font-bold'>Enter your PIN</h1>
              {otpErr && (<p className='text-xs text-red-600'>{otpErr}</p>)}
              <div className='h-[8vh] w-full flex items-center justify-center gap-3 px-5'>
                {[0,1,2,3].map((i) => (
                  <input key={i}
                    className="bg-zinc-200 h-full w-[8vh] text-center text-2xl rounded-lg"
                    type="text"
                    maxLength="1"
                    value={otpVals[i]}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g,'').slice(0,1); setOtpVals((p) => { const n=[...p]; n[i]=v; return n; }); if (v.length === 1) e.target.nextElementSibling?.focus(); }}
                  />
                ))}
              </div>
              <button onClick={() => { const otp = otpVals.join(''); setOtpErr(''); sendMessage('ride:start', { rideId, otp }); }} className='h-[5vh] w-[80%] bg-black text-white rounded-lg flex items-center justify-center cursor-pointer'>Submit</button>
            </div>
          </div>
        )}
        <div
          onClick={() => navigate(-1)}
          className="h-[5vh] w-[5vh] rounded-full bg-white shadow-md flex items-center justify-center absolute top-10 left-7 z-99 cursor-pointer"
        >
          <i className="ri-arrow-left-line text-2xl text-black font-bold"></i>
        </div>
        <div className="h-screen w-full bg-white relative">
          <div ref={mapRef} className="h-full w-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
            <i className="ri-map-pin-2-fill text-4xl text-red-600 drop-shadow-md"></i>
          </div>
          <div onClick={() => { setFollowGps(true); if (gpsLatestRef.current && mapInstanceRef.current) { mapInstanceRef.current.setCenter(gpsLatestRef.current); setCenter(gpsLatestRef.current); } else { navigator.geolocation?.getCurrentPosition((pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; gpsLatestRef.current = p; mapInstanceRef.current?.setCenter(p); setCenter(p); }); } }} className="h-[5vh] w-[5vh] rounded-full bg-white absolute bottom-20 right-5 flex items-center justify-center shadow-md hover:shadow-xl transition-all ease-in-out cursor-pointer">
            <i className="ri-navigation-fill text-xl"></i>
          </div>
        </div>
        <div className="shadow-md h-[5vh] w-[5vh] rounded-full absolute top-10 right-10 cursor-pointer">
          <div className="h-[5vh] w-[5vh] rounded-full bg-black flex items-center justify-center overflow-hidden border border-white border-2 ">
            <img
              src={captain?.profileImage || "https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"}
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
                <div className="h-[5vh] w-[5vh] rounded-full flex items-center justify-center bg-zinc-100">
                  <i className="ri-map-pin-2-fill text-2xl text-black"></i>
                </div>
                <div className="h-[5vh] w-[75vw] ">
                  <p className="text-zinc-500 text-sm">{isOngoing ? 'Destination' : 'Pick up at'}</p>
                  <h1 className="text-black text-lg uber-move-bold truncate">
                    {isOngoing ? (acceptedRide?.dropoff || '—') : (acceptedRide?.pickup || '—')}
                  </h1>
                </div>
              </div>
              <div className="h-[20vh] w-full flex flex-col items-center justify-center border-b border-zinc-200">
                <div className="h-[10vh] w-full flex items-center justify-between">
                  <div className="h-[8vh] w-[30vw] flex flex-col items-center justify-center">
                    <p className="text-zinc-500 text-sm">Reach at</p>
                    <h1 className="text-black text-lg uber-move-bold">
                      {arrivalTime || (isOngoing && durationMin ? new Date(Date.now() + durationMin * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—')}
                    </h1>
                  </div>
                  <div className="h-[8vh] w-[30vw] flex flex-col items-center justify-center">
                    <p className="text-zinc-500 text-sm">Distance</p>
                    <h1 className="text-black text-lg uber-move-bold">
                      {typeof distanceKm === 'number' ? `${distanceKm} km` : ((acceptedRide?.distance ? `${acceptedRide.distance} km` : '—'))}
                    </h1>
                  </div>
                  <div className="h-[8vh] w-[30vw] flex flex-col items-center justify-center">
                    <p className="text-zinc-500 text-sm">Fare</p>
                    <h1 className="text-black text-lg uber-move-bold">₹{acceptedRide?.rideFare ?? acceptedRide?.fare ?? '—'}</h1>
                  </div>
                </div>
                <button
                  onClick={() => { if (isOngoing) { sendMessage('ride:complete', { rideId }); } else { setPin(true); setOtpErr(''); } }}
                  className="h-[5vh] w-[85vw] mt-3 bg-[#3B864E] text-white poppins-medium rounded-md cursor-pointer relative hover:bg-[#50AC67] transition-all duration-200"
                >
                  {isOngoing ? 'Drop Off' : 'Enter OTP'}
                </button>
                
              </div>
            </div>
          </BottomSlider>
        </div>
      </div>
    </div>
  );
}

export default PickupLocation