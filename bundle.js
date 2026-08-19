(()=>{
  var modules = {
    574(module, exports, require) {
      const configureTargets = () => {
        if (window.XR8 && window.XR8.XrController) {
          window.XR8.XrController.configure({
            imageTargetData: [require(226), require(227), require(228), require(229)]
          });
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
    },
    227(module) {
      "use strict";
      module.exports = JSON.parse('{"type":"PLANAR","properties":{"top":0,"left":0,"width":1086,"height":1448,"isRotated":false,"originalWidth":1086,"originalHeight":1448},"imagePath":"image-targets/Shelter_luminance.png","metadata":null,"name":"Shelter","resources":{"originalImage":"Shelter_original.png","croppedImage":"Shelter_cropped.png","thumbnailImage":"Shelter_thumbnail.png","luminanceImage":"Shelter_luminance.png"},"created":1787101448151,"updated":1787101448151}');
    },
    228(module) {
      "use strict";
      module.exports = JSON.parse('{"type":"PLANAR","properties":{"top":0,"left":57,"width":511,"height":682,"isRotated":false,"originalWidth":627,"originalHeight":682},"imagePath":"image-targets/xd_luminance.jpg","metadata":null,"name":"xd","resources":{"originalImage":"xd_original.jpg","croppedImage":"xd_cropped.jpg","thumbnailImage":"xd_thumbnail.jpg","luminanceImage":"xd_luminance.jpg"},"created":1785891200202,"updated":1785891516488}');
    },
    229(module) {
      "use strict";
      module.exports = JSON.parse('{"type":"PLANAR","properties":{"top":17,"left":0,"width":484,"height":645,"isRotated":false,"originalWidth":484,"originalHeight":680},"imagePath":"image-targets/xd2_luminance.jpg","metadata":null,"name":"xd2","resources":{"originalImage":"xd2_original.jpg","croppedImage":"xd2_cropped.jpg","thumbnailImage":"xd2_thumbnail.jpg","luminanceImage":"xd2_luminance.jpg"},"created":1785890863017,"updated":1785891520472}');
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
      console.error("Error loading targets module:", e);
    }

    const ECS = window.ecs;
    if (!ECS) {
      console.error("8th Wall ECS not found on window.ecs");
      return;
    }

    // =========================================================================
    // 1. REDIRECCIÃ“N INDEPENDIENTE DE REDES SOCIALES (Estilo Samuel)
    // =========================================================================
    const SOCIAL_LINKS = {
      instagram: "https://www.instagram.com/deavidplata18?igsh=cWIxZDg3ajExdjU3",
      web: "https://dplata777.github.io/portafolio-/",
      whatsapp: "https://wa.me/573104812846"
    };

    let lastUrlOpenTime = 0;

    function navigateToUrl(url) {
      const now = Date.now();
      if (now - lastUrlOpenTime < 600) return;
      lastUrlOpenTime = now;
      console.log("[open-url-button] Redirigiendo a:", url);

      try {
        const win = window.open(url, "_blank", "noopener,noreferrer");
        if (!win || win.closed || typeof win.closed === "undefined") {
          window.location.href = url;
        }
      } catch (err) {
        window.location.href = url;
      }
    }

    function getUrlFromIdentifier(identifierStr, customUrl) {
      if (customUrl && customUrl.trim()) return customUrl.trim();
      const str = (identifierStr || "").toLowerCase();

      if (str.includes("instagram") || str.includes("insta") || str.includes("ig")) {
        return SOCIAL_LINKS.instagram;
      }
      if (str.includes("whatsapp") || str.includes("whats") || str.includes("wa.me") || str.includes("wsp")) {
        return SOCIAL_LINKS.whatsapp;
      }
      if (str.includes("portfolio") || str.includes("portafolio") || str.includes("web")) {
        return SOCIAL_LINKS.web;
      }
      return null;
    }

    function pulseObjectScale(obj) {
      try {
        if (!obj || !obj.scale) return;
        const orig = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
        obj.scale.set(orig.x * 1.3, orig.y * 1.3, orig.z * 1.3);
        setTimeout(() => {
          if (obj && obj.scale) obj.scale.set(orig.x, orig.y, orig.z);
        }, 220);
      } catch (e) {}
    }

    function handleTouchOnIcons(world, clientX, clientY, targetEid) {
      const threeState = world.three;
      if (!threeState) return;

      const camera = threeState.activeCamera;
      const renderer = threeState.renderer;
      const canvas = renderer?.domElement || document.querySelector("canvas");
      if (!camera || !canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const entityToObject = threeState.entityToObject;
      if (!entityToObject) return;

      const logoObjects = [];
      for (const [eid, obj] of entityToObject.entries()) {
        if (!obj || obj.visible === false) continue;
        let gltfSrc = "";
        try {
          if (ECS.GltfModel && ECS.GltfModel.has(world, eid)) {
            const c = ECS.GltfModel.get(world, eid);
            gltfSrc = c.src || c.url || "";
          }
        } catch (e) {}
        const fullId = ${obj.name || ""} .toLowerCase();
        if (
          !fullId.includes("plane") &&
          !fullId.includes("animaciones") &&
          !fullId.includes("avatar") &&
          !fullId.includes("camera")
        ) {
          const url = getUrlFromIdentifier(fullId);
          if (url) {
            logoObjects.push({ eid, obj, url });
          }
        }
      }

      try {
        const RaycasterCtor = window.THREE?.Raycaster || camera.raycaster?.constructor;
        if (RaycasterCtor) {
          const raycaster = new RaycasterCtor();
          const mouse = {
            x: ((clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
            y: -((clientY - canvasRect.top) / canvasRect.height) * 2 + 1
          };
          raycaster.setFromCamera(mouse, camera);

          const meshesToTest = [];
          const meshToLogoMap = new Map();

          for (const item of logoObjects) {
            item.obj.traverse((child) => {
              if (child.isMesh) {
                meshesToTest.push(child);
                meshToLogoMap.set(child, item);
              }
            });
          }

          const intersects = raycaster.intersectObjects(meshesToTest, false);
          if (intersects && intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const matchedLogo = meshToLogoMap.get(hitMesh);
            if (matchedLogo) {
              console.log([open-url-button] Raycast 3D exacto: );
              pulseObjectScale(matchedLogo.obj);
              navigateToUrl(matchedLogo.url);
              return;
            }
          }
        }
      } catch (rayErr) {}

      let closestMatch = null;
      let minDistance = 120;

      for (const item of logoObjects) {
        const obj = item.obj;
        let objDist = Infinity;

        try {
          const Vector3Class = camera.position?.constructor;
          if (Vector3Class && camera.project) {
            const worldPos = new Vector3Class();
            if (obj.getWorldPosition) obj.getWorldPosition(worldPos);
            else if (obj.matrixWorld) worldPos.setFromMatrixPosition(obj.matrixWorld);

            const screenPoint = worldPos.clone();
            camera.project(screenPoint);

            if (screenPoint.z > -1 && screenPoint.z < 1) {
              const screenX = ((screenPoint.x + 1) / 2) * canvasRect.width + canvasRect.left;
              const screenY = ((-screenPoint.y + 1) / 2) * canvasRect.height + canvasRect.top;
              objDist = Math.hypot(screenX - clientX, screenY - clientY);
            }
          }
        } catch (e) {}

        if (objDist < minDistance) {
          minDistance = objDist;
          closestMatch = { obj, url: item.url, dist: objDist };
        }
      }

      if (closestMatch && closestMatch.url) {
        console.log([open-url-button] Proximidad 2D:  (px));
        pulseObjectScale(closestMatch.obj);
        navigateToUrl(closestMatch.url);
      }
    }

    try {
      ECS.registerComponent({
        name: "open-url-button",
        schema: { url: ECS.string, target: ECS.string },
        schemaDefaults: { url: "", target: "_blank" },
        add: (world, component) => {
          world.events.addListener(component.eid, ECS.input.UI_CLICK, () => {
            const obj = world.three?.entityToObject?.get(component.eid);
            const url = getUrlFromIdentifier(obj?.name || "", component.schema.url);
            if (url) {
              if (obj) pulseObjectScale(obj);
              navigateToUrl(url);
            }
          });
        }
      });

      ECS.registerComponent({
        name: "link-opener",
        schema: { url: ECS.string },
        schemaDefaults: { url: "" },
        add: (world, component) => {
          world.events.addListener(component.eid, ECS.input.UI_CLICK, () => {
            const obj = world.three?.entityToObject?.get(component.eid);
            const url = getUrlFromIdentifier(obj?.name || "", component.schema.url);
            if (url) {
              if (obj) pulseObjectScale(obj);
              navigateToUrl(url);
            }
          });
        }
      });

      let isGlobalAttached = false;
      ECS.registerComponent({
        name: "open-url-global-behavior",
        add: (world) => {
          if (isGlobalAttached) return;
          isGlobalAttached = true;

          world.events.addListener(world.events.globalId, ECS.input.SCREEN_TOUCH_START, (event) => {
            if (event?.position) {
              handleTouchOnIcons(world, event.position.x, event.position.y, event.target);
            }
          });

          const canvas = world.three?.renderer?.domElement || document.querySelector("canvas") || window;
          canvas.addEventListener("touchend", (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
              handleTouchOnIcons(world, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
          }, { passive: true });

          canvas.addEventListener("click", (e) => {
            handleTouchOnIcons(world, e.clientX, e.clientY);
          });
        }
      });
    } catch (e) {
      console.error("Error registering open-url-button:", e);
    }

    // =========================================================================
    // 2. CONTROL DEL VIDEO Y BOTÃ“N FLOTANTE (Estilo Samuel)
    // =========================================================================
    let lastVideoToggleTime = 0;
    let isVideoPlaying = false;
    let uiFloatingBtn = null;

    function updateUiFloatingBtn(playing) {
      if (!uiFloatingBtn) return;
      if (playing) {
        uiFloatingBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>';
        uiFloatingBtn.style.backgroundColor = "rgba(15, 23, 42, 0.85)";
        uiFloatingBtn.setAttribute("title", "Pausar Video");
      } else {
        uiFloatingBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 3px;"><polygon points="5,3 19,12 5,21" /></svg>';
        uiFloatingBtn.style.backgroundColor = "rgba(239, 68, 68, 0.85)";
        uiFloatingBtn.setAttribute("title", "Reproducir Video");
      }
    }

    function findVideoElement(world) {
      const threeState = world.three;
      if (threeState?.entityToObject) {
        for (const [_, obj] of threeState.entityToObject.entries()) {
          let found = null;
          obj.traverse((child) => {
            if (child.material?.map?.image instanceof HTMLVideoElement) {
              found = child.material.map.image;
            }
          });
          if (found) return found;
        }
      }
      const videos = Array.from(document.querySelectorAll("video"));
      const matched = videos.find((v) => {
        const s = v.src || v.querySelector("source")?.src || "";
        return s.includes("Video_RV") || s.includes("video") || s.includes(".mp4");
      });
      return matched || videos[0] || null;
    }

    function findVideoPlaneEid(world) {
      const threeState = world.three;
      if (!threeState?.entityToObject) return null;
      const VideoControls = ECS.VideoControls;
      for (const [eid, obj] of threeState.entityToObject.entries()) {
        const objName = (obj?.name || "").toLowerCase();
        if (objName.includes("plane") || objName.includes("video") || (VideoControls && VideoControls.has(world, eid))) {
          return eid;
        }
      }
      return null;
    }

    function playVideo(world) {
      const planeEid = findVideoPlaneEid(world);
      const VideoControls = ECS.VideoControls;
      if (planeEid && VideoControls && VideoControls.has(world, planeEid)) {
        VideoControls.mutate(world, planeEid, (cursor) => {
          cursor.paused = false;
        });
      }

      const vid = findVideoElement(world);
      if (vid) {
        vid.muted = false;
        vid.play().catch(() => {
          vid.muted = true;
          vid.play().then(() => {
            const unlockAudio = () => {
              vid.muted = false;
              window.removeEventListener("touchstart", unlockAudio);
              window.removeEventListener("click", unlockAudio);
            };
            window.addEventListener("touchstart", unlockAudio, { once: true });
            window.addEventListener("click", unlockAudio, { once: true });
          });
        });
      }

      isVideoPlaying = true;
      updateUiFloatingBtn(true);
    }

    function pauseVideo(world) {
      const planeEid = findVideoPlaneEid(world);
      const VideoControls = ECS.VideoControls;
      if (planeEid && VideoControls && VideoControls.has(world, planeEid)) {
        VideoControls.mutate(world, planeEid, (cursor) => {
          cursor.paused = true;
        });
      }

      const vid = findVideoElement(world);
      if (vid) {
        vid.pause();
      }

      isVideoPlaying = false;
      updateUiFloatingBtn(false);
    }

    function toggleVideo(world) {
      const now = Date.now();
      if (now - lastVideoToggleTime < 400) return;
      lastVideoToggleTime = now;

      if (isVideoPlaying) {
        pauseVideo(world);
      } else {
        playVideo(world);
      }
    }

    function createFloatingButton(world) {
      if (document.getElementById("video-control-toggle-btn")) {
        uiFloatingBtn = document.getElementById("video-control-toggle-btn");
        return;
      }

      uiFloatingBtn = document.createElement("button");
      uiFloatingBtn.id = "video-control-toggle-btn";
      uiFloatingBtn.setAttribute("aria-label", "Reproducir o Pausar Video");

      Object.assign(uiFloatingBtn.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "rgba(239, 68, 68, 0.85)",
        backdropFilter: "blur(8px)",
        webkitBackdropFilter: "blur(8px)",
        border: "2px solid rgba(255, 255, 255, 0.4)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        color: "#FFFFFF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999",
        outline: "none",
        transition: "transform 0.15s ease, background-color 0.2s ease",
        userSelect: "none",
        webkitUserSelect: "none",
        touchAction: "manipulation"
      });

      updateUiFloatingBtn(false);

      uiFloatingBtn.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        if (uiFloatingBtn) uiFloatingBtn.style.transform = "scale(0.92)";
      });

      const resetScale = () => {
        if (uiFloatingBtn) uiFloatingBtn.style.transform = "scale(1)";
      };
      uiFloatingBtn.addEventListener("pointerup", resetScale);
      uiFloatingBtn.addEventListener("pointercancel", resetScale);

      uiFloatingBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleVideo(world);
      });

      document.body.appendChild(uiFloatingBtn);
    }

    try {
      ECS.registerComponent({
        name: "video-control",
        schema: { buttonEntity: ECS.eid, textEntity: ECS.eid, imageTargetEntity: ECS.eid },
        add: (world, component) => {
          world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleVideo(world));
          world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, () => toggleVideo(world));
          if (component.schema.imageTargetEntity) {
            world.events.addListener(component.schema.imageTargetEntity, ECS.events.REALITY_IMAGE_FOUND, () => playVideo(world));
            world.events.addListener(component.schema.imageTargetEntity, ECS.events.REALITY_IMAGE_LOST, () => pauseVideo(world));
          }
        }
      });

      ECS.registerComponent({
        name: "video-toggle-button",
        add: (world, component) => {
          world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleVideo(world));
          world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, () => toggleVideo(world));
        }
      });

      let isVideoBehaviorAttached = false;
      ECS.registerComponent({
        name: "video-global-behavior",
        add: (world) => {
          if (isVideoBehaviorAttached) return;
          isVideoBehaviorAttached = true;

          createFloatingButton(world);

          setTimeout(() => {
            pauseVideo(world);
          }, 300);

          world.events.addListener(world.events.globalId, ECS.input.UI_CLICK, (event) => {
            if (event?.target) {
              const obj = world.three?.entityToObject?.get(event.target);
              const objName = (obj?.name || "").toLowerCase();
              if (
                objName.includes("button") ||
                objName.includes("icon") ||
                objName.includes("text") ||
                objName.includes("plane")
              ) {
                toggleVideo(world);
              }
            }
          });

          window.addEventListener("xrimagelost", () => {
            if (isVideoPlaying) {
              pauseVideo(world);
            }
          });
        }
      });
    } catch (e) {
      console.error("Error registering video-toggle-button:", e);
    }

    // =========================================================================
    // 3. CAMBIO DE ANIMACIÃ“N DEL PERSONAJE (Estilo Samuel)
    // =========================================================================
    let lastAvatarToggleTime = 0;
    const CLIPS = ["mixamo.com", "mixamo.com.001"];
    let currentClipIndex = 0;

    function toggleCharacterAnimation(world, eid) {
      const now = Date.now();
      if (now - lastAvatarToggleTime < 450) return;
      lastAvatarToggleTime = now;

      currentClipIndex = (currentClipIndex + 1) % CLIPS.length;
      const nextClip = CLIPS[currentClipIndex];
      console.log([character-animation-toggle] Cambiando animacion a: );

      try {
        if (ECS.GltfModel && ECS.GltfModel.has(world, eid)) {
          ECS.GltfModel.mutate(world, eid, (cursor) => {
            cursor.animationClip = nextClip;
            cursor.loop = true;
            cursor.paused = false;
          });
        }
      } catch (err) {
        console.error("[character-animation-toggle] Error al mutar animacion:", err);
      }
    }

    try {
      ECS.registerComponent({
        name: "avatar-animation",
        schema: { animClip1: ECS.string, animClip2: ECS.string },
        schemaDefaults: { animClip1: "mixamo.com", animClip2: "mixamo.com.001" },
        add: (world, component) => {
          world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, () => toggleCharacterAnimation(world, component.eid));
          world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleCharacterAnimation(world, component.eid));
        }
      });

      ECS.registerComponent({
        name: "AvatarAnimationComponent",
        schema: { clip1: ECS.string, clip2: ECS.string },
        schemaDefaults: { clip1: "mixamo.com", clip2: "mixamo.com.001" },
        add: (world, component) => {
          world.events.addListener(component.eid, ECS.input.SCREEN_TOUCH_START, () => toggleCharacterAnimation(world, component.eid));
          world.events.addListener(component.eid, ECS.input.UI_CLICK, () => toggleCharacterAnimation(world, component.eid));
        }
      });

      let isCharGlobalAttached = false;
      ECS.registerComponent({
        name: "character-animation-global-behavior",
        add: (world) => {
          if (isCharGlobalAttached) return;
          isCharGlobalAttached = true;

          const findAvatarEid = () => {
            const threeState = world.three;
            if (!threeState?.entityToObject) return null;
            for (const [eid, obj] of threeState.entityToObject.entries()) {
              let gltfSrc = "";
              try {
                if (ECS.GltfModel && ECS.GltfModel.has(world, eid)) {
                  const cursor = ECS.GltfModel.get(world, eid);
                  gltfSrc = cursor.src || cursor.url || "";
                }
              } catch (e) {}
              const objName = (obj?.name || "").toLowerCase();
              const fullId = ${objName} .toLowerCase();
              if (fullId.includes("animaciones") || fullId.includes("avatar") || fullId.includes("bailanding")) {
                return eid;
              }
            }
            return null;
          };

          const checkAvatarRaycast = (clientX, clientY, targetEid) => {
            const avatarEid = findAvatarEid();
            if (!avatarEid) return;

            if (targetEid === avatarEid) {
              toggleCharacterAnimation(world, avatarEid);
              return;
            }

            const threeState = world.three;
            if (!threeState) return;
            const avatarObj = threeState.entityToObject?.get(avatarEid);
            const camera = threeState.activeCamera;
            const canvas = threeState.renderer?.domElement || document.querySelector("canvas");
            if (!avatarObj || !camera || !canvas || avatarObj.visible === false) return;

            const canvasRect = canvas.getBoundingClientRect();
            let minDistance = Infinity;

            try {
              const Vector3Class = camera.position?.constructor;
              if (Vector3Class && camera.project) {
                const worldPos = new Vector3Class();
                if (avatarObj.getWorldPosition) avatarObj.getWorldPosition(worldPos);
                else if (avatarObj.matrixWorld) worldPos.setFromMatrixPosition(avatarObj.matrixWorld);

                const points = [
                  worldPos.clone(),
                  worldPos.clone().add(new Vector3Class(0, 0.3, 0)),
                  worldPos.clone().add(new Vector3Class(0, 0.6, 0))
                ];

                for (const pt of points) {
                  camera.project(pt);
                  if (pt.z > -1 && pt.z < 1) {
                    const screenX = ((pt.x + 1) / 2) * canvasRect.width + canvasRect.left;
                    const screenY = ((-pt.y + 1) / 2) * canvasRect.height + canvasRect.top;
                    const dist = Math.hypot(screenX - clientX, screenY - clientY);
                    if (dist < minDistance) minDistance = dist;
                  }
                }
              }
            } catch (e) {}

            if (minDistance <= 130) {
              toggleCharacterAnimation(world, avatarEid);
            }
          };

          world.events.addListener(world.events.globalId, ECS.input.SCREEN_TOUCH_START, (event) => {
            if (event?.position) {
              checkAvatarRaycast(event.position.x, event.position.y, event.target);
            }
          });

          const canvas = world.three?.renderer?.domElement || document.querySelector("canvas") || window;
          canvas.addEventListener("touchend", (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
              checkAvatarRaycast(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
          }, { passive: true });
        }
      });
    } catch (e) {
      console.error("Error registering character-animation-toggle:", e);
    }

    // =========================================================================
    // 4. ANIMACIÃ“N FLOTANTE ESTILO MINECRAFT (floating-item)
    // =========================================================================
    try {
      ECS.registerComponent({
        name: "floating-item",
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

    // =========================================================================
    // 5. INICIALIZACIÃ“N DE LA ESCENA (Estilo Samuel)
    // =========================================================================
    try {
      const sceneData = JSON.parse('{"objects":{"47699d9e-18a5-4f88-a4f9-b8be92e8f74a":{"components":"","geometry":null,"id":"47699d9e-18a5-4f88-a4f9-b8be92e8f74a","light":"@{type=ambient}","material":null,"name":"Ambient Light","position":"10 5 5","rotation":"0 0 0 1","scale":"1 1 1","parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.4038940050501252},"a608ddd9-9379-464d-966f-5d8d8674c83c":{"camera":"@{type=perspective; xr=}","components":"","geometry":null,"id":"a608ddd9-9379-464d-966f-5d8d8674c83c","material":null,"name":"Camera","position":"0.11021234810228797 1.71038305001215 2.9534682386621958","rotation":"0.00019221713819526202 0.9814103103014319 -0.19099243844258743 0.0018558808938609701","scale":"1.0000068056433036 1.3811911619356971 1.4401904974617683","parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":1.0308214152219775},"ac1989e3-3b71-49e2-a05f-e682aeb18c36":{"components":"","geometry":null,"id":"ac1989e3-3b71-49e2-a05f-e682aeb18c36","light":"@{intensity=1; type=directional}","material":null,"name":"Directional Light","position":"20 50 10","rotation":"0 0 0 1","scale":"1 1 1","parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","order":0.6644431107322474},"75217571-d28a-4d44-9f83-80166d0897ed":{"id":"75217571-d28a-4d44-9f83-80166d0897ed","position":"0 0 0","rotation":"-0.7071067811865475 0 0 0.7071067811865476","scale":"2.6 2.6 2.6","geometry":null,"material":null,"parentId":"88453035-dc0f-486d-868a-8ff7c2fda864","components":"@{comp-open-url-global=; comp-video-global=; comp-avatar-global=}","name":"Image Target","imageTarget":"@{name=Tarjeta de Presentacion}","order":5.363991776955565},"e1f2a3b4-5678-90ab-cdef-123456789000":{"id":"e1f2a3b4-5678-90ab-cdef-123456789000","name":"Avatar Shadow","position":"0.007 0.001 0.034","rotation":"-0.7071067811865475 0 0 0.7071067811865476","scale":"0.5 0.5 0.5","geometry":"@{type=plane; width=1.2; height=1.2}","material":"@{type=shadow; color=#000000; opacity=0.4}","parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"","order":2.1},"5dc4dc82-1293-4052-8e31-1f1293ed8a9b":{"id":"5dc4dc82-1293-4052-8e31-1f1293ed8a9b","position":"0.00775452111507066 0.10883949592772793 0.03443241969513731","rotation":"0.700909264299852 0 0 0.7132504491541805","scale":"0.38461538461538514 0.38461538461538564 0.38461538461538564","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{avatar-anim-001=}","gltfModel":"@{src=; animationClip=mixamo.com; loop=True; collider=True}","name":"Animaciones.glb","order":2.295440257932817},"a1ff5de6-a5fc-4ac6-9bb4-0b39fbf3f062":{"id":"a1ff5de6-a5fc-4ac6-9bb4-0b39fbf3f062","position":"0 0.9144730089247948 0.5008703406106403","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"1.8461538461538463 1.1538461538461537 1.1538461538461535","geometry":"@{type=plane; width=1; height=1}","material":"@{type=basic; color=#FFFFFF; textureSrc=}","videoControls":"@{volume=0.5}","parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{video-ctrl-001=}","name":"Video Player","order":11.062780065811888},"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc":{"id":"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc","position":"0 -0.28556072730335924 1.2290907895080168","rotation":"0 0 0 1","scale":"0.19999999999999993 0.33333333333333304 0.33333333333333315","geometry":null,"material":null,"parentId":"a1ff5de6-a5fc-4ac6-9bb4-0b39fbf3f062","components":"","ui":"@{type=3d; width=100; height=36; background=#bd0000; borderRadius=18; flexDirection=row; backgroundOpacity=1; padding=10; gap=6; alignItems=center; justifyContent=center}","name":"Play/Pause Button","order":8.636582721891168},"2b9c3b56-c409-42ab-bf6a-76466c75e94c":{"id":"2b9c3b56-c409-42ab-bf6a-76466c75e94c","position":"0 0 0","rotation":"0 0 0 1","scale":"1 1 1","geometry":null,"material":null,"parentId":"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc","components":"","name":"Icon","ui":"@{width=0; height=0; backgroundOpacity=0}","order":0.40252499950996284},"632bcc1e-c66c-4589-b31e-7009e486a464":{"id":"632bcc1e-c66c-4589-b31e-7009e486a464","position":"0 0 0","rotation":"0 0 0 1","scale":"1 1 1","geometry":null,"material":null,"parentId":"508a2c4f-0c9e-476e-ab0e-a3a7a00515dc","components":"","name":"Text","ui":"@{width=80; height=14; text=â–¶ Play; color=#ffffff; fontSize=16}","order":1.3001820905999628},"c1a2b3d4-e5f6-7890-abcd-ef1234567001":{"id":"c1a2b3d4-e5f6-7890-abcd-ef1234567001","position":"-0.4061136235544293 -0.03927398651647238 0.13712149222708367","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"0.7846153846153843 0.7846153846153843 0.7846153846153843","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{link-opener-wa=; comp-floating-wa=}","name":"WhatsApp Link","ui":"@{type=3d; width=100; height=30; background=#25D366; borderRadius=15; backgroundOpacity=1; text=WhatsApp; color=#ffffff; fontSize=12; alignItems=center; justifyContent=center; image=}","order":19.011843134639424},"c1a2b3d4-e5f6-7890-abcd-ef1234567002":{"id":"c1a2b3d4-e5f6-7890-abcd-ef1234567002","position":"-0.36179993794484655 -0.3796205329680996 0.21414228871021912","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"0.6846153846153844 0.6846153846153844 0.6846153846153844","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{link-opener-pf=; comp-floating-pf=}","name":"Portfolio Link","ui":"@{type=3d; width=100; height=30; background=#3B82F6; borderRadius=15; backgroundOpacity=1; text=Portfolio; color=#ffffff; fontSize=12; alignItems=center; justifyContent=center; image=}","order":22.730054866147196},"c1a2b3d4-e5f6-7890-abcd-ef1234567003":{"id":"c1a2b3d4-e5f6-7890-abcd-ef1234567003","position":"0.3619230769230767 -0.38007086204489493 0.12535460700841294","rotation":"0.7071067811865475 0 0 0.7071067811865476","scale":"0.48461538461538445 0.48461538461538445 0.48461538461538445","geometry":null,"material":null,"parentId":"75217571-d28a-4d44-9f83-80166d0897ed","components":"@{link-opener-ig=; comp-floating-ig=}","name":"Instagram Link","ui":"@{type=3d; width=100; height=30; background=#E1306C; borderRadius=15; backgroundOpacity=1; text=Instagram; color=#ffffff; fontSize=12; alignItems=center; justifyContent=center; image=}","order":20.9084820881096}},"spaces":{"88453035-dc0f-486d-868a-8ff7c2fda864":{"id":"88453035-dc0f-486d-868a-8ff7c2fda864","name":"Default Space","activeCamera":"a608ddd9-9379-464d-966f-5d8d8674c83c"}},"entrySpaceId":"88453035-dc0f-486d-868a-8ff7c2fda864"}');
      delete sceneData.history;
      delete sceneData.historyVersion;
      ECS.application.init(sceneData);
    } catch (e) {
      console.error("Error during ECS application init:", e);
    }
  })();
})();