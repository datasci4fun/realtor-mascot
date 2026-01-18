'use client'

import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM, VRMUtils, VRMHumanBoneName } from '@pixiv/three-vrm'
import { BoneState, defaultBones } from '@/types/mascot'
import { AnimationPresets, getAnimationFrame } from './AnimationPresets'
import { BoneControls } from './BoneControls'

export function BoneEditorMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const vrmRef = useRef<VRM | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const [bones, setBones] = useState<BoneState>(defaultBones)
  const [copied, setCopied] = useState(false)
  const [modelRotation, setModelRotation] = useState(Math.PI)
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null)
  const animPhaseRef = useRef(0)

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return

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
  }, [])

  // Apply bone rotations when they change
  useEffect(() => {
    if (!vrmRef.current?.humanoid) return

    const humanoid = vrmRef.current.humanoid
    Object.entries(bones).forEach(([boneName, rot]) => {
      const bone = humanoid.getRawBoneNode(boneName as VRMHumanBoneName)
      if (bone) {
        bone.rotation.set(rot.x, rot.y, rot.z)
      }
    })
  }, [bones])

  // Apply model rotation
  useEffect(() => {
    if (!vrmRef.current) return
    vrmRef.current.scene.rotation.y = modelRotation
  }, [modelRotation])

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
    if (!activeAnimation) return

    const interval = setInterval(() => {
      animPhaseRef.current += 0.1
      const newBones = getAnimationFrame(activeAnimation, animPhaseRef.current)
      setBones(newBones)
    }, 16)

    return () => clearInterval(interval)
  }, [activeAnimation])

  return (
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
        <div className="mt-3">
          <AnimationPresets
            activeAnimation={activeAnimation}
            onAnimationSelect={setActiveAnimation}
          />
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

      {/* Right Column - Bone Controls */}
      <BoneControls
        bones={bones}
        onBoneUpdate={updateBone}
        onStopAnimation={stopAnimation}
      />
    </div>
  )
}
