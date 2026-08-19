(()=>{
  var modules = {
    574(module, exports, require) {
      const configureTargets = () => {
        if (window.XR8 && window.XR8.XrController) {
          try {
            window.XR8.XrController.configure({
              imageTargetData: [require(226)]
            });
          } catch (e) {
            console.warn("[8thWall] Error al configurar imageTargetData:", e);
          }
        }
      };
      if (window.XR8) {
        configureTargets();
      } else {
        window.addEventListener("xrloaded", configureTargets);
      }
    },
    226(module) {
      "use strict";
      module.exports = JSON.parse('{"type":"PLANAR","properties":{"top":0,"left":0,"width":1086,"height":1448,"isRotated":false,"originalWidth":1086,"originalHeight":1448},"imagePath":"image-targets/Tarjeta de Presentacion_luminance.png","metadata":null,"name":"Tarjeta de Presentacion","resources":{"originalImage":"Tarjeta de Presentacion_original.png","croppedImage":"Tarjeta de Presentacion_cropped.png","thumbnailImage":"Tarjeta de Presentacion_thumbnail.png","luminanceImage":"Tarjeta de Presentacion_luminance.png"},"created":1787117783023,"updated":1787117783023}');
    }
  };

  var cache = {};
  function require(id) {
    if (cache[id] !== undefined) return cache[id].exports;
    var module = cache[id] = { exports: {} };
    modules[id](module, module.exports, require);
    return module.exports;
  }

  (() => {
    "use strict";
    try {
      require(574);
    } catch (e) {
      console.warn("[8thWall] Target module warning:", e);
    }

    const startApp = () => {
      const ECS = window.ecs;
      if (!ECS) {
        console.error("8th Wall ECS no se encuentra disponible en window.ecs");
        return;
      }

      // --- 1. AVATAR ANIMATION ---
      let lastAvatarToggleTime = 0;
      function toggleAvatarAnimation(world, eid, clip1, clip2) {
        const c1 = clip1 || 'mixamo.com';
        const c2 = clip2 || 'mixamo.com.001';
        const now = Date.now();
        if (now - lastAvatarToggleTime < 400) return;
        lastAvatarToggleTime = now;
        try {
          if (ECS.GltfModel && ECS.GltfModel.has(world, eid)) {
            const current = ECS.GltfModel.get(world, eid);
            const nextClip = (current.animationClip === c1) ? c2 : c1;
            ECS.GltfModel.mutate(world, eid, (cursor) => {
              cursor.animationClip = nextClip;
              cursor.loop = true;
              cursor.paused = false;
            });
          }
        } catch (err) {}
      }

      try {
        ECS.registerComponent({
          name: 'avatar-animation',
          schema: { animClip1: ECS.string, animClip2: ECS.string },
          schemaDefaults: { animClip1: 'mixamo.com', animClip2: 'mixamo.com.001' },
          add: (world, component) => {
            world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleAvatarAnimation(world, component.eid, component.schema.animClip1, component.schema.animClip2));
            world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, () => toggleAvatarAnimation(world, component.eid, component.schema.animClip1, component.schema.animClip2));
          }
        });
      } catch (e) {}

      try {
        ECS.registerComponent({
          name: 'AvatarAnimationComponent',
          schema: { clip1: ECS.string, clip2: ECS.string },
          schemaDefaults: { clip1: 'mixamo.com', clip2: 'mixamo.com.001' },
          add: (world, component) => {
            world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleAvatarAnimation(world, component.eid, component.schema.clip1, component.schema.clip2));
            world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, () => toggleAvatarAnimation(world, component.eid, component.schema.clip1, component.schema.clip2));
          }
        });
      } catch (e) {}

      // --- 2. REDES SOCIALES (LINK OPENER) ---
      const SOCIAL_LINKS = {
        whatsapp: 'https://wa.me/573104812846',
        portfolio: 'https://dplata777.github.io/portafolio-/',
        instagram: 'https://www.instagram.com/deavidplata18?igsh=cWIxZDg3ajExdjU3'
      };
      let lastUrlOpenTime = 0;
      function navigateToUrl(url) {
        if (!url) return;
        const now = Date.now();
        if (now - lastUrlOpenTime < 500) return;
        lastUrlOpenTime = now;
        try {
          const win = window.open(url, '_blank', 'noopener,noreferrer');
          if (!win || win.closed || typeof win.closed === 'undefined') {
            window.location.href = url;
          }
        } catch (err) {
          window.location.href = url;
        }
      }
      function pulseObjectScale(obj) {
        try {
          if (!obj || !obj.scale) return;
          const orig = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
          obj.scale.set(orig.x * 1.25, orig.y * 1.25, orig.z * 1.25);
          setTimeout(() => {
            if (obj && obj.scale) obj.scale.set(orig.x, orig.y, orig.z);
          }, 200);
        } catch (err) {}
      }
      function getUrlFromIdentifier(identifierStr, customUrl) {
        if (customUrl && customUrl.trim()) return customUrl.trim();
        const str = (identifierStr || '').toLowerCase();
        if (str.includes('whatsapp') || str.includes('wa.me') || str.includes('wsp')) return SOCIAL_LINKS.whatsapp;
        if (str.includes('portfolio') || str.includes('portafolio') || str.includes('web')) return SOCIAL_LINKS.portfolio;
        if (str.includes('instagram') || str.includes('insta') || str.includes('ig')) return SOCIAL_LINKS.instagram;
        return null;
      }
      try {
        ECS.registerComponent({
          name: 'link-opener',
          schema: { url: ECS.string },
          schemaDefaults: { url: '' },
          add: (world, component) => {
            const open = () => {
              const obj = world.three?.entityToObject?.get(component.eid);
              const url = getUrlFromIdentifier(obj?.name || '', component.schema.url);
              if (url) { pulseObjectScale(obj); navigateToUrl(url); }
            };
            world.events.addListener(component.eid, ECS.input.UI_CLICK, open);
            world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, open);
          }
        });
      } catch (e) {}

      // --- 3. VIDEO CONTROL ---
      let lastVideoToggleTime = 0;
      let isVideoPlaying = false;
      let uiFloatingBtn = null;
      function updateFloatingUiBtn(playing) {
        if (!uiFloatingBtn) return;
        if (playing) {
          uiFloatingBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>';
          uiFloatingBtn.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
          uiFloatingBtn.setAttribute('title', 'Pausar Video');
        } else {
          uiFloatingBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 3px;"><polygon points="5,3 19,12 5,21" /></svg>';
          uiFloatingBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.85)';
          uiFloatingBtn.setAttribute('title', 'Reproducir Video');
        }
      }
      function findVideoElement(world) {
        const threeState = world.three;
        if (threeState?.entityToObject) {
          for (const [_, obj] of threeState.entityToObject.entries()) {
            let found = null;
            obj.traverse((child) => {
              if (child.material?.map?.image instanceof HTMLVideoElement) { found = child.material.map.image; }
            });
            if (found) return found;
          }
        }
        const videos = Array.from(document.querySelectorAll('video'));
        return videos[0] || null;
      }
      function findVideoPlaneEid(world) {
        const threeState = world.three;
        if (!threeState?.entityToObject) return null;
        const VideoControls = ECS.VideoControls;
        for (const [eid, obj] of threeState.entityToObject.entries()) {
          const objName = (obj?.name || '').toLowerCase();
          if (objName.includes('plane') || objName.includes('video') || (VideoControls && VideoControls.has(world, eid))) {
            return eid;
          }
        }
        return null;
      }
      function playVideo(world, planeEid) {
        const targetEid = planeEid || findVideoPlaneEid(world);
        const VideoControls = ECS.VideoControls;
        if (targetEid && VideoControls && VideoControls.has(world, targetEid)) {
          VideoControls.mutate(world, targetEid, (cursor) => { cursor.paused = false; });
        }
        const vid = findVideoElement(world);
        if (vid) {
          vid.muted = false;
          vid.play().catch(() => {
            vid.muted = true;
            vid.play().then(() => {
              const unlockAudio = () => {
                vid.muted = false;
                window.removeEventListener('touchstart', unlockAudio);
                window.removeEventListener('click', unlockAudio);
              };
              window.addEventListener('touchstart', unlockAudio, { once: true });
              window.addEventListener('click', unlockAudio, { once: true });
            });
          });
        }
        isVideoPlaying = true;
        updateFloatingUiBtn(true);
      }
      function pauseVideo(world, planeEid) {
        const targetEid = planeEid || findVideoPlaneEid(world);
        const VideoControls = ECS.VideoControls;
        if (targetEid && VideoControls && VideoControls.has(world, targetEid)) {
          VideoControls.mutate(world, targetEid, (cursor) => { cursor.paused = true; });
        }
        const vid = findVideoElement(world);
        if (vid) { vid.pause(); }
        isVideoPlaying = false;
        updateFloatingUiBtn(false);
      }
      function toggleVideo(world, planeEid) {
        const now = Date.now();
        if (now - lastVideoToggleTime < 400) return;
        lastVideoToggleTime = now;
        if (isVideoPlaying) pauseVideo(world, planeEid);
        else playVideo(world, planeEid);
      }
      function createFloatingButton(world) {
        if (document.getElementById('video-control-toggle-btn')) {
          uiFloatingBtn = document.getElementById('video-control-toggle-btn');
          return;
        }
        uiFloatingBtn = document.createElement('button');
        uiFloatingBtn.id = 'video-control-toggle-btn';
        uiFloatingBtn.setAttribute('aria-label', 'Reproducir o Pausar Video');
        Object.assign(uiFloatingBtn.style, {
          position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
          borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.85)', backdropFilter: 'blur(8px)',
          webkitBackdropFilter: 'blur(8px)', border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', color: '#FFFFFF', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '9999', outline: 'none',
          transition: 'transform 0.15s ease, background-color 0.2s ease', userSelect: 'none', webkitUserSelect: 'none', touchAction: 'manipulation'
        });
        updateFloatingUiBtn(false);
        uiFloatingBtn.addEventListener('pointerdown', (evt) => { evt.stopPropagation(); if (uiFloatingBtn) uiFloatingBtn.style.transform = 'scale(0.92)'; });
        const resetScale = () => { if (uiFloatingBtn) uiFloatingBtn.style.transform = 'scale(1)'; };
        uiFloatingBtn.addEventListener('pointerup', resetScale);
        uiFloatingBtn.addEventListener('pointercancel', resetScale);
        uiFloatingBtn.addEventListener('click', (evt) => { evt.stopPropagation(); toggleVideo(world); });
        document.body.appendChild(uiFloatingBtn);
      }
      try {
        ECS.registerComponent({
          name: 'video-control',
          schema: { buttonEntity: ECS.eid, textEntity: ECS.eid, imageTargetEntity: ECS.eid },
          add: (world, component) => {
            if (component.schema.buttonEntity) {
              world.events.addListener(component.schema.buttonEntity, ECS.input.UI_CLICK, () => toggleVideo(world, component.eid));
              world.events.addListener(component.schema.buttonEntity, ECS.input.SCREEN_TOUCH_START, () => toggleVideo(world, component.eid));
            }
            world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleVideo(world, component.eid));
            if (component.schema.imageTargetEntity) {
              world.events.addListener(component.schema.imageTargetEntity, ECS.events.REALITY_IMAGE_FOUND, () => playVideo(world, component.eid));
              world.events.addListener(component.schema.imageTargetEntity, ECS.events.REALITY_IMAGE_LOST, () => pauseVideo(world, component.eid));
            }
          }
        });
      } catch (e) {}

      // --- 4. FLOATING ITEM COMPONENT (MINECRAFT ITEM ANIMATION) ---
      try {
        ECS.registerComponent({
          name: 'floating-item',
          schema: { speed: ECS.f32, amplitude: ECS.f32, rotationSpeed: ECS.f32 },
          schemaDefaults: { speed: 2.5, amplitude: 0.03, rotationSpeed: 0.8 },
          add: (world, component) => {
            const threeState = world.three;
            const obj = threeState?.entityToObject?.get(component.eid);
            if (obj) { component.initialY = obj.position.y; }
          },
          tick: (world, component) => {
            const threeState = world.three;
            const obj = threeState?.entityToObject?.get(component.eid);
            if (!obj || obj.visible === false) return;
            if (typeof component.initialY !== 'number') { component.initialY = obj.position.y; }
            const elapsed = (world.time?.elapsed || Date.now()) / 1000;
            const delta = (world.time?.delta || 16) / 1000;
            const initialY = component.initialY;
            const speed = component.schema.speed || 2.5;
            const amplitude = component.schema.amplitude || 0.03;
            const rotSpeed = component.schema.rotationSpeed || 0.8;
            obj.position.y = initialY + Math.sin(elapsed * speed) * amplitude;
            obj.rotation.y += delta * rotSpeed;
          }
        });
      } catch (e) {}

      // --- 5. GLOBAL BEHAVIORS ---
      try {
        ECS.registerComponent({
          name: 'open-url-global-behavior',
          add: (world) => {
            world.events.addListener(world.events.globalId, ECS.input.UI_CLICK, (event) => {
              if (event?.target) {
                const obj = world.three?.entityToObject?.get(event.target);
                const url = getUrlFromIdentifier(obj?.name || '');
                if (url) { pulseObjectScale(obj); navigateToUrl(url); }
              }
            });
          }
        });
      } catch (e) {}

      try {
        ECS.registerComponent({
          name: 'video-global-behavior',
          add: (world) => {
            createFloatingButton(world);
            world.events.addListener(world.events.globalId, ECS.input.UI_CLICK, (event) => {
              if (event?.target) {
                const obj = world.three?.entityToObject?.get(event.target);
                const objName = (obj?.name || '').toLowerCase();
                if (objName.includes('button') || objName.includes('icon') || objName.includes('text') || objName.includes('plane')) {
                  toggleVideo(world);
                }
              }
            });
            window.addEventListener('xrimagelost', () => { if (isVideoPlaying) pauseVideo(world); });
          }
        });
      } catch (e) {}

      try {
        ECS.registerComponent({
          name: 'character-animation-global-behavior',
          add: (world) => {
            world.events.addListener(world.events.globalId, ECS.input.SCREEN_TOUCH_START, (event) => {
              const threeState = world.three;
              if (!threeState?.entityToObject) return;
              let avatarEid = null;
              for (const [eid, obj] of threeState.entityToObject.entries()) {
                const objName = (obj?.name || '').toLowerCase();
                if (objName.includes('animaciones') || objName.includes('avatar')) { avatarEid = eid; break; }
              }
              if (avatarEid) { toggleAvatarAnimation(world, avatarEid); }
            });
          }
        });
      } catch (e) {}

      // --- 6. SCENE GRAPH INITIALIZATION ---
      try {
        const sceneData = JSON.parse('{"objects":{"47699d9e-18a5-4f88-a4f9-b8be92e8f74a":{"components":"","geometry":null,"id":"47699d9e-18a5-4f88-a4f9-b8be92e8f74a","light":"@{type=ambient}","material":null,"name":"Ambient Light","position":"10 5 5","rotation":"0 0 0 1","scale":"1 1 1","parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.4038940050501252},"a608ddd9-9379-464d-966f-5d8d8674c83c":{"camera":"@{type=perspective; xr=}","components":"","geometry":null,"id":"a608ddd9-9379-464d-966f-5d8d8674c83c","material":null,"name":"Camera","position":"0.11021234810228797 1.7103830500121502 2.9534682386621958","rotation":"0.00044368872331410124 0.9659425615285845 -0.25875089860082223 0.0016563336561801576","scale":"1 1 1","parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.0308214152219775},"ac1989e3-3b71-49e2-a05f-e682aeb18c36":{"components":"","geometry":null,"id":"ac1989e3-3b71-49e2-a05f-e682aeb18c36","light":"@{intensity=1; type=directional}","material":null,"name":"Directional Light","position":"20 50 10","rotation":"0 0 0 1","scale":"1 1 1","parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.6644431107322474},"75217571-d28a-4d44-9f83-80166d0897ed":{"id":"75217571-d28a-4d44-9f83-80166d0897ed","position":"0 0 0","rotation":"-0.7071067811865475 0 0 0.7071067811865476","scale":"2.6 2.6 2.6","geometry":null,"material":null,"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","components":"@{comp-open-url-global=; comp-video-global=; comp-avatar-global=}","name":"Image Target","imageTarget":"@{name=Tarjeta de Presentacion}","order":5.363991776955565},"e1f2a3b4-5678-90ab-cdef-123456789000":{"id":"e1f2a3b4-5678-90ab-cdef-123456789000","name":"Avatar Shadow","position":"0.007 0.001 0.034","rotation":"-0.7071067811865475 0 0 0.7071067811865476","scale":"0.5 0.5 0.5","geometry":"@{type=plane; width=1.2; height=1.2}","material":"@{type=shadow; color=#000000; opacity=0.4}","parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"","order":2.1},"5dc4dc82-1293-4052-8e31-1f1293ed8a9b":{"id":"5dc4dc82-1293-4052-8e31-1f1293ed8a9b","position":"0.00775452111507066 0.10883949592772793 0.03443241969513731","rotation":"0.700909264299852 0 0 0.7132504491541805","scale":"0.38461538461538514 0.38461538461538564 0.38461538461538564","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{avatar-anim-001=}","gltfModel":"@{src=; animationClip=mixamo.com; loop=True; collider=True}","name":"Animaciones.glb","order":2.295440257932817},"a1ff5de6-a5fc-4ac6-9bb4-0b39fbf3f062":{"id":"a1ff5de6-a5fc-4ac6-9bb4-0b39fbf3f062","position":"0 0.9144730089247948 0.5008703406106403","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"1.8461538461538463 1.1538461538461537 1.1538461538461535","geometry":"@{type=plane; width=1; height=1}","material":"@{type=basic; color=#FFFFFF; textureSrc=}","videoControls":"@{volume=0.5}","parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{video-ctrl-001=}","name":"Video Player","order":11.062780065811888},"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc":{"id":"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc","position":"0 -0.28556072730335924 1.2290907895080168","rotation":"0 0 0 1","scale":"0.19999999999999993 0.33333333333333304 0.33333333333333315","geometry":null,"material":null,"parentId":"a1ff5de6-a5fc-4ac6-9bb4-0b39fbf3f062","components":"","ui":"@{type=3d; width=100; height=36; background=#bd0000; borderRadius=18; flexDirection=row; backgroundOpacity=1; padding=10; gap=6; alignItems=center; justifyContent=center}","name":"Play/Pause Button","order":8.636582721891168},"2b9c3b56-c409-42ab-bf6a-76466c75e94c":{"id":"2b9c3b56-c409-42ab-bf6a-76466c75e94c","position":"0 0 0","rotation":"0 0 0 1","scale":"1 1 1","geometry":null,"material":null,"parentId":"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc","components":"","name":"Icon","ui":"@{width=0; height=0; backgroundOpacity=0}","order":0.40252499950996284},"632bcc1e-c66c-4589-b31e-7009e486a464":{"id":"632bcc1e-c66c-4589-b31e-7009e486a464","position":"0 0 0","rotation":"0 0 0 1","scale":"1 1 1","geometry":null,"material":null,"parentId":"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc","components":"","name":"Text","ui":"@{width=80; height=14; text=â–¶ Play; color=#ffffff; fontSize=16}","order":1.3001820905999628},"c1a2b3d4-e5f6-7890-abcd-ef1234567001":{"id":"c1a2b3d4-e5f6-7890-abcd-ef1234567001","position":"-0.39268883023181095 -0.03927398651647238 0.13712149222708367","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"0.7846153846153843 0.7846153846153843 0.7846153846153843","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{link-opener-wa=; comp-floating-wa=}","name":"WhatsApp Link","ui":"@{type=3d; width=100; height=30; background=#25D366; borderRadius=15; backgroundOpacity=1; text=WhatsApp; color=#ffffff; fontSize=12; alignItems=center; justifyContent=center; image=}","order":19.011843134639424},"c1a2b3d4-e5f6-7890-abcd-ef1234567002":{"id":"c1a2b3d4-e5f6-7890-abcd-ef1234567002","position":"-0.36179993794484655 -0.3796205329680996 0.21414228871021912","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"0.6846153846153844 0.6846153846153844 0.6846153846153844","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{link-opener-pf=; comp-floating-pf=}","name":"Portfolio Link","ui":"@{type=3d; width=100; height=30; background=#3B82F6; borderRadius=15; backgroundOpacity=1; text=Portfolio; color=#ffffff; fontSize=12; alignItems=center; justifyContent=center; image=}","order":22.730054866147196},"c1a2b3d4-e5f6-7890-abcd-ef1234567003":{"id":"c1a2b3d4-e5f6-7890-abcd-ef1234567003","position":"0.3619230769230767 -0.38007086204489493 0.12535460700841294","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"0.48461538461538445 0.48461538461538445 0.48461538461538445","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{link-opener-ig=; comp-floating-ig=}","name":"Instagram Link","ui":"@{type=3d; width=100; height=30; background=#E1306C; borderRadius=15; backgroundOpacity=1; text=Instagram; color=#ffffff; fontSize=12; alignItems=center; justifyContent=center; image=}","order":20.9084820881096}},"spaces":{"88453035-dc0f-486d-868a-8ff7c2fda864":{"id":"88453035-dc0f-486d-868a-8ff7c2fda864","name":"Default Space","activeCamera":"a608ddd9-9379-464d-966f-5d8d8674c83c"}},"entrySpaceId":"88453035-dc0f-486d-868a-8ff7c2fda864"}');
        delete sceneData.history;
        delete sceneData.historyVersion;
        ECS.application.init(sceneData);
      } catch (e) {
        console.error("[8thWall] Error al inicializar ECS application:", e);
      }
    };

    if (window.ecs && window.ecs.application) {
      startApp();
    } else {
      window.addEventListener("ecsloaded", startApp);
      window.addEventListener("xrloaded", () => {
        setTimeout(startApp, 100);
      });
      // Fallback
      if (document.readyState === "complete") {
        setTimeout(startApp, 200);
      } else {
        window.addEventListener("load", () => setTimeout(startApp, 200));
      }
    }
  })();
})();