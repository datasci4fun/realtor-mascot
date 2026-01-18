'use client'

import { BoneState, defaultBones } from '@/types/mascot'

interface AnimationPresetsProps {
  activeAnimation: string | null
  onAnimationSelect: (name: string | null) => void
}

export function AnimationPresets({ activeAnimation, onAnimationSelect }: AnimationPresetsProps) {
  const toggleAnimation = (name: string) => {
    onAnimationSelect(activeAnimation === name ? null : name)
  }

  return (
    <div className="bg-gray-800 p-3 rounded-lg">
      <h3 className="font-semibold mb-2 text-yellow-400">Waving Animations</h3>
      <div className="grid grid-cols-1 gap-1 mb-3">
        {['waving', 'waving_v2', 'waving_v3'].map(name => (
          <button
            key={name}
            onClick={() => toggleAnimation(name)}
            className={`px-2 py-2 rounded text-xs text-left ${
              activeAnimation === name ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {activeAnimation === name ? '▶ ' : ''}{name}
          </button>
        ))}
      </div>

      <h3 className="font-semibold mb-2 text-yellow-400">Idle Animations</h3>
      <div className="grid grid-cols-1 gap-1 mb-3">
        {['idle_breathing', 'idle_sway', 'friendly'].map(name => (
          <button
            key={name}
            onClick={() => toggleAnimation(name)}
            className={`px-2 py-2 rounded text-xs text-left ${
              activeAnimation === name ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {activeAnimation === name ? '▶ ' : ''}{name}
          </button>
        ))}
      </div>

      <h3 className="font-semibold mb-2 text-yellow-400">Walking Animations</h3>
      <div className="grid grid-cols-1 gap-1 mb-3">
        {['walking', 'walking_slow'].map(name => (
          <button
            key={name}
            onClick={() => toggleAnimation(name)}
            className={`px-2 py-2 rounded text-xs text-left ${
              activeAnimation === name ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {activeAnimation === name ? '▶ ' : ''}{name}
          </button>
        ))}
      </div>

      <h3 className="font-semibold mb-2 text-yellow-400">Other Animations</h3>
      <div className="grid grid-cols-1 gap-1">
        {['excited', 'thinking', 'happy_bounce'].map(name => (
          <button
            key={name}
            onClick={() => toggleAnimation(name)}
            className={`px-2 py-2 rounded text-xs text-left ${
              activeAnimation === name ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {activeAnimation === name ? '▶ ' : ''}{name}
          </button>
        ))}
      </div>
    </div>
  )
}

// Animation logic - returns bone state for a given animation and phase
export function getAnimationFrame(animationName: string, phase: number): BoneState {
  const sin = Math.sin(phase)
  const cos = Math.cos(phase)

  switch (animationName) {
    case 'waving':
      return {
        ...defaultBones,
        rightUpperArm: { x: -0.3, y: 0, z: -1.5 },
        rightLowerArm: { x: -0.8, y: 0, z: 0 },
        rightHand: { x: 0, y: sin * 0.6, z: 0 },
        head: { x: sin * 0.03, y: 0.15, z: sin * 0.05 },
      }

    case 'waving_v2':
      return {
        ...defaultBones,
        rightUpperArm: { x: 0, y: 0.3, z: -2.0 },
        rightLowerArm: { x: -0.5, y: 0, z: 0 },
        rightHand: { x: sin * 0.4, y: 0, z: 0 },
        head: { x: 0, y: 0.1, z: sin * 0.05 },
      }

    case 'waving_v3':
      return {
        ...defaultBones,
        rightUpperArm: { x: -0.5, y: 0, z: -1.3 },
        rightLowerArm: { x: -0.3, y: sin * 0.5, z: 0 },
        rightHand: { x: 0, y: 0, z: 0 },
        head: { x: 0.05, y: 0.1 + sin * 0.05, z: 0 },
      }

    case 'idle_breathing':
      return {
        ...defaultBones,
        spine: { x: sin * 0.04, y: 0, z: 0 },
        head: { x: sin * 0.03, y: cos * 0.04, z: sin * 0.02 },
      }

    case 'idle_sway':
      return {
        ...defaultBones,
        hips: { x: 0, y: sin * 0.05, z: 0 },
        spine: { x: sin * 0.03, y: 0, z: cos * 0.02 },
        head: { x: sin * 0.05, y: cos * 0.06, z: sin * 0.03 },
      }

    case 'excited': {
      const bounce = Math.abs(sin) * 0.05
      return {
        ...defaultBones,
        spine: { x: bounce, y: 0, z: 0 },
        head: { x: sin * 0.08, y: 0, z: cos * 0.05 },
        rightUpperArm: { x: 0, y: 0, z: -0.5 + sin * 0.1 },
        leftUpperArm: { x: 0, y: 0, z: 0.5 - sin * 0.1 },
      }
    }

    case 'thinking': {
      const slowPhase = phase * 0.3
      return {
        ...defaultBones,
        head: { x: 0.1, y: 0.2 + Math.sin(slowPhase) * 0.05, z: 0.08 },
        rightUpperArm: { x: 0.3, y: 0, z: -0.8 },
        rightLowerArm: { x: -0.5, y: 0, z: 0 },
      }
    }

    case 'walking': {
      const legSwing = sin * 0.4
      return {
        ...defaultBones,
        rightUpperLeg: { x: legSwing, y: 0, z: 0 },
        leftUpperLeg: { x: -legSwing, y: 0, z: 0 },
        rightLowerLeg: { x: Math.max(0, -sin) * 0.6, y: 0, z: 0 },
        leftLowerLeg: { x: Math.max(0, sin) * 0.6, y: 0, z: 0 },
        rightUpperArm: { x: -legSwing * 0.5, y: 0, z: -0.4 },
        leftUpperArm: { x: legSwing * 0.5, y: 0, z: 0.4 },
        spine: { x: Math.abs(sin) * 0.03, y: 0, z: 0 },
        hips: { x: 0, y: 0, z: sin * 0.03 },
        head: { x: 0, y: cos * 0.03, z: 0 },
      }
    }

    case 'walking_slow': {
      const slowLeg = Math.sin(phase * 0.7) * 0.3
      return {
        ...defaultBones,
        rightUpperLeg: { x: slowLeg, y: 0, z: 0 },
        leftUpperLeg: { x: -slowLeg, y: 0, z: 0 },
        rightLowerLeg: { x: Math.max(0, -Math.sin(phase * 0.7)) * 0.4, y: 0, z: 0 },
        leftLowerLeg: { x: Math.max(0, Math.sin(phase * 0.7)) * 0.4, y: 0, z: 0 },
        rightUpperArm: { x: -slowLeg * 0.3, y: 0, z: -0.5 },
        leftUpperArm: { x: slowLeg * 0.3, y: 0, z: 0.5 },
      }
    }

    case 'happy_bounce': {
      const quickBounce = Math.abs(Math.sin(phase * 2)) * 0.04
      return {
        ...defaultBones,
        spine: { x: quickBounce, y: 0, z: 0 },
        head: { x: sin * 0.06, y: cos * 0.08, z: sin * 0.04 },
        rightUpperArm: { x: 0, y: 0, z: -0.4 - quickBounce },
        leftUpperArm: { x: 0, y: 0, z: 0.4 + quickBounce },
      }
    }

    case 'friendly':
      return {
        ...defaultBones,
        head: { x: sin * 0.07, y: cos * 0.1, z: sin * 0.04 },
        spine: { x: sin * 0.02, y: 0, z: 0 },
      }

    default:
      return defaultBones
  }
}
