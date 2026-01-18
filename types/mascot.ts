// Mascot types and constants for debug tool

export type MascotMood = 'idle' | 'friendly' | 'excited' | 'thinking' | 'happy' | 'waving' | 'walking'

export interface BoneRotation {
  x: number
  y: number
  z: number
}

export interface BoneState {
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

export const defaultBones: BoneState = {
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

export const moods: MascotMood[] = ['idle', 'friendly', 'excited', 'thinking', 'happy', 'waving', 'walking']

export const animationList = {
  waving: ['waving', 'waving_v2', 'waving_v3'],
  idle: ['idle_breathing', 'idle_sway', 'friendly'],
  walking: ['walking', 'walking_slow'],
  other: ['excited', 'thinking', 'happy_bounce'],
}

export const boneGroups = {
  'Right Arm': ['rightUpperArm', 'rightLowerArm', 'rightHand'] as const,
  'Left Arm': ['leftUpperArm', 'leftLowerArm', 'leftHand'] as const,
  'Body': ['head', 'spine', 'hips'] as const,
  'Legs': ['rightUpperLeg', 'rightLowerLeg', 'leftUpperLeg', 'leftLowerLeg'] as const,
}
