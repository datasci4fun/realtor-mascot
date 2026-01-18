'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm'
import { VRMAvatar } from '@/components/mascot/VRMAvatar'

type MascotMood = 'idle' | 'friendly' | 'excited' | 'thinking' | 'happy' | 'waving' | 'walking'

interface BoneRotation {
  x: number
  y: number
  z: number
}

interface BoneState {
  rightUpperArm: BoneRotation
  rightLowerArm: BoneRotation
  rightHand: BoneRotation
  leftUpperArm: BoneRotation
  leftLowerArm: BoneRotation
  leftHand: BoneRotation
  head: BoneRotation
  spine: BoneRotation
  hips: BoneRotation
  rightUpperLeg: BoneRotation
  rightLowerLeg: BoneRotation
  leftUpperLeg: BoneRotation
  leftLowerLeg: BoneRotation
}

const defaultBones: BoneState = {
  rightUpperArm: { x: 0, y: 0, z: -0.5 },
  rightLowerArm: { x: 0, y: 0, z: 0 },
  rightHand: { x: 0, y: 0, z: 0 },
  leftUpperArm: { x: 0, y: 0, z: 0.5 },
  leftLowerArm: { x: 0, y: 0, z: 0 },
  leftHand: { x: 0, y: 0, z: 0 },
  head: { x: 0, y: 0, z: 0 },
  spine: { x: 0, y: 0, z: 0 },
  hips: { x: 0, y: 0, z: 0 },
  rightUpperLeg: { x: 0, y: 0, z: 0 },
  rightLowerLeg: { x: 0, y: 0, z: 0 },
  leftUpperLeg: { x: 0, y: 0, z: 0 },
  leftLowerLeg: { x: 0, y: 0, z: 0 },
}

// Animation names for reference
const animationList = {
  waving: ['waving', 'waving_v2', 'waving_v3'],
  idle: ['idle_breathing', 'idle_sway', 'friendly'],
  walking: ['walking', 'walking_slow'],
  other: ['excited', 'thinking', 'happy_bounce'],
}

