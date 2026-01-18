# Mascot Development Notes

## Common Mistakes to Avoid

### 1. React Hooks Order
**NEVER** put early returns before all hooks are called. All `useState`, `useEffect`, `useRef`, etc. must be called unconditionally at the top of the component.

```javascript
// WRONG - breaks React rules of hooks
function Component() {
  const [a, setA] = useState(false)
  if (someCondition) return null  // EARLY RETURN BEFORE OTHER HOOKS
  const [b, setB] = useState(0)   // This breaks!
}

// CORRECT
function Component() {
  const [a, setA] = useState(false)
  const [b, setB] = useState(0)   // All hooks first
  if (someCondition) return null  // Early return AFTER all hooks
}
```

### 2. Dynamic Imports in React
**NEVER** use `require()` inside a component render. It doesn't work properly with Next.js client components.

```javascript
// WRONG
const VRMAvatar = mode === 'animation'
  ? require('@/components/mascot/VRMAvatar').VRMAvatar
  : null

// CORRECT - import at the top of the file
import { VRMAvatar } from '@/components/mascot/VRMAvatar'
```

### 3. Debug Page Must Stay Isolated
The `/debug/mascot` page must:
- Import VRMAvatar normally at the top
- NOT include the full Mascot component (it auto-walks, has chat, etc.)
- Mascot.tsx checks for `/debug` path and returns null

### 4. VRMAvatar Animation Loop
The animation loop in VRMAvatar.tsx must:
- Always call `requestAnimationFrame`
- Always call `renderer.render(scene, camera)`
- Update animations via `updateAnimations(vrm, delta)`
- Be started with `clockRef.current.start()` before `animate()`

### 5. Bone Rotation Values
- X: Forward/backward rotation
- Y: Twist/rotation
- Z: Side rotation (for arms: negative Z raises right arm, positive Z raises left arm)
- Values are in radians: π ≈ 3.14 = 180°, π/2 ≈ 1.57 = 90°

### 6. Canvas Size
- Width: 320px (wide enough for T-pose arms without clipping)
- Height: 350px (full body view)
- Camera at (0, 0.9, 2.5) looking at (0, 0.85, 0)

### 7. Walk Direction Mapping
In Mascot.tsx:
- `walkDirection = 1` means moving LEFT on screen (increasing distance from right edge)
- `walkDirection = -1` means moving RIGHT on screen

In VRMAvatar.tsx rotation:
- `walkDirection = 1` → `Math.PI / 2` (face left)
- `walkDirection = -1` → `-Math.PI / 2` (face right)
- `walkDirection = 0` → `Math.PI` (face camera)

### 8. Chat Auto-Opens
MascotChat.tsx auto-opens after a delay (3 seconds on homepage). This used to block walking, but we removed that check. Walking now continues even when chat is open.

## File Structure

```
components/mascot/
├── Mascot.tsx          - Main component with walking logic, renders VRMAvatar
├── MascotChat.tsx      - Chat UI, auto-opens with greeting
├── MascotProvider.tsx  - Context for mood, visibility, chat state
└── VRMAvatar.tsx       - Three.js/VRM rendering, all animations

app/debug/mascot/
└── page.tsx            - Debug page with Animation Testing + Bone Editor modes
```

## Animation States in VRMAvatar.tsx

Located in the `switch(currentMood)` block inside `updateAnimations()`:

- `idle` - Default breathing, subtle head movement
- `friendly` - More head movement, happy expression
- `excited` - Fast movements, surprised expression
- `thinking` - Head tilted
- `happy` - Joyful expression
- `waving` - Right arm raised and waving
- `walking` - Leg/arm swing (only visible from side profile)

## Natural Standing Pose (IMPORTANT)
```javascript
// Arms at sides - NOT T-pose
rightUpperArm: z = -1.1  // ~63° down from horizontal
leftUpperArm:  z = 1.1   // ~63° down from horizontal

// T-pose (arms straight out) would be z = 0
// Values around ±0.5 still look too stiff/raised
```

## Current Waving Animation Values
```javascript
setBoneRotation(humanoid, 'rightUpperArm', -0.3, 0, -1.5)
setBoneRotation(humanoid, 'rightLowerArm', -0.8, 0, 0)
setBoneRotation(humanoid, 'rightHand', 0, Math.sin(phase) * 0.6, 0)
```
