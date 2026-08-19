import * as ecs from '@8thwall/ecs'

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
  data: {
    currentClip: ecs.ui8,
  },
  add: (world, component) => {
    const {eid, schema, data} = component
    data.currentClip = 0

    // Helper: check if target entity is this entity or any descendant
    const isThisEntityOrChild = (target: bigint): boolean => {
      let current = target
      for (let i = 0; i < 20; i++) {
        if (current === eid) return true
        try {
          const parent = world.getParent(current)
          if (!parent || parent === current) break
          current = parent
        } catch {
          break
        }
      }
      return false
    }

    // Listen for screen touch events globally
    world.events.addListener(
      world.events.globalId,
      ecs.input.SCREEN_TOUCH_START,
      (event) => {
        const target = event.data.target
        if (!target) return

        // Only react if the user tapped on this avatar (or a child mesh)
        if (isThisEntityOrChild(target)) {
          // Toggle between the two animation clips
          data.currentClip = data.currentClip === 0 ? 1 : 0
          const newClip = data.currentClip === 0
            ? schema.animClip1
            : schema.animClip2

          ecs.GltfModel.set(world, eid, {animationClip: newClip})
        }
      }
    )
  },
})
