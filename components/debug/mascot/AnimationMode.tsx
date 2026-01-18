'use client'

import { useState } from 'react'
import { VRMAvatar } from '@/components/mascot/VRMAvatar'
import { MascotMood, moods } from '@/types/mascot'

export function AnimationMode() {
  const [mood, setMood] = useState<MascotMood>('idle')
  const [walkDirection, setWalkDirection] = useState(0)

  return (
    <div className="flex gap-8">
      {/* Avatar Display */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Avatar Preview</h2>
        <div className="bg-gradient-to-b from-indigo-200 to-indigo-300 rounded-lg overflow-hidden">
          <VRMAvatar
            mood={mood}
            walkDirection={walkDirection}
            onClick={() => console.log('Avatar clicked')}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-6">
        {/* Current State */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Current State</h2>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            <span className="text-gray-400">Mood:</span>
            <span className="text-green-400">{mood}</span>
            <span className="text-gray-400">Walk Direction:</span>
            <span className="text-blue-400">
              {walkDirection === 0 ? 'Stopped' : walkDirection === 1 ? 'Left (on screen)' : 'Right (on screen)'}
            </span>
          </div>
        </div>

        {/* Mood Controls */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Mood</h2>
          <div className="grid grid-cols-4 gap-2">
            {moods.map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  mood === m
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Walk Direction Controls */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Walk Direction</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setWalkDirection(-1)
                setMood('walking')
              }}
              className={`flex-1 px-4 py-3 rounded font-medium transition ${
                walkDirection === -1 ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              ← Walk Right
            </button>
            <button
              onClick={() => {
                setWalkDirection(0)
                if (mood === 'walking') setMood('idle')
              }}
              className={`flex-1 px-4 py-3 rounded font-medium transition ${
                walkDirection === 0 ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Stop
            </button>
            <button
              onClick={() => {
                setWalkDirection(1)
                setMood('walking')
              }}
              className={`flex-1 px-4 py-3 rounded font-medium transition ${
                walkDirection === 1 ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Walk Left →
            </button>
          </div>
        </div>

        {/* Test Sequences */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Test Sequences</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                setMood('waving')
                await new Promise(r => setTimeout(r, 2000))
                setMood('friendly')
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded"
            >
              Wave Hello (2s)
            </button>
            <button
              onClick={async () => {
                setMood('thinking')
                await new Promise(r => setTimeout(r, 1500))
                setMood('excited')
                await new Promise(r => setTimeout(r, 1500))
                setMood('happy')
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded"
            >
              Think → Excited → Happy
            </button>
            <button
              onClick={async () => {
                setWalkDirection(1)
                setMood('walking')
                await new Promise(r => setTimeout(r, 2000))
                setWalkDirection(-1)
                await new Promise(r => setTimeout(r, 2000))
                setWalkDirection(0)
                setMood('friendly')
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded"
            >
              Walk Left → Right → Stop
            </button>
            <button
              onClick={() => {
                setWalkDirection(0)
                setMood('idle')
              }}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Animation Info */}
        <div className="bg-gray-800 p-4 rounded-lg text-sm">
          <h2 className="text-lg font-semibold mb-3">Animation Reference</h2>
          <ul className="space-y-1 text-gray-300">
            <li><span className="text-yellow-400">idle:</span> Subtle head movement, breathing</li>
            <li><span className="text-yellow-400">friendly:</span> More pronounced head movement</li>
            <li><span className="text-yellow-400">excited:</span> Faster movements, happy expression</li>
            <li><span className="text-yellow-400">thinking:</span> Head tilted, contemplative</li>
            <li><span className="text-yellow-400">happy:</span> Joyful expression, head bob</li>
            <li><span className="text-yellow-400">waving:</span> Right arm wave animation</li>
            <li><span className="text-yellow-400">walking:</span> Leg/arm swing, body bob</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
