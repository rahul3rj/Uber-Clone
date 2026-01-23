import React, { useState, useEffect, useContext, useRef } from 'react'
import BottomSlider from '../components/BottomSlider';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext.jsx';
import { UserDataContext } from '../context/UserContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import Chat from './Chat.jsx';

const RideSelection = () => {
    const { sendMessage, receiveMessage, off } = useContext(SocketContext);
    const location = useLocation();
    const navigate = useNavigate();
    const pickup = location.state?.pickup || '';
    const destination = location.state?.destination || '';
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const [center, setCenter] = useState({ lat: (typeof location.state?.pickupLat === 'number' ? location.state.pickupLat : 37.7749), lng: (typeof location.state?.pickupLng === 'number' ? location.state.pickupLng : -122.4194) });
    const [currentRideId, setCurrentRideId] = useState(null);
    const [sliderOpen, setSliderOpen] = useState(false);
    const [fares, setFares] = useState(null);
    const [fareLoading, setFareLoading] = useState(false);
    const [fareError, setFareError] = useState('');
    const [rideOtp, setRideOtp] = useState('');
    const [duration, setDuration] = useState('');
    const [acceptedCaptain, setAcceptedCaptain] = useState(null);
    const [ProfileActive, setProfileActive] = useState(false);

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
      let map;
      loadGoogleMaps().then(() => {
        const google = window.google;
        if (!mapRef.current) return;
        map = new google.maps.Map(mapRef.current, { center, zoom: 14, disableDefaultUI: true });
        mapInstanceRef.current = map;
        markerRef.current = new google.maps.Marker({ position: center, map, clickable: false });
        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({ map, preserveViewport: true });
        const update = () => { const c = map.getCenter(); const next = { lat: c.lat(), lng: c.lng() }; setCenter(next); if (markerRef.current) markerRef.current.setPosition(next); };
        map.addListener('idle', update);
        if (pickup && destination) {
          directionsServiceRef.current.route({ origin: pickup, destination, travelMode: google.maps.TravelMode.DRIVING }, (res, status) => { if (status === 'OK') directionsRendererRef.current.setDirections(res); });
        }
      }).catch(() => {});
      return () => { };
    }, []);

    const handleConfirmRide = async () => {
      if (!pickup || !destination) return;
      if (currentRideId) { setFareError('Cancel the current ride to request a new one'); return; }
      if (selected === null) { setFareError('Please select a ride type'); return; }
      const vehicleType = ['motorcycle','auto','car'][selected];
      const token = localStorage.getItem('user');
      try {
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
          pickup,
          destination,
          vehicleType,
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const newId = res.data?.ride?._id || null;
        console.log('Ride created:', res.data?.ride);
        setCurrentRideId(newId);
        const otp = res.data?.ride?.otp || '';
        setRideOtp(otp);
        localStorage.setItem('currentRide', JSON.stringify({ id: newId, pickup, destination, stage: 'loading', otp }));
        setSliderStage('loading');
      } catch (err) {
        console.log(err);
        setFareError('Unable to create ride');
      }
    };
    const [selected, setSelected] = useState(null);
    const [sliderStage, setSliderStage] = useState('ride');
    const [loadingProgress, setLoadingProgress] = useState(0); 
    const LOADING_DURATION_MS = 5*10000;
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [payment, setPayment] = useState(false);
    const [paymentLocked, setPaymentLocked] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const { user } = useContext(UserDataContext);
    const [trips, setTrips] = useState(0);
    const [callState, setCallState] = useState('idle');
    const [incomingFrom, setIncomingFrom] = useState(null);
    const ringStopRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const outgoingRef = useRef(false);
    const paymentIcons = {
      cash: "https://tb-static.uber.com/prod/wallet/icons_v2/cash_3x.png",
      upi: "https://tb-static.uber.com/prod/wallet/icons_v2/qr_3x.png",
      others: "https://tb-static.uber.com/prod/wallet/icons_v2/gift_box_3x.png",
    };
    const paymentLabelMap = { cash: "Cash", upi: "UPI", others: "Others" };
    const rideImages = [
      "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png",
      "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png",
      "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/Hatchback.png",
    ];
    const rideTypesMap = { motorcycle: 2, auto: 3, car: 5 };
    const vehicleImageMap = { motorcycle: rideImages[0], auto: rideImages[1], car: rideImages[2] };
    const selectedImageSrc = acceptedCaptain ? vehicleImageMap[acceptedCaptain?.vehicle?.vehicleType] : (selected !== null ? rideImages[selected] : null);
    const pickupMinutes = (() => { const vt = acceptedCaptain?.vehicle?.vehicleType ?? (selected !== null ? ['motorcycle','auto','car'][selected] : null); return vt ? (rideTypesMap[vt] ?? 3) : 3; })();

    useEffect(() => {
      const token = localStorage.getItem("user");
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/users/stats/trips`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        .then((res) => setTrips(res.data?.trips || 0))
        .catch(() => {});
    }, []);

    useEffect(() => {
      if (sliderStage === "loading") {
        const id = setTimeout(() => {
          if (currentRideId) {
            sendMessage("ride:cancel", { rideId: currentRideId, by: "system" });
            try {
              localStorage.setItem("redirectAfterCancel", "1");
            } catch (e) {}
            localStorage.removeItem("currentRide");
            setAcceptedCaptain(null);
            setCurrentRideId(null);
          }
          setSliderStage("ride");
        }, LOADING_DURATION_MS);

        return () => clearTimeout(id);
      }
    }, [sliderStage, currentRideId, sendMessage]);

    useEffect(() => {
      if (sliderStage === 'loading') {
        setLoadingProgress(0);
        const start = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const pct = Math.min(100, (elapsed / LOADING_DURATION_MS) * 100);
          setLoadingProgress(pct);
          if (pct >= 100) {
            clearInterval(interval);
          }
        }, 100);
        return () => clearTimeout(interval);
      } else if (sliderStage === 'details') {
        setLoadingProgress(100);
      } else {
        setLoadingProgress(0);
      }
    }, [sliderStage]);

    useEffect(() => {
      const token = localStorage.getItem('user');
      if (!pickup || !destination) return;
      let cancelled = false;
      setFareLoading(true);
      setFareError('');
      axios.get(`${import.meta.env.VITE_BASE_URL}/rides/fare`, {
        params: { pickup, destination },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).then((res) => {
        if (cancelled) return;
        setFares(res.data?.fare || null);
      }).catch(() => {
        if (cancelled) return;
        setFareError('Unable to fetch fare');
      }).finally(() => {
        if (!cancelled) setFareLoading(false);
      });
      return () => { cancelled = true; };
    }, [pickup, destination]);

    useEffect(() => {
      receiveMessage('ride:accepted', (data) => {
        const id = data?.rideId || null;
        setCurrentRideId(id);
        setAcceptedCaptain(data?.captain || null);
        setSliderStage('details');
        const saved = JSON.parse(localStorage.getItem('currentRide') || '{}');
        localStorage.setItem('currentRide', JSON.stringify({ ...saved, id, stage: 'details', acceptedCaptain: data?.captain || null }));
      });
      receiveMessage('ride:cancelled', (payload) => {
        const id = payload?.rideId;
        if (id) { try { localStorage.removeItem(`chat:${id}`) } catch (e) {} }
        localStorage.removeItem('currentRide');
        setSliderStage('ride');
        setAcceptedCaptain(null);
        setCurrentRideId(null);
      });
      const chatHandler = (m) => {
        if (!m?.rideId) return;
        const key = `chat:${m.rideId}`;
        try {
          const prev = JSON.parse(localStorage.getItem(key) || '[]');
          const next = Array.isArray(prev) ? [...prev, m] : [m];
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {}
      };
      receiveMessage('chat:message', chatHandler);
      return () => { off('chat:message', chatHandler); };
    }, [receiveMessage, off]);

    useEffect(() => {
      const completedHandler = (payload) => {
        const id = payload?.rideId;
        if (!id || id !== currentRideId) return;
        setPayment(true);
        setPaymentLocked(true);
      };
      receiveMessage('ride:completed', completedHandler);
      return () => { off('ride:completed', completedHandler); };
    }, [currentRideId, receiveMessage, off]);

    const startRingtone = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      let on = false;
      const interval = setInterval(() => {
        on = !on;
        gain.gain.setValueAtTime(on ? 0.2 : 0, ctx.currentTime);
      }, 600);
      return () => { clearInterval(interval); osc.stop(); ctx.close(); };
    };

    useEffect(() => {
      const ringHandler = (payload) => {
        if (!payload || payload.rideId !== currentRideId) return;
        if (payload.from === 'user') { setCallState('outgoing'); } else { setCallState('incoming'); setIncomingFrom(payload.from || 'captain'); }
        if (!ringStopRef.current) ringStopRef.current = startRingtone();
      };
      receiveMessage('call:ring', ringHandler);
      const acceptHandler = async (payload) => { if (!payload || payload.rideId !== currentRideId) return; if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } if (outgoingRef.current) { ensurePC(); await startLocal().catch(()=>{}); const offer = await pcRef.current.createOffer(); await pcRef.current.setLocalDescription(offer); sendMessage('webrtc:offer', { rideId: currentRideId, sdp: offer }); } setCallState('active'); };
      receiveMessage('call:accept', acceptHandler);
      const declineHandler = (payload) => { if (!payload || payload.rideId !== currentRideId) return; setCallState('idle'); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } cleanupConnections(); outgoingRef.current = false; };
      receiveMessage('call:decline', declineHandler);
      const endHandler = (payload) => { if (!payload || payload.rideId !== currentRideId) return; setCallState('idle'); cleanupConnections(); outgoingRef.current = false; };
      receiveMessage('call:end', endHandler);
      return () => { off('call:ring', ringHandler); off('call:accept', acceptHandler); off('call:decline', declineHandler); off('call:end', endHandler); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } };
    }, [currentRideId, receiveMessage, off]);

    const ensurePC = () => {
      if (pcRef.current) return;
      pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      pcRef.current.onicecandidate = (e) => { if (e.candidate) sendMessage('webrtc:candidate', { rideId: currentRideId, candidate: e.candidate }); };
      pcRef.current.ontrack = (e) => {
        const s = e.streams && e.streams[0] ? e.streams[0] : new MediaStream();
        if (!e.streams || e.streams.length === 0) s.addTrack(e.track);
        if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = s; remoteAudioRef.current.play().catch(()=>{}); }
      };
    };
    const startLocal = async () => {
      if (!pcRef.current) ensurePC();
      if (localStreamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
    };
    const cleanupConnections = () => {
      try { localStreamRef.current?.getTracks()?.forEach((t) => t.stop()); } catch (e) {}
      if (remoteAudioRef.current) { try { remoteAudioRef.current.srcObject = null; } catch (e) {} }
      try { pcRef.current?.close(); } catch (e) {}
      pcRef.current = null;
      localStreamRef.current = null;
    };

    useEffect(() => {
      const offerHandler = async (p) => { if (!p || p.rideId !== currentRideId) return; ensurePC(); await startLocal().catch(()=>{}); await pcRef.current.setRemoteDescription(new RTCSessionDescription(p.sdp)).catch(()=>{}); const ans = await pcRef.current.createAnswer(); await pcRef.current.setLocalDescription(ans); sendMessage('webrtc:answer', { rideId: currentRideId, sdp: ans }); setCallState('active'); };
      receiveMessage('webrtc:offer', offerHandler);
      const answerHandler = async (p) => { if (!p || p.rideId !== currentRideId) return; if (!pcRef.current) return; await pcRef.current.setRemoteDescription(new RTCSessionDescription(p.sdp)).catch(()=>{}); setCallState('active'); };
      receiveMessage('webrtc:answer', answerHandler);
      const candHandler = async (p) => { if (!p || p.rideId !== currentRideId || !p.candidate) return; try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(p.candidate)); } catch (e) {} };
      receiveMessage('webrtc:candidate', candHandler);
      return () => { off('webrtc:offer', offerHandler); off('webrtc:answer', answerHandler); off('webrtc:candidate', candHandler); };
    }, [currentRideId, receiveMessage, off]);

    useEffect(() => {
      const redirectFlag = localStorage.getItem('redirectAfterCancel');
      if (redirectFlag) {
        const token = localStorage.getItem('user');
        axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel-open`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).catch(() => {});
        localStorage.removeItem('redirectAfterCancel');
        navigate('/Home');
        return;
      }
      const rs = location.state?.returnStage;
      const rid = location.state?.rideId;
      if (rs) setSliderStage(rs);
      if (rid) setCurrentRideId(rid);
      const savedRaw = localStorage.getItem('currentRide');
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw);
          if (saved?.id) {
            setCurrentRideId(saved.id);
            setRideOtp(saved.otp || '');
            setAcceptedCaptain(saved.acceptedCaptain || null);
            setSliderStage(saved.stage || 'details');
            sendMessage('ride:rejoin', { rideId: saved.id });
            const token = localStorage.getItem('user');
            axios.get(`${import.meta.env.VITE_BASE_URL}/rides/${saved.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
              .then((res) => {
                setAcceptedCaptain(res.data?.ride?.captain || saved.acceptedCaptain || null);
              }).catch(() => {});
          }
        } catch (e) {}
      }
    }, []);
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden uber-move">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        {payment && (
            <div className="w-full h-screen bg-black/20 absolute z-99 flex flex-col items-center justify-center">
              <div className='h-[50vh] w-[80%] bg-white rounded-md flex flex-col items-center justify-center gap-4'>
                <div className='w-[25vh] h-[25vh] flex items-center justify-center'>
                  <img
                    src={paymentMethod === 'cash' ? '/payWithCash.png' : paymentMethod === 'upi' ? '/payWithUpi.png' : '/payWithGiftCard.png'}
                    alt=""
                    className=" w-full object-cover"
                  />
                </div>
                <div className='text-2xl font-bold'>
                  {paymentMethod === 'cash' ? 'Pay with Cash' : paymentMethod === 'upi' ? 'Pay with UPI' : 'Pay with Gift Card'}
                </div>
                <div className='text-md font-medium'>{paymentMethod === 'cash' ? 'Pay with cash at the destination' : paymentMethod === 'upi' ? 'Pay with UPI' : 'Pay with your gift card'}</div>
                <div className='w-[80%] h-[5vh] flex flex-1 items-center justify-center gap-2'>
                  {!paymentLocked && (
                    <div onClick={() => setPayment(false)} className='w-[50%] h-[5vh] flex items-center justify-center rounded-sm bg-zinc-400 text-white cursor-pointer'>
                      Not now
                    </div>
                  )}
                  <div onClick={() => { setPayment(false); try { localStorage.removeItem('currentRide') } catch (e) {} setAcceptedCaptain(null); setCurrentRideId(null); navigate('/Home'); }} className='w-[50%] h-[5vh] flex items-center justify-center rounded-sm bg-black text-white cursor-pointer'>
                    Done
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <p className="text-black text-sm uber-text-medium capitalize">{`${user?.fullname?.firstname || ''} ${user?.fullname?.lastname || ''}`.trim()}</p>
              <p className="text-zinc-600 text-xs uber-text">Trips: {trips}</p>
              <button onClick={() => { const token = localStorage.getItem('user'); axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then(() => { localStorage.removeItem('user'); window.location.href = '/user/login'; }).catch(() => {}); }} className="px-18 py-3 rounded-md bg-black flex items-center justify-center hover:bg-red-500 text-white text-xs">Logout <i className="ri-logout-box-line"></i></button>
            </div>
          )}
        </div>
        </div>
        <div
          onClick={() => {
            window.location.href = "/Home";
          }}
          className="h-[5vh] w-[5vh] rounded-full bg-white z-9 absolute top-10 left-7 flex items-center justify-center shadow-md hover:shadow-xl transition-all ease-in-out cursor-pointer"
        >
          <i className="ri-arrow-left-line text-xl font-bold"></i>
        </div>
        <div className="h-[30vh] w-full">
          <BottomSlider
            collapsedPeek={290}
            onOpenChange={(open) => {
              setSliderOpen(open);
            }}
          >
            {sliderStage === "ride" && (
              <div className="h-[50vh] w-full flex flex-col items-center justify-start">
                <h1 className="text-lg uber-text-medium my-2">Choose a Ride</h1>
                {fareError && <p className="text-sm uber-text text-red-600">{fareError}</p>}
                <div className="w-full h-[2px] bg-black/10"></div>
                <div className="h-full w-full flex flex-col items-center justify-start my-2 gap-3">
                  <div
                    onClick={() => setSelected(0)}
                    className={`h-[9vh] w-full rounded-lg border-2 flex items-center justify-between pr-4 cursor-pointer transition-all ease-in-out hover:bg-zinc-100 ${
                      selected === 0 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-full w-[9vh]">
                      <img
                        src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png"
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    </div>
                    <div className="h-[5vh] flex-1">
                      <h1 className="text-md uber-text-medium flex">
                        Bike{" "}
                        <span className="uber-text-medium font-[200] text-sm">
                          <i className="ml-1 ri-user-fill text-sm"></i>1{" "}
                        </span>
                      </h1>
                      <p className="text-sm uber-text text-zinc-500">
                        {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} . 2 min
                      </p>
                    </div>
                    <div className="h-[5vh] flex-initial items-center justify-center">
                      <h1 className="text-md uber-text-medium">{fareLoading ? '…' : (fares?.motorcycle ? `₹${fares.motorcycle}` : '—')}</h1>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelected(1)}
                    className={`h-[9vh] w-full rounded-lg border-2 flex items-center justify-between pr-4 cursor-pointer transition-all ease-in-out hover:bg-zinc-100 ${
                      selected === 1 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-full w-[9vh]">
                      <img
                        src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png"
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    </div>
                    <div className="h-[5vh] flex-1">
                      <h1 className="text-md uber-text-medium flex">
                        Auto{" "}
                        <span className="uber-text-medium font-[200] text-sm">
                          <i className="ml-1 ri-user-fill text-sm"></i>2{" "}
                        </span>
                      </h1>
                      <p className="text-sm uber-text text-zinc-500">
                        {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} . 3 min
                      </p>
                    </div>
                    <div className="h-[5vh] flex-initial items-center justify-center">
                      <h1 className="text-md uber-text-medium">{fareLoading ? '…' : (fares?.auto ? `₹${fares.auto}` : '—')}</h1>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelected(2)}
                    className={`h-[9vh] w-full rounded-lg border-2 flex items-center justify-between pr-4 cursor-pointer transition-all ease-in-out hover:bg-zinc-100 ${
                      selected === 2 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-full w-[9vh]">
                      <img
                        src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/Hatchback.png"
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    </div>
                    <div className="h-[5vh] flex-1">
                      <h1 className="text-md uber-text-medium flex">
                        Uber Go{" "}
                        <span className="uber-text-medium font-[200] text-sm">
                          <i className="ml-1 ri-user-fill text-sm"></i>3{" "}
                        </span>
                      </h1>
                      <p className="text-sm uber-text text-zinc-500">
                        {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} . 5 min
                      </p>
                    </div>
                    <div className="h-[5vh] flex-initial items-center justify-center">
                      <h1 className="text-md uber-text-medium">{fareLoading ? '…' : (fares?.car ? `₹${fares.car}` : '—')}</h1>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sliderStage === "loading" && (
              <div className="h-[50vh] w-full flex flex-col items-center justify-start px-5">
                <h1 className="text-lg uber-move-bold mt-1">Ride requested</h1>
                <p className="text-sm uber-text text-zinc-500">
                  Finding drivers nearby
                </p>
                <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <div className="w-full h-[8vh] flex items-center rounded-lg justify-between border-2 border-zinc-100 mt-5 px-3">
                  <div className="w-full flex-1 flex-col items-start justify-start">
                    <p className="text-xs uber-text text-zinc-500 font-[600]">
                      Trip Details
                    </p>
                    <h1 className="text-sm uber-text-medium">
                      Meet at the pickup point
                    </h1>
                  </div>
                  <div onClick={() => { if (!currentRideId) return; if (window.confirm('Cancel this ride?')) { sendMessage('ride:cancel', { rideId: currentRideId, by: 'user' }); try { localStorage.setItem('redirectAfterCancel', '1') } catch (e) {} localStorage.removeItem('currentRide'); setAcceptedCaptain(null); setCurrentRideId(null); setSliderStage('ride'); } }}  className="w-[5vh] h-[5vh] flex items-center justify-center bg-zinc-100 rounded-md cursor-pointer">
                    <i className="ri-more-2-fill text-2xl text-black/50 rotate-90"></i>
                  </div>
                </div>
                <div className="h-[20vh] w-full flex items-center justify-center mt-2 rounded-lg overflow-hidden">
                  <img
                    src="https://i.pinimg.com/originals/0c/a9/a9/0ca9a912149840edebd299271e8fbc56.gif"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {sliderStage === "details" && (
              <div className="h-[50vh] w-full flex flex-col items-center justify-start ">
                <h1 className="text-lg uber-text-medium my-2">
                  Pick-up in {pickupMinutes} min
                </h1>
                <div className="h-[5vh] w-full bg-blue-500 rounded-md flex items-center justify-between px-5">
                  <h1 className="text-sm uber-text-medium text-white">
                    Share PIN
                  </h1>
                  <div className="h-[3vh] w-[30vw] flex items-center justify-between">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">{rideOtp?.[0] ?? '•'}</h1>
                    </div>
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">{rideOtp?.[1] ?? '•'}</h1>
                    </div>
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">{rideOtp?.[2] ?? '•'}</h1>
                    </div>
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">{rideOtp?.[3] ?? '•'}</h1>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-start my-3 gap-3">
                  <div className="w-full h-[8vh] flex items-center rounded-lg justify-between border-2 border-zinc-100 px-3">
                  <div className="w-full flex-1 flex-col items-start justify-start">
                    <p className="text-xs uber-text text-zinc-500 font-[600]">
                      Trip Details
                    </p>
                    <h1 className="text-sm uber-text-medium">
                      Meet at the pickup point
                    </h1>
                  </div>
                  <div onClick={() => { if (!currentRideId) return; if (window.confirm('Cancel this ride?')) { sendMessage('ride:cancel', { rideId: currentRideId, by: 'user' }); try { localStorage.setItem('redirectAfterCancel', '1') } catch (e) {} localStorage.removeItem('currentRide'); setAcceptedCaptain(null); setCurrentRideId(null); setSliderStage('ride'); } }} className="w-[5vh] h-[5vh] flex items-center justify-center bg-zinc-100 rounded-md cursor-pointer">
                    <i className="ri-more-2-fill text-2xl text-black/50 rotate-90"></i>
                  </div>
                </div>
                </div>
                <div className='w-full h-[16vh] flex flex-col items-center rounded-lg justify-between border-2 border-zinc-100 px-3'>
                  <div className='w-full h-[60%] flex flex-col items-center justify-start'>
                    <div className='h-[70%] w-full flex items-center justify-between'>
                      <div className='h-full w-[20vw] flex items-center justify-start relative overflow-hidden pt-1'>
                        <div className='h-[5vh] w-[5vh] flex items-center justify-center relative z-20'>
                          <img src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg" alt=""  className='h-full w-full object-cover rounded-full border-1 border-black'/>
                          <div className='h-[1.5vh] w-[4vh] absolute -bottom-1 right-[.5vh] bg-black rounded-full flex items-center justify-center'>
                            <i className="ri-star-s-line text-white text-xs"></i>
                            <h1 className="text-[10px] uber-text-medium text-white">4.5</h1>
                          </div>
                        </div>
                        <div className='h-[8vh] w-[8vh] flex items-center justify-center absolute left-5 z-10'>
                          {selectedImageSrc && (<img src={selectedImageSrc} alt="" className='h-full w-full object-cover' />)}
                        </div>
                      </div>
                      <div className='h-full w-[50vw] flex flex-col items-end justify-center'>
                        <h1 className="text-md uber-move-bold">
                          {acceptedCaptain?.vehicle?.plate || '—'}
                        </h1>
                        <p className="text-xs uber-text text-zinc-600 font-[600]">
                          {acceptedCaptain?.vehicle?.color && acceptedCaptain?.vehicle?.vehicleType ? `${acceptedCaptain.vehicle.color} ${acceptedCaptain.vehicle.vehicleType}` : '—'}
                        </p>
                      </div>
                    </div>
                    <div className='h-[2vh] w-full flex items-center justify-between'>
                      <p className="text-xs uber-text text-zinc-600 font-[600]">
                        {`${acceptedCaptain?.fullname?.firstname || ''} ${acceptedCaptain?.fullname?.lastname || ''}`.trim() || '—'}
                      </p>
                      <p className="text-xs uber-text text-zinc-600 font-[600]">
                        —
                      </p>
                    </div>
                  </div>
                  <div className='w-full h-[40%] flex items-center gap-1 justify-between'>
                    <div onClick={() => { if (!currentRideId) return; setChatOpen(true); }} className='h-[5vh] w-[30vh] flex flex-1 items-center justify-center gap-2 rounded-md bg-zinc-100 cursor-pointer'>
                      <i className="ri-message-fill text-black"></i>
                      <h1 className="text-sm uber-text-medium text-black">
                        Send a message
                      </h1>
                    </div>
                    <div onClick={() => { if (!currentRideId) return; outgoingRef.current = true; setCallState('outgoing'); sendMessage('call:initiate', { rideId: currentRideId, from: 'user' }); if (!ringStopRef.current) ringStopRef.current = startRingtone(); }} className='h-[5vh] w-[5vh] flex items-center justify-center gap-2 rounded-md bg-zinc-100 cursor-pointer'>
                      <i className="ri-phone-fill text-black"></i>
                    </div>
                    <div onClick={() => { if (!currentRideId) return; if (window.confirm('Cancel this ride?')) { sendMessage('ride:cancel', { rideId: currentRideId, by: 'user' }); try { localStorage.setItem('redirectAfterCancel', '1') } catch (e) {} localStorage.removeItem('currentRide'); setAcceptedCaptain(null); setCurrentRideId(null); setSliderStage('ride'); } }} className='h-[5vh] w-[5vh] flex items-center justify-center gap-2 rounded-md bg-zinc-100 cursor-pointer'>
                      <i className="ri-more-2-fill text-2xl text-black/50 rotate-90"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </BottomSlider>
        </div>
        <div className="absolute z-11 bottom-0 left-0 right-0 h-[13vh] bg-white w-full flex flex-col items-center justify-center border-t-[2px] border-t-black/10">
          <div onClick={() => setPaymentOpen(true)} className="h-[8vh] w-[85%] flex items-center justify-center cursor-pointer group">
            <div className="h-[3vh] w-[3vh] flex items-center justify-center">
              <img
                src={paymentIcons[paymentMethod]}
                alt={paymentLabelMap[paymentMethod]}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-[3vh] w-full flex-1 flex items-center justify-between mx-3">
              <h1 className="text-sm uber-text-medium">{paymentLabelMap[paymentMethod]}</h1>
              <i className="ri-arrow-drop-right-line text-3xl text-black/50 group-hover:text-black transition-all ease-in-out duration-200"></i>
            </div>
          </div>
          <button
            onClick={() => {
              if (sliderStage === 'details') {
                setPayment(true);
              } else {
                handleConfirmRide();
              }
            }}
            className="w-[85%] h-[7vh] mb-2 rounded-md bg-black text-white text-md hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
          >
            {sliderStage === 'details' ? 'Pay Now' : 'Confirm Ride'}
          </button>
          

          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
          {paymentOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setPaymentOpen(false)}></div>
              <div className="relative z-[70] w-[80%] max-w-md bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-md uber-text-medium mb-2">Choose Payment Method</h2>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setPaymentMethod('cash'); setPaymentOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center">
                      <img src={paymentIcons.cash} alt="Cash" className="h-full w-full object-cover" />
                    </div>
                    <span className="uber-text-medium">Cash</span>
                  </button>
                  <button onClick={() => { setPaymentMethod('upi'); setPaymentOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center">
                      <img src={paymentIcons.upi} alt="UPI" className="h-full w-full object-cover" />
                    </div>
                    <span className="uber-text-medium">UPI</span>
                  </button>
                  <button onClick={() => { setPaymentMethod('others'); setPaymentOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center">
                      <img src={paymentIcons.others} alt="Others" className="h-full w-full object-cover" />
                    </div>
                    <span className="uber-text-medium">Others</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      {callState !== 'idle' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-[70] w-full max-w-sm bg-gradient-to-b from-[#0e0e10] to-[#1b1b1f] text-white rounded-2xl p-6 flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-white/20">
              <img src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg" alt="" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-lg uber-move-bold">{`${acceptedCaptain?.fullname?.firstname || ''} ${acceptedCaptain?.fullname?.lastname || ''}`.trim() || 'Captain'}</h1>
            <h2 className="text-xs text-white/60">{callState === 'incoming' ? 'Incoming call' : callState === 'outgoing' ? 'Calling…' : 'In call'}</h2>
            {callState === 'incoming' && (
              <div className="w-full flex items-center justify-between gap-4 mt-2">
                <button onClick={() => { setCallState('active'); sendMessage('call:accept', { rideId: currentRideId, by: 'user' }); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } }} className="flex-1 h-[6vh] rounded-lg bg-[#3B864E] text-white">Accept</button>
                <button onClick={() => { setCallState('idle'); sendMessage('call:decline', { rideId: currentRideId, by: 'user' }); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } cleanupConnections(); outgoingRef.current = false; }} className="flex-1 h-[6vh] rounded-lg bg-red-500 text-white">Decline</button>
              </div>
            )}
            {callState === 'outgoing' && (
              <div className="w-full flex items-center justify-center gap-4 mt-2">
                <button onClick={() => { setCallState('idle'); sendMessage('call:decline', { rideId: currentRideId, by: 'user' }); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } cleanupConnections(); outgoingRef.current = false; }} className="h-[6vh] w-full rounded-lg bg-zinc-500 text-white">Cancel</button>
              </div>
            )}
            {callState === 'active' && (
              <div className="w-full flex items-center justify-center gap-4 mt-2">
                <button onClick={() => { setCallState('idle'); sendMessage('call:end', { rideId: currentRideId, by: 'user' }); cleanupConnections(); outgoingRef.current = false; }} className="h-[6vh] w-full rounded-lg bg-red-600 text-white">End Call</button>
              </div>
            )}
          </div>
        </div>
      )}
      {chatOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setChatOpen(false)}></div>
          <div className="relative z-[70] w-full max-w-md bg-white shadow-lg">
            <Chat rideId={currentRideId} role={'user'} pickup={pickup} destination={destination} returnStage={sliderStage} onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default RideSelection