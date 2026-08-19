import * as ecs from '@8thwall/ecs'

let lastUrlOpenTime = 0

export const SOCIAL_LINKS = {
  whatsapp: 'https://wa.me/573104812846',
  portfolio: 'https://dplata777.github.io/portafolio-/',
  instagram: 'https://www.instagram.com/deavidplata18?igsh=cWIxZDg3ajExdjU3',
}

export function navigateToUrl(url: string) {
  if (!url) return
  const now = Date.now()
  if (now - lastUrlOpenTime < 500) return
  lastUrlOpenTime = now

  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  } catch (err) {
    window.location.href = url
  }
}

export function pulseObjectScale(obj: any) {
  try {
    if (!obj || !obj.scale) return
    const orig = {x: obj.scale.x, y: obj.scale.y, z: obj.scale.z}
    obj.scale.set(orig.x * 1.25, orig.y * 1.25, orig.z * 1.25)
    setTimeout(() => {
      if (obj && obj.scale) obj.scale.set(orig.x, orig.y, orig.z)
    }, 200)
  } catch (e) {}
}

export function getUrlFromIdentifier(identifierStr: string, customUrl?: string): string | null {
  if (customUrl && customUrl.trim()) return customUrl.trim()
  const str = (identifierStr || '').toLowerCase()
  if (str.includes('whatsapp') || str.includes('wa.me') || str.includes('wsp')) return SOCIAL_LINKS.whatsapp
  if (str.includes('portfolio') || str.includes('portafolio') || str.includes('web')) return SOCIAL_LINKS.portfolio
  if (str.includes('instagram') || str.includes('insta') || str.includes('ig')) return SOCIAL_LINKS.instagram
  return null
}

// Register link-opener
ecs.registerComponent({
  name: 'link-opener',
  schema: {
    url: ecs.string,
  },
  schemaDefaults: {
    url: '',
  },
  add: (world, component) => {
    const open = () => {
      const obj = (world as any).three?.entityToObject?.get(component.eid)
      const url = getUrlFromIdentifier(obj?.name || '', component.schema.url)
      if (url) {
        pulseObjectScale(obj)
        navigateToUrl(url)
      }
    }
    world.events.addListener(component.eid, ecs.input.UI_CLICK, open)
    world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, open)
  },
})

// Register LinkOpenerComponent (alias)
try {
  ecs.registerComponent({
    name: 'LinkOpenerComponent',
    schema: {
      url: ecs.string,
    },
    add: (world, component) => {
      const open = () => {
        const obj = (world as any).three?.entityToObject?.get(component.eid)
        const url = getUrlFromIdentifier(obj?.name || '', component.schema.url)
        if (url) {
          pulseObjectScale(obj)
          navigateToUrl(url)
        }
      }
      world.events.addListener(component.eid, ecs.input.UI_CLICK, open)
      world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, open)
    },
  })
} catch (e) {}

// Register open-url-button (alias)
try {
  ecs.registerComponent({
    name: 'open-url-button',
    schema: {
      url: ecs.string,
    },
    add: (world, component) => {
      const open = () => {
        const obj = (world as any).three?.entityToObject?.get(component.eid)
        const url = getUrlFromIdentifier(obj?.name || '', component.schema.url)
        if (url) {
          pulseObjectScale(obj)
          navigateToUrl(url)
        }
      }
      world.events.addListener(component.eid, ecs.input.UI_CLICK, open)
      world.events.addListener(component.eid, ecs.input.SCREEN_TOUCH_START, open)
    },
  })
} catch (e) {}

// Global behavior component for url click detection on screen
let isGlobalAttached = false
ecs.registerComponent({
  name: 'open-url-global-behavior',
  add: (world) => {
    if (isGlobalAttached) return
    isGlobalAttached = true

    world.events.addListener(world.events.globalId, ecs.input.UI_CLICK, (event: any) => {
      if (event?.target) {
        const obj = (world as any).three?.entityToObject?.get(event.target)
        const url = getUrlFromIdentifier(obj?.name || '')
        if (url) {
          pulseObjectScale(obj)
          navigateToUrl(url)
        }
      }
    })
  },
})
