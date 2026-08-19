import * as ecs from '@8thwall/ecs'

/**
 * FloatingItemComponent.ts
 * Animación de flotación y rotación estilo "Item de Minecraft":
 * - Levita suavemente arriba y abajo en el eje Y usando una onda senoidal.
 * - Gira continuamente sobre su propio eje Y.
 */

ecs.registerComponent({
  name: 'floating-item',
  schema: {
    speed: ecs.f32,          // Velocidad del bamboleo
    amplitude: ecs.f32,      // Amplitud/altura de flotación
    rotationSpeed: ecs.f32,  // Velocidad de giro
  },
  schemaDefaults: {
    speed: 2.5,
    amplitude: 0.03,
    rotationSpeed: 0.8,
  },
  add: (world, component) => {
    const threeState = (world as any).three
    const obj = threeState?.entityToObject?.get(component.eid)
    if (obj) {
      obj.userData.initialY = obj.position.y
    }
  },
  tick: (world, component) => {
    const threeState = (world as any).three
    const obj = threeState?.entityToObject?.get(component.eid)
    if (!obj || obj.visible === false) return

    if (typeof obj.userData.initialY !== 'number') {
      obj.userData.initialY = obj.position.y
    }

    const elapsed = (world.time?.elapsed || Date.now()) / 1000
    const delta = (world.time?.delta || 16) / 1000
    const initialY = obj.userData.initialY

    const speed = component.schema?.speed || 2.5
    const amplitude = component.schema?.amplitude || 0.03
    const rotSpeed = component.schema?.rotationSpeed || 0.8

    obj.position.y = initialY + Math.sin(elapsed * speed) * amplitude
    obj.rotation.y += delta * rotSpeed
  },
})

// Alias FloatingItemComponent
try {
  ecs.registerComponent({
    name: 'FloatingItemComponent',
    schema: {
      speed: ecs.f32,
      amplitude: ecs.f32,
      rotationSpeed: ecs.f32,
    },
    schemaDefaults: {
      speed: 2.5,
      amplitude: 0.03,
      rotationSpeed: 0.8,
    },
    add: (world, component) => {
      const threeState = (world as any).three
      const obj = threeState?.entityToObject?.get(component.eid)
      if (obj) {
        obj.userData.initialY = obj.position.y
      }
    },
    tick: (world, component) => {
      const threeState = (world as any).three
      const obj = threeState?.entityToObject?.get(component.eid)
      if (!obj || obj.visible === false) return

      if (typeof obj.userData.initialY !== 'number') {
        obj.userData.initialY = obj.position.y
      }

      const elapsed = (world.time?.elapsed || Date.now()) / 1000
      const delta = (world.time?.delta || 16) / 1000
      const initialY = obj.userData.initialY

      const speed = component.schema?.speed || 2.5
      const amplitude = component.schema?.amplitude || 0.03
      const rotSpeed = component.schema?.rotationSpeed || 0.8

      obj.position.y = initialY + Math.sin(elapsed * speed) * amplitude
      obj.rotation.y += delta * rotSpeed
    },
  })
} catch (e) {}
