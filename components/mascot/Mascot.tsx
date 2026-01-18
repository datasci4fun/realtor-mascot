'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useMascot } from './MascotProvider'
import { MascotChat } from './MascotChat'
import { VRMAvatar } from './VRMAvatar'

type WalkState = 'idle' | 'walking' | 'paused'

export function Mascot() {
  const pathname = usePathname()
  const { state, setChatOpen, setMood } = useMascot()
  const [isClient, setIsClient] = useState(false)

  // Walking state
  const [position, setPosition] = useState({ x: 20 }) // x position from right
  const [walkState, setWalkState] = useState<WalkState>('idle')
  const [walkDirection, setWalkDirection] = useState(0) // -1 = left, 0 = stopped, 1 = right
  const [targetX, setTargetX] = useState(20)

  const walkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const stateTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if we should skip rendering (debug pages)
  const isDebugPage = pathname?.startsWith('/debug')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Wave on first appearance
  useEffect(() => {
    if (isClient && state.isVisible) {
      const timer = setTimeout(() => {
        setMood('waving')
        setTimeout(() => setMood('friendly'), 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isClient, state.isVisible, setMood])

  // Pick a new target position
  const pickNewTarget = useCallback(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const maxX = screenWidth - 250 // Don't go off left edge
    const minX = 20 // Don't go off right edge
    const newTarget = Math.random() * (maxX - minX) + minX
    setTargetX(newTarget)
    // Set initial direction based on target (will be updated during walk)
    setWalkDirection(newTarget > position.x ? 1 : -1)
  }, [position.x])

  // Walking behavior state machine
  useEffect(() => {
    if (!isClient || !state.isVisible) {
      return
    }

    const scheduleNextAction = () => {
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current)
      }

      if (walkState === 'idle' || walkState === 'paused') {
        // After being idle for a bit, start walking
        const idleTime = 2000 + Math.random() * 3000 // 2-5 seconds idle
        stateTimerRef.current = setTimeout(() => {
          pickNewTarget()
          setWalkState('walking')
          setMood('walking')
        }, idleTime)
      }
    }

    scheduleNextAction()

    return () => {
      if (stateTimerRef.current) {
        clearTimeout(stateTimerRef.current)
      }
    }
  }, [isClient, state.isVisible, walkState, setMood, pickNewTarget])

  // Walking movement
  useEffect(() => {
    if (walkState !== 'walking') {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current)
        walkIntervalRef.current = null
      }
      return
    }

    const speed = 2 // pixels per frame
    walkIntervalRef.current = setInterval(() => {
      setPosition(prev => {
        const diff = targetX - prev.x

        // Check if we've reached the target
        if (Math.abs(diff) < speed) {
          // Arrived at destination
          setWalkState('paused')
          setWalkDirection(0) // Stop and face forward
          // Note: setMood('friendly') is handled by the useEffect that watches walkState
          return { x: targetX }
        }

        // Move towards target
        const direction = diff > 0 ? 1 : -1
        setWalkDirection(direction)
        return { x: prev.x + direction * speed }
      })
    }, 16) // ~60fps

    return () => {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current)
      }
    }
  }, [walkState, targetX])

  // Update mood when walk state changes
  useEffect(() => {
    if (walkState === 'walking') {
      setMood('walking')
    } else if (walkState === 'paused' || walkState === 'idle') {
      if (state.mood === 'walking') {
        setMood('friendly')
      }
    }
  }, [walkState, setMood, state.mood])

  // Don't render on debug pages or before client hydration
  if (!isClient || !state.isVisible || isDebugPage) return null

  const handleAvatarClick = () => {
    // Stop walking when clicked
    setWalkState('idle')
    setWalkDirection(0) // Face forward
    setChatOpen(!state.isChatOpen)
    if (!state.isChatOpen) {
      setMood('friendly')
    }
  }

  return (
    <div
      id="mascot-container"
      className="fixed z-50"
      style={{
        right: `${position.x}px`,
        bottom: '0px',
        transition: walkState === 'walking' ? 'none' : 'right 0.3s ease',
      }}
    >
      {/* Chat UI */}
      <MascotChat />

      {/* VRM Avatar - Full body walking around */}
      <div
        className="mascot-avatar relative"
        style={{
          filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2))',
        }}
      >
        <VRMAvatar
          mood={state.mood}
          onClick={handleAvatarClick}
          vrmUrl="/mascot/mascot.vrm"
          walkDirection={walkDirection}
        />

        {/* Chat indicator bubble */}
        {!state.isChatOpen && walkDirection === 0 && (
          <div
            className="absolute top-4 -left-4 bg-primary-500 text-white
                       text-sm px-3 py-1.5 rounded-full animate-bounce shadow-lg"
            style={{ animationDuration: '2s' }}
          >
            Chat with me!
          </div>
        )}
      </div>
    </div>
  )
}
