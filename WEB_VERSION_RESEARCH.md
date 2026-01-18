# Web Version Research - Mate Engine

This document contains research on porting Mate Engine to JavaScript for web deployment, including a persistent website mascot concept.

**Current Target**: Real estate website with mascot as lead generation assistant.

---

## Table of Contents

1. [Overview](#overview)
2. [Real Estate Site Use Case](#real-estate-site-use-case)
3. [Tech Stack Mapping](#tech-stack-mapping)
4. [Desktop App (Electron)](#desktop-app-electron)
5. [Web Page Version](#web-page-version)
6. [Persistent Website Mascot](#persistent-website-mascot-concept)
7. [Implementation Details](#implementation-details)
8. [Transition Effects](#transition-effects)
9. [Tech Recommendations](#tech-recommendations)

---

## Overview

Mate Engine can be ported to JavaScript using Three.js for 3D rendering and the `three-vrm` library for VRM avatar support. There are two main deployment targets:

1. **Desktop App** - Using Electron for transparent windows, system audio, etc.
2. **Web Page** - Browser-based, good for website mascots and embeds

The most interesting use case is a **persistent website mascot** that travels between pages and interacts with navigation transitions.

**Primary use case**: Real estate website where the mascot acts as a lead generation assistant.

---

## Real Estate Site Use Case

The mascot will be deployed on a **real estate website for a Realtor**, serving as an interactive lead generation tool.

### Business Goals

1. **Lead Capture** - Collect visitor information (name, email, phone, intent)
2. **Engagement** - Keep visitors on site longer
3. **Qualification** - Understand if they're buying, selling, or renting
4. **Scheduling** - Help visitors book property viewings
5. **Brand Personality** - Make the Realtor's site memorable

### Mascot Behavior by Page

| Page | Mascot Role |
|------|-------------|
| **Home** | Welcome visitors, ask if buying/selling/renting |
| **Listings** | Help filter results, offer to save favorites |
| **Listing Detail** | Highlight features, push for viewing scheduling |
| **About** | Share Realtor credentials (passive, less pushy) |
| **Contact** | Reassure quick response, assist form completion |

### Lead Capture Flow

The mascot guides visitors through a conversational lead capture:

```
1. Greeting (after 3-5 second delay)
   "Hi! Looking for your dream home?"
   [Yes, help me!] [Just browsing]

2. Intent Qualification
   "Are you looking to buy, sell, or rent?"
   [Buying] [Selling] [Renting]

3. Timeline
   "What's your timeline?"
   [ASAP] [1-3 months] [3-6 months] [Just exploring]

4. Budget (for buyers)
   "What's your budget range?"
   [Under $300k] [$300-500k] [$500-750k] [$750k+]

5. Contact Capture
   "I'll send you matching listings! What's your email?"
   [email input field]

6. Confirmation
   "Thanks {name}! Sarah will reach out soon."
```

### Key Features Needed

- **Conversational UI** - Chat bubbles with quick-reply buttons
- **Form integration** - Inline email/phone capture
- **CRM sync** - Send leads to HubSpot/Salesforce
- **Email notifications** - Alert Realtor of new leads
- **Analytics** - Track mascot engagement and conversion

### Why Next.js for This

| Requirement | Next.js Solution |
|-------------|------------------|
| SEO for listings | Server-side rendering |
| Property images | Built-in image optimization |
| Lead API endpoints | API routes |
| Fast page loads | Static generation + CDN |
| Easy deployment | Vercel hosting |

See [WEB_TECH_COMPARISON.md](./WEB_TECH_COMPARISON.md) for full architecture and code examples.

---

## Tech Stack Mapping

| Unity Feature | JS Equivalent |
|---------------|---------------|
| Unity Engine | **Three.js** |
| VRM Loading | **@pixiv/three-vrm** |
| Transparent Window | Electron `transparent: true` |
| Always-on-top | Electron `alwaysOnTop: true` |
| Click-through | Electron `setIgnoreMouseEvents()` |
| Animation System | Three.js `AnimationMixer` + custom state machine |
| Audio Detection | Web Audio API or native Node modules |
| Settings UI | HTML/CSS (React/Vue/Svelte optional) |
| Discord RPC | `discord-rpc` npm package |
| Steam Integration | `steamworks.js` or `greenworks` |
| File Dialogs | Electron `dialog` / `<input type="file">` |

---

## Desktop App (Electron)

### Project Structure

```
mate-engine-electron/
├── package.json
├── main.js                 # Electron main process
├── preload.js              # Bridge between main/renderer
├── src/
│   ├── renderer/
│   │   ├── index.html
│   │   ├── app.js          # Three.js scene setup
│   │   ├── vrm-loader.js   # VRM loading with three-vrm
│   │   ├── animator.js     # Animation state machine
│   │   └── mouse-tracker.js
│   ├── audio/
│   │   └── audio-monitor.js  # System audio detection
│   └── integrations/
│       ├── discord.js
│       └── steam.js
└── assets/
    └── animations/
```

### Key Challenges

#### System Audio Detection (Hardest)
- **Windows**: Requires native module (`node-audio-windows`) or helper process
- **macOS/Linux**: Even harder, no universal solution
- **Workaround**: Microphone input to detect ambient music

#### Transparent Click-Through Window
```js
const win = new BrowserWindow({
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  skipTaskbar: true,
})

// Click-through except on avatar
win.setIgnoreMouseEvents(true, { forward: true })
```

### Pros/Cons vs Unity

| Aspect | Unity | Electron + Three.js |
|--------|-------|---------------------|
| Bundle Size | ~50-100MB | ~150-200MB |
| Performance | Better (native) | Good (WebGL) |
| VRM Support | Excellent | Good |
| System Audio | Easy (NAudio) | Hard |
| Cross-platform | Requires rebuild | Same build works |
| Dev Speed | Slower | Faster |
| UI Development | Painful | Easy (HTML/CSS) |

---

## Web Page Version

### What Works

| Feature | Web Support |
|---------|-------------|
| VRM avatar rendering | Yes |
| Animations | Yes |
| Mouse tracking | Yes |
| Click interactions | Yes |
| Settings UI | Yes |
| Custom avatar upload | Yes |

### What Doesn't Work

| Feature | Reason |
|---------|--------|
| Transparent background | In browser, not on desktop |
| Always-on-top | Can't escape browser tab |
| Click-through | N/A |
| System audio detection | Browsers block this |
| Discord RPC | No native access |
| Steam integration | No native access |

### Audio Workarounds

- **Microphone input** - Detect music in room (needs permission)
- **Audio file upload** - User uploads music
- **Embedded player** - Analyze audio from YouTube/Spotify embed
- **Manual toggle** - User clicks "dance" button

### Minimal Web Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
    #ui { position: absolute; top: 10px; right: 10px; }
  </style>
</head>
<body>
  <div id="ui">
    <input type="file" id="vrm-input" accept=".vrm">
    <button id="dance-btn">Dance</button>
  </div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
      "@pixiv/three-vrm": "https://unpkg.com/@pixiv/three-vrm@2.0.6/lib/three-vrm.module.js"
    }
  }
  </script>

  <script type="module">
    import * as THREE from 'three'
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
    import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 20)
    camera.position.set(0, 1, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(1, 1, 1)
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.5))

    // VRM loader
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    let currentVrm = null
    let mixer = null

    // Load VRM
    async function loadVRM(url) {
      const gltf = await loader.loadAsync(url)
      const vrm = gltf.userData.vrm
      VRMUtils.removeUnnecessaryVertices(vrm.scene)
      VRMUtils.removeUnnecessaryJoints(vrm.scene)

      if (currentVrm) scene.remove(currentVrm.scene)
      currentVrm = vrm
      scene.add(vrm.scene)
      mixer = new THREE.AnimationMixer(vrm.scene)
    }

    // Mouse tracking
    const mouse = new THREE.Vector2()
    document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })

    function updateLookAt() {
      if (!currentVrm) return
      const head = currentVrm.humanoid?.getNormalizedBoneNode('head')
      if (head) {
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, mouse.x * 0.5, 0.1)
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, mouse.y * 0.3, 0.1)
      }
    }

    // Animation loop
    const clock = new THREE.Clock()
    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()

      if (mixer) mixer.update(delta)
      if (currentVrm) {
        currentVrm.update(delta)
        updateLookAt()
      }

      renderer.render(scene, camera)
    }
    animate()

    // File input handler
    document.getElementById('vrm-input').addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) loadVRM(URL.createObjectURL(file))
    })

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  </script>
</body>
</html>
```

### Good Use Cases for Web Version

| Use Case | Fit |
|----------|-----|
| Portfolio/personal site mascot | Excellent |
| Twitch overlay (OBS browser source) | Excellent |
| VTuber-lite (with webcam tracking) | Excellent |
| Interactive art project | Excellent |
| Desktop pet replacement | Poor |
| Music visualization | Okay |

---

## Persistent Website Mascot Concept

The most compelling web use case is a **persistent avatar mascot** that:
- Lives across page transitions (never unmounts)
- Reacts to and participates in navigation
- Has different behaviors on different pages
- Can interact with page elements

### Architecture

```
┌─────────────────────────────────────────┐
│  Avatar Layer (never unmounts)          │  ← Fixed position, above everything
│  ┌─────┐                                │
│  │ VRM │  "Let's go to the blog!"       │
│  └─────┘                                │
├─────────────────────────────────────────┤
│  Transition Layer (animations)          │  ← Page transition effects
├─────────────────────────────────────────┤
│  Page Content (swapped via SPA router)  │  ← Only this part changes
│                                         │
│    [Home] [About] [Projects] [Blog]     │
│                                         │
│    Welcome to my site...                │
│                                         │
└─────────────────────────────────────────┘
```

### Project Structure

```
src/
├── index.html
├── main.js                    # App entry, router setup
├── avatar/
│   ├── Avatar.js              # Three.js scene, VRM loader
│   ├── AvatarState.js         # Position, mood, animation state
│   ├── AvatarBehavior.js      # Idle, reactions, following cursor
│   └── AvatarInteractions.js  # Click reactions, dragging
├── transitions/
│   ├── TransitionManager.js   # Orchestrates page + avatar transitions
│   ├── effects/
│   │   ├── fade.js
│   │   ├── slide.js
│   │   ├── portal.js          # Avatar "opens" a portal
│   │   └── carry.js           # Avatar carries you to next page
│   └── AvatarTransitions.js   # Avatar-specific transition animations
├── pages/
│   ├── Home.js
│   ├── About.js
│   ├── Projects.js
│   └── Blog.js
├── router.js                  # Client-side routing (SPA)
└── styles.css
```

### Key Requirement: SPA Architecture

The avatar persists because the site uses **client-side routing** (Single Page Application):
- No full page reloads
- Only the content area swaps
- Avatar container never unmounts
- State preserved across navigation

---

## Implementation Details

### Avatar Class

```js
// avatar/Avatar.js
export class Avatar {
  constructor(container) {
    this.state = {
      position: { x: 80, y: 70 },  // percentage of viewport
      mood: 'idle',
      isSpeaking: false,
      isDragging: false,
    }

    this.setupScene(container)
    this.loadVRM('/avatar/mascot.vrm')
    this.setupInteractions()
    this.animate()
  }

