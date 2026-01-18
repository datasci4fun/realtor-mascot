'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMascot } from './MascotProvider'
import { motion, AnimatePresence } from 'framer-motion'

type ConversationState =
  | 'hidden'
  | 'greeting'
  | 'asking_intent'
  | 'asking_timeline'
  | 'asking_budget'
  | 'collecting_email'
  | 'collecting_name'
  | 'thank_you'
  | 'idle'

interface LeadData {
  name: string
  email: string
  phone: string
  intent: 'buying' | 'selling' | 'renting' | ''
  priceRange: string
  timeline: string
}

const pageGreetings: Record<string, string> = {
  '/': "Hi! Looking for your dream home? I can help!",
  '/listings': "See anything you like? I can schedule a viewing!",
  '/about': "Want to know more about Sarah? She's helped 200+ families!",
  '/contact': "I'll make sure Sarah gets your message right away!",
}

const greetingDelays: Record<string, number> = {
  '/': 3000,
  '/listings': 8000,
  '/about': 5000,
  '/contact': 2000,
}

export function MascotChat() {
  const pathname = usePathname()
  const { state: mascotState, setMood, setChatOpen } = useMascot()

  const [conversationState, setConversationState] = useState<ConversationState>('hidden')
  const [currentMessage, setCurrentMessage] = useState('')
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    intent: '',
    priceRange: '',
    timeline: '',
  })
  const [hasInteracted, setHasInteracted] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Get greeting for current path
  const getGreeting = () => {
    // Check for listing detail page
    if (pathname.startsWith('/listings/') && pathname !== '/listings') {
      return "Beautiful property, right? Want to see it in person?"
    }
    return pageGreetings[pathname] || pageGreetings['/']
  }

  // Trigger greeting after delay
  useEffect(() => {
    if (hasInteracted) return

    const delay = greetingDelays[pathname] || 5000
    const timer = setTimeout(() => {
      setCurrentMessage(getGreeting())
      setConversationState('greeting')
      setMood('friendly')
      setChatOpen(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [pathname, hasInteracted, setMood, setChatOpen])

  // Reset on page change (but keep lead data)
  useEffect(() => {
    if (conversationState !== 'hidden' && conversationState !== 'thank_you') {
      // Update greeting for new page
      setCurrentMessage(getGreeting())
      setConversationState('greeting')
    }
  }, [pathname])

  const handleQuickReply = (reply: string) => {
    setHasInteracted(true)

    switch (conversationState) {
      case 'greeting':
        if (reply === 'yes_help') {
          setConversationState('asking_intent')
          setCurrentMessage("Great! Are you looking to buy, sell, or rent?")
          setMood('excited')
        } else {
          setConversationState('idle')
          setCurrentMessage("No problem! I'm here if you need me. Just click me anytime!")
          setMood('idle')
          setTimeout(() => {
            setChatOpen(false)
            setConversationState('hidden')
          }, 3000)
        }
        break

      case 'asking_intent':
        setLeadData(prev => ({ ...prev, intent: reply as LeadData['intent'] }))
        setConversationState('asking_timeline')
        setCurrentMessage("What's your timeline?")
        break

      case 'asking_timeline':
        setLeadData(prev => ({ ...prev, timeline: reply }))
        if (leadData.intent === 'buying' || leadData.intent === 'renting') {
          setConversationState('asking_budget')
          setCurrentMessage("What's your budget range?")
        } else {
          setConversationState('collecting_email')
          setCurrentMessage("I can have Sarah send you a free home valuation! What's your email?")
        }
        break

      case 'asking_budget':
        setLeadData(prev => ({ ...prev, priceRange: reply }))
        setConversationState('collecting_email')
        setCurrentMessage("I'll send you matching listings! What's your email?")
        break
    }
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    if (conversationState === 'collecting_email') {
      setLeadData(prev => ({ ...prev, email: inputValue }))
      setInputValue('')
      setConversationState('collecting_name')
      setCurrentMessage("And what should I call you?")
    } else if (conversationState === 'collecting_name') {
      const name = inputValue
      setLeadData(prev => ({ ...prev, name }))
      setInputValue('')

      // Submit lead
      await submitLead({ ...leadData, name })

      setConversationState('thank_you')
      setCurrentMessage(`Thanks ${name}! Sarah will reach out soon. You're going to love working with her!`)
      setMood('happy')

      // Hide after thank you
      setTimeout(() => {
        setChatOpen(false)
      }, 5000)
    }
  }

  const submitLead = async (data: LeadData) => {
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'mascot',
          page: pathname,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error('Failed to submit lead:', error)
    }
  }

  const handleMascotClick = () => {
    if (conversationState === 'hidden' || conversationState === 'idle') {
      setCurrentMessage(getGreeting())
      setConversationState('greeting')
      setChatOpen(true)
      setMood('friendly')
    }
  }

  // Add click handler to mascot avatar
  useEffect(() => {
    const avatar = document.querySelector('.mascot-avatar')
    if (avatar) {
      avatar.addEventListener('click', handleMascotClick)
      return () => avatar.removeEventListener('click', handleMascotClick)
    }
  }, [conversationState])

  if (conversationState === 'hidden') return null

  return (
    <AnimatePresence>
      {mascotState.isChatOpen && (
        <motion.div
          className="mascot-chat"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <div className="chat-bubble">
            <p className="text-gray-800 text-sm leading-relaxed">{currentMessage}</p>
          </div>

          {/* Quick replies for greeting */}
          {conversationState === 'greeting' && (
            <div className="quick-replies">
              <button
                className="quick-reply-btn"
                onClick={() => handleQuickReply('yes_help')}
              >
                Yes, help me!
              </button>
              <button
                className="quick-reply-btn"
                onClick={() => handleQuickReply('just_browsing')}
              >
                Just browsing
              </button>
            </div>
          )}

          {/* Quick replies for intent */}
          {conversationState === 'asking_intent' && (
            <div className="quick-replies">
              <button className="quick-reply-btn" onClick={() => handleQuickReply('buying')}>
                Buying
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('selling')}>
                Selling
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('renting')}>
                Renting
              </button>
            </div>
          )}

          {/* Quick replies for timeline */}
          {conversationState === 'asking_timeline' && (
            <div className="quick-replies">
              <button className="quick-reply-btn" onClick={() => handleQuickReply('asap')}>
                ASAP
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('1-3 months')}>
                1-3 months
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('3-6 months')}>
                3-6 months
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('exploring')}>
                Just exploring
              </button>
            </div>
          )}

          {/* Quick replies for budget */}
          {conversationState === 'asking_budget' && (
            <div className="quick-replies">
              <button className="quick-reply-btn" onClick={() => handleQuickReply('under-300k')}>
                Under $300k
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('300k-500k')}>
                $300k-$500k
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('500k-750k')}>
                $500k-$750k
              </button>
              <button className="quick-reply-btn" onClick={() => handleQuickReply('750k+')}>
                $750k+
              </button>
            </div>
          )}

          {/* Email input */}
          {conversationState === 'collecting_email' && (
            <form onSubmit={handleInputSubmit} className="mt-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                required
                autoFocus
              />
              <button
                type="submit"
                className="mt-2 w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
              >
                Send
              </button>
            </form>
          )}

          {/* Name input */}
          {conversationState === 'collecting_name' && (
            <form onSubmit={handleInputSubmit} className="mt-3">
              <input
                type="text"
                placeholder="Your name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                required
                autoFocus
              />
              <button
                type="submit"
                className="mt-2 w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
              >
                Send
              </button>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
