'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type MascotMood = 'idle' | 'friendly' | 'excited' | 'thinking' | 'happy' | 'waving' | 'walking'

interface MascotState {
  mood: MascotMood
  isVisible: boolean
  isChatOpen: boolean
  position: { x: number; y: number }
}

interface MascotContextType {
  state: MascotState
  setMood: (mood: MascotMood) => void
  setVisible: (visible: boolean) => void
  setChatOpen: (open: boolean) => void
  setPosition: (x: number, y: number) => void
}

const MascotContext = createContext<MascotContextType | null>(null)

export function MascotProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MascotState>({
    mood: 'idle',
    isVisible: true,
    isChatOpen: false,
    position: { x: 85, y: 70 },
  })

  const setMood = useCallback((mood: MascotMood) => {
    setState(prev => ({ ...prev, mood }))
  }, [])

  const setVisible = useCallback((isVisible: boolean) => {
    setState(prev => ({ ...prev, isVisible }))
  }, [])

  const setChatOpen = useCallback((isChatOpen: boolean) => {
    setState(prev => ({ ...prev, isChatOpen }))
  }, [])

  const setPosition = useCallback((x: number, y: number) => {
    setState(prev => ({ ...prev, position: { x, y } }))
  }, [])

  return (
    <MascotContext.Provider value={{ state, setMood, setVisible, setChatOpen, setPosition }}>
      {children}
    </MascotContext.Provider>
  )
}

export function useMascot() {
  const context = useContext(MascotContext)
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider')
  }
  return context
}
