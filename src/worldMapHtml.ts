// Self-contained HTML visual for Power BI "HTML Content" custom visual.
// Dark Dracula-like background, neon country contours, neon star particles,
// and animated flight arcs between countries (planes taking off / landing).
//
// Usage in a Power BI measure (DAX):
//   WorldMapVisual = <the string produced by WorldMapHtml()>
// Then point the HTML Content custom visual at that measure.
//
// Pure HTML + CSS + JS, no external dependencies, no network calls.

/* ---------- Country outlines as [lon,lat] polygons (simplified) ---------- */
type Ring = [number, number][];
interface CountryDef { name: string; rings: Ring[]; }

const COUNTRIES_DEF: CountryDef[] = [
  { name: "Canada", rings: [[[-141,70],[-141,60],[-128,54],[-125,49],[-95,49],[-89,49],[-83,46],[-79,43],[-74,45],[-67,47],[-60,47],[-53,47],[-55,52],[-66,60],[-78,63],[-85,65],[-95,69],[-110,72],[-125,72],[-138,70],[-141,70]]] },
  { name: "United States", rings: [[[-125,49],[-95,49],[-89,49],[-83,46],[-81,41],[-77,38],[-75,37],[-76,35],[-80,32],[-82,27],[-83,26],[-90,29],[-97,26],[-103,29],[-108,31],[-114,32],[-117,33],[-121,36],[-124,40],[-124,45],[-125,49]]] },
  { name: "Mexico", rings: [[[-117,32],[-108,31],[-103,29],[-97,26],[-94,29],[-90,29],[-89,21],[-92,18],[-95,16],[-98,16],[-104,19],[-110,23],[-115,28],[-117,32]]] },
  { name: "Brazil", rings: [[[-73,5],[-69,1],[-66,-2],[-60,-3],[-50,-1],[-44,-2],[-39,-8],[-35,-9],[-37,-15],[-43,-23],[-53,-30],[-58,-27],[-62,-22],[-65,-15],[-70,-9],[-73,-5],[-73,5]]] },
  { name: "Argentina", rings: [[[-66,-22],[-58,-27],[-54,-35],[-58,-39],[-65,-42],[-69,-50],[-73,-53],[-71,-55],[-66,-55],[-65,-48],[-68,-40],[-70,-33],[-70,-27],[-66,-22]]] },
  { name: "Colombia", rings: [[[-77,8],[-72,12],[-67,11],[-67,6],[-70,1],[-74,1],[-78,2],[-79,7],[-77,8]]] },
  { name: "Peru", rings: [[[-81,-4],[-75,-0],[-69,-0],[-68,-6],[-69,-13],[-73,-17],[-76,-14],[-81,-7],[-81,-4]]] },
  { name: "Chile", rings: [[[-70,-18],[-67,-22],[-67,-28],[-70,-33],[-72,-39],[-73,-45],[-73,-53],[-71,-55],[-69,-52],[-69,-45],[-71,-37],[-72,-30],[-71,-23],[-70,-18]]] },
  { name: "United Kingdom", rings: [[[-5,58],[-3,58],[-2,55],[1,52],[2,51],[1,49],[-3,50],[-5,50],[-5,53],[-3,55],[-5,58]]] },
  { name: "Ireland", rings: [[[-10,54],[-6,55],[-6,52],[-10,52],[-10,54]]] },
  { name: "France", rings: [[[-1,49],[2,51],[4,49],[7,49],[8,43],[3,43],[-1,44],[-2,47],[-1,49]]] },
  { name: "Spain", rings: [[[-9,43],[-2,43],[3,42],[3,40],[0,37],[-5,36],[-9,37],[-9,43]]] },
  { name: "Portugal", rings: [[[-9,42],[-7,42],[-7,37],[-9,37],[-9,42]]] },
  { name: "Germany", rings: [[[6,54],[9,55],[13,54],[15,51],[12,50],[10,47],[7,48],[6,51],[6,54]]] },
  { name: "Italy", rings: [[[7,46],[12,46],[13,45],[14,42],[18,41],[16,38],[15,38],[13,38],[11,42],[8,44],[7,46]]] },
  { name: "Poland", rings: [[[15,54],[19,54],[23,54],[24,50],[22,49],[18,49],[15,50],[15,54]]] },
  { name: "Sweden", rings: [[[12,68],[20,66],[23,68],[24,66],[22,60],[18,57],[13,56],[12,58],[15,62],[12,65],[12,68]]] },
  { name: "Norway", rings: [[[5,62],[10,65],[14,69],[21,70],[28,71],[31,70],[24,68],[16,66],[12,64],[8,60],[5,58],[5,62]]] },
  { name: "Finland", rings: [[[22,60],[26,60],[30,62],[31,70],[27,70],[24,68],[22,66],[22,60]]] },
  { name: "Ukraine", rings: [[[22,52],[34,52],[40,49],[39,46],[37,45],[32,45],[28,46],[23,48],[22,52]]] },
  { name: "Romania", rings: [[[21,48],[26,48],[29,46],[28,44],[24,44],[21,45],[21,48]]] },
  { name: "Greece", rings: [[[20,42],[24,41],[27,40],[26,37],[22,37],[20,39],[20,42]]] },
  { name: "Turkey", rings: [[[26,42],[35,42],[44,42],[44,37],[36,36],[28,36],[26,38],[26,42]]] },
  { name: "Russia", rings: [[[28,70],[40,68],[60,68],[80,73],[110,74],[140,73],[170,70],[180,68],[180,60],[160,60],[140,57],[130,53],[120,52],[110,52],[100,54],[88,51],[80,50],[70,50],[60,51],[50,51],[40,49],[37,45],[40,43],[45,42],[50,45],[55,50],[45,55],[35,55],[30,55],[28,60],[28,70]]] },
  { name: "Kazakhstan", rings: [[[50,55],[60,55],[70,55],[80,53],[80,48],[68,45],[55,45],[50,48],[50,55]]] },
  { name: "China", rings: [[[74,39],[80,42],[90,42],[100,42],[110,42],[120,42],[125,45],[130,45],[130,40],[122,35],[120,30],[115,25],[110,21],[105,22],[100,22],[95,24],[90,28],[85,30],[80,33],[75,35],[74,39]]] },
  { name: "Mongolia", rings: [[[88,49],[95,50],[115,49],[120,46],[110,43],[95,43],[88,45],[88,49]]] },
  { name: "India", rings: [[[68,24],[72,28],[78,32],[84,28],[88,25],[92,24],[91,22],[88,21],[83,17],[78,10],[76,8],[73,12],[70,18],[68,22],[68,24]]] },
  { name: "Pakistan", rings: [[[61,25],[66,25],[68,24],[68,30],[72,34],[75,37],[74,33],[70,30],[66,30],[61,30],[61,25]]] },
  { name: "Iran", rings: [[[44,38],[50,38],[57,38],[61,31],[63,25],[57,25],[52,27],[48,30],[45,33],[44,38]]] },
  { name: "Saudi Arabia", rings: [[[35,29],[44,29],[55,26],[55,20],[52,16],[45,12],[42,16],[38,22],[35,29]]] },
  { name: "Iraq", rings: [[[39,36],[44,37],[47,35],[46,30],[42,30],[39,32],[39,36]]] },
  { name: "Egypt", rings: [[[25,32],[34,32],[36,29],[36,22],[33,22],[25,22],[25,32]]] },
  { name: "Libya", rings: [[[10,32],[20,32],[25,32],[25,22],[20,20],[15,20],[10,24],[10,32]]] },
  { name: "Algeria", rings: [[[-8,37],[0,37],[8,37],[10,32],[10,24],[3,22],[-5,22],[-8,28],[-8,37]]] },
  { name: "Morocco", rings: [[[-8,36],[-1,36],[2,35],[1,30],[-5,28],[-8,30],[-8,36]]] },
  { name: "Nigeria", rings: [[[3,13],[8,13],[14,13],[14,7],[8,4],[3,6],[3,13]]] },
  { name: "South Africa", rings: [[[17,-29],[25,-29],[31,-29],[32,-25],[28,-22],[22,-20],[18,-22],[17,-29]]] },
  { name: "Ethiopia", rings: [[[33,9],[38,9],[43,9],[45,6],[42,4],[38,4],[34,5],[33,9]]] },
  { name: "Kenya", rings: [[[34,4],[41,4],[41,-2],[34,-2],[34,4]]] },
  { name: "Sudan", rings: [[[22,22],[31,22],[37,22],[38,16],[33,10],[27,10],[24,14],[22,18],[22,22]]] },
  { name: "DR Congo", rings: [[[12,5],[25,5],[30,-2],[29,-8],[25,-11],[18,-8],[12,-6],[12,5]]] },
  { name: "Japan", rings: [[[130,33],[136,35],[141,38],[141,41],[145,44],[142,45],[138,40],[134,36],[130,33]]] },
  { name: "South Korea", rings: [[[126,38],[129,38],[130,35],[127,34],[126,35],[126,38]]] },
  { name: "Indonesia", rings: [[[95,5],[105,5],[115,5],[125,5],[130,-2],[120,-3],[110,-3],[100,-2],[95,5]]] },
  { name: "Australia", rings: [[[114,-22],[122,-18],[130,-12],[137,-12],[142,-10],[145,-15],[150,-22],[153,-28],[148,-37],[140,-38],[130,-32],[120,-32],[115,-30],[114,-22]]] },
  { name: "New Zealand", rings: [[[166,-41],[173,-37],[176,-39],[178,-42],[172,-46],[167,-45],[166,-41]]] },
  { name: "Thailand", rings: [[[98,20],[102,20],[105,18],[105,13],[101,7],[100,8],[99,13],[98,20]]] },
  { name: "Vietnam", rings: [[[102,22],[107,22],[110,21],[109,16],[106,11],[105,9],[104,14],[102,18],[102,22]]] },
  { name: "Myanmar", rings: [[[94,28],[98,28],[101,22],[101,17],[98,16],[95,19],[94,24],[94,28]]] },
  { name: "Philippines", rings: [[[120,18],[122,18],[125,12],[127,9],[124,7],[121,9],[120,14],[120,18]]] },
];

