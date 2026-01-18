'use client'

import { useState } from 'react'
import { AnimationMode, BoneEditorMode } from '@/components/debug/mascot'

export default function MascotDebugPage() {
  const [mode, setMode] = useState<'animation' | 'bones'>('animation')

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">Mascot Animation Debug</h1>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('animation')}
          className={`px-4 py-2 rounded font-medium ${
            mode === 'animation' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Animation Testing
        </button>
        <button
          onClick={() => setMode('bones')}
          className={`px-4 py-2 rounded font-medium ${
            mode === 'bones' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Bone Editor
        </button>
      </div>

      {/* Render mode-specific component */}
      {mode === 'animation' && <AnimationMode />}
      {mode === 'bones' && <BoneEditorMode />}
    </div>
  )
}
