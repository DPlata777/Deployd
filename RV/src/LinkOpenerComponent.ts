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
  if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
    return customUrl.trim()
  }
  const str = (identifierStr || '').toLowerCase().trim()
  if (!str) return null

  if (str.includes('whatsapp') || str.includes('wa.me') || str.includes('wsp')) {
    return SOCIAL_LINKS.whatsapp
  }
  if (str.includes('portfolio') || str.includes('portafolio') || str.includes('github') || str.includes('web')) {
    return SOCIAL_LINKS.portfolio
  }
  if (str.includes('instagram') || str.includes('insta') || (/\big\b/).test(str)) {
    return SOCIAL_LINKS.instagram
  }
  return null
}

// Global registry mapping entity ID to its target URL
const entityUrlMap = new Map<any, string>()

function registerLinkOpenerListeners(world: ecs.World, eid: ecs.Eid, configuredUrl?: string) {
  const currentEid = eid
  const urlParam = (configuredUrl && typeof configuredUrl === 'string') ? configuredUrl.trim() : ''

  const getResolvedUrl = (): string | null => {
    if (urlParam) return urlParam
    if (entityUrlMap.has(currentEid)) return entityUrlMap.get(currentEid)!
    const obj = (world as any).three?.entityToObject?.get(currentEid)
    const urlFromObj = getUrlFromIdentifier(obj?.name || '')
    if (urlFromObj) return urlFromObj
    if (obj?.parent) {
      const urlFromParent = getUrlFromIdentifier(obj.parent.name || '')
      if (urlFromParent) return urlFromParent
    }
    return null
  }

  const resolved = getResolvedUrl()
  if (resolved) {
    entityUrlMap.set(currentEid, resolved)
  }

  const handleOpen = () => {
    const obj = (world as any).three?.entityToObject?.get(currentEid)
    const url = getResolvedUrl()
    if (url) {
      pulseObjectScale(obj)
      navigateToUrl(url)
    }
  }

  world.events.addListener(currentEid, ecs.input.UI_CLICK, handleOpen)
  world.events.addListener(currentEid, ecs.input.SCREEN_TOUCH_START, handleOpen)
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
    const currentEid = component.eid
    const configuredUrl = component.schema?.url ? String(component.schema.url).trim() : ''
    registerLinkOpenerListeners(world, currentEid, configuredUrl)
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
      const currentEid = component.eid
      const configuredUrl = component.schema?.url ? String(component.schema.url).trim() : ''
      registerLinkOpenerListeners(world, currentEid, configuredUrl)
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
      const currentEid = component.eid
      const configuredUrl = component.schema?.url ? String(component.schema.url).trim() : ''
      registerLinkOpenerListeners(world, currentEid, configuredUrl)
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
        const targetEid = event.target
        let url = entityUrlMap.get(targetEid) || null
        const obj = (world as any).three?.entityToObject?.get(targetEid)
        if (!url && obj) {
          url = getUrlFromIdentifier(obj.name || '')
          if (!url && obj.parent) {
            url = getUrlFromIdentifier(obj.parent.name || '')
          }
        }
        if (url) {
          pulseObjectScale(obj)
          navigateToUrl(url)
        }
      }
    })
  },
})
