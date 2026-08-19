import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'video-control',
  schema: {
    // Reference to the Play/Pause UI button entity
    buttonEntity: ecs.eid,
    // Reference to the Text child of the button (to update label)
    textEntity: ecs.eid,
    // Reference to the Image Target entity (for auto play/pause on tracking)
    imageTargetEntity: ecs.eid,
  },
  data: {
    isPlaying: ecs.boolean,
  },
  add: (world, component) => {
    const {eid, schema, data} = component
    data.isPlaying = false

    // --- Button click: toggle play/pause ---
    if (schema.buttonEntity) {
      world.events.addListener(schema.buttonEntity, ecs.input.UI_CLICK, () => {
        data.isPlaying = !data.isPlaying
        ecs.VideoControls.set(world, eid, {paused: !data.isPlaying})

        // Update button text to reflect current state
        if (schema.textEntity) {
          ecs.Ui.mutate(world, schema.textEntity, (cursor) => {
            cursor.text = data.isPlaying ? '⏸ Pause' : '▶ Play'
          })
        }
      })
    }

    // --- Image Target found: auto-play ---
    if (schema.imageTargetEntity) {
      world.events.addListener(
        schema.imageTargetEntity,
        ecs.events.REALITY_IMAGE_FOUND,
        () => {
          data.isPlaying = true
          ecs.VideoControls.set(world, eid, {paused: false})
          if (schema.textEntity) {
            ecs.Ui.mutate(world, schema.textEntity, (cursor) => {
              cursor.text = '⏸ Pause'
            })
          }
        }
      )

      // --- Image Target lost: auto-pause ---
      world.events.addListener(
        schema.imageTargetEntity,
        ecs.events.REALITY_IMAGE_LOST,
        () => {
          data.isPlaying = false
          ecs.VideoControls.set(world, eid, {paused: true})
          if (schema.textEntity) {
            ecs.Ui.mutate(world, schema.textEntity, (cursor) => {
              cursor.text = '▶ Play'
            })
          }
        }
      )
    }
  },
})