  // Move avatar to position (animated)
  async moveTo(x, y, duration = 1000) {
    this.playAnimation('walk')
    await this.tweenPosition(x, y, duration)
    this.playAnimation('idle')
  }

  // Avatar speaks with text bubble
  async say(text, duration = 3000) {
    this.state.isSpeaking = true
    this.showSpeechBubble(text)
    this.playAnimation('talking')
    await this.wait(duration)
    this.hideSpeechBubble()
    this.state.isSpeaking = false
    this.playAnimation('idle')
  }

  // React to page navigation
  async reactToNavigation(fromPage, toPage) {
    const reactions = {
      'home→about': async () => {
        await this.say("Let me tell you about myself!")
        await this.playAnimation('excited')
      },
      'home→projects': async () => {
        await this.say("Check out what I've built!")
        await this.moveTo(20, 50)
      },
      'home→blog': async () => {
        await this.say("Time to read some posts~")
        await this.playAnimation('thinking')
      },
    }

    const key = `${fromPage}→${toPage}`
    if (reactions[key]) await reactions[key]()
  }

  // Participate in transition animation
  async participateInTransition(transitionType, progress) {
    switch (transitionType) {
      case 'portal':
        if (progress < 0.3) await this.playAnimation('cast_spell')
        break
      case 'carry':
        this.rotation.z = Math.sin(progress * Math.PI * 4) * 0.1
        break
      case 'wave':
        if (progress < 0.5) await this.playAnimation('wave')
        break
    }
  }
}
```

### Transition Manager

```js
// transitions/TransitionManager.js
export class TransitionManager {
  constructor(avatar, router) {
    this.avatar = avatar
    this.router = router
    this.transitionLayer = document.getElementById('transition-layer')
  }

