import React, { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext.jsx";
import Chat from './Chat.jsx';
import axios from 'axios';

const CaptainRideDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { sendMessage, receiveMessage, off } = useContext(SocketContext);

  const acceptedRide = state?.acceptedRide;
  const rideId = acceptedRide?.id;
  const [chatOpen, setChatOpen] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [incomingFrom, setIncomingFrom] = useState(null);
  const ringStopRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const outgoingRef = useRef(false);

  useEffect(() => {
    const cancelHandler = (payload) => {
      if (!payload || payload.rideId !== rideId) return;
      try { localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
      navigate('/CaptainHome');
    };
    receiveMessage('ride:cancelled', cancelHandler);
    const completedHandler = (payload) => {
      if (!payload || payload.rideId !== rideId) return;
      try { localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
      navigate('/CaptainHome');
    };
    receiveMessage('ride:completed', completedHandler);
    return () => { off('ride:cancelled', cancelHandler); off('ride:completed', completedHandler); };
  }, [rideId, receiveMessage, off, navigate]);

  useEffect(() => {
    if (!rideId) return;
    const chatHandler = (m) => {
      if (!m?.rideId || m.rideId !== rideId) return;
      const key = `chat:${rideId}`;
      try {
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        const next = Array.isArray(prev) ? [...prev, m] : [m];
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {}
    };
    receiveMessage('chat:message', chatHandler);
    return () => off('chat:message', chatHandler);
  }, [rideId, receiveMessage, off]);

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
      if (!payload || payload.rideId !== rideId) return;
      if (payload.from === 'captain') { setCallState('outgoing'); } else { setCallState('incoming'); setIncomingFrom(payload.from || 'user'); }
      if (!ringStopRef.current) ringStopRef.current = startRingtone();
    };
    receiveMessage('call:ring', ringHandler);
    const acceptHandler = async (payload) => { if (!payload || payload.rideId !== rideId) return; if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } if (outgoingRef.current) { ensurePC(); await startLocal().catch(()=>{}); const offer = await pcRef.current.createOffer(); await pcRef.current.setLocalDescription(offer); sendMessage('webrtc:offer', { rideId, sdp: offer }); } setCallState('active'); };
    receiveMessage('call:accept', acceptHandler);
    const declineHandler = (payload) => { if (!payload || payload.rideId !== rideId) return; setCallState('idle'); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } cleanupConnections(); outgoingRef.current = false; };
    receiveMessage('call:decline', declineHandler);
    const endHandler = (payload) => { if (!payload || payload.rideId !== rideId) return; setCallState('idle'); cleanupConnections(); outgoingRef.current = false; };
    receiveMessage('call:end', endHandler);
    return () => { off('call:ring', ringHandler); off('call:accept', acceptHandler); off('call:decline', declineHandler); off('call:end', endHandler); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } };
  }, [rideId, receiveMessage, off]);

  const ensurePC = () => {
    if (pcRef.current) return;
    pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current.onicecandidate = (e) => { if (e.candidate) sendMessage('webrtc:candidate', { rideId, candidate: e.candidate }); };
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
    const offerHandler = async (p) => { if (!p || p.rideId !== rideId) return; ensurePC(); await startLocal().catch(()=>{}); await pcRef.current.setRemoteDescription(new RTCSessionDescription(p.sdp)).catch(()=>{}); const ans = await pcRef.current.createAnswer(); await pcRef.current.setLocalDescription(ans); sendMessage('webrtc:answer', { rideId, sdp: ans }); setCallState('active'); };
    receiveMessage('webrtc:offer', offerHandler);
    const answerHandler = async (p) => { if (!p || p.rideId !== rideId) return; if (!pcRef.current) return; await pcRef.current.setRemoteDescription(new RTCSessionDescription(p.sdp)).catch(()=>{}); setCallState('active'); };
    receiveMessage('webrtc:answer', answerHandler);
    const candHandler = async (p) => { if (!p || p.rideId !== rideId || !p.candidate) return; try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(p.candidate)); } catch (e) {} };
    receiveMessage('webrtc:candidate', candHandler);
    return () => { off('webrtc:offer', offerHandler); off('webrtc:answer', answerHandler); off('webrtc:candidate', candHandler); };
  }, [rideId, receiveMessage, off]);

  useEffect(() => {
    if (!acceptedRide?.pickup || !acceptedRide?.dropoff) return;
    const token = localStorage.getItem('captain') || localStorage.getItem('user');
    axios.get(`${import.meta.env.VITE_BASE_URL}/maps/distanceTime`, {
      params: { origin: acceptedRide.pickup, destination: acceptedRide.dropoff },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).then((res) => {
      const s = String(res.data?.distance || '').toLowerCase().replace(/,/g,'').trim();
      let n = parseFloat(s);
      if (s.includes('km')) n = isNaN(n) ? 0 : n;
      else if (s.includes('m')) n = isNaN(n) ? 0 : n / 1000;
      else if (s.includes('mi')) n = isNaN(n) ? 0 : n * 1.60934;
      else n = isNaN(n) ? 0 : n;
      setDistanceKm(n);
    }).catch(() => {});
  }, [acceptedRide]);

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
            onClick={() => { sendMessage('ride:cancel', { rideId: acceptedRide.id, by: 'captain' }); navigate('/CaptainHome'); }}
            className="text-black text-md uber-text font-[600] cursor-pointer transition-all duration-300 ease-in-out absolute left-5"
          >
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <h1 className="text-black text-lg uber-move-bold">Ride Accepted</h1>
        </div>
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
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
                  {typeof distanceKm === 'number' ? distanceKm : (acceptedRide.distance ?? '—')} km
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
                  ₹{acceptedRide.fare - ( 25 + acceptedRide.fare * (5/100))}
                </h1>
              </div>
              <div className="h-auto w-full flex items-center justify-between gap-2 ">
                <h1 className="text-black text-sm uber-text-medium">Base fare</h1>
                <h1 className="text-black text-sm uber-text-medium">
                  ₹25
                </h1>
              </div>
              <div className="h-auto w-full flex items-center justify-between gap-2 ">
                <h1 className="text-black text-sm uber-text-medium">
                  GST (5%)
                </h1>
                <h1 className="text-black text-sm uber-text-medium">
                  ₹{(acceptedRide.fare * (5/100)).toFixed(2)}
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
              <div onClick={() => { outgoingRef.current = true; setCallState('outgoing'); sendMessage('call:initiate', { rideId, from: 'captain' }); if (!ringStopRef.current) ringStopRef.current = startRingtone(); }} className="h-[8vh] w-full flex flex-col items-center justify-center bg-[#3B864E] text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-[#3B864E]/90 transition-all duration-300 ease-in-out">
                <i className="ri-phone-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Call
                </h1>
              </div>
              <div onClick={() => setChatOpen(true)} className="h-[8vh] w-full flex flex-col items-center justify-center bg-black text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-zinc-700 transition-all duration-300 ease-in-out">
                <i className="ri-message-2-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Message
                </h1>
              </div>
              <div onClick={() => { sendMessage('ride:cancel', { rideId: acceptedRide.id, by: 'captain' }); navigate('/CaptainHome'); }} className="h-[8vh] w-full flex flex-col items-center justify-center bg-red-500 text-white text-sm uber-text-medium rounded-lg cursor-pointer hover:bg-red-600 transition-all duration-300 ease-in-out">
                <i className="ri-delete-bin-6-fill"></i>
                <h1 className="text-white text-xs uber-text font-[500]">
                  Cancel
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
          {callState !== 'idle' && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-[70] w-full max-w-sm bg-gradient-to-b from-[#0e0e10] to-[#1b1b1f] text-white rounded-2xl p-6 flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full overflow-hidden border border-white/20">
                  <img src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg" alt="" className="h-full w-full object-cover" />
                </div>
                <h1 className="text-lg uber-move-bold">{acceptedRide.name}</h1>
                <h2 className="text-xs text-white/60">{callState === 'incoming' ? 'Incoming call' : callState === 'outgoing' ? 'Calling…' : 'In call'}</h2>
                {callState === 'incoming' && (
                  <div className="w-full flex items-center justify-between gap-4 mt-2">
                    <button onClick={() => { setCallState('active'); sendMessage('call:accept', { rideId, by: 'captain' }); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } }} className="flex-1 h-[6vh] rounded-lg bg-[#3B864E] text-white">Accept</button>
                    <button onClick={() => { setCallState('idle'); sendMessage('call:decline', { rideId, by: 'captain' }); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } }} className="flex-1 h-[6vh] rounded-lg bg-red-500 text-white">Decline</button>
                  </div>
                )}
                {callState === 'outgoing' && (
                  <div className="w-full flex items-center justify-center gap-4 mt-2">
                    <button onClick={() => { setCallState('idle'); sendMessage('call:decline', { rideId, by: 'captain' }); if (ringStopRef.current) { ringStopRef.current(); ringStopRef.current = null; } cleanupConnections(); outgoingRef.current = false; }} className="h-[6vh] w-full rounded-lg bg-zinc-500 text-white">Cancel</button>
                  </div>
                )}
                {callState === 'active' && (
                  <div className="w-full flex items-center justify-center gap-4 mt-2">
                    <button onClick={() => { setCallState('idle'); sendMessage('call:end', { rideId, by: 'captain' }); cleanupConnections(); outgoingRef.current = false; }} className="h-[6vh] w-full rounded-lg bg-red-600 text-white">End Call</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {chatOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setChatOpen(false)}></div>
              <div className="relative z-[70] w-full max-w-md bg-white shadow-lg">
                <Chat rideId={rideId} role={'captain'} onClose={() => setChatOpen(false)} />
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaptainRideDetail