import * as THREE from 'three';

export interface HandiRigRefs {
  rootGroup: THREE.Group;
  handiGroup: THREE.Group;
  lidGroup: THREE.Group;
  spicesOrbitGroup: THREE.Group;
  floatingRiceMesh: THREE.InstancedMesh;
  floatingRiceSeeds: {
    radius: number;
    angle: number;
    yBase: number;
    speed: number;
    tiltX: number;
    tiltZ: number;
    scale: number;
  }[];
  steamSprites: {
    sprite: THREE.Sprite;
    phase: number;
    speed: number;
    driftX: number;
    driftZ: number;
  }[];
  platedGroup: THREE.Group;
  beaconGroup: THREE.Group;
  beaconRings: THREE.Mesh[];
  disposables: { dispose: () => void }[];
}

function createHammeredBumpTexture(
  disposables: { dispose: () => void }[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 8; y < 256; y += 16) {
      const rowOffset = (y / 16) % 2 === 0 ? 0 : 8;
      for (let x = 8; x < 256; x += 16) {
        const cx = (x + rowOffset) % 256;
        const grad = ctx.createRadialGradient(cx, y, 1, cx, y, 7.5);
        grad.addColorStop(0, '#4a4a4a');
        grad.addColorStop(0.75, '#8a8a8a');
        grad.addColorStop(1, '#b0b0b0');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, y, 7.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 3);
  // Data map stays in linear NoColorSpace
  tex.colorSpace = THREE.NoColorSpace;
  disposables.push(tex);
  return tex;
}

function createBiryaniRiceAlbedo(
  maxAnisotropy: number,
  disposables: { dispose: () => void }[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F6E7C8';
    ctx.fillRect(0, 0, 512, 512);

    const palette = ['#FFF9EC', '#F4A300', '#E07A16', '#FFF3D6', '#C95B12'];
    for (let i = 0; i < 1600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const angle = Math.random() * Math.PI;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = palette[i % palette.length];
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 1.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  disposables.push(tex);
  return tex;
}

function createSteamTexture(
  disposables: { dispose: () => void }[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(255, 244, 224, 0.42)');
    grad.addColorStop(0.45, 'rgba(244, 195, 130, 0.16)');
    grad.addColorStop(1, 'rgba(255, 244, 224, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  disposables.push(tex);
  return tex;
}

function createContactShadowTexture(
  disposables: { dispose: () => void }[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.68)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  disposables.push(tex);
  return tex;
}

export function buildCulinarySceneAssets(
  renderer: THREE.WebGLRenderer
): HandiRigRefs {
  const disposables: { dispose: () => void }[] = [];
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const hammeredBump = createHammeredBumpTexture(disposables);
  const riceAlbedo = createBiryaniRiceAlbedo(maxAniso, disposables);
  const steamTex = createSteamTexture(disposables);
  const shadowTex = createContactShadowTexture(disposables);

  // PBR Materials (varied roughness & metalness >= 0.25 between adjacent parts)
  const copperMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C86434'),
    metalness: 0.88,
    roughness: 0.24,
    bumpMap: hammeredBump,
    bumpScale: 0.025,
    clearcoat: 0.22,
    clearcoatRoughness: 0.25,
    anisotropy: 0.65,
  });

  const antiqueBrassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#E5A93B'),
    metalness: 0.94,
    roughness: 0.14,
    anisotropy: 0.8,
  });

  const doughSealMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#EAD4B0'),
    metalness: 0.02,
    roughness: 0.88,
  });

  const darkInteriorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#231510'),
    metalness: 0.5,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });

  const riceMoundMat = new THREE.MeshStandardMaterial({
    map: riceAlbedo,
    roughness: 0.68,
    metalness: 0.04,
  });

  const riceGrainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFFFFF'),
    roughness: 0.45,
    metalness: 0.05,
  });

  const masalaMeatMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#6E2B14'),
    roughness: 0.42,
    metalness: 0.08,
  });

  const mintLeafMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2F7D32'),
    roughness: 0.52,
    metalness: 0.04,
  });

  const saffronStrandMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C81E1E'),
    emissive: new THREE.Color('#6B0F0F'),
    emissiveIntensity: 0.45,
    roughness: 0.38,
    metalness: 0.05,
  });

  const cardamomMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#7C9A59'),
    roughness: 0.62,
    metalness: 0.04,
  });

  const starAniseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4E2212'),
    roughness: 0.72,
    metalness: 0.05,
  });

  const bayLeafMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8A7F4D'),
    roughness: 0.68,
    metalness: 0.03,
  });

  const stonewareMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1C1917'),
    roughness: 0.36,
    metalness: 0.12,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
  });

  disposables.push(
    copperMat,
    antiqueBrassMat,
    doughSealMat,
    darkInteriorMat,
    riceMoundMat,
    riceGrainMat,
    masalaMeatMat,
    mintLeafMat,
    saffronStrandMat,
    cardamomMat,
    starAniseMat,
    bayLeafMat,
    stonewareMat
  );

  const rootGroup = new THREE.Group();
  const handiGroup = new THREE.Group();
  // Position hero handi slightly right on wide screens via stage controller
  rootGroup.add(handiGroup);

  // Soft Contact Shadow Grounding Plane beneath Handi
  const shadowGeo = new THREE.PlaneGeometry(3.8, 3.8);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.62,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -1.16;
  handiGroup.add(shadowMesh);
  disposables.push(shadowGeo, shadowMat);

  // 1. Handi Copper Belly (LatheGeometry curved traditional deg/handi profile)
  const bellyPoints = [
    new THREE.Vector2(0.0, -1.12),
    new THREE.Vector2(0.58, -1.1),
    new THREE.Vector2(1.06, -0.86),
    new THREE.Vector2(1.28, -0.42),
    new THREE.Vector2(1.24, 0.05),
    new THREE.Vector2(0.96, 0.38),
    new THREE.Vector2(0.88, 0.52),
  ];
  const bellyGeo = new THREE.LatheGeometry(bellyPoints, 64);
  bellyGeo.computeVertexNormals();
  const bellyMesh = new THREE.Mesh(bellyGeo, copperMat);
  bellyMesh.castShadow = true;
  bellyMesh.receiveShadow = true;
  handiGroup.add(bellyMesh);

  // Interior dark liner
  const linerGeo = new THREE.CylinderGeometry(0.86, 0.95, 0.35, 48, 1, true);
  const linerMesh = new THREE.Mesh(linerGeo, darkInteriorMat);
  linerMesh.position.y = 0.45;
  handiGroup.add(linerMesh);

  // 2. Flared Antique Brass Neck & Rolled Collar Rim
  const neckPoints = [
    new THREE.Vector2(0.87, 0.48),
    new THREE.Vector2(0.92, 0.58),
    new THREE.Vector2(1.09, 0.72),
    new THREE.Vector2(1.04, 0.76),
    new THREE.Vector2(0.86, 0.62),
  ];
  const neckGeo = new THREE.LatheGeometry(neckPoints, 64);
  const neckMesh = new THREE.Mesh(neckGeo, antiqueBrassMat);
  neckMesh.castShadow = true;
  handiGroup.add(neckMesh);

  const rimTorusGeo = new THREE.TorusGeometry(1.06, 0.045, 20, 64);
  const rimTorus = new THREE.Mesh(rimTorusGeo, antiqueBrassMat);
  rimTorus.rotation.x = Math.PI / 2;
  rimTorus.position.y = 0.73;
  handiGroup.add(rimTorus);

  // Brass Foot Ring Base (sits flush above shadow plane)
  const baseRingGeo = new THREE.TorusGeometry(0.58, 0.05, 16, 48);
  const baseRing = new THREE.Mesh(baseRingGeo, antiqueBrassMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = -1.11;
  handiGroup.add(baseRing);

  // 3. Traditional Atta (Wheat Dough) Dum Seal Ring around Rim
  const doughGeo = new THREE.TorusGeometry(0.99, 0.058, 18, 56);
  const doughMesh = new THREE.Mesh(doughGeo, doughSealMat);
  doughMesh.rotation.x = Math.PI / 2;
  doughMesh.position.y = 0.76;
  handiGroup.add(doughMesh);

  // 4. Twin Forged Brass Side Handles + Rivets
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.18, -0.1, -0.22),
    new THREE.Vector3(1.48, 0.08, -0.14),
    new THREE.Vector3(1.52, 0.16, 0.0),
    new THREE.Vector3(1.48, 0.08, 0.14),
    new THREE.Vector3(1.18, -0.1, 0.22),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 28, 0.042, 12, false);
  const rightHandle = new THREE.Mesh(handleGeo, antiqueBrassMat);
  rightHandle.castShadow = true;
  handiGroup.add(rightHandle);

  const leftHandle = rightHandle.clone();
  leftHandle.rotation.y = Math.PI;
  handiGroup.add(leftHandle);

  // 5. Saffron-Streaked Basmati Rice Crown Inside Handi
  const riceMoundGeo = new THREE.SphereGeometry(
    0.92,
    40,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.48
  );
  riceMoundGeo.scale(1, 0.46, 1);
  const riceMound = new THREE.Mesh(riceMoundGeo, riceMoundMat);
  riceMound.position.y = 0.42;
  riceMound.receiveShadow = true;
  handiGroup.add(riceMound);

  // 200 Individual 3D Long-Grain Basmati Kernels on the Mound (InstancedMesh)
  const singleGrainGeo = new THREE.CapsuleGeometry(0.015, 0.085, 4, 8);
  const surfaceGrainCount = 200;
  const surfaceRiceInstanced = new THREE.InstancedMesh(
    singleGrainGeo,
    riceGrainMat,
    surfaceGrainCount
  );
  const dummy = new THREE.Object3D();
  const grainColors = [
    new THREE.Color('#FFFBF0'),
    new THREE.Color('#F4A300'),
    new THREE.Color('#FFF3D1'),
    new THREE.Color('#D97706'),
  ];

  for (let i = 0; i < surfaceGrainCount; i++) {
    const r = Math.sqrt(Math.random()) * 0.78;
    const theta = Math.random() * Math.PI * 2;
    const gx = Math.cos(theta) * r;
    const gz = Math.sin(theta) * r;
    const gy = 0.46 + Math.sqrt(Math.max(0, 0.85 - r * r)) * 0.36;
    dummy.position.set(gx, gy, gz);
    dummy.rotation.set(
      (Math.random() - 0.5) * 1.4,
      Math.random() * Math.PI,
      Math.PI / 2 + (Math.random() - 0.5) * 0.6
    );
    dummy.scale.setScalar(0.85 + Math.random() * 0.35);
    dummy.updateMatrix();
    surfaceRiceInstanced.setMatrixAt(i, dummy.matrix);
    surfaceRiceInstanced.setColorAt(i, grainColors[i % grainColors.length]);
  }
  surfaceRiceInstanced.instanceMatrix.needsUpdate = true;
  if (surfaceRiceInstanced.instanceColor) {
    surfaceRiceInstanced.instanceColor.needsUpdate = true;
  }
  surfaceRiceInstanced.computeBoundingSphere();
  handiGroup.add(surfaceRiceInstanced);

  // Succulent Glazed Mutton Pieces & Mint Leaf Garnish on Rice Crown
  const meatGeo = new THREE.DodecahedronGeometry(0.14, 1);
  const meatOffsets = [
    [-0.24, 0.79, 0.14],
    [0.22, 0.8, -0.12],
    [0.04, 0.83, 0.24],
    [-0.12, 0.78, -0.26],
  ];
  meatOffsets.forEach(([mx, my, mz], idx) => {
    const chunk = new THREE.Mesh(meatGeo, masalaMeatMat);
    chunk.position.set(mx, my, mz);
    chunk.rotation.set(idx * 0.7, idx * 1.1, 0.3);
    chunk.scale.set(1.2, 0.78, 0.95);
    chunk.castShadow = true;
    handiGroup.add(chunk);
  });

  // Extruded Mint Leaves
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.08, 0.09, 0, 0.22);
  leafShape.quadraticCurveTo(-0.08, 0.09, 0, 0);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(leafGeo, mintLeafMat);
    const ang = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(ang) * 0.16, 0.86, Math.sin(ang) * 0.16);
    leaf.rotation.set(-Math.PI / 2.4, ang, 0.2);
    handiGroup.add(leaf);
  }

  // 6. Domed Copper Lid + Brass Finial Spire (Animated via Scroll / Hover)
  const lidGroup = new THREE.Group();
  const lidPoints = [
    new THREE.Vector2(1.01, 0.0),
    new THREE.Vector2(0.94, 0.12),
    new THREE.Vector2(0.68, 0.32),
    new THREE.Vector2(0.24, 0.44),
    new THREE.Vector2(0.0, 0.46),
  ];
  const lidGeo = new THREE.LatheGeometry(lidPoints, 64);
  const lidDome = new THREE.Mesh(lidGeo, copperMat);
  lidDome.castShadow = true;
  lidGroup.add(lidDome);

  const finialPoints = [
    new THREE.Vector2(0.0, 0.45),
    new THREE.Vector2(0.14, 0.46),
    new THREE.Vector2(0.06, 0.54),
    new THREE.Vector2(0.11, 0.64),
    new THREE.Vector2(0.03, 0.76),
    new THREE.Vector2(0.0, 0.8),
  ];
  const finialGeo = new THREE.LatheGeometry(finialPoints, 32);
  const finialMesh = new THREE.Mesh(finialGeo, antiqueBrassMat);
  finialMesh.castShadow = true;
  lidGroup.add(finialMesh);

  // Rest slightly ajar in Hero so golden steam escapes
  lidGroup.position.set(0.12, 0.86, -0.05);
  lidGroup.rotation.z = -0.14;
  handiGroup.add(lidGroup);

  // 7. Floating Basmati Rice Grains (InstancedMesh, 84 grains orbiting)
  const floatingCount = 84;
  const floatingRiceMesh = new THREE.InstancedMesh(
    singleGrainGeo,
    riceGrainMat,
    floatingCount
  );
  floatingRiceMesh.frustumCulled = false;
  const floatingRiceSeeds: HandiRigRefs['floatingRiceSeeds'] = [];

  for (let i = 0; i < floatingCount; i++) {
    const seed = {
      radius: 1.45 + Math.random() * 1.65,
      angle: Math.random() * Math.PI * 2,
      yBase: -0.75 + Math.random() * 2.4,
      speed: 0.14 + Math.random() * 0.22,
      tiltX: Math.random() * Math.PI,
      tiltZ: Math.random() * Math.PI,
      scale: 0.75 + Math.random() * 0.55,
    };
    floatingRiceSeeds.push(seed);
    floatingRiceMesh.setColorAt(
      i,
      i % 3 === 0 ? new THREE.Color('#F4A300') : new THREE.Color('#FFF6E3')
    );
  }
  if (floatingRiceMesh.instanceColor) {
    floatingRiceMesh.instanceColor.needsUpdate = true;
  }
  handiGroup.add(floatingRiceMesh);

  // 8. Orbiting Whole Spices Group (Saffron strands, Cardamom pods, Star Anise, Bay Leaves)
  const spicesOrbitGroup = new THREE.Group();
  handiGroup.add(spicesOrbitGroup);

  // Saffron Strands (16 curved crimson filaments)
  const strandGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const rad = 1.35 + (i % 3) * 0.32;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.06, 0.11, 0.03),
      new THREE.Vector3(-0.03, 0.24, -0.02),
      new THREE.Vector3(0.05, 0.34, 0.04),
    ]);
    const sGeo = new THREE.TubeGeometry(curve, 14, 0.009, 6, false);
    strandGeos.push(sGeo);
    const strand = new THREE.Mesh(sGeo, saffronStrandMat);
    strand.position.set(
      Math.cos(ang) * rad,
      0.35 + Math.sin(i * 1.7) * 0.75,
      Math.sin(ang) * rad
    );
    strand.rotation.set(i * 0.5, ang, i * 0.3);
    spicesOrbitGroup.add(strand);
  }

  // Green Cardamom Pods (8 pods)
  const podGeo = new THREE.SphereGeometry(0.055, 14, 12);
  podGeo.scale(0.65, 1.45, 0.65);
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + 0.35;
    const pod = new THREE.Mesh(podGeo, cardamomMat);
    pod.position.set(
      Math.cos(ang) * 1.75,
      -0.15 + Math.cos(i * 1.3) * 0.65,
      Math.sin(ang) * 1.75
    );
    pod.rotation.set(0.6, ang, 0.8);
    spicesOrbitGroup.add(pod);
  }

  // Star Anise (4 sculptural 8-petal stars)
  const petalGeo = new THREE.ConeGeometry(0.032, 0.12, 6);
  petalGeo.rotateZ(Math.PI / 2);
  petalGeo.translate(0.06, 0, 0);
  for (let s = 0; s < 4; s++) {
    const starGroup = new THREE.Group();
    for (let p = 0; p < 8; p++) {
      const petal = new THREE.Mesh(petalGeo, starAniseMat);
      petal.rotation.y = (p / 8) * Math.PI * 2;
      starGroup.add(petal);
    }
    const ang = (s / 4) * Math.PI * 2 + 0.7;
    starGroup.position.set(
      Math.cos(ang) * 2.05,
      0.2 + (s % 2 === 0 ? 0.45 : -0.35),
      Math.sin(ang) * 2.05
    );
    starGroup.rotation.set(0.5 + s * 0.4, ang, 0.3);
    spicesOrbitGroup.add(starGroup);
  }

  // Tejpatta Bay Leaves (5 dried bay leaves)
  const bayShape = new THREE.Shape();
  bayShape.moveTo(0, 0);
  bayShape.quadraticCurveTo(0.11, 0.18, 0, 0.42);
  bayShape.quadraticCurveTo(-0.11, 0.18, 0, 0);
  const bayGeo = new THREE.ExtrudeGeometry(bayShape, {
    depth: 0.005,
    bevelEnabled: false,
  });
  for (let b = 0; b < 5; b++) {
    const bay = new THREE.Mesh(bayGeo, bayLeafMat);
    const ang = (b / 5) * Math.PI * 2 + 0.2;
    bay.position.set(
      Math.cos(ang) * 1.9,
      -0.45 + b * 0.28,
      Math.sin(ang) * 1.9
    );
    bay.rotation.set(0.7, ang, 0.5);
    spicesOrbitGroup.add(bay);
  }

  // 9. Rising Golden Steam Particles
  const steamSprites: HandiRigRefs['steamSprites'] = [];
  for (let i = 0; i < 14; i++) {
    const sMat = new THREE.SpriteMaterial({
      map: steamTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.0,
      blending: THREE.NormalBlending,
    });
    disposables.push(sMat);
    const sprite = new THREE.Sprite(sMat);
    sprite.position.set(0, 0.85, 0);
    sprite.scale.setScalar(0.75);
    handiGroup.add(sprite);
    steamSprites.push({
      sprite,
      phase: i / 14,
      speed: 0.22 + (i % 4) * 0.04,
      driftX: (Math.random() - 0.5) * 0.35,
      driftZ: (Math.random() - 0.5) * 0.35,
    });
  }

  // 10. Scene 3: Royal Plated Dastarkhwan Thali (positioned for scroll transition)
  const platedGroup = new THREE.Group();
  platedGroup.position.set(0, -4.6, 0);
  rootGroup.add(platedGroup);

  const thaliPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.42, 0.0),
    new THREE.Vector2(1.56, 0.14),
    new THREE.Vector2(1.52, 0.17),
    new THREE.Vector2(1.36, 0.05),
    new THREE.Vector2(0.0, 0.05),
  ];
  const thaliGeo = new THREE.LatheGeometry(thaliPoints, 64);
  const thaliMesh = new THREE.Mesh(thaliGeo, stonewareMat);
  thaliMesh.receiveShadow = true;
  platedGroup.add(thaliMesh);

  // Brass rim inlay around stoneware platter
  const thaliRimGeo = new THREE.TorusGeometry(1.54, 0.02, 12, 64);
  const thaliRim = new THREE.Mesh(thaliRimGeo, antiqueBrassMat);
  thaliRim.rotation.x = Math.PI / 2;
  thaliRim.position.y = 0.155;
  platedGroup.add(thaliRim);

  // Plated Biryani Mound on Thali
  const platedRice = new THREE.Mesh(riceMoundGeo, riceMoundMat);
  platedRice.position.set(-0.22, 0.02, 0.08);
  platedRice.scale.set(0.95, 0.85, 0.95);
  platedGroup.add(platedRice);

  // Two Hammered Brass Katoris (Mirchi ka Salan & Burani Raita)
  const katoriGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.22, 32);
  const salanFillGeo = new THREE.CircleGeometry(0.25, 24);
  const salanMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#9A3412'),
    roughness: 0.25,
  });
  const raitaMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F8FAFC'),
    roughness: 0.32,
  });
  disposables.push(katoriGeo, salanFillGeo, salanMat, raitaMat);

  const katori1 = new THREE.Mesh(katoriGeo, antiqueBrassMat);
  katori1.position.set(0.88, 0.15, -0.35);
  const salanTop = new THREE.Mesh(salanFillGeo, salanMat);
  salanTop.rotation.x = -Math.PI / 2;
  salanTop.position.y = 0.112;
  katori1.add(salanTop);
  platedGroup.add(katori1);

  const katori2 = new THREE.Mesh(katoriGeo, antiqueBrassMat);
  katori2.position.set(0.82, 0.15, 0.34);
  const raitaTop = new THREE.Mesh(salanFillGeo, raitaMat);
  raitaTop.rotation.x = -Math.PI / 2;
  raitaTop.position.y = 0.112;
  katori2.add(raitaTop);
  platedGroup.add(katori2);

  // 11. Scene 4: Madhurawada Golden Coordinate Beacon
  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(0, -9.2, 0);
  rootGroup.add(beaconGroup);

  const beaconPinPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.08, 0.28),
    new THREE.Vector2(0.36, 0.78),
    new THREE.Vector2(0.32, 1.06),
    new THREE.Vector2(0.0, 1.22),
  ];
  const beaconPinGeo = new THREE.LatheGeometry(beaconPinPoints, 40);
  const beaconPin = new THREE.Mesh(beaconPinGeo, antiqueBrassMat);
  beaconPin.position.y = 0.15;
  beaconGroup.add(beaconPin);

  const beaconRings: THREE.Mesh[] = [];
  [0.85, 1.35, 1.9].forEach((r, idx) => {
    const rGeo = new THREE.RingGeometry(r - 0.018, r, 64);
    const rMat = new THREE.MeshBasicMaterial({
      color: idx === 0 ? '#F4A300' : '#7C5832',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45 - idx * 0.1,
    });
    rMat.polygonOffset = true;
    rMat.polygonOffsetFactor = -1;
    rMat.polygonOffsetUnits = -1;
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02 * (idx + 1);
    beaconGroup.add(ring);
    beaconRings.push(ring);
    disposables.push(rGeo, rMat);
  });

  disposables.push(
    bellyGeo,
    linerGeo,
    neckGeo,
    rimTorusGeo,
    baseRingGeo,
    doughGeo,
    handleGeo,
    riceMoundGeo,
    singleGrainGeo,
    meatGeo,
    leafGeo,
    lidGeo,
    finialGeo,
    podGeo,
    petalGeo,
    bayGeo,
    thaliGeo,
    thaliRimGeo,
    beaconPinGeo,
    ...strandGeos
  );

  return {
    rootGroup,
    handiGroup,
    lidGroup,
    spicesOrbitGroup,
    floatingRiceMesh,
    floatingRiceSeeds,
    steamSprites,
    platedGroup,
    beaconGroup,
    beaconRings,
    disposables,
  };
}