  async play(fromPage, toPage) {
    const transitionType = this.selectTransition(fromPage, toPage)

    // 1. Avatar reacts to navigation starting
    await this.avatar.reactToNavigation(fromPage, toPage)

    // 2. Play transition with avatar participation
    await this.runTransition(transitionType, fromPage, toPage)

    // 3. Avatar settles into new page
    await this.avatar.settleIntoPage(toPage)
  }

  async portalTransition(from, to) {
    await this.avatar.playAnimation('cast_spell')

    const portal = this.createPortalEffect()
    this.transitionLayer.appendChild(portal)

    await this.animatePortalOpen(portal)
    await this.router.swapContent(to)
    await this.animatePortalClose(portal)

    portal.remove()
  }

  async carryTransition(from, to) {
    const pageEl = document.getElementById('page-content')

    await this.avatar.moveTo(10, 90)
    await this.avatar.playAnimation('grab')

    await Promise.all([
      this.avatar.moveTo(-20, 50, 800),
      this.animateElement(pageEl, {
        transform: 'rotate(-5deg) translateX(-120%)',
        opacity: 0
      }, 800)
    ])

    await this.router.swapContent(to)
    pageEl.style.transform = 'translateX(120%)'

    await Promise.all([
      this.avatar.moveTo(80, 70, 800),
      this.animateElement(pageEl, {
        transform: 'rotate(0) translateX(0)',
        opacity: 1
      }, 800)
    ])

    await this.avatar.playAnimation('idle')
  }
}
```

### Client-Side Router

```js
// router.js
export class Router {
  constructor(contentSelector) {
    this.contentEl = document.querySelector(contentSelector)
    this.currentPage = this.getPageFromURL()
    this.listeners = { beforeNavigate: [], afterNavigate: [] }

    this.setupLinkInterception()
    window.addEventListener('popstate', () => this.handleNavigation())
  }

