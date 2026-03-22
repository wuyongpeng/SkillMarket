'use client'

import { useRef } from 'react'
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'

interface DraggableCardProps {
  defaultX?: number
  defaultY?: number
  zIndex?: number
  onFocus?: () => void
  children: React.ReactNode
  className?: string
}

export default function DraggableCard({
  defaultX = 0,
  defaultY = 0,
  zIndex = 10,
  onFocus,
  children,
  className = '',
}: DraggableCardProps) {
  const pos = useRef({ x: defaultX, y: defaultY })

  const [style, api] = useSpring(() => ({
    x: defaultX,
    y: defaultY,
    scale: 1,
    shadow: 8,
    config: { tension: 300, friction: 30 },
  }))

  const bind = useDrag(
    ({ active, movement: [mx, my], first, last }) => {
      if (first) onFocus?.()
      const x = pos.current.x + mx
      const y = pos.current.y + my
      if (last) pos.current = { x, y }
      api.start({
        x,
        y,
        scale: active ? 1.04 : 1,
        shadow: active ? 24 : 8,
        immediate: (key) => key === 'x' || key === 'y',
      })
    },
    { filterTaps: true }
  )

  return (
    <animated.div
      {...bind()}
      onMouseDown={onFocus}
      className={`draggable-card ${className}`}
      style={{
        ...style,
        zIndex,
        position: 'absolute',
        touchAction: 'none',
        cursor: 'grab',
        boxShadow: style.shadow.to(
          (s) => `${s * 0.3}px ${s * 0.5}px ${s}px rgba(0,0,0,0.12), 3px 3px 0 #1a1a2e`
        ),
      }}
    >
      {children}
    </animated.div>
  )
}
