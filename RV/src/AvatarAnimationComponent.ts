import * as ecs from '@8thwall/ecs'

let lastAvatarToggleTime = 0

function toggleAvatarAnimation(world: ecs.World, eid: ecs.Eid, clip1 = 'mixamo.com', clip2 = 'mixamo.com.001') {
  const now = Date.now()
  if (now - lastAvatarToggleTime < 400) return
  lastAvatarToggleTime = now

  try {
    if (ecs.GltfModel && ecs.GltfModel.has(world, eid)) {
      const current = ecs.GltfModel.get(world, eid)
      const nextClip = (current.animationClip === clip1) ? clip2 : clip1

      ecs.GltfModel.mutate(world, eid, (cursor: any) => {
        cursor.animationClip = nextClip
        cursor.loop = true
        cursor.paused = false
      })
    }
  } catch (err) {
    console.error('[avatar-animation] Error changing animation:', err)
  }
}

// Register under avatar-animation
ecs.registerComponent({
  name: 'avatar-animation',
  schema: {
    animClip1: ecs.string,
    animClip2: ecs.string,
  },
  schemaDefaults: {
    animClip1: 'mixamo.com',
    animClip2: 'mixamo.com.001',
  },
  add: (world, component) => {
    const currentEid = component.eid
    const c1 = component.schema?.animClip1 || 'mixamo.com'
    const c2 = component.schema?.animClip2 || 'mixamo.com.001'
    world.events.addListener(currentEid, ecs.input.UI_CLICK, () => {
      toggleAvatarAnimation(world, currentEid, c1, c2)
    })
    world.events.addListener(currentEid, ecs.input.SCREEN_TOUCH_START, () => {
      toggleAvatarAnimation(world, currentEid, c1, c2)
    })
  },
})

// Register under AvatarAnimationComponent (alias)
try {
  ecs.registerComponent({
    name: 'AvatarAnimationComponent',
    schema: {
      clip1: ecs.string,
      clip2: ecs.string,
    },
    schemaDefaults: {
      clip1: 'mixamo.com',
      clip2: 'mixamo.com.001',
    },
    add: (world, component) => {
      const currentEid = component.eid
      const c1 = component.schema?.clip1 || 'mixamo.com'
      const c2 = component.schema?.clip2 || 'mixamo.com.001'
      world.events.addListener(currentEid, ecs.input.UI_CLICK, () => {
        toggleAvatarAnimation(world, currentEid, c1, c2)
      })
      world.events.addListener(currentEid, ecs.input.SCREEN_TOUCH_START, () => {
        toggleAvatarAnimation(world, currentEid, c1, c2)
      })
    },
  })
} catch (e) {}

// Register under character-animation-toggle (alias)
try {
  ecs.registerComponent({
    name: 'character-animation-toggle',
    add: (world, component) => {
      const currentEid = component.eid
      world.events.addListener(currentEid, ecs.input.UI_CLICK, () => {
        toggleAvatarAnimation(world, currentEid)
      })
      world.events.addListener(currentEid, ecs.input.SCREEN_TOUCH_START, () => {
        toggleAvatarAnimation(world, currentEid)
      })
    },
  })
} catch (e) {}

// Global touch/proximity fallback behavior
let isCharGlobalAttached = false
ecs.registerComponent({
  name: 'character-animation-global-behavior',
  add: (world) => {
    if (isCharGlobalAttached) return
    isCharGlobalAttached = true

    const findAvatarEid = (): ecs.Eid | null => {
      const threeState = (world as any).three
      if (!threeState?.entityToObject) return null

      for (const [eid, obj] of threeState.entityToObject.entries()) {
        const objName = (obj?.name || '').toLowerCase()
        if (objName.includes('animaciones') || objName.includes('avatar') || objName.includes('yobailanding')) {
          return eid
        }
      }
      return null
    }

    world.events.addListener(world.events.globalId, ecs.input.SCREEN_TOUCH_START, (event: any) => {
      const avatarEid = findAvatarEid()
      if (!avatarEid) return

      if (event?.target === avatarEid) {
        toggleAvatarAnimation(world, avatarEid)
        return
      }

      // If touching another specific entity, don't trigger avatar fallback
      if (event?.target && event?.target !== avatarEid && event?.target !== world.events.globalId) {
        return
      }

      if (event?.position) {
        const threeState = (world as any).three
        const avatarObj = threeState?.entityToObject?.get(avatarEid)
        const camera = threeState?.activeCamera
        const canvas = threeState?.renderer?.domElement || document.querySelector('canvas')
        if (!avatarObj || !camera || !canvas || avatarObj.visible === false) return

        const canvasRect = canvas.getBoundingClientRect()
        try {
          const Vector3Class = camera.position?.constructor
          if (Vector3Class && camera.project) {
            const worldPos = new Vector3Class()
            if (avatarObj.getWorldPosition) avatarObj.getWorldPosition(worldPos)
            else if (avatarObj.matrixWorld) worldPos.setFromMatrixPosition(avatarObj.matrixWorld)

            camera.project(worldPos)
            if (worldPos.z > -1 && worldPos.z < 1) {
              const screenX = ((worldPos.x + 1) / 2) * canvasRect.width + canvasRect.left
              const screenY = ((-worldPos.y + 1) / 2) * canvasRect.height + canvasRect.top
              const dist = Math.hypot(screenX - event.position.x, screenY - event.position.y)
              if (dist <= 130) {
                toggleAvatarAnimation(world, avatarEid)
              }
            }
          }
        } catch (e) {}
      }
    })
  },
})
