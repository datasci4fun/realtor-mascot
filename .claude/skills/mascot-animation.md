# Mascot Animation Skill

Create and edit VRM mascot animations for the realtor site.

## CRITICAL: Default Orientation

**ALWAYS start from this reference point:**

```
Model Rotation: Math.PI (180°) - faces the camera/user
VRM loads facing +Z, we rotate to face -Z (toward camera at +Z)
```

**T-Pose Reference (all bones at 0 except arms):**
```javascript
// After VRMUtils.rotateVRM0(vrm) and vrm.scene.rotation.y = Math.PI:
// - Character faces the viewer (camera)
// - Arms are straight out to sides (T-pose)
// - Looking straight ahead

// Natural standing pose (arms at sides):
rightUpperArm: { x: 0, y: 0, z: -1.1 }  // Arms down at sides (~63°)
leftUpperArm:  { x: 0, y: 0, z: 1.1 }   // Arms down at sides (~63°)
// All other bones: { x: 0, y: 0, z: 0 }
```

**Orientation when facing camera (rotation.y = Math.PI):**
```
        HEAD
         |
   L ----+---- R    (from viewer's perspective)
         |          Left arm = character's left = viewer's right
        LEGS        Right arm = character's right = viewer's left

Camera is at +Z looking at origin
Character faces -Z (toward camera)
```

**Side view (rotation.y = Math.PI/2 or -Math.PI/2):**
```
Walking left on screen:  rotation.y = Math.PI/2 (90°)
Walking right on screen: rotation.y = -Math.PI/2 (-90°)
```

## Quick Reference

**Debug Page:** `http://localhost:3000/debug/mascot`
**Animation File:** `components/mascot/VRMAvatar.tsx`
**Animation Function:** `updateAnimations()` (line ~198)
**Canvas Size:** 320w × 350h (wide enough for T-pose arms)

## Bone Structure

```
Head & Body:
- head        - Head rotation (nod, turn, tilt)
- spine       - Upper body (breathing, lean)
- hips        - Lower body (sway, walking)

Right Arm:
- rightUpperArm   - Shoulder (raise/lower arm)
- rightLowerArm   - Elbow (bend arm)
- rightHand       - Wrist (wave, rotate)

Left Arm:
- leftUpperArm    - Shoulder
- leftLowerArm    - Elbow
- leftHand        - Wrist

Legs:
- rightUpperLeg   - Hip (walking stride)
- rightLowerLeg   - Knee (bend)
- leftUpperLeg    - Hip
- leftLowerLeg    - Knee
```

## Rotation Axes (in radians, π ≈ 3.14)

**When character faces camera (default):**

| Bone | X (positive) | Y (positive) | Z (positive) |
|------|--------------|--------------|--------------|
| head | Look down | Turn left | Tilt right |
| spine | Lean forward | Twist left | Lean right |
| hips | Pelvis forward | Twist left | Tilt right |
| rightUpperArm | Swing forward | Rotate inward | Raise up (NEGATIVE to raise!) |
| leftUpperArm | Swing forward | Rotate outward | Raise up (POSITIVE to raise!) |
| rightLowerArm | Bend elbow (curl in) | Twist forearm | - |
| leftLowerArm | Bend elbow (curl in) | Twist forearm | - |
| rightUpperLeg | Kick forward | Rotate inward | - |
| leftUpperLeg | Kick forward | Rotate outward | - |
| rightLowerLeg | Bend knee back | - | - |
| leftLowerLeg | Bend knee back | - | - |

**IMPORTANT for arms:**
- Right arm: Z = **-1.1** is natural standing (at sides), Z = **-1.5** raises arm to ~shoulder height
- Left arm: Z = **+1.1** is natural standing (at sides), Z = **+1.5** raises arm to ~shoulder height
- The signs are OPPOSITE because arms mirror each other
- T-pose (arms straight out) is Z = 0

**Common values:**
- `0.1` = ~6 degrees (subtle)
- `0.3` = ~17 degrees (noticeable)
- `0.5` = ~29 degrees (moderate)
- `1.0` = ~57 degrees (significant)
- `1.57` = 90 degrees
- `3.14` = 180 degrees

## Animation Code Pattern

