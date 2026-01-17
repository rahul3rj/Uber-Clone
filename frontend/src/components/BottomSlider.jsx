import React, { useState, useRef, useEffect } from 'react'

const BottomSlider = ({
  children,
  collapsedPeek = 100,
  className = '',
  contentClassName = '',
  style,
  onOpenChange,
}) => {
  const sheetRef = useRef(null)
  const [translateY, setTranslateY] = useState(0)
  const collapsedOffsetRef = useRef(0)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const startYRef = useRef(0)
  const startTranslateRef = useRef(0)
  const openRef = useRef(false)
  const [transition, setTransition] = useState('transform 200ms ease')

  useEffect(() => {
    const update = () => {
      if (!sheetRef.current) return
      const h = sheetRef.current.offsetHeight
      const off = Math.max(h - collapsedPeek, 0)
      const wasOpen = openRef.current
      collapsedOffsetRef.current = off
      setTranslateY(wasOpen ? 0 : off)
      if (onOpenChange) onOpenChange(wasOpen)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [collapsedPeek, onOpenChange])

  const onStart = (clientY) => {
    draggingRef.current = true
    movedRef.current = false
    startYRef.current = clientY
    startTranslateRef.current = translateY
    setTransition('none')
  }

  const onMove = (clientY) => {
    if (!draggingRef.current) return
    const dy = clientY - startYRef.current
    if (Math.abs(dy) > 3) movedRef.current = true
    const next = Math.min(Math.max(startTranslateRef.current + dy, 0), collapsedOffsetRef.current)
    setTranslateY(next)
  }

  const onEnd = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setTransition('transform 200ms ease')
    const snap = translateY < collapsedOffsetRef.current / 2 ? 0 : collapsedOffsetRef.current
    setTranslateY(snap)
    const isOpen = snap === 0
    openRef.current = isOpen
    if (onOpenChange) onOpenChange(isOpen)
  }

  return (
    <div
      ref={sheetRef}
      className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-6px_24px_rgba(0,0,0,0.12)] ${className}`}
      style={{ transform: `translateY(${translateY}px)`, transition, ...style }}
    >
      <div
        className={` w-full px-6 pt-3 pb-4 select-none ${contentClassName}`}
        onMouseDown={(e) => onStart(e.clientY)}
        onMouseMove={(e) => onMove(e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientY)}
        onTouchEnd={onEnd} 
        onClick={() => {
            if (movedRef.current) return
            const tol = 1
            const isCollapsed = Math.abs(translateY - collapsedOffsetRef.current) <= tol
            if (!isCollapsed) return
            setTransition('transform 200ms ease')
            setTranslateY(0)
            openRef.current = true
            if (onOpenChange) onOpenChange(true)
          }}
      >
        <div
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"
          
        />
        {children}
      </div>
    </div>
  )
}

export default BottomSlider