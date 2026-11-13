// Construction entrance: one scene that is a pure function of progress p (0..1).
// 0 site fly-over → earth bursts → concrete frame rises → glass envelope → finished towers and skyline.
import * as THREE from "three";

const F = 34, FH = 3.6, TW = 14, TD = 22, GAP = 13;
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lin = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));
function rng(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const lean = (f: number) => 5 * Math.sin(Math.PI * f / (F - 1));
const plateW = (f: number) => TW * (1 - 0.28 * Math.pow(f / F, 2));
const plateD = (f: number) => TD * (1 - 0.16 * (f / F));
const towerX = (s: number, f: number) => s * (GAP / 2 + plateW(f) / 2 + lean(f));

function earthTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!; const r = rng(3);
  g.fillStyle = "#8c4a2e"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { const v = r(); g.fillStyle = v > .5 ? `rgba(60,24,12,${.10 + r() * .22})` : `rgba(196,120,80,${.08 + r() * .2})`; const s = 1 + r() * 5; g.fillRect(r() * 256, r() * 256, s, s * (0.6 + r())); }
  for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(50,20,10,${.12 + r() * .15})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 80, x - 8, 170, x + 4, 256); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(70, 70); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color("#2f72c6") }, hor: { value: new THREE.Color("#dcb898") } },
    vertexShader: "varying vec3 w; void main(){ w = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 w; void main(){ float h = clamp(w.y*1.25+0.02,0.0,1.0); gl_FragColor = vec4(mix(hor, top, pow(h,0.8)),1.0);\n#include <colorspace_fragment>\n}"
  });
}

export type BuildScene = { setProgress: (p: number) => void; resize: (w: number, h: number) => void; render: () => void; dispose: () => void };

