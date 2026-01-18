'use client'

import { BoneState, boneGroups } from '@/types/mascot'

interface BoneControlsProps {
  bones: BoneState
  onBoneUpdate: (bone: keyof BoneState, axis: 'x' | 'y' | 'z', value: number) => void
  onStopAnimation: () => void
}

export function BoneControls({ bones, onBoneUpdate, onStopAnimation }: BoneControlsProps) {
  const handleChange = (bone: keyof BoneState, axis: 'x' | 'y' | 'z', value: number) => {
    onStopAnimation()
    onBoneUpdate(bone, axis, value)
  }

  return (
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
                      onChange={(e) => handleChange(boneName, axis, Number(e.target.value))}
                      className="w-full h-2"
                    />
                    <input
                      type="number"
                      step={0.1}
                      value={bones[boneName][axis].toFixed(2)}
                      onChange={(e) => handleChange(boneName, axis, Number(e.target.value))}
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
  )
}
