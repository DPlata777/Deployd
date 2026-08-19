import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'link-opener',
  schema: {
    // The URL to open when this entity is tapped
    url: ecs.string,
  },
  schemaDefaults: {
    url: '',
  },
  add: (world, component) => {
    const {eid, schema} = component

    // When this UI element is clicked, open the configured URL
    world.events.addListener(eid, ecs.input.UI_CLICK, () => {
      if (schema.url) {
        window.open(schema.url, '_blank')
      }
    })
  },
})