  setupLinkInterception() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"]')
      if (link) {
        e.preventDefault()
        this.navigate(link.getAttribute('href'))
      }
    })
  }

  async navigate(path) {
    const fromPage = this.currentPage
    const toPage = this.getPageName(path)

    for (const handler of this.listeners.beforeNavigate) {
      await handler(fromPage, toPage)
    }

    history.pushState({}, '', path)
    this.currentPage = toPage

    for (const handler of this.listeners.afterNavigate) {
      await handler(fromPage, toPage)
    }
  }

  async swapContent(pageName) {
    const module = await import(`./pages/${pageName}.js`)
    this.contentEl.innerHTML = ''
    this.contentEl.appendChild(module.render())
  }

  on(event, handler) {
    this.listeners[event].push(handler)
  }
}
```

### Page-Specific Avatar Behavior

```js
// avatar/AvatarBehavior.js
export class AvatarBehavior {
  constructor(avatar) {
    this.avatar = avatar
  }

  setPageBehavior(pageName) {
    const behaviors = {
      home: {
        position: { x: 80, y: 70 },
        idleAnimations: ['wave', 'idle', 'look_around'],
        interactsWith: ['hero-section'],
      },
      about: {
        position: { x: 15, y: 50 },
        idleAnimations: ['idle', 'thinking', 'nod'],
        followScroll: true,
      },
      projects: {
        position: { x: 85, y: 40 },
        idleAnimations: ['idle', 'excited'],
        reactToHover: true,
      },
      blog: {
        position: { x: 90, y: 80 },
        idleAnimations: ['reading', 'idle'],
        quiet: true,
      },
    }

    const behavior = behaviors[pageName] || behaviors.home
    this.avatar.moveTo(behavior.position.x, behavior.position.y)
  }

  onElementHover(element) {
    if (element.classList.contains('project-card')) {
      this.avatar.lookAt(element)
      this.avatar.say("That's a cool one!")
    }
  }

  onScroll(scrollY) {
    // Avatar follows scroll on certain pages
  }
}
```

### Main App Entry

```js
// main.js
import { Avatar } from './avatar/Avatar.js'
import { Router } from './router.js'
import { TransitionManager } from './transitions/TransitionManager.js'

