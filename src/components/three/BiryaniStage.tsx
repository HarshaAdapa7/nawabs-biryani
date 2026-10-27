import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { CameraSceneId } from '../../types/restaurant';
import { MEDIA_ASSETS } from '../../data/menuData';
import { buildCulinarySceneAssets } from './proceduralModels';

interface BiryaniStageProps {
  scrollProgressRef: React.MutableRefObject<number>;
  manualSceneOverride: CameraSceneId | null;
  onSelectScene: (scene: CameraSceneId | null) => void;
}

// Module-level reusable math objects (Zero GC in render loop)
const _camTargetPos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.1, 0);
const _dummyObj = new THREE.Object3D();

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const BiryaniStage: React.FC<BiryaniStageProps> = ({
  scrollProgressRef,
  manualSceneOverride,
  onSelectScene,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const manualOverrideRef = useRef<CameraSceneId | null>(manualSceneOverride);
  const pausedMotionRef = useRef<boolean>(false);

  const [webglFailed, setWebglFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  manualOverrideRef.current = manualSceneOverride;
  pausedMotionRef.current = motionPaused;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || !canvasMountRef.current) return;

    const container = canvasMountRef.current;
    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#121212', 0.055);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      60
    );
    camera.position.set(0, 1.35, 5.4);

    // Studio Environment Reflection (RoomEnvironment on all devices)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Balanced Golden-Hour 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#475569', '#2E1116', 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFCA7A', 2.4);
    keyLight.position.set(4.5, 6.2, 4.2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      const d = 3.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 18;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(
      '#F4A300',
      3.1,
      20,
      Math.PI / 4,
      0.65,
      1.6
    );
    rimLight.position.set(-4.2, 3.8, -3.6);
    scene.add(rimLight);

    const maroonFill = new THREE.PointLight('#9F1239', 1.4, 14, 1.8);
    maroonFill.position.set(-3.2, -1.2, 2.8);
    scene.add(maroonFill);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const areaLight = new THREE.RectAreaLight('#FFE4B5', 2.6, 3.2, 2.2);
      areaLight.position.set(2.6, 2.8, 3.2);
      areaLight.lookAt(0, 0, 0);
      scene.add(areaLight);
    }

    // Build Procedural Handi, Spices, Plated Thali & Beacon
    const rig = buildCulinarySceneAssets(renderer);
    scene.add(rig.rootGroup);

    const updateResponsiveOffsets = () => {
      const isDesktop = window.innerWidth >= 1024;
      rig.handiGroup.position.x = isDesktop ? 1.55 : 0.0;
      rig.handiGroup.position.y = isDesktop ? -0.08 : -0.35;
      rig.platedGroup.position.x = isDesktop ? 1.35 : 0.0;
      rig.beaconGroup.position.x = isDesktop ? 1.35 : 0.0;
    };
    updateResponsiveOffsets();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer & Gyroscope Parallax Tracking
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointer.y = -(e.clientY / Math.max(window.innerHeight, 1)) * 2 + 1;
    };
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        pointer.x = THREE.MathUtils.clamp(e.gamma / 35, -1, 1);
        pointer.y = THREE.MathUtils.clamp((e.beta - 45) / 35, -1, 1);
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('deviceorientation', onDeviceOrientation, {
      passive: true,
    });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateResponsiveOffsets();
    };
    window.addEventListener('resize', onResize);

    // Keyboard shortcut 'H' to toggle bottom 3D HUD dock
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName || ''
        )
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Animation & Software-WebGL Paced Loop
    let frameId = 0;
    let timerId = 0;
    let unmounted = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        timerId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    }

    function computeCameraGoal(progress: number, override: CameraSceneId | null) {
      const isDesktop = window.innerWidth >= 1024;
      const anchorX = isDesktop ? 1.45 : 0.0;

      let effectiveProgress = progress;
      if (override === 'handi') effectiveProgress = 0.05;
      else if (override === 'ingredients') effectiveProgress = 0.36;
      else if (override === 'plated') effectiveProgress = 0.66;
      else if (override === 'location') effectiveProgress = 0.94;

      if (effectiveProgress < 0.26) {
        // Scene 1: Hero Sealed Dum Handi
        const t = effectiveProgress / 0.26;
        _camTargetPos.set(
          isDesktop ? 0.35 : 0.0,
          THREE.MathUtils.lerp(1.15, 1.45, t),
          THREE.MathUtils.lerp(5.25, 4.65, t)
        );
        _camLookTarget.set(
          isDesktop ? 0.85 : 0.0,
          THREE.MathUtils.lerp(0.05, 0.25, t),
          0
        );
      } else if (effectiveProgress < 0.56) {
        // Scene 2: Lid Lifted — Whole Spices, Saffron & Basmati Inspection
        const t = (effectiveProgress - 0.26) / 0.3;
        _camTargetPos.set(
          isDesktop ? 0.65 : 0.15,
          THREE.MathUtils.lerp(1.55, 2.05, t),
          THREE.MathUtils.lerp(4.4, 3.85, t)
        );
        _camLookTarget.set(anchorX * 0.75, 0.55, 0);
      } else if (effectiveProgress < 0.84) {
        // Scene 3: Royal Plated Dastarkhwan Thali
        const t = (effectiveProgress - 0.56) / 0.28;
        _camTargetPos.set(
          isDesktop ? 0.45 : 0.0,
          THREE.MathUtils.lerp(-2.5, -2.85, t),
          THREE.MathUtils.lerp(4.35, 3.95, t)
        );
        _camLookTarget.set(anchorX * 0.72, -4.45, 0);
      } else {
        // Scene 4: Madhurawada NH-16 Location Beacon
        _camTargetPos.set(isDesktop ? 0.5 : 0.0, -7.2, 4.4);
        _camLookTarget.set(anchorX * 0.72, -8.85, 0);
      }

      return effectiveProgress;
    }

    function tick() {
      if (unmounted) return;
      const rawDelta = clock.getDelta();
      const dt = Math.min(rawDelta, 0.08);
      const elapsed = clock.getElapsedTime();
      const isPaused = pausedMotionRef.current;

      const effProg = computeCameraGoal(
        scrollProgressRef.current,
        manualOverrideRef.current
      );

      // Smoothly damp camera position & lookAt target
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        _camTargetPos.x + pointer.x * 0.28,
        4.2,
        dt
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        _camTargetPos.y + pointer.y * 0.2,
        4.2,
        dt
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        _camTargetPos.z,
        4.2,
        dt
      );

      _currentLookAt.x = THREE.MathUtils.damp(
        _currentLookAt.x,
        _camLookTarget.x,
        5.0,
        dt
      );
      _currentLookAt.y = THREE.MathUtils.damp(
        _currentLookAt.y,
        _camLookTarget.y,
        5.0,
        dt
      );
      _currentLookAt.z = THREE.MathUtils.damp(
        _currentLookAt.z,
        _camLookTarget.z,
        5.0,
        dt
      );
      camera.lookAt(_currentLookAt);

      // Lid open factor peaks during Scene 2 (Ingredients reveal)
      const lidOpenGoal =
        effProg >= 0.22 && effProg <= 0.58 ? 1.0 : 0.12;
      const targetLidY = THREE.MathUtils.lerp(0.84, 1.92, lidOpenGoal);
      const targetLidRotZ = THREE.MathUtils.lerp(-0.12, -0.52, lidOpenGoal);
      const targetLidX = THREE.MathUtils.lerp(0.1, 0.52, lidOpenGoal);

      rig.lidGroup.position.y = THREE.MathUtils.damp(
        rig.lidGroup.position.y,
        targetLidY,
        4.5,
        dt
      );
      rig.lidGroup.position.x = THREE.MathUtils.damp(
        rig.lidGroup.position.x,
        targetLidX,
        4.5,
        dt
      );
      rig.lidGroup.rotation.z = THREE.MathUtils.damp(
        rig.lidGroup.rotation.z,
        targetLidRotZ,
        4.5,
        dt
      );

      if (!isPaused) {
        // Slow royal rotation + subtle cursor tilt
        rig.handiGroup.rotation.y += dt * 0.24;
        rig.handiGroup.rotation.x = THREE.MathUtils.damp(
          rig.handiGroup.rotation.x,
          pointer.y * 0.12,
          4.0,
          dt
        );
        rig.handiGroup.rotation.z = THREE.MathUtils.damp(
          rig.handiGroup.rotation.z,
          -pointer.x * 0.12,
          4.0,
          dt
        );

        rig.spicesOrbitGroup.rotation.y -= dt * 0.38;
        rig.platedGroup.rotation.y += dt * 0.26;
        rig.beaconGroup.rotation.y += dt * 0.3;

        // Update floating Basmati rice InstancedMesh
        const seeds = rig.floatingRiceSeeds;
        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i];
          const a = s.angle + elapsed * s.speed;
          const expand = lidOpenGoal > 0.5 ? 1.18 : 1.0;
          _dummyObj.position.set(
            Math.cos(a) * s.radius * expand,
            s.yBase + Math.sin(elapsed * 0.9 + i) * 0.18,
            Math.sin(a) * s.radius * expand
          );
          _dummyObj.rotation.set(
            s.tiltX + elapsed * 0.4,
            a,
            s.tiltZ + elapsed * 0.25
          );
          _dummyObj.scale.setScalar(s.scale);
          _dummyObj.updateMatrix();
          rig.floatingRiceMesh.setMatrixAt(i, _dummyObj.matrix);
        }
        rig.floatingRiceMesh.instanceMatrix.needsUpdate = true;

        // Rising golden steam plumes
        for (let i = 0; i < rig.steamSprites.length; i++) {
          const st = rig.steamSprites[i];
          const cycle = (st.phase + elapsed * st.speed) % 1;
          st.sprite.position.set(
            Math.sin(elapsed * 0.8 + i) * 0.18 + st.driftX * cycle,
            0.78 + cycle * 2.15,
            Math.cos(elapsed * 0.7 + i) * 0.18 + st.driftZ * cycle
          );
          const scale = 0.55 + cycle * 1.15;
          st.sprite.scale.set(scale, scale * 1.25, 1);
          const alpha =
            cycle < 0.25
              ? (cycle / 0.25) * 0.34
              : (1 - (cycle - 0.25) / 0.75) * 0.34;
          (st.sprite.material as THREE.SpriteMaterial).opacity = Math.max(
            0,
            alpha
          );
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      unmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost
      );
      rig.disposables.forEach((d) => d.dispose());
      envTarget.dispose();
      renderer.dispose();
    };
  }, [reducedMotion, scrollProgressRef]);

  // Graceful fallback on WebGL failure or prefers-reduced-motion
  if (webglFailed || reducedMotion) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#121212]"
      >
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full opacity-35 bg-[radial-gradient(circle,#5A0F1B_0%,transparent_70%)]" />
        <div className="hidden lg:flex items-center justify-end h-full max-w-7xl mx-auto px-8">
          <div className="relative w-[440px] aspect-[4/3] rounded-2xl overflow-hidden border border-[#FFF4E0]/10 shadow-2xl">
            <img
              src={MEDIA_ASSETS.muttonDumImg}
              alt="Royal Copper Handi Mutton Dum Biryani"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  const sceneButtons: { id: CameraSceneId | null; label: string }[] = [
    { id: null, label: 'Scroll Sync' },
    { id: 'handi', label: '01. Handi' },
    { id: 'ingredients', label: '02. Spices' },
    { id: 'plated', label: '03. Plated' },
    { id: 'location', label: '04. Beacon' },
  ];

  return (
    <>
      {/* Dedicated Isolated WebGL Canvas Mount (Zero backdrop-filter over canvas) */}
      <div
        ref={canvasMountRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Ambient radial vignette so left-aligned editorial typography achieves WCAG AA contrast */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(18,18,18,0.92)_0%,rgba(18,18,18,0.68)_46%,rgba(18,18,18,0.28)_100%)]"
      />

      {/* Unified Collapsible Bottom 3D Camera Dock (Desktop, Zero Viewport Occlusion, No backdrop-filter) */}
      <div className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex-col items-center pointer-events-auto">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          aria-expanded={!dockCollapsed}
          className="px-3 py-1 text-[11px] font-medium text-[#C9BBA6] hover:text-[#FFF4E0] bg-[#1A1615] border border-[#FFF4E0]/12 border-b-0 rounded-t-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {dockCollapsed ? '▴ Show 3D Camera' : '▾ Hide 3D Camera (H)'}
        </button>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181413] border border-[#FFF4E0]/12 shadow-xl transition-all duration-200 ${
            dockCollapsed
              ? 'opacity-0 translate-y-6 pointer-events-none h-0 py-0 overflow-hidden border-0'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {sceneButtons.map((btn) => {
            const active = manualSceneOverride === btn.id;
            return (
              <button
                key={btn.label}
                type="button"
                onClick={() => onSelectScene(btn.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#F4A300] text-[#121212]'
                    : 'text-[#C9BBA6] hover:text-[#FFF4E0] hover:bg-[#251E1C]'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
          <span aria-hidden="true" className="text-[#FFF4E0]/15 px-0.5">
            |
          </span>
          <button
            type="button"
            onClick={() => setMotionPaused((p) => !p)}
            className="px-2.5 py-1 text-xs font-medium text-[#C9BBA6] hover:text-[#FFF4E0] rounded hover:bg-[#251E1C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {motionPaused ? 'Resume 3D' : 'Pause 3D'}
          </button>
        </div>
      </div>
    </>
  );
};
