import * as ecs from '@8thwall/ecs'

let lastVideoToggleTime = 0
let isVideoPlaying = false
let uiFloatingBtn: HTMLButtonElement | null = null

function updateFloatingUiBtn(playing: boolean) {
  if (!uiFloatingBtn) return
  if (playing) {
    uiFloatingBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>'
    uiFloatingBtn.style.backgroundColor = 'rgba(15, 23, 42, 0.85)'
    uiFloatingBtn.setAttribute('title', 'Pausar Video')
  } else {
    uiFloatingBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 3px;"><polygon points="5,3 19,12 5,21" /></svg>'
    uiFloatingBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.85)'
    uiFloatingBtn.setAttribute('title', 'Reproducir Video')
  }
}

function findVideoElement(world: ecs.World): HTMLVideoElement | null {
  const threeState = (world as any).three
  if (threeState?.entityToObject) {
    for (const [_, obj] of threeState.entityToObject.entries()) {
      let found: HTMLVideoElement | null = null
      obj.traverse((child: any) => {
        if (child.material?.map?.image instanceof HTMLVideoElement) {
          found = child.material.map.image
        }
      })
      if (found) return found
    }
  }
  const videos = Array.from(document.querySelectorAll('video'))
  return videos[0] || null
}

function findVideoPlaneEid(world: ecs.World): ecs.Eid | null {
  const threeState = (world as any).three
  if (!threeState?.entityToObject) return null
  const VideoControls = (ecs as any).VideoControls

  for (const [eid, obj] of threeState.entityToObject.entries()) {
    const objName = (obj?.name || '').toLowerCase()
    if (objName.includes('plane') || objName.includes('video') || (VideoControls && VideoControls.has(world, eid))) {
      return eid
    }
  }
  return null
}

export function playVideo(world: ecs.World, planeEid?: ecs.Eid) {
  const targetEid = planeEid || findVideoPlaneEid(world)
  const VideoControls = (ecs as any).VideoControls
  if (targetEid && VideoControls && VideoControls.has(world, targetEid)) {
    VideoControls.mutate(world, targetEid, (cursor: any) => {
      cursor.paused = false
    })
  }

  const vid = findVideoElement(world)
  if (vid) {
    vid.muted = false
    vid.play().catch(() => {
      vid.muted = true
      vid.play().then(() => {
        const unlockAudio = () => {
          vid.muted = false
          window.removeEventListener('touchstart', unlockAudio)
          window.removeEventListener('click', unlockAudio)
        }
        window.addEventListener('touchstart', unlockAudio, {once: true})
        window.addEventListener('click', unlockAudio, {once: true})
      })
    })
  }

  isVideoPlaying = true
  updateFloatingUiBtn(true)
}

export function pauseVideo(world: ecs.World, planeEid?: ecs.Eid) {
  const targetEid = planeEid || findVideoPlaneEid(world)
  const VideoControls = (ecs as any).VideoControls
  if (targetEid && VideoControls && VideoControls.has(world, targetEid)) {
    VideoControls.mutate(world, targetEid, (cursor: any) => {
      cursor.paused = true
    })
  }

  const vid = findVideoElement(world)
  if (vid) {
    vid.pause()
  }

  isVideoPlaying = false
  updateFloatingUiBtn(false)
}

export function toggleVideo(world: ecs.World, planeEid?: ecs.Eid) {
  const now = Date.now()
  if (now - lastVideoToggleTime < 400) return
  lastVideoToggleTime = now

  if (isVideoPlaying) {
    pauseVideo(world, planeEid)
  } else {
    playVideo(world, planeEid)
  }
}

function createFloatingButton(world: ecs.World) {
  if (document.getElementById('video-control-toggle-btn')) {
    uiFloatingBtn = document.getElementById('video-control-toggle-btn') as HTMLButtonElement
    return
  }

  uiFloatingBtn = document.createElement('button')
  uiFloatingBtn.id = 'video-control-toggle-btn'
  uiFloatingBtn.setAttribute('aria-label', 'Reproducir o Pausar Video')

  Object.assign(uiFloatingBtn.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    backdropFilter: 'blur(8px)',
    webkitBackdropFilter: 'blur(8px)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    outline: 'none',
    transition: 'transform 0.15s ease, background-color 0.2s ease',
    userSelect: 'none',
    webkitUserSelect: 'none',
    touchAction: 'manipulation',
  })

  updateFloatingUiBtn(false)

  uiFloatingBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation()
    if (uiFloatingBtn) uiFloatingBtn.style.transform = 'scale(0.92)'
  })

  const resetScale = () => {
    if (uiFloatingBtn) uiFloatingBtn.style.transform = 'scale(1)'
  }
  uiFloatingBtn.addEventListener('pointerup', resetScale)
  uiFloatingBtn.addEventListener('pointercancel', resetScale)

  uiFloatingBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    toggleVideo(world)
  })

  document.body.appendChild(uiFloatingBtn)
}

// Register video-control
ecs.registerComponent({
  name: 'video-control',
  schema: {
    buttonEntity: ecs.eid,
    textEntity: ecs.eid,
    imageTargetEntity: ecs.eid,
  },
  add: (world, component) => {
    if (component.schema.buttonEntity) {
      world.events.addListener(component.schema.buttonEntity, ecs.input.UI_CLICK, () => toggleVideo(world, component.eid))
      world.events.addListener(component.schema.buttonEntity, ecs.input.SCREEN_TOUCH_START, () => toggleVideo(world, component.eid))
    }
    world.events.addListener(component.eid, ecs.input.UI_CLICK, () => toggleVideo(world, component.eid))

    if (component.schema.imageTargetEntity) {
      world.events.addListener(component.schema.imageTargetEntity, ecs.events.REALITY_IMAGE_FOUND, () => playVideo(world, component.eid))
      world.events.addListener(component.schema.imageTargetEntity, ecs.events.REALITY_IMAGE_LOST, () => pauseVideo(world, component.eid))
    }
  },
})

// Register VideoControlComponent (alias)
try {
  ecs.registerComponent({
    name: 'VideoControlComponent',
    schema: {
      targetName: ecs.string,
      videoSrc: ecs.string,
    },
    add: (world, component) => {
      world.events.addListener(component.eid, ecs.input.UI_CLICK, () => toggleVideo(world, component.eid))
      world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, () => toggleVideo(world, component.eid))
    },
  })
} catch (e) {}

// Register video-toggle-button (alias)
try {
  ecs.registerComponent({
    name: 'video-toggle-button',
    add: (world, component) => {
      world.events.addListener(component.eid, ecs.input.UI_CLICK, () => toggleVideo(world, component.eid))
      world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, () => toggleVideo(world, component.eid))
    },
  })
} catch (e) {}

// Global behavior component
let isVideoBehaviorAttached = false
ecs.registerComponent({
  name: 'video-global-behavior',
  add: (world) => {
    if (isVideoBehaviorAttached) return
    isVideoBehaviorAttached = true

    createFloatingButton(world)

    world.events.addListener(world.events.globalId, ecs.input.UI_CLICK, (event: any) => {
      if (event?.target) {
        const obj = (world as any).three?.entityToObject?.get(event.target)
        const objName = (obj?.name || '').toLowerCase()
        if (objName.includes('button') || objName.includes('icon') || objName.includes('text') || objName.includes('plane')) {
          toggleVideo(world)
        }
      }
    })

    window.addEventListener('xrimagelost', () => {
      if (isVideoPlaying) pauseVideo(world)
    })
  },
})
