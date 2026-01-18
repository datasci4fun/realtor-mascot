'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm'

type MascotMood = 'idle' | 'friendly' | 'excited' | 'thinking' | 'happy' | 'waving' | 'walking'

interface VRMAvatarProps {
  mood: MascotMood
  onClick?: () => void
  vrmUrl?: string
  walkDirection?: number // -1 = walking left, 0 = stopped, 1 = walking right
}

export function VRMAvatar({ mood, onClick, vrmUrl = '/mascot/mascot.vrm', walkDirection = 0 }: VRMAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const vrmRef = useRef<VRM | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const frameRef = useRef<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const currentMoodRef = useRef<MascotMood>(mood)

  // Animation state
  const animStateRef = useRef({
    blinkTimer: 0,
    isBlinking: false,
    headBobPhase: 0,
    armWavePhase: 0,
    breathPhase: 0,
    walkPhase: 0,
    currentRotation: Math.PI, // Current Y rotation of the model (facing camera)
  })

  // Track walk direction
  const walkDirectionRef = useRef(walkDirection)
  useEffect(() => {
    walkDirectionRef.current = walkDirection
  }, [walkDirection])

  // Update mood ref when prop changes
  useEffect(() => {
    currentMoodRef.current = mood
  }, [mood])

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const width = 320 // Wide enough for T-pose arms
    const height = 350 // Taller for full body

    // Scene
    const scene = new THREE.Scene()
    scene.background = null
    sceneRef.current = scene

    // Camera - positioned to show full body
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20)
    camera.position.set(0, 0.9, 2.5)
    camera.lookAt(0, 0.85, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(1, 1.5, 2)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-1, 1, 1)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
    rimLight.position.set(0, 1, -1)
    scene.add(rimLight)

    // Load VRM
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      vrmUrl,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM
        if (!vrm) {
          setLoadError('No VRM data')
          return
        }

        // Try to rotate - this is for VRM 0.x models
        try {
          VRMUtils.rotateVRM0(vrm)
        } catch (e) {
          // VRM 1.0 doesn't need rotation
        }

        scene.add(vrm.scene)
        vrmRef.current = vrm

        // Set initial relaxed pose
        setRelaxedPose(vrm)

        setIsLoaded(true)
      },
      undefined, // Skip progress callback
      (error) => {
        console.error('VRM load error:', error)
        setLoadError('Failed to load')
      }
    )

    // Animation loop
    let isRunning = true
    const animate = () => {
      if (!isRunning) return
      frameRef.current = requestAnimationFrame(animate)

      const delta = clockRef.current.getDelta()

      if (vrmRef.current) {
        updateAnimations(vrmRef.current, delta)
        // Only update expressions and spring bones, not pose
        if (vrmRef.current.expressionManager) {
          vrmRef.current.expressionManager.update()
        }
        if (vrmRef.current.springBoneManager) {
          vrmRef.current.springBoneManager.update(delta)
        }
      }

      renderer.render(scene, camera)
    }

    clockRef.current.start()
    animate()

    return () => {
      isRunning = false
      cancelAnimationFrame(frameRef.current)
      renderer.dispose()
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
      }
    }
  }, [vrmUrl])

  const setRelaxedPose = (vrm: VRM) => {
    const humanoid = vrm.humanoid
    if (!humanoid) return

    // Set initial arm positions (relaxed, not T-pose)
    const leftUpperArm = humanoid.getRawBoneNode('leftUpperArm')
    const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm')

    if (leftUpperArm) {
      leftUpperArm.rotation.z = 1.1 // Arms down at sides (natural standing)
    }
    if (rightUpperArm) {
      rightUpperArm.rotation.z = -1.1 // Arms down at sides (natural standing)
    }

    // Initial expression
    if (vrm.expressionManager) {
      vrm.expressionManager.setValue('happy', 0.3)
    }
  }

  // Helper to set bone rotation using raw bones
  const setBoneRotation = useCallback((humanoid: NonNullable<VRM['humanoid']>, boneName: string, x: number, y: number, z: number) => {
    const bone = humanoid.getRawBoneNode(boneName)
    if (bone) {
      bone.rotation.set(x, y, z)
    }
  }, [])

  const updateAnimations = (vrm: VRM, delta: number) => {
    const anim = animStateRef.current
    const humanoid = vrm.humanoid
    const expression = vrm.expressionManager
    if (!humanoid) return

    // Rotate model based on walk direction
    // Walking: turn to side profile (90 degrees)
    // Stopped: face forward (0 degrees)
    const targetRotation = walkDirectionRef.current !== 0
      ? (walkDirectionRef.current > 0 ? Math.PI / 2 : -Math.PI / 2) // Side profile when walking
      : Math.PI // Face towards camera when stopped (180° rotation)

    // Smoothly interpolate rotation
    const rotationSpeed = 5 // radians per second
    const rotationDiff = targetRotation - anim.currentRotation
    if (Math.abs(rotationDiff) > 0.01) {
      anim.currentRotation += Math.sign(rotationDiff) * Math.min(Math.abs(rotationDiff), rotationSpeed * delta)
    } else {
      anim.currentRotation = targetRotation
    }

    // Apply rotation to the VRM scene
    vrm.scene.rotation.y = anim.currentRotation

    const currentMood = currentMoodRef.current

    // Breathing animation - more visible
    anim.breathPhase += delta * 2.5
    setBoneRotation(humanoid, 'spine', Math.sin(anim.breathPhase) * 0.06, 0, 0)

    // Subtle body sway for more life
    setBoneRotation(humanoid, 'hips', 0, Math.sin(anim.breathPhase * 0.5) * 0.05, 0)

    // Blinking
    anim.blinkTimer += delta
    if (!anim.isBlinking && anim.blinkTimer > 2.5 + Math.random() * 2) {
      anim.isBlinking = true
      anim.blinkTimer = 0
    }
    if (expression) {
      if (anim.isBlinking) {
        expression.setValue('blink', 1)
        if (anim.blinkTimer > 0.1) {
          expression.setValue('blink', 0)
          anim.isBlinking = false
        }
      }
    }

    // Idle head movement - faster for more visible motion
    anim.headBobPhase += delta * 2.0

    // Default arm positions (natural standing - arms at sides)
    setBoneRotation(humanoid, 'leftUpperArm', 0, 0, 1.1)
    setBoneRotation(humanoid, 'rightUpperArm', 0, 0, -1.1)

    // Mood-specific animations
    switch (currentMood) {
      case 'waving':
        anim.armWavePhase += delta * 8
        // Raise right arm to wave - arm up and slightly forward
        setBoneRotation(humanoid, 'rightUpperArm', -0.3, 0, -1.5) // Raise arm to ~85 degrees
        setBoneRotation(humanoid, 'rightLowerArm', -0.8, 0, 0) // Bend elbow
        // Wave the hand back and forth
        setBoneRotation(humanoid, 'rightHand', 0, Math.sin(anim.armWavePhase) * 0.6, 0)
        // Friendly head tilt
        setBoneRotation(humanoid, 'head',
          Math.sin(anim.headBobPhase) * 0.03,
          0.15, // Slight turn toward waving hand
          Math.sin(anim.headBobPhase * 0.7) * 0.05
        )
        if (expression) {
          expression.setValue('happy', 0.7)
        }
        break

      case 'excited':
        anim.headBobPhase += delta * 2
        setBoneRotation(humanoid, 'head',
          Math.sin(anim.headBobPhase * 2) * 0.05,
          0,
          Math.sin(anim.headBobPhase) * 0.03
        )
        setBoneRotation(humanoid, 'spine', Math.sin(anim.breathPhase * 2) * 0.03, 0, 0)
        if (expression) {
          expression.setValue('happy', 0.9)
          expression.setValue('surprised', 0.2)
        }
        break

      case 'thinking':
        setBoneRotation(humanoid, 'head', 0.05, 0.2, 0.08)
        if (expression) {
          expression.setValue('happy', 0.1)
        }
        break

      case 'happy':
      case 'friendly':
        // More visible head movement
        setBoneRotation(humanoid, 'head',
          Math.sin(anim.headBobPhase) * 0.1,
          Math.sin(anim.headBobPhase * 0.5) * 0.15,
          Math.sin(anim.headBobPhase * 0.7) * 0.06
        )
        if (expression) {
          expression.setValue('happy', 0.6)
        }
        break

      case 'walking':
        anim.walkPhase += delta * 8

        // Leg animation - opposite legs move together
        const legSwing = Math.sin(anim.walkPhase) * 0.4

        setBoneRotation(humanoid, 'leftUpperLeg', legSwing, 0, 0)
        setBoneRotation(humanoid, 'rightUpperLeg', -legSwing, 0, 0)
        setBoneRotation(humanoid, 'leftLowerLeg', Math.max(0, -Math.sin(anim.walkPhase)) * 0.6, 0, 0)
        setBoneRotation(humanoid, 'rightLowerLeg', Math.max(0, Math.sin(anim.walkPhase)) * 0.6, 0, 0)

        // Arm swing - opposite to legs, arms stay at sides
        setBoneRotation(humanoid, 'leftUpperArm', -legSwing * 0.5, 0, 1.0)
        setBoneRotation(humanoid, 'rightUpperArm', legSwing * 0.5, 0, -1.0)

        // Body bob while walking
        setBoneRotation(humanoid, 'spine', Math.abs(Math.sin(anim.walkPhase * 2)) * 0.03, 0, 0)
        setBoneRotation(humanoid, 'hips', 0, 0, Math.sin(anim.walkPhase) * 0.03)

        // Head stays relatively stable
        setBoneRotation(humanoid, 'head', 0, Math.sin(anim.walkPhase * 0.5) * 0.05, 0)

        if (expression) {
          expression.setValue('happy', 0.4)
        }
        break

      default: // idle - more visible movement
        setBoneRotation(humanoid, 'head',
          Math.sin(anim.headBobPhase) * 0.1,
          Math.sin(anim.headBobPhase * 0.5) * 0.12,
          Math.sin(anim.headBobPhase * 0.7) * 0.05
        )
        if (expression) {
          expression.setValue('happy', 0.3)
        }
    }
  }

  // Fallback avatar
  if (loadError) {
    return (
      <div
        onClick={onClick}
        className="bg-gradient-to-br from-primary-400 to-primary-600
                   rounded-2xl flex items-center justify-center text-8xl
                   shadow-lg cursor-pointer hover:scale-[1.02] transition-transform
                   border-3 border-white"
        style={{ width: 320, height: 350 }}
        title="Click to chat!"
      >
        👩‍💼
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="cursor-pointer hover:scale-[1.02] transition-transform"
      style={{
        width: 320,
        height: 350,
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.5s ease',
      }}
      title="Click to chat with Sarah!"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}