/* ---------- Equirectangular projection to viewBox 0 0 1010 500 ---------- */
const W = 1010, H = 500;
const proj = (lon: number, lat: number): [number, number] => [
  ((lon + 180) / 360) * W,
  ((90 - lat) / 180) * H,
];

interface Country { name: string; d: string; }
const COUNTRIES: Country[] = COUNTRIES_DEF.map((c) => ({
  name: c.name,
  d: c.rings
    .map((ring) => {
      const pts = ring.map(([lon, lat]) => {
        const [x, y] = proj(lon, lat);
        return x.toFixed(1) + " " + y.toFixed(1);
      });
      return "M" + pts.join(" L") + " Z";
    })
    .join(" "),
}));

/* ---------- Hub cities (major airports) ---------- */
interface Hub { name: string; country: string; lon: number; lat: number; }
const HUBS: Hub[] = [
  { name: "New York", country: "United States", lon: -74.0, lat: 40.7 },
  { name: "Los Angeles", country: "United States", lon: -118.2, lat: 34.1 },
  { name: "Toronto", country: "Canada", lon: -79.4, lat: 43.7 },
  { name: "Mexico City", country: "Mexico", lon: -99.1, lat: 19.4 },
  { name: "São Paulo", country: "Brazil", lon: -46.6, lat: -23.5 },
  { name: "Buenos Aires", country: "Argentina", lon: -58.4, lat: -34.6 },
  { name: "London", country: "United Kingdom", lon: -0.1, lat: 51.5 },
  { name: "Paris", country: "France", lon: 2.3, lat: 48.9 },
  { name: "Frankfurt", country: "Germany", lon: 8.7, lat: 50.1 },
  { name: "Madrid", country: "Spain", lon: -3.7, lat: 40.4 },
  { name: "Rome", country: "Italy", lon: 12.5, lat: 41.9 },
  { name: "Istanbul", country: "Turkey", lon: 28.9, lat: 41.0 },
  { name: "Moscow", country: "Russia", lon: 37.6, lat: 55.8 },
  { name: "Cairo", country: "Egypt", lon: 31.2, lat: 30.0 },
  { name: "Lagos", country: "Nigeria", lon: 3.4, lat: 6.5 },
  { name: "Johannesburg", country: "South Africa", lon: 28.0, lat: -26.2 },
  { name: "Nairobi", country: "Kenya", lon: 36.8, lat: -1.3 },
  { name: "Dubai", country: "United Arab Emirates", lon: 55.3, lat: 25.2 },
  { name: "Mumbai", country: "India", lon: 72.8, lat: 19.1 },
  { name: "Delhi", country: "India", lon: 77.2, lat: 28.6 },
  { name: "Beijing", country: "China", lon: 116.4, lat: 39.9 },
  { name: "Shanghai", country: "China", lon: 121.5, lat: 31.2 },
  { name: "Hong Kong", country: "China", lon: 114.2, lat: 22.3 },
  { name: "Tokyo", country: "Japan", lon: 139.7, lat: 35.7 },
  { name: "Seoul", country: "South Korea", lon: 127.0, lat: 37.6 },
  { name: "Singapore", country: "Singapore", lon: 103.8, lat: 1.3 },
  { name: "Bangkok", country: "Thailand", lon: 100.5, lat: 13.8 },
  { name: "Sydney", country: "Australia", lon: 151.2, lat: -33.9 },
  { name: "Jakarta", country: "Indonesia", lon: 106.8, lat: -6.2 },
];