export default function MascotDebugPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const vrmRef = useRef<VRM | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Mode: 'animation' uses VRMAvatar component, 'bones' uses direct bone control
  const [mode, setMode] = useState<'animation' | 'bones'>('animation')

  // Animation mode state
  const [mood, setMood] = useState<MascotMood>('idle')
  const [walkDirection, setWalkDirection] = useState(0)

  // Bone editor state
  const [bones, setBones] = useState<BoneState>(defaultBones)
  const [copied, setCopied] = useState(false)
  const [modelRotation, setModelRotation] = useState(Math.PI)
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)
  const animPhaseRef = useRef(0)

  const moods: MascotMood[] = ['idle', 'friendly', 'excited', 'thinking', 'happy', 'waving', 'walking']

  // Initialize Three.js scene for bone editor mode
  useEffect(() => {
    if (mode !== 'bones' || !canvasRef.current) return

    const canvas = canvasRef.current
    const width = 300
    const height = 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20)
    camera.position.set(0, 0.9, 2.5)
    camera.lookAt(0, 0.85, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(1, 1.5, 2)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-1, 1, 1)
    scene.add(fillLight)

    // Load VRM
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load('/mascot/mascot.vrm', (gltf) => {
      const vrm = gltf.userData.vrm as VRM
      if (!vrm) return

      try {
        VRMUtils.rotateVRM0(vrm)
      } catch (e) {}

      scene.add(vrm.scene)
      vrmRef.current = vrm
      vrm.scene.rotation.y = Math.PI
      setIsLoaded(true)
    })

    // Animation loop
    let isRunning = true
    const clock = new THREE.Clock()
    const animate = () => {
      if (!isRunning) return
      requestAnimationFrame(animate)
      const delta = clock.getDelta()

      if (vrmRef.current) {
        vrmRef.current.expressionManager?.update()
        vrmRef.current.springBoneManager?.update(delta)
      }

      renderer.render(scene, camera)
    }
    clock.start()
    animate()

    return () => {
      isRunning = false
      renderer.dispose()
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
        vrmRef.current = null
      }
      setIsLoaded(false)
    }
  }, [mode])

  // Apply bone rotations when they change (bones mode)
  useEffect(() => {
    if (mode !== 'bones' || !vrmRef.current?.humanoid) return

    const humanoid = vrmRef.current.humanoid
    Object.entries(bones).forEach(([boneName, rot]) => {
      const bone = humanoid.getRawBoneNode(boneName)
      if (bone) {
        bone.rotation.set(rot.x, rot.y, rot.z)
      }
    })
  }, [bones, mode])

  // Apply model rotation (bones mode)
  useEffect(() => {
    if (mode !== 'bones' || !vrmRef.current) return
    vrmRef.current.scene.rotation.y = modelRotation
  }, [modelRotation, mode])

  const updateBone = (bone: keyof BoneState, axis: 'x' | 'y' | 'z', value: number) => {
    setBones(prev => ({
      ...prev,
      [bone]: { ...prev[bone], [axis]: value }
    }))
  }

  const copyToClipboard = () => {
    const code = Object.entries(bones)
      .filter(([_, rot]) => Math.abs(rot.x) > 0.01 || Math.abs(rot.y) > 0.01 || Math.abs(rot.z) > 0.01)
      .map(([bone, rot]) => {
        const values = `${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)}`
        return `setBoneRotation(humanoid, '${bone}', ${values})`
      })
      .join('\n')

    const fullOutput = `// Bone rotations for animation:\n${code}\n\n// Raw values:\n${JSON.stringify(bones, null, 2)}`

    navigator.clipboard.writeText(fullOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetBones = () => {
    setBones(defaultBones)
    setActiveAnimation(null)
  }

  const stopAnimation = () => {
    setActiveAnimation(null)
  }

  // Animation loop for previewing animations
  useEffect(() => {
    if (!activeAnimation || mode !== 'bones') return

    const interval = setInterval(() => {
      animPhaseRef.current += 0.1

      const phase = animPhaseRef.current
      const sin = Math.sin(phase)
      const cos = Math.cos(phase)

      switch (activeAnimation) {
        case 'waving':
          // Arm stays raised, hand waves back and forth
          setBones({
            ...defaultBones,
            rightUpperArm: { x: -0.3, y: 0, z: -1.5 },
            rightLowerArm: { x: -0.8, y: 0, z: 0 },
            rightHand: { x: 0, y: sin * 0.6, z: 0 },
            head: { x: sin * 0.03, y: 0.15, z: sin * 0.05 },
          })
          break

        case 'waving_v2':
          // Different wave - more enthusiastic
          setBones({
            ...defaultBones,
            rightUpperArm: { x: 0, y: 0.3, z: -2.0 },
            rightLowerArm: { x: -0.5, y: 0, z: 0 },
            rightHand: { x: sin * 0.4, y: 0, z: 0 },
            head: { x: 0, y: 0.1, z: sin * 0.05 },
          })
          break

        case 'waving_v3':
          // Gentle wave - forearm twist
          setBones({
            ...defaultBones,
            rightUpperArm: { x: -0.5, y: 0, z: -1.3 },
            rightLowerArm: { x: -0.3, y: sin * 0.5, z: 0 },
            rightHand: { x: 0, y: 0, z: 0 },
            head: { x: 0.05, y: 0.1 + sin * 0.05, z: 0 },
          })
          break

        case 'idle_breathing':
          // Subtle breathing animation
          setBones({
            ...defaultBones,
            spine: { x: sin * 0.04, y: 0, z: 0 },
            head: { x: sin * 0.03, y: cos * 0.04, z: sin * 0.02 },
          })
          break

        case 'idle_sway':
          // More visible body sway
          setBones({
            ...defaultBones,
            hips: { x: 0, y: sin * 0.05, z: 0 },
            spine: { x: sin * 0.03, y: 0, z: cos * 0.02 },
            head: { x: sin * 0.05, y: cos * 0.06, z: sin * 0.03 },
          })
          break

        case 'excited':
          // Bouncy excited movement
          const bounce = Math.abs(sin) * 0.05
          setBones({
            ...defaultBones,
            spine: { x: bounce, y: 0, z: 0 },
            head: { x: sin * 0.08, y: 0, z: cos * 0.05 },
            rightUpperArm: { x: 0, y: 0, z: -0.5 + sin * 0.1 },
            leftUpperArm: { x: 0, y: 0, z: 0.5 - sin * 0.1 },
          })
          break

        case 'thinking':
          // Slow thoughtful head movement
          const slowPhase = phase * 0.3
          setBones({
            ...defaultBones,
            head: { x: 0.1, y: 0.2 + Math.sin(slowPhase) * 0.05, z: 0.08 },
            rightUpperArm: { x: 0.3, y: 0, z: -0.8 },
            rightLowerArm: { x: -0.5, y: 0, z: 0 },
          })
          break

        case 'walking':
          // Full walking cycle
          const legSwing = sin * 0.4
          setBones({
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
          })
          break

        case 'walking_slow':
          // Slower, more deliberate walk
          const slowLeg = Math.sin(phase * 0.7) * 0.3
          setBones({
            ...defaultBones,
            rightUpperLeg: { x: slowLeg, y: 0, z: 0 },
            leftUpperLeg: { x: -slowLeg, y: 0, z: 0 },
            rightLowerLeg: { x: Math.max(0, -Math.sin(phase * 0.7)) * 0.4, y: 0, z: 0 },
            leftLowerLeg: { x: Math.max(0, Math.sin(phase * 0.7)) * 0.4, y: 0, z: 0 },
            rightUpperArm: { x: -slowLeg * 0.3, y: 0, z: -0.5 },
            leftUpperArm: { x: slowLeg * 0.3, y: 0, z: 0.5 },
          })
          break

        case 'happy_bounce':
          // Happy bouncy animation
          const quickBounce = Math.abs(Math.sin(phase * 2)) * 0.04
          setBones({
            ...defaultBones,
            spine: { x: quickBounce, y: 0, z: 0 },
            head: { x: sin * 0.06, y: cos * 0.08, z: sin * 0.04 },
            rightUpperArm: { x: 0, y: 0, z: -0.4 - quickBounce },
            leftUpperArm: { x: 0, y: 0, z: 0.4 + quickBounce },
          })
          break

        case 'friendly':
          // Warm friendly swaying
          setBones({
            ...defaultBones,
            head: { x: sin * 0.07, y: cos * 0.1, z: sin * 0.04 },
            spine: { x: sin * 0.02, y: 0, z: 0 },
          })
          break
      }
    }, 16)

    return () => clearInterval(interval)
  }, [activeAnimation, mode])

  const boneGroups = {
    'Right Arm': ['rightUpperArm', 'rightLowerArm', 'rightHand'] as const,
    'Left Arm': ['leftUpperArm', 'leftLowerArm', 'leftHand'] as const,
    'Body': ['head', 'spine', 'hips'] as const,
    'Legs': ['rightUpperLeg', 'rightLowerLeg', 'leftUpperLeg', 'leftLowerLeg'] as const,
  }

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

      {/* ============ ANIMATION MODE ============ */}
      {mode === 'animation' && (
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
      )}

      {/* ============ BONE EDITOR MODE ============ */}
      {mode === 'bones' && (
        <div className="flex gap-4">
          {/* Left Column - Canvas and Actions */}
          <div className="flex-shrink-0 w-80">
            <div className="bg-gray-800 p-3 rounded-lg">
              <canvas ref={canvasRef} className="rounded" style={{ width: 300, height: 400 }} />
              {!isLoaded && <p className="text-center mt-2 text-gray-400">Loading...</p>}

              {/* Model rotation */}
              <div className="mt-3">
                <label className="text-xs text-gray-400">View Angle</label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min={0}
                    max={6.28}
                    step={0.1}
                    value={modelRotation}
                    onChange={(e) => setModelRotation(Number(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setModelRotation(Math.PI)}
                    className="px-2 py-1 bg-gray-700 rounded text-xs"
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setModelRotation(Math.PI / 2)}
                    className="px-2 py-1 bg-gray-700 rounded text-xs"
                  >
                    Side
                  </button>
                </div>
              </div>
            </div>

            {/* Animated Presets */}
            <div className="mt-3 bg-gray-800 p-3 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-400">Waving Animations</h3>
              <div className="grid grid-cols-1 gap-1 mb-3">
                {['waving', 'waving_v2', 'waving_v3'].map(name => (
                  <button
                    key={name}
                    onClick={() => setActiveAnimation(activeAnimation === name ? null : name)}
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
                    onClick={() => setActiveAnimation(activeAnimation === name ? null : name)}
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
                    onClick={() => setActiveAnimation(activeAnimation === name ? null : name)}
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
                    onClick={() => setActiveAnimation(activeAnimation === name ? null : name)}
                    className={`px-2 py-2 rounded text-xs text-left ${
                      activeAnimation === name ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {activeAnimation === name ? '▶ ' : ''}{name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 space-y-2">
              {activeAnimation && (
                <button
                  onClick={stopAnimation}
                  className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded text-sm font-bold"
                >
                  ⏹ Stop: {activeAnimation}
                </button>
              )}
              <button
                onClick={resetBones}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Reset to Default Pose
              </button>
              <button
                onClick={copyToClipboard}
                className={`w-full px-3 py-3 rounded text-sm font-bold ${
                  copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {copied ? '✓ Copied!' : '📋 Copy Animation Code'}
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-3 bg-gray-800 p-3 rounded-lg text-xs text-gray-400">
              <p className="mb-1"><strong>How to use:</strong></p>
              <p>1. Click an animation to preview it</p>
              <p>2. When you like one, tell me the name</p>
              <p>3. I'll update the mascot code</p>
            </div>

            {/* Current Values Display */}
            <div className="mt-3 bg-gray-800 p-3 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Non-Zero Values:</h3>
              <pre className="text-xs font-mono text-green-400 overflow-auto max-h-32">
                {Object.entries(bones)
                  .filter(([_, rot]) => Math.abs(rot.x) > 0.01 || Math.abs(rot.y) > 0.01 || Math.abs(rot.z) > 0.01)
                  .map(([bone, rot]) => `${bone}: (${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)})`)
                  .join('\n') || 'All bones at default'}
              </pre>
            </div>
          </div>

          {/* Right Column - Bone Controls (for manual tweaking) */}
          <div className="flex-1 grid grid-cols-2 gap-3 overflow-auto max-h-[85vh]">
            {Object.entries(boneGroups).map(([groupName, boneNames]) => (
              <div key={groupName} className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-400">{groupName}</h3>
                {boneNames.map(boneName => (
                  <div key={boneName} className="mb-3 p-2 bg-gray-900 rounded">
                    <div className="text-sm font-mono text-gray-300 mb-1">{boneName}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['x', 'y', 'z'] as const).map(axis => (
                        <div key={axis}>
                          <label className="text-xs text-gray-500 uppercase">{axis}</label>
                          <input
                            type="range"
                            min={-3.14}
                            max={3.14}
                            step={0.05}
                            value={bones[boneName][axis]}
                            onChange={(e) => {
                              stopAnimation()
                              updateBone(boneName, axis, Number(e.target.value))
                            }}
                            className="w-full h-2"
                          />
                          <input
                            type="number"
                            step={0.1}
                            value={bones[boneName][axis].toFixed(2)}
                            onChange={(e) => {
                              stopAnimation()
                              updateBone(boneName, axis, Number(e.target.value))
                            }}
                            className="w-full bg-gray-700 text-xs p-1 rounded text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