export function createBuildScene(canvas: HTMLCanvasElement, lowPower: boolean): BuildScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(lowPower ? 1.25 : 2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); const fog = new THREE.FogExp2("#dcb898", 0.0026); scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 2400);
  const r = rng(11), dummy = new THREE.Object3D();
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };

  // sky + reflections
  const skyMat = keep(skyMaterial()); const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(1800, 32, 16)), skyMat); scene.add(sky);
  { const envScene = new THREE.Scene(); const m = skyMaterial(); m.uniforms.top.value.set("#3a78c2"); m.uniforms.hor.value.set("#e9eef2"); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 12), m));
    const pm = new THREE.PMREMGenerator(renderer); const env = keep(pm.fromScene(envScene, 0.02)); scene.environment = env.texture; pm.dispose(); m.dispose(); }
  const hemi = new THREE.HemisphereLight("#dfe9f5", "#7a4a33", .9); scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffe2bd", 2.4); sun.position.set(-120, 160, -140); scene.add(sun);

  // ground, plaza, water
  const earthMat = keep(new THREE.MeshStandardMaterial({ map: keep(earthTexture()), roughness: 1, metalness: 0, envMapIntensity: 0.15 }));
  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(2400, 2400)), earthMat); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const lawnMat = keep(new THREE.MeshStandardMaterial({ color: "#5d7f4e", roughness: 1, transparent: true, opacity: 0, envMapIntensity: 0.2 }));
  const lawn = new THREE.Mesh(keep(new THREE.CircleGeometry(330, 72)), lawnMat); lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.04; scene.add(lawn);
  const plaza = new THREE.Mesh(keep(new THREE.CircleGeometry(78, 72)), keep(new THREE.MeshStandardMaterial({ color: "#d9d2c4", roughness: .8, envMapIntensity: 0.4 }))); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.1; scene.add(plaza);
  const waterMat = keep(new THREE.MeshStandardMaterial({ color: "#2e6f93", roughness: .12, metalness: .9, transparent: true, opacity: 0 }));
  const water = new THREE.Mesh(keep(new THREE.PlaneGeometry(2400, 900)), waterMat); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.12, 560); scene.add(water);

  // far tree line (site stage)
  const treeN = lowPower ? 260 : 520; const trees = new THREE.InstancedMesh(keep(new THREE.ConeGeometry(11, 20, 7)), keep(new THREE.MeshStandardMaterial({ color: "#1c3622", roughness: 1, envMapIntensity: 0.1 })), treeN);
  for (let i = 0; i < treeN; i++) { const a = r() * Math.PI * 2, d = 330 + r() * 120, s = .7 + r() * .9; dummy.position.set(Math.cos(a) * d, 9 * s, Math.sin(a) * d); dummy.scale.set(s, s, s); dummy.rotation.set(0, r() * 6, 0); dummy.updateMatrix(); trees.setMatrixAt(i, dummy.matrix); }
  scene.add(trees);
  // rocks along the approach, for a sense of speed
  const rockN = lowPower ? 140 : 300; const rocks = new THREE.InstancedMesh(keep(new THREE.DodecahedronGeometry(1, 0)), keep(new THREE.MeshStandardMaterial({ color: "#6e3923", roughness: 1, flatShading: true, envMapIntensity: 0.1 })), rockN);
  for (let i = 0; i < rockN; i++) { const s = .25 + r() * 1.1; { const rx = (r() - .5) * 150; dummy.position.set(rx + Math.sign(rx || 1) * 9, s * .3, -40 - r() * 250); } dummy.scale.set(s * (1 + r()), s * .7, s * (1 + r())); dummy.rotation.set(r() * 3, r() * 3, r() * 3); dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix); }
  scene.add(rocks);

  // excavators
  const yellow = keep(new THREE.MeshStandardMaterial({ color: "#e2a41a", roughness: .55, metalness: .2 })), dark = keep(new THREE.MeshStandardMaterial({ color: "#26221f", roughness: .9 }));
  const box = keep(new THREE.BoxGeometry(1, 1, 1));
  const part = (m: THREE.Material, sx: number, sy: number, sz: number, x: number, y: number, z: number, parent: THREE.Object3D) => { const o = new THREE.Mesh(box, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); parent.add(o); return o; };
  const excavators: { g: THREE.Group; boom: THREE.Group; stick: THREE.Group }[] = [];
  for (const [x, z, rot] of [[-26, -34, .7], [30, -16, -2.3]] as const) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    part(dark, 1.2, 1.3, 7, -1.9, .65, 0, g); part(dark, 1.2, 1.3, 7, 1.9, .65, 0, g);
    const top = new THREE.Group(); top.position.y = 1.5; g.add(top);
    part(yellow, 4.6, 2, 5.4, 0, 1, -.4, top); part(yellow, 1.8, 2, 2.2, -1.2, 2.9, 1.2, top); part(dark, 1.5, 1.2, .1, -1.2, 3, 2.32, top);
    const boom = new THREE.Group(); boom.position.set(1, 2, 2); top.add(boom); part(yellow, .8, .9, 7, 0, 0, 3.5, boom);
    const stick = new THREE.Group(); stick.position.set(0, 0, 7); boom.add(stick); part(yellow, .6, .7, 5, 0, 0, 2.5, stick); part(dark, 1.6, 1.3, 1.5, 0, 0, 5.4, stick);
    scene.add(g); excavators.push({ g, boom, stick });
  }

  // earth burst
  const chunkN = lowPower ? 260 : 620; const chunks = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(1, 0)), keep(new THREE.MeshStandardMaterial({ color: "#7a3f25", roughness: 1, flatShading: true, envMapIntensity: 0.1 })), chunkN);
  const cd = Array.from({ length: chunkN }, () => { const a = r() * Math.PI * 2, sp = .25 + r(); return { ox: (r() - .5) * 46, oz: (r() - .5) * 46 - 8, vx: Math.cos(a) * sp * 34, vz: Math.sin(a) * sp * 34 - 26, vy: 46 + r() * 70, s: .25 + Math.pow(r(), 2) * 1.5, d: r() * .25, rx: r() * 9, ry: r() * 9 }; });
  chunks.frustumCulled = false; scene.add(chunks);

  // structure
  const concrete = keep(new THREE.MeshStandardMaterial({ color: "#9a9992", roughness: .85, envMapIntensity: 0.35 }));
  const slabs = new THREE.InstancedMesh(box, concrete, F * 2); slabs.frustumCulled = false; scene.add(slabs);
  const colsPer = 8; const cols = new THREE.InstancedMesh(box, keep(new THREE.MeshStandardMaterial({ color: "#74736e", roughness: .9, envMapIntensity: 0.3 })), F * 2 * colsPer); cols.frustumCulled = false; scene.add(cols);
  const glassMat = keep(new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .08, metalness: .92, envMapIntensity: 1.05 }));
  type Pane = { x: number; y: number; z: number; ry: number; w: number; nx: number; nz: number; f: number; d: number };
  const panes: Pane[] = [];
  for (const s of [-1, 1]) for (let f = 0; f < F; f++) {
    const w = plateW(f), d = plateD(f), cx = towerX(s, f), y = f * FH + (FH - .4) / 2;
    for (let i = 0; i < 4; i++) for (const q of [-1, 1]) panes.push({ x: cx - w / 2 + (i + .5) * w / 4, y, z: q * d / 2, ry: 0, w: w / 4, nx: 0, nz: q, f, d: r() });
    for (let i = 0; i < 6; i++) for (const q of [-1, 1]) panes.push({ x: cx + q * w / 2, y, z: -d / 2 + (i + .5) * d / 6, ry: Math.PI / 2, w: d / 6, nx: q, nz: 0, f, d: r() });
  }
  const glass = new THREE.InstancedMesh(box, glassMat, panes.length); glass.frustumCulled = false; scene.add(glass);
  { const col = new THREE.Color(); panes.forEach((a, i) => { col.setHSL(.575 + r() * .03, .7 + r() * .2, .26 + r() * .16 + (a.f / F) * .06); glass.setColorAt(i, col); }); glass.instanceColor!.needsUpdate = true; }
  const bridgeFloors = [10, 20, 29]; const bridges = bridgeFloors.map(f => { const m = new THREE.Mesh(box, glassMat); m.position.set(0, f * FH + FH, 0); scene.add(m); return m; });
  // crowns
  const crownMat = keep(new THREE.MeshStandardMaterial({ color: "#f1ede4", roughness: .5, envMapIntensity: .6 }));
  const crowns = [-1, 1].map(s => { const m = new THREE.Mesh(box, crownMat); m.position.set(towerX(s, F - 1), F * FH + 3, 0); scene.add(m); return m; });

  // tower crane
  const crane = new THREE.Group(); crane.position.set(-(GAP / 2 + TW + 16), 0, 16); scene.add(crane);
  const mast = part(yellow, 1.8, 1, 1.8, 0, 0, 0, crane); const jib = new THREE.Group(); crane.add(jib);
  part(yellow, 62, 1.3, 1.3, 22, 0, 0, jib); part(yellow, 1.6, 7, 1.6, 0, 3.5, 0, jib); part(dark, 5, 3, 3, -12, -.6, 0, jib); part(dark, .15, 26, .15, 34, -13, 0, jib);

  // finished stage: plaza trees and skyline
  const pTreeN = lowPower ? 50 : 110; const pTrees = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(2.4, 1)), keep(new THREE.MeshStandardMaterial({ color: "#3f7a45", roughness: 1, flatShading: true, envMapIntensity: .2 })), pTreeN);
  const pt = Array.from({ length: pTreeN }, () => { const a = r() * Math.PI * 2, d = 46 + r() * 150; return { x: Math.cos(a) * d, z: Math.sin(a) * d * .8 - 20, s: .7 + r() * 1.1, d: r() }; }).filter(t => (Math.abs(t.x) > 30 || Math.abs(t.z) > 26) && t.z > -120);
  pTrees.count = pt.length; pTrees.frustumCulled = false; scene.add(pTrees);
  const cityN = lowPower ? 70 : 150; const city = new THREE.InstancedMesh(box, keep(new THREE.MeshStandardMaterial({ color: "#8fa6bd", roughness: .35, metalness: .6, envMapIntensity: .9 })), cityN);
  const cb = Array.from({ length: cityN }, () => ({ x: (r() - .5) * 1500, z: 500 + r() * 260, w: 16 + r() * 26, h: 30 + Math.pow(r(), 2.2) * 210, d: r() }));
  city.frustumCulled = false; scene.add(city);

  // camera path
  const KP = [0, .2, .32, .5, .68, .85, 1];
  const posCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(8, 1.5, -300), new THREE.Vector3(3, 2.2, -86), new THREE.Vector3(-34, 12, -62), new THREE.Vector3(-58, 50, -48), new THREE.Vector3(44, 88, -72), new THREE.Vector3(84, 58, -150), new THREE.Vector3(-26, 16, -205)], false, "catmullrom", .5);
  const tgtCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 3, -60), new THREE.Vector3(0, 6, 0), new THREE.Vector3(0, 16, 0), new THREE.Vector3(0, 46, 0), new THREE.Vector3(0, 74, 0), new THREE.Vector3(0, 64, 0), new THREE.Vector3(14, 62, 0)], false, "catmullrom", .5);
  const curveU = (p: number) => { let i = 0; while (i < KP.length - 2 && p > KP[i + 1]) i++; const t = lin(KP[i], KP[i + 1], p); return (i + t) / (KP.length - 1); };
  const cPos = new THREE.Vector3(), cTgt = new THREE.Vector3();
  const c1 = new THREE.Color(), c2 = new THREE.Color();
  let aspect = 1;

  function setProgress(p: number) {
    p = Math.min(1, Math.max(0, p));
    const done = sm(.8, .97, p);
    // atmosphere
    fog.color.copy(c1.set("#dcb898")).lerp(c2.set("#bcd4ea"), sm(.3, .85, p)); fog.density = 0.0026 - 0.0018 * sm(.3, .9, p);
    (skyMat.uniforms.hor.value as THREE.Color).copy(fog.color); (skyMat.uniforms.top.value as THREE.Color).copy(c1.set("#2f72c6")).lerp(c2.set("#1c66d2"), sm(.4, .9, p));
    sun.intensity = 2.9 + .6 * done; hemi.intensity = .85 + .25 * done;
    lawnMat.opacity = done; lawn.visible = done > 0; waterMat.opacity = done; water.visible = done > 0;
    plaza.scale.setScalar(Math.max(.0001, sm(.74, .9, p)));
    // site machines
    const ex = 1 - sm(.3, .42, p);
    excavators.forEach((e, i) => { e.g.visible = ex > 0; e.g.scale.setScalar(Math.max(.0001, ex)); e.boom.rotation.x = -.75 + Math.sin(p * 40 + i * 2) * .22; e.stick.rotation.x = 1.5 + Math.cos(p * 40 + i * 2) * .3; });
    rocks.visible = p < .6;
    // burst
    const bt = lin(.19, .36, p); chunks.visible = bt > 0 && bt < 1;
    if (chunks.visible) { for (let i = 0; i < chunkN; i++) { const c = cd[i], t = Math.max(0, (bt - c.d) / (1 - c.d)) * 2.6; const y = c.vy * t - 34 * t * t;
      const k = t <= 0 || y < -2 ? 0 : c.s * (1 - bt * .5); dummy.position.set(c.ox + c.vx * t, Math.max(y, 0), c.oz + c.vz * t); dummy.rotation.set(c.rx + t * 3, c.ry + t * 2, 0); dummy.scale.setScalar(k); dummy.updateMatrix(); chunks.setMatrixAt(i, dummy.matrix); }
      chunks.instanceMatrix.needsUpdate = true; }
    // frame
    concrete.color.copy(c1.set("#84837d")).lerp(c2.set("#f1ede4"), sm(.6, .86, p));
    let si = 0, ci = 0;
    for (const s of [-1, 1]) for (let f = 0; f < F; f++) {
      const t0 = .29 + .3 * (f / F), kc = sm(t0, t0 + .035, p), ks = sm(t0 + .02, t0 + .05, p);
      const w = plateW(f), d = plateD(f), cx = towerX(s, f), oh = f % 4 === 3 ? 2.6 : 1;
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(cx, (f + 1) * FH - .2 + (1 - ks) * 9, 0); dummy.scale.set((w + oh * 2) * ks, ks > 0 ? .4 : 0, (d + oh * 2) * ks); dummy.updateMatrix(); slabs.setMatrixAt(si++, dummy.matrix);
      const h = (FH - .4) * kc;
      for (let c = 0; c < colsPer; c++) { const px = c < 4 ? (c % 2 ? 1 : -1) * (w / 2 - .7) : c < 6 ? 0 : (c % 2 ? 1 : -1) * (w / 2 - .7), pz = c < 4 ? (c < 2 ? 1 : -1) * (d / 2 - .7) : c < 6 ? (c % 2 ? 1 : -1) * (d / 2 - .7) : 0;
        dummy.position.set(cx + px, f * FH + h / 2, pz); dummy.scale.set(kc > 0 ? .75 : 0, h, kc > 0 ? .75 : 0); dummy.updateMatrix(); cols.setMatrixAt(ci++, dummy.matrix); }
    }
    slabs.instanceMatrix.needsUpdate = true; cols.instanceMatrix.needsUpdate = true;
    // envelope
    for (let i = 0; i < panes.length; i++) { const a = panes[i], t0 = .53 + .27 * (a.f / F) + a.d * .03, k = sm(t0, t0 + .05, p), away = (1 - k) * (1 - k) * 34;
      dummy.position.set(a.x + a.nx * away, a.y + (1 - k) * 12, a.z + a.nz * away); dummy.rotation.set(0, a.ry + (1 - k) * 1.4, 0); dummy.scale.set((a.w - .18) * k, (FH - .55) * k, k > 0 ? .14 : 0); dummy.updateMatrix(); glass.setMatrixAt(i, dummy.matrix); }
    glass.instanceMatrix.needsUpdate = true;
    bridges.forEach((b, i) => { const f = bridgeFloors[i], t0 = .56 + .27 * (f / F), k = sm(t0, t0 + .06, p); b.visible = k > 0; b.scale.set(Math.max(.0001, (GAP + lean(f) * 2 + 2) * k), FH * 1.6, plateD(f) * .46); });
    crowns.forEach(c => { const k = sm(.8, .88, p); c.visible = k > 0; c.scale.set(plateW(F - 1) + 2, 6 * k + .0001, plateD(F - 1) + 2); c.position.y = F * FH + 3 * k; });
    // crane
    const up = sm(.27, .36, p), off = 1 - sm(.82, .92, p), mh = (30 + 104 * sm(.3, .62, p)) * up; crane.visible = up * off > 0;
    mast.scale.y = Math.max(.0001, mh); mast.position.y = mh / 2; jib.position.y = mh; jib.rotation.y = -1.1 + p * 5; crane.scale.setScalar(Math.max(.0001, off));
    // finished surroundings
    pTrees.visible = done > 0; if (pTrees.visible) { for (let i = 0; i < pt.length; i++) { const t = pt[i], k = sm(t.d * .6, t.d * .6 + .4, done); dummy.rotation.set(0, i, 0); dummy.position.set(t.x, 2.6 * t.s * k, t.z); dummy.scale.setScalar(Math.max(.0001, t.s * k)); dummy.updateMatrix(); pTrees.setMatrixAt(i, dummy.matrix); } pTrees.instanceMatrix.needsUpdate = true; }
    city.visible = done > 0; if (city.visible) { for (let i = 0; i < cityN; i++) { const b = cb[i], k = sm(b.d * .5, b.d * .5 + .5, done), h = b.h * k + .0001; dummy.rotation.set(0, 0, 0); dummy.position.set(b.x, h / 2, b.z); dummy.scale.set(b.w, h, b.w); dummy.updateMatrix(); city.setMatrixAt(i, dummy.matrix); } city.instanceMatrix.needsUpdate = true; }
    // camera
    const u = curveU(p); posCurve.getPoint(u, cPos); tgtCurve.getPoint(u, cTgt);
    if (aspect < 1) { cPos.sub(cTgt).multiplyScalar(1 + (1 - aspect) * .55 * sm(.3, 1, p)).add(cTgt); }
    camera.position.copy(cPos); camera.lookAt(cTgt);
  }

  return {
    setProgress,
    resize(w, h) { aspect = w / h; camera.aspect = aspect; camera.fov = aspect < 1 ? 58 : 46; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); },
    render() { renderer.render(scene, camera); },
    dispose() { disposables.forEach(d => d.dispose()); renderer.dispose(); }
  };
}