```javascript
case 'mood_name':
  // Update phase for oscillating animations
  anim.somePhase += delta * speed  // speed: 1-10, higher = faster

  // Set bone rotations
  setBoneRotation(humanoid, 'boneName', x, y, z)

  // For oscillating movement, use Math.sin(phase)
  setBoneRotation(humanoid, 'head',
    Math.sin(anim.headBobPhase) * 0.1,  // amplitude 0.1
    0,
    0
  )

  // Set facial expression
  if (expression) {
    expression.setValue('happy', 0.6)  // 0-1 intensity
  }
  break
```

## Available Expressions

- `happy` - Smile
- `blink` - Close eyes
- `surprised` - Wide eyes
- `angry` - Frown
- `sad` - Sad expression

## Current Animation Moods

1. **idle** - Default breathing, subtle head movement
2. **friendly** - More head movement, happy expression
3. **excited** - Fast movements, surprised expression
4. **thinking** - Head tilted, contemplative
5. **happy** - Same as friendly
6. **waving** - Right arm raised and waving
7. **walking** - Leg/arm swing cycle

## Workflow: Creating New Animation

1. **Open Bone Editor:** Go to `/debug/mascot` → "Bone Editor" tab

2. **Test existing animations:** Click animation names to preview

3. **Find good values:** Use sliders to adjust bones, or modify animations in the switch statement

4. **Update VRMAvatar.tsx:**
   ```javascript
   case 'new_mood':
     anim.somePhase += delta * 5
     setBoneRotation(humanoid, 'rightUpperArm', x, y, z)
     // ... more bones
     if (expression) {
       expression.setValue('happy', 0.5)
     }
     break
   ```

5. **Add mood type:** Update the `MascotMood` type at the top of the file

6. **Test in Animation Testing mode** on the debug page

## Example: Waving Animation

```javascript
case 'waving':
  anim.armWavePhase += delta * 8
  // Raise arm
  setBoneRotation(humanoid, 'rightUpperArm', -0.3, 0, -1.5)
  // Bend elbow
  setBoneRotation(humanoid, 'rightLowerArm', -0.8, 0, 0)
  // Wave hand back and forth
  setBoneRotation(humanoid, 'rightHand', 0, Math.sin(anim.armWavePhase) * 0.6, 0)
  // Head tilt
  setBoneRotation(humanoid, 'head',
    Math.sin(anim.headBobPhase) * 0.03,
    0.15,
    Math.sin(anim.headBobPhase * 0.7) * 0.05
  )
  if (expression) {
    expression.setValue('happy', 0.7)
  }
  break
```

## Example: Walking Animation

```javascript
case 'walking':
  anim.walkPhase += delta * 8
  const legSwing = Math.sin(anim.walkPhase) * 0.4

  // Legs - opposite movement
  setBoneRotation(humanoid, 'leftUpperLeg', legSwing, 0, 0)
  setBoneRotation(humanoid, 'rightUpperLeg', -legSwing, 0, 0)
  setBoneRotation(humanoid, 'leftLowerLeg', Math.max(0, -Math.sin(anim.walkPhase)) * 0.6, 0, 0)
  setBoneRotation(humanoid, 'rightLowerLeg', Math.max(0, Math.sin(anim.walkPhase)) * 0.6, 0, 0)

  // Arms - swing opposite to legs
  setBoneRotation(humanoid, 'leftUpperArm', -legSwing * 0.5, 0, 0.4)
  setBoneRotation(humanoid, 'rightUpperArm', legSwing * 0.5, 0, -0.4)

  // Body bob
  setBoneRotation(humanoid, 'spine', Math.abs(Math.sin(anim.walkPhase * 2)) * 0.03, 0, 0)
  setBoneRotation(humanoid, 'hips', 0, 0, Math.sin(anim.walkPhase) * 0.03)
  break
```

## Tips

- **Subtle is better:** Start with small values (0.05-0.1) and increase
- **Use sine waves:** `Math.sin(phase)` creates smooth oscillation between -1 and 1
- **Multiply for amplitude:** `Math.sin(phase) * 0.3` limits range to -0.3 to 0.3
- **Different speeds:** Use `phase * 0.5` for slower, `phase * 2` for faster
- **Test from side view:** Walking animations need side view to see legs
- **Arms at rest:** Default arm Z rotation is -1.1 (right) and 1.1 (left) for natural standing

## Debug Animations in Bone Editor

The bone editor at `/debug/mascot` has these animated presets to test:

**Waving:** waving, waving_v2, waving_v3
**Idle:** idle_breathing, idle_sway, friendly
**Walking:** walking, walking_slow
**Other:** excited, thinking, happy_bounce

Click to play, click again to stop. Use "Front" and "Side" buttons to change view angle.