const PALETTE = ["#8be9fd", "#bd93f9", "#ff79c6", "#50fa7b", "#f1fa8c", "#ffb86c"];

export const WorldMapHtml = (): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root{
    --bg:#282a36; --bg2:#21222c; --current:#44475a; --fg:#f8f8f2;
    --comment:#6272a4; --cyan:#8be9fd; --green:#50fa7b; --yellow:#f1fa8c;
  }
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;width:100%;overflow:hidden;background:var(--bg);font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:var(--fg)}
  #wrap{position:relative;width:100%;height:100%}
  svg#map{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1}
  #stars{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
  .country{fill:var(--bg2);stroke:var(--cyan);stroke-width:.45;stroke-opacity:.55;transition:fill .25s,stroke .25s,stroke-opacity .25s}
  .country:hover{fill:#343746;stroke:var(--green);stroke-opacity:1;cursor:pointer}
  .arc{fill:none;stroke-linecap:round;filter:url(#neonGlow)}
  .plane{fill:var(--yellow);filter:url(#planeGlow)}
  .pulse{transform-box:fill-box;transform-origin:center}
  #hud{position:absolute;left:16px;top:12px;z-index:5;pointer-events:none}
  #hud .t{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--comment)}
  #hud .v{font-size:22px;font-weight:600;color:var(--cyan);text-shadow:0 0 8px rgba(139,233,253,.6)}
  #legend{position:absolute;right:16px;bottom:14px;z-index:5;font-size:11px;color:var(--comment);letter-spacing:.12em;text-transform:uppercase;text-align:right;line-height:1.7;pointer-events:none}
  #legend b{color:var(--green)} #legend i{color:var(--yellow);font-style:normal}
  .tip{position:absolute;z-index:6;background:rgba(33,34,44,.94);border:1px solid var(--current);border-radius:6px;padding:8px 10px;font-size:12px;color:var(--fg);pointer-events:none;opacity:0;transform:translate(-50%,-110%);transition:opacity .15s;white-space:nowrap}
  .tip.show{opacity:1}
  .tip .name{color:var(--cyan);font-weight:600;margin-bottom:2px}
</style>
</head>
<body>
<div id="wrap">
  <canvas id="stars"></canvas>
  <svg id="map" viewBox="0 0 1010 500" preserveAspectRatio="xMidYMid meet">
    <defs>
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="planeGlow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="1.6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g id="countries"></g>
    <g id="arcs"></g>
    <g id="markers"></g>
  </svg>
  <div id="hud"><div class="t">Global Network</div><div class="v" id="hudCount">0 flights</div></div>
  <div id="legend"><div><b>●</b> Country contours</div><div><i>✈</i> Active routes</div></div>
  <div class="tip" id="tip"></div>
</div>
<script>
(function(){
  "use strict";
  var C = ${JSON.stringify(COUNTRIES)};
  var HUBS = ${JSON.stringify(HUBS.map((h) => {
    const [x, y] = proj(h.lon, h.lat);
    return { name: h.name, country: h.country, x, y };
  }))};
  var PALETTE = ${JSON.stringify(PALETTE)};

  /* ---- Stars ---- */
  var cv=document.getElementById('stars'), cx=cv.getContext('2d'), stars=[];
  function sizeCanvas(){ cv.width=window.innerWidth; cv.height=window.innerHeight; }
  sizeCanvas(); window.addEventListener('resize',sizeCanvas);
  for(var i=0;i<140;i++){
    stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.3,
      c:PALETTE[Math.floor(Math.random()*PALETTE.length)],
      s:Math.random()*2+.6, ph:Math.random()*Math.PI*2});
  }
  function drawStars(t){
    cx.clearRect(0,0,cv.width,cv.height);
    for(var i=0;i<stars.length;i++){
      var s=stars[i], a=.35+.65*Math.abs(Math.sin(t*.001*s.s+s.ph));
      cx.globalAlpha=a; cx.fillStyle=s.c; cx.shadowBlur=8; cx.shadowColor=s.c;
      cx.beginPath(); cx.arc(s.x*cv.width,s.y*cv.height,s.r,0,6.283); cx.fill();
    }
    cx.globalAlpha=1; cx.shadowBlur=0;
  }

  /* ---- Countries ---- */
  var gC=document.getElementById('countries'), tip=document.getElementById('tip');
  var frag=document.createDocumentFragment();
  C.forEach(function(c){
    var p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',c.d); p.setAttribute('class','country'); p.setAttribute('data-name',c.name);
    p.addEventListener('mouseenter',function(e){ showTip(e,c.name); });
    p.addEventListener('mousemove',moveTip);
    p.addEventListener('mouseleave',hideTip);
    frag.appendChild(p);
  });
  gC.appendChild(frag);
  function showTip(e,n){
    if(!tip.querySelector('.name')) tip.insertAdjacentHTML('afterbegin','<div class="name"></div>');
    tip.firstChild.textContent=n; tip.classList.add('show'); moveTip(e);
  }
  function moveTip(e){ tip.style.left=e.clientX+'px'; tip.style.top=(e.clientY-10)+'px'; }
  function hideTip(){ tip.classList.remove('show'); }

  /* ---- Markers (pulsing hubs) ---- */
  var gM=document.getElementById('markers');
  HUBS.forEach(function(h){
    var g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform','translate('+h.x.toFixed(1)+','+h.y.toFixed(1)+')');
    var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r','2.2'); c.setAttribute('fill','#50fa7b'); c.setAttribute('class','pulse');
    c.style.filter='url(#planeGlow)';
    g.appendChild(c); gM.appendChild(g);
  });

  /* ---- Flight arcs ---- */
  var gA=document.getElementById('arcs'), active=0, hudEl=document.getElementById('hudCount');
  function updateHud(){ hudEl.textContent=active+' flight'+(active===1?'':'s'); }
  function arcPts(x1,y1,x2,y2,seg){
    var mx=(x1+x2)/2, my=(y1+y2)/2, dx=x2-x1, dy=y2-y1, dist=Math.hypot(dx,dy);
    var lift=Math.min(120, dist*0.22);
    var nx=-dy, ny=dx, nl=Math.hypot(nx,ny)||1; nx/=nl; ny/=nl;
    if(ny>0){nx=-nx;ny=-ny;}
    var cxp=mx+nx*lift, cyp=my+ny*lift, pts=[];
    for(var i=0;i<=seg;i++){ var t=i/seg, u=1-t;
      pts.push([u*u*x1+2*u*t*cxp+t*t*x2, u*u*y1+2*u*t*cyp+t*t*y2]); }
    return pts;
  }
  function launchFlight(){
    if(HUBS.length<2) return;
    var a=HUBS[Math.floor(Math.random()*HUBS.length)];
    var b=HUBS[Math.floor(Math.random()*HUBS.length)];
    if(a===b) return;
    var pts=arcPts(a.x,a.y,b.x,b.y,48);
    var d='M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' L');
    var path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d); path.setAttribute('class','arc');
    var col=PALETTE[Math.floor(Math.random()*PALETTE.length)];
    path.setAttribute('stroke',col); path.setAttribute('stroke-width','1.4');
    gA.appendChild(path);
    var len=path.getTotalLength();
    path.style.strokeDasharray=len+' '+len; path.style.strokeDashoffset=len;
    var plane=document.createElementNS('http://www.w3.org/2000/svg','circle');
    plane.setAttribute('r','2.4'); plane.setAttribute('class','plane'); gA.appendChild(plane);
    active++; updateHud();
    var dur=2200+Math.random()*1800, start=null;
    function step(ts){
      if(start===null) start=ts;
      var t=Math.min((ts-start)/dur,1);
      path.style.strokeDashoffset=len*(1-t);
      var p=path.getPointAtLength(len*t);
      plane.setAttribute('cx',p.x); plane.setAttribute('cy',p.y);
      var op=t>0.8?(1-(t-0.8)/0.2):1;
      path.style.strokeOpacity=0.85*op; plane.style.opacity=op;
      if(t<1){ requestAnimationFrame(step); }
      else { path.remove(); plane.remove(); active--; updateHud(); }
    }
    requestAnimationFrame(step);
  }

  function loop(t){ drawStars(t); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  setInterval(launchFlight, 650);
  launchFlight(); setTimeout(launchFlight,300); setTimeout(launchFlight,700);
})();
</script>
</body>
</html>`;
