import React, { useEffect, useRef, useState } from 'react'

const Loader = ({ waitMs = 5000, exitMs = 1200, onFinish }) => {
  const [phase, setPhase] = useState('enter')
  const t1 = useRef(null)
  const t2 = useRef(null)

  useEffect(() => {
    t1.current = setTimeout(() => {
      setPhase('exit')
      t2.current = setTimeout(() => {
        setPhase('done')
        if (typeof onFinish === 'function') onFinish()
      }, exitMs)
    }, waitMs)

    return () => {
      if (t1.current) clearTimeout(t1.current)
      if (t2.current) clearTimeout(t2.current)
    }
  }, [waitMs, exitMs, onFinish])

  if (phase === 'done') return null

  return (
    <div
      className={
        `fixed inset-0 z-[9999] bg-black will-change-transform ` +
        `transition-transform duration-[${exitMs}ms] ease-[cubic-bezier(0.22,1,0.36,1)] ` +
        (phase === 'exit' ? '-translate-y-full' : 'translate-y-0')
      }
    >
      <div className=" absolute inset-0 flex items-center justify-center">
        <img src="/loader.gif" alt="" className='h-[25%]'/>
      </div>
    </div>
  )
}

export default Loader