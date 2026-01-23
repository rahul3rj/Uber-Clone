import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext.jsx'

const Chat = (props) => {
  const { state } = useLocation()
  const rideId = props?.rideId ?? state?.rideId ?? null
  const role = props?.role ?? state?.role ?? 'user'
  const pickup = props?.pickup ?? state?.pickup ?? ''
  const destination = props?.destination ?? state?.destination ?? ''
  const returnStage = props?.returnStage ?? state?.returnStage ?? null
  const navigate = useNavigate()
  const { sendMessage, receiveMessage, off } = useContext(SocketContext)
  const onClose = props?.onClose
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    const handler = (payload) => {
      if (!payload || payload.rideId !== rideId) return
      setMessages((prev) => {
        const next = [...prev, payload]
        try { localStorage.setItem(`chat:${rideId}`, JSON.stringify(next)) } catch (e) {}
        return next
      })
    }
    receiveMessage('chat:message', handler)
    const cancelHandler = (payload) => {
      if (payload?.rideId === rideId) {
        try { localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
        setMessages([])
        if (onClose) onClose(); else navigate(role === 'captain' ? '/CaptainHome' : '/Home')
      }
    }
    receiveMessage('ride:cancelled', cancelHandler)
    const completedHandler = (payload) => {
      if (payload?.rideId === rideId) {
        try { localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
        setMessages([])
        if (onClose) onClose(); else navigate(role === 'captain' ? '/CaptainHome' : '/Home')
      }
    }
    receiveMessage('ride:completed', completedHandler)
    return () => {
      off('chat:message', handler)
      off('ride:cancelled', cancelHandler)
      off('ride:completed', completedHandler)
    }
  }, [rideId, role, receiveMessage, off, navigate, onClose])

  useEffect(() => {
    if (!rideId) return
    try {
      const raw = localStorage.getItem(`chat:${rideId}`)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved)) setMessages(saved)
      }
    } catch (e) {}
  }, [rideId])

  const onSend = () => {
    const t = text.trim()
    if (!t || !rideId) return
    sendMessage('chat:message', { rideId, from: role, text: t })
    setText('')
  }

  const onCancel = () => {
    if (!rideId) return
    if (window.confirm('Cancel ride?')) {
      sendMessage('ride:cancel', { rideId, by: role })
      try { localStorage.setItem('redirectAfterCancel','1'); localStorage.removeItem(`chat:${rideId}`) } catch (e) {}
      setMessages([])
      if (onClose) onClose(); else navigate(role === 'captain' ? '/CaptainHome' : '/Home')
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col">
        <div className="h-[7vh] w-full flex items-center justify-between px-5 border-b border-zinc-300">
          <button onClick={() => { if (onClose) onClose(); else if (role === 'user') navigate('/RideSelection', { state: { pickup, destination, returnStage, rideId } }); else navigate(-1); }} className="text-black text-md uber-text font-[600]">
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <h1 className="text-black text-lg uber-move-bold">Chat</h1>
          <button onClick={onCancel} className="text-red-600 text-sm uber-text font-[600]">Cancel</button>
        </div>

        <div className="flex-1 w-full overflow-y-auto px-5 py-3 gap-2 flex flex-col">
          {messages.map((m, idx) => {
            const mine = m.from === role
            return (
              <div key={idx} className={`max-w-[70%] px-3 py-2 rounded-md ${mine ? 'self-end bg-black text-white' : 'self-start bg-zinc-200 text-black'}`}>
                <div className="text-sm uber-text-medium">{m.text}</div>
                <div className={`text-[10px] ${mine ? 'text-white/70' : 'text-black/50'}`}>{new Date(m.ts || Date.now()).toLocaleTimeString()}</div>
              </div>
            )
          })}
        </div>

        <div className="h-[10vh] w-full flex items-center justify-center px-5 border-t border-zinc-300 gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 h-[6vh] bg-[#f2f2f2] rounded-md px-4 outline-none text-sm uber-text-medium"
          />
          <button onClick={onSend} className="h-[6vh] px-4 rounded-md bg-black text-white text-sm uber-text-medium">Send</button>
        </div>
      </div>
    </div>
  )
}

export default Chat