'use strict';
(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: true });
  const bar = document.getElementById('progress');
  const chapterNumber = document.getElementById('chapter-number');
  const chapters = [...document.querySelectorAll('[data-scene]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.getElementById('year').textContent = new Date().getFullYear();
  if (!ctx) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  let w, h, scrollScene = 0, targetScene = 0, pointerX = 0, pointerY = 0;
  let frame = 0, last = 0, visible = true;

  // Subdivided icosahedron: an actual 3D surface with depth-sorted faces.
  const phi = (1 + Math.sqrt(5)) / 2;
  let vertices = [
    [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
    [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
    [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
  ];
  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
  ];
  vertices = vertices.map(v => { const n = Math.hypot(...v); return v.map(x => x / n); });
  for (let s = 0; s < 2; s++) {
    const cache = new Map(), next = [];
    const middle = (a, b) => {
      const key = [Math.min(a,b),Math.max(a,b)].join(':');
      if (cache.has(key)) return cache.get(key);
      const v = vertices[a].map((x,i) => x + vertices[b][i]);
      const n = Math.hypot(...v), index = vertices.push(v.map(x => x / n)) - 1;
      cache.set(key,index); return index;
    };
    for (const [a,b,c] of faces) { const ab=middle(a,b), bc=middle(b,c), ca=middle(c,a); next.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]); }
    faces = next;
  }
  const edges = [...new Set(faces.flatMap(([a,b,c]) => [[a,b],[b,c],[c,a]].map(([x,y]) => [Math.min(x,y),Math.max(x,y)].join(':'))))].map(s => s.split(':').map(Number));
  const stars = Array.from({length:100}, (_,i) => ({ x:((i*137.508)%101)/101, y:((i*71.283)%97)/97, size:i%9===0?1.5:.65, phase:i*.71 }));
  const labels = ['01','02','03','04','05'];

  function resize() {
    w = innerWidth; h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    updateScroll();
    draw(performance.now());
  }
  function updateScroll() {
    const center = scrollY + h * .5;
    let position = 0;
    for (let i = 0; i < chapters.length-1; i++) {
      const a = chapters[i].offsetTop + chapters[i].offsetHeight*.5;
      const b = chapters[i+1].offsetTop + chapters[i+1].offsetHeight*.5;
      if (center >= a) position = i + smooth((center-a)/(b-a));
    }
    targetScene = clamp(position,0,4);
    chapterNumber.textContent = labels[clamp(Math.round(position),0,4)];
    bar.style.transform = `scaleX(${clamp(scrollY / Math.max(1,document.documentElement.scrollHeight-h),0,1)})`;
    if (reduced.matches) { scrollScene=targetScene; draw(performance.now()); }
  }
  function shape(p, stage, i) {
    const [x,y,z] = p;
    if (stage===0) return [x*1.18,y*1.18,z*1.18];
    if (stage===1) { const a=Math.atan2(z,x)+y*2.1; return [Math.cos(a)*(1.05+y*.22),y*1.6,Math.sin(a)*(1.05+y*.22)]; }
    if (stage===2) { const a=Math.atan2(z,x)+y*3.2; const rad=1.12+.16*Math.sin(y*8); return [Math.cos(a)*rad,y*1.65,Math.sin(a)*rad]; }
    if (stage===3) { const a=Math.atan2(z,x); const radius=1.2 + y*.35; return [Math.cos(a)*radius,y*.75,Math.sin(a)*radius]; }
    const a=Math.atan2(z,x)+y*.9, radius=1.3+Math.abs(y)*.6;
    return [Math.cos(a)*radius,y*1.45,Math.sin(a)*radius];
  }
  function transform(v, yaw, pitch, roll) {
    const [x,y,z]=v, cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
    const ax=x*cy-z*sy, az=x*sy+z*cy, ay=y*cp-az*sp, bz=y*sp+az*cp;
    return [ax*cr-ay*sr,ax*sr+ay*cr,bz];
  }
  function project(v,cx,cy,scale) {
    const perspective = 5.2/(6+v[2]);
    return {x:cx+v[0]*scale*perspective,y:cy+v[1]*scale*perspective,z:v[2]};
  }
  function line(a,b,color,width=1) {
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  function orbit(cx,cy,scale,angle,tilt,rx,ry,glow) {
    ctx.beginPath();
    for(let i=0;i<=120;i++) {
      const t=i*Math.PI*2/120;
      const v=transform([Math.cos(t)*rx,Math.sin(t)*ry,0],angle,tilt,angle*.35);
      const p=project(v,cx,cy,scale);
      if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
    }
    ctx.strokeStyle=glow;ctx.lineWidth=1;ctx.stroke();
    const moving=transform([Math.cos(angle*1.6)*rx,Math.sin(angle*1.6)*ry,0],angle,tilt,angle*.35);
    const point=project(moving,cx,cy,scale);
    const halo=ctx.createRadialGradient(point.x,point.y,1,point.x,point.y,22);
    halo.addColorStop(0,'#ffffff');halo.addColorStop(.15,'#a8e5ffb8');halo.addColorStop(1,'#a8e5ff00');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(point.x,point.y,22,0,Math.PI*2);ctx.fill();
  }
  function draw(time) {
    ctx.clearRect(0,0,w,h);
    const scene = reduced.matches ? targetScene : scrollScene;
    const base=Math.floor(scene), blend=smooth(scene-base);
    const seconds=reduced.matches?0:time*.001;
    const cx=w*(w<700?.63:.75)+pointerX*(w<700?8:26);
    const cy=h*.51+pointerY*18;
    const scale=Math.min(w,h)*(w<700?.42:.52);
    const rotation=seconds*.15+scene*.87;
    const pitch=.22+Math.sin(seconds*.14+scene*.6)*.16+pointerY*.15;
    const roll=scene*.17+pointerX*.08;

    // Moving star field and a broad atmospheric bloom around the central object.
    for(const s of stars){const x=(s.x*w + scene*18)%(w+20),y=s.y*h;
      ctx.fillStyle=`rgba(186,223,250,${.11+(Math.sin(seconds*.8+s.phase)+1)*.10})`;
      ctx.beginPath();ctx.arc(x,y,s.size,0,Math.PI*2);ctx.fill();}
    const bloom=ctx.createRadialGradient(cx,cy,scale*.2,cx,cy,scale*2.1);
    bloom.addColorStop(0,'#538bc622');bloom.addColorStop(.6,'#173d7f11');bloom.addColorStop(1,'#06080e00');
    ctx.fillStyle=bloom;ctx.fillRect(0,0,w,h);

    const projected=vertices.map((p,i)=>{
      const from=shape(p,base,i),to=shape(p,Math.min(base+1,4),i);
      const v=transform(from.map((x,k)=>mix(x,to[k],blend)),rotation+pointerX*.23,pitch,roll);
      return project(v,cx,cy,scale);
    });
    // Filled facets create visible depth; edge light reveals the underlying structure.
    const ordered=faces.map(f=>({f,z:(projected[f[0]].z+projected[f[1]].z+projected[f[2]].z)/3})).sort((a,b)=>b.z-a.z);
    for(const {f,z} of ordered){
      const a=projected[f[0]],b=projected[f[1]],c=projected[f[2]];
      const alpha=clamp(.025-z*.024,.012,.10);
      ctx.fillStyle=`rgba(92,178,255,${alpha})`;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fill();
    }
    for(const [a,b] of edges){const p=projected[a],q=projected[b],alpha=clamp(.28-(p.z+q.z)*.075,.045,.62);line(p,q,`rgba(151,215,255,${alpha})`,.9);}
    for(let i=0;i<projected.length;i+=3){const p=projected[i],radius=i%11===0?2.9:1.2;ctx.fillStyle=i%11===0?'#d9f4ff':`rgba(158,217,255,${clamp(.8-p.z*.13,.2,.94)})`;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();}
    orbit(cx,cy,scale,rotation*.6+.35,.52,1.7,1.22,'#a9e1ff66');
    orbit(cx,cy,scale,-rotation*.47-1.1,-.62,1.95,1.5,'#8ac6ff42');
    orbit(cx,cy,scale,rotation*.31+2.4,1.08,1.57,1.82,'#bfaeff36');

    // One luminous thread traces the surface as the visitor moves through chapters.
    const index=Math.floor((scene/4)*(vertices.length-1));
    const point=projected[index];
    const halo=ctx.createRadialGradient(point.x,point.y,0,point.x,point.y,34);
    halo.addColorStop(0,'#ffffff');halo.addColorStop(.1,'#b4eaffdd');halo.addColorStop(1,'#8acfff00');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(point.x,point.y,34,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#bfeeffaa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(point.x,point.y,20,0,Math.PI*2);ctx.stroke();
  }
  function tick(time) {
    frame=requestAnimationFrame(tick);
    if(!visible || reduced.matches || time-last<30) return;
    last=time;
    scrollScene += (targetScene-scrollScene)*.075;
    draw(time);
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('pointermove',e=>{
    if(reduced.matches)return;
    pointerX=clamp(e.clientX/Math.max(1,w)*2-1,-1,1);
    pointerY=clamp(e.clientY/Math.max(1,h)*2-1,-1,1);
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)last=0});
  reduced.addEventListener('change',()=>{scrollScene=targetScene;draw(performance.now())});
  resize();tick(performance.now());
})();