class App {
  constructor() {
    this.avatar = new Avatar('#avatar-container')
    this.router = new Router('#page-content')
    this.transitions = new TransitionManager(this.avatar, this.router)

    this.router.on('beforeNavigate', (from, to) => {
      return this.transitions.play(from, to)
    })
  }
}

new App()
```

### HTML Structure

```html
<body>
  <div id="avatar-container"></div>    <!-- Never unmounts -->
  <div id="transition-layer"></div>    <!-- For effects -->
  <div id="page-content"></div>        <!-- Swapped by router -->
</body>
```

---

## Transition Effects

| Transition | Description |
|------------|-------------|
| **Portal** | Avatar casts spell, opens swirling portal, content flies through |
| **Carry** | Avatar grabs page corner, carries it off screen, brings new one |
| **Slide** | Avatar pushes current page off, pulls new one in |
| **Teleport** | Avatar and page dissolve into particles, reform as new page |
| **Door** | Avatar opens a door, walks through, you follow |
| **Flip** | Avatar flips the page like a book |
| **Swim** | Page becomes water, avatar swims to new page |
| **Fade** | Simple crossfade with avatar wave animation |
| **Wave** | Avatar waves goodbye to old page, welcomes new one |

---

## Tech Recommendations

### For Production Real Estate Site (Current Target)

**Recommended: Next.js**

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 | SEO, image optimization, API routes |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Fast development |
| 3D/Mascot | Three.js + three-vrm | VRM avatar support |
| Animation | Framer Motion | Page transitions |
| Forms | React Hook Form + Zod | Validation |
| CRM | HubSpot | Lead management |
| Hosting | Vercel | Perfect for Next.js |

See [WEB_TECH_COMPARISON.md](./WEB_TECH_COMPARISON.md) for complete architecture, code examples, and setup instructions.

### For Prototyping / Simple Sites

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Vanilla JS + Three.js** | No build step, lightweight | More boilerplate | Quick prototypes |
| **Vite + Vanilla JS** | Hot reload, no framework | Manual routing | Localhost dev |
| **Svelte** | Small bundle, easy animations | Less ecosystem | Performance |
| **Astro** | Great for content, islands | Less control | Blogs, portfolios |

### Quick Prototype Stack

For testing mascot concepts before production:

1. **Vite** - Build tool with hot reload
2. **Vanilla JS** - No framework overhead
3. **Three.js + three-vrm** - 3D rendering
4. **GSAP** - Smooth animations

---

## Shared Core Strategy

If building both desktop (Electron) and web versions:

```
mate-engine-core/        # Shared Three.js + three-vrm code
├── src/
│   ├── avatar.js        # VRM loading, animation
│   ├── animator.js      # State machine
│   └── mouse-track.js   # Cursor following

mate-engine-web/         # Web build
├── index.html
└── main.js              # Uses core, adds web UI

mate-engine-desktop/     # Electron build
├── main.js              # Electron setup
└── renderer.js          # Uses core, adds system audio
```

---

## Next Steps

### For Real Estate Site

1. **Setup Next.js** - Create project with TypeScript + Tailwind
2. **Mascot Component** - Three.js canvas with VRM avatar
3. **Chat UI** - Speech bubbles and quick-reply buttons
4. **Lead Flow** - Conversational lead capture logic
5. **API Routes** - Lead submission endpoint
6. **CRM Integration** - Connect to HubSpot
7. **Page Behaviors** - Different mascot actions per page
8. **Testing** - Verify lead flow and CRM sync

### For Prototyping

1. **Prototype** - Build minimal web demo with VRM + mouse tracking
2. **Router** - Add SPA routing with basic page transitions
3. **Avatar Reactions** - Implement navigation reactions and speech bubbles
4. **Transitions** - Build out fancy transition effects
5. **Polish** - Add page-specific behaviors, idle animations, interactions

---

## External Resources

- [three-vrm](https://github.com/pixiv/three-vrm) - VRM loader for Three.js
- [Three.js](https://threejs.org/) - 3D library
- [GSAP](https://greensock.com/gsap/) - Animation library
- [VRM Specification](https://vrm.dev/en/) - VRM format docs
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) - Native browser transitions
