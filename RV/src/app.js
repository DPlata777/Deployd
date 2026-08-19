const onxrloaded = () => {
  const targets = []
  try { targets.push(require('../image-targets/Tarjeta de Presentacion.json')) } catch (e) {}
  try { targets.push(require('../image-targets/Shelter.json')) } catch (e) {}
  if (window.XR8 && window.XR8.XrController) {
    window.XR8.XrController.configure({
      imageTargetData: targets,
    })
  }
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)