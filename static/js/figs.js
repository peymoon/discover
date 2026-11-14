/* Results and ablation figures (data: paper Tables 1, 2, 8, 9). Plain SVG, animated once when scrolled into view. */
(function(){
'use strict';
var NS = 'http://www.w3.org/2000/svg';
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function clamp(x, a, b){ return Math.max(a, Math.min(b, x)); }
function prog(t, a, d){ return clamp((t - a)/d, 0, 1); }
function eo(x){ return 1 - Math.pow(1 - x, 3); }
function eio(x){ return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
var css = getComputedStyle(document.documentElement);
function v(n){ return css.getPropertyValue(n).trim(); }
var C = { ink:v('--ink'), ink2:v('--ink-2'), ink3:v('--ink-3'), rule:v('--rule'), accent:v('--accent'), soft:v('--accent-soft'),
          none:'#9AA0AC', low:'#E3A600', high:'#D23B34' };
function costCol(g){ return g === 0 ? C.none : (g < 1 ? C.low : C.high); }
var DSC = '<tspan style="font-variant:small-caps">Discover</tspan>';

/* a figure = an <svg>, a draw(t) function and a duration; it plays once when it first becomes visible */
function player(svg, draw, dur){
  var t0 = null, raf = null, seen = false;
  function frame(ts){ if (t0 == null) t0 = ts; var t = (ts - t0)/1000; svg.innerHTML = draw(Math.min(t, dur)); raf = t < dur ? requestAnimationFrame(frame) : null; }
  function play(){ if (reduce){ svg.innerHTML = draw(dur); return; } if (raf) cancelAnimationFrame(raf); t0 = null; raf = requestAnimationFrame(frame); }
  svg.innerHTML = draw(reduce ? dur : 0);
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en, ob){ if (en[0].isIntersecting && !seen){ seen = true; play(); ob.disconnect(); } }, { threshold:.35 }).observe(svg);
  } else play();
  return { replay:function(){ if (seen) play(); else svg.innerHTML = draw(reduce ? dur : 0); } };
}

/* ---------- main results: accuracy vs. share of the pool that received labels ---------- */
var RES = {
  512:  { y:[7,14], ticks:[8,10,12,14], base:7.86, ds:{
    virl:{ disc:13.12, pts:[['MaxVar-10%',90,11.04,7.2],['Full data',90,9.71,0],['VADE-10%',90,9.15,7.2],['Hard-10%',90,8.74,0.9],['VADE',90,8.32,7.2],['Random-10%',10,10.38,0],['DOTS-MM-10%',10,9.12,0.27]] },
    vlaa:{ disc:13.19, pts:[['Full data',90,12.13,0],['MaxVar-10%',90,11.76,7.2],['VADE-10%',90,10.29,7.2],['Hard-10%',90,9.87,0.9],['VADE',90,9.43,7.2],['Random-10%',10,11.32,0],['DOTS-MM-10%',10,10.24,0.37]] } } },
  2048: { y:[8,24], ticks:[10,14,18,22], base:10.00, ds:{
    virl:{ disc:21.33, pts:[['MaxVar-10%',90,17.88,7.2],['Full data',90,16.97,0],['VADE-10%',90,16.91,7.2],['Hard-10%',90,14.89,0.9],['VADE',90,14.63,7.2],['Random-10%',10,18.44,0],['DOTS-MM-10%',10,15.75,0.27]] },
    vlaa:{ disc:23.46, pts:[['Full data',90,20.08,0],['MaxVar-10%',90,19.61,7.2],['VADE-10%',90,18.19,7.2],['Hard-10%',90,17.92,0.9],['VADE',90,17.08,7.2],['Random-10%',10,18.23,0],['DOTS-MM-10%',10,18.68,0.37]] } } }
};
var W = 600, H = 420, X0 = 62, X1 = 400, Y0 = 350, Y1 = 34;
function spread(items, gap){
  var s = items.slice().sort(function(a, b){ return a.y - b.y; }), i;
  for (i = 1; i < s.length; i++) if (s[i].ly < s[i-1].ly + gap) s[i].ly = s[i-1].ly + gap;
  var sh = s.reduce(function(a, b){ return a + b.ly - b.y; }, 0)/s.length; s.forEach(function(o){ o.ly -= sh*.5; });
  for (i = 1; i < s.length; i++) if (s[i].ly < s[i-1].ly + gap) s[i].ly = s[i-1].ly + gap;
  return s;
}
function resDraw(cap, key, svg){
  return function(T){
    var cfg = RES[cap], d = cfg.ds[key], sk = svg.clientWidth && svg.clientWidth < 520 ? 1.5 : 1;
    function fs(x){ return (x*sk).toFixed(1); }
    function XM(x){ return X0 + (X1 - X0)*x/100; }
    function YM(y){ return Y0 - (Y0 - Y1)*(y - cfg.y[0])/(cfg.y[1] - cfg.y[0]); }
    var o = '';
    o += '<rect x="' + X0 + '" y="' + (Y1 - 12) + '" width="' + (XM(10) - X0) + '" height="' + (Y0 - Y1 + 12) + '" fill="' + C.soft + '"/>';
    o += '<text x="' + (X0 + XM(10))/2 + '" y="' + (Y1 - 18) + '" font-size="' + fs(12) + '" font-weight="700" fill="' + C.accent + '" text-anchor="middle">10% budget</text>';
    cfg.ticks.forEach(function(t){ o += '<line x1="' + X0 + '" y1="' + YM(t) + '" x2="' + (X1 + 12) + '" y2="' + YM(t) + '" stroke="' + C.rule + '"/><text x="' + (X0 - 8) + '" y="' + (YM(t) + 4) + '" font-size="' + fs(12) + '" fill="' + C.ink3 + '" text-anchor="end">' + t + '</text>'; });
    o += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + (X1 + 12) + '" y2="' + Y0 + '" stroke="' + C.ink3 + '" stroke-width="1.2"/><line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="' + (Y1 - 12) + '" stroke="' + C.ink3 + '" stroke-width="1.2"/>';
    [0, 10, 50, 90].forEach(function(t){ o += '<line x1="' + XM(t) + '" y1="' + Y0 + '" x2="' + XM(t) + '" y2="' + (Y0 + 5) + '" stroke="' + C.ink3 + '" stroke-width="1.2"/><text x="' + XM(t) + '" y="' + (Y0 + 19) + '" font-size="' + fs(12) + '" fill="' + C.ink3 + '" text-anchor="middle">' + t + (t ? '%' : '') + '</text>'; });
    o += '<text x="' + (X0 + X1)/2 + '" y="' + (Y0 + 40) + '" font-size="' + fs(13) + '" fill="' + C.ink2 + '" text-anchor="middle">labelled prompts (% of pool)</text>';
    o += '<text transform="translate(16 ' + (Y0 + Y1)/2 + ') rotate(-90)" font-size="' + fs(13) + '" fill="' + C.ink2 + '" text-anchor="middle">avg. accuracy (%)</text>';
    var qb = eo(prog(T, .2, .35));
    if (qb > 0){ var by = YM(cfg.base); o += '<circle cx="' + XM(0) + '" cy="' + by + '" r="' + (2 + 3*qb) + '" fill="' + C.none + '"/><text class="halo" x="' + (XM(0) + 8) + '" y="' + (by - 8) + '" font-size="' + fs(12) + '" fill="' + C.ink3 + '" opacity="' + qb + '">Base model</text>'; }
    var big = spread(d.pts.filter(function(p){ return p[1] === 90; }).map(function(p){ return { p:p, y:YM(p[2]), ly:YM(p[2]) }; }), 15*sk);
    var small = spread(d.pts.filter(function(p){ return p[1] === 10; }).map(function(p){ return { p:p, y:YM(p[2]), ly:YM(p[2]) }; }), 15*sk);
    var lab = '', LY = new Map(); big.concat(small).forEach(function(q){ LY.set(q.p, q.ly); });
    d.pts.forEach(function(p, k){
      var isBig = p[1] === 90, t0 = isBig ? .6 + k*.08 : 2.1 + (k - 5)*.12, dur = isBig ? 1.5 : .45, q = prog(T, t0, dur); if (q <= 0) return;
      var px = XM(p[1]*eio(q)), py = YM(p[2]), c = costCol(p[3]);
      o += '<line x1="' + XM(0) + '" y1="' + py + '" x2="' + px + '" y2="' + py + '" stroke="' + c + '" stroke-width="3.5" opacity=".45" stroke-linecap="round"/>';
      o += '<circle cx="' + px + '" cy="' + py + '" r="' + (5.5*Math.sqrt(sk)) + '" fill="' + c + '"/>';
      var la = eo(prog(T, t0 + dur*.8, .3)); if (la > 0){ var ly = LY.get(p), lx = XM(p[1]) + 12;
        if (Math.abs(ly - py) > 1) o += '<line x1="' + (XM(p[1]) + 6) + '" y1="' + py + '" x2="' + (lx - 3) + '" y2="' + ly + '" stroke="' + C.ink3 + '" opacity="' + la + '"/>';
        if (!isBig) lab += '<rect x="' + (lx - 3) + '" y="' + (ly - 8*sk) + '" width="' + (p[0].length*6.6*sk + 6) + '" height="' + (16*sk) + '" fill="#fff" opacity="' + la + '"/>';
        lab += '<text class="halo" x="' + lx + '" y="' + (ly + 4) + '" font-size="' + fs(12) + '" fill="' + C.ink2 + '" opacity="' + la + '">' + p[0] + '</text>'; }
    });
    var qd = prog(T, 2.8, .45);
    if (qd > 0){ var dx = XM(10*eio(qd)), dy = YM(d.disc);
      o += '<line x1="' + XM(0) + '" y1="' + dy + '" x2="' + dx + '" y2="' + dy + '" stroke="' + C.accent + '" stroke-width="3.5" opacity=".6" stroke-linecap="round"/><circle cx="' + dx + '" cy="' + dy + '" r="' + (7.5*Math.sqrt(sk)) + '" fill="' + C.accent + '"/>';
      var dl = eo(prog(T, 3.15, .3)); if (dl > 0) o += '<text class="halo" x="' + (XM(10) + 14) + '" y="' + (dy + 5) + '" font-size="' + fs(14) + '" font-weight="700" fill="' + C.accent + '" opacity="' + dl + '">' + DSC + '-10%</text>'; }
    var qr = prog(T, 3.5, .5);
    if (qr > 0){ var yb = Y0 - 10, xa = XM(10), xb = XM(10 + 80*eio(qr));
      o += '<line x1="' + xa + '" y1="' + yb + '" x2="' + xb + '" y2="' + yb + '" stroke="' + C.ink + '" stroke-width="1.5"/><line x1="' + xa + '" y1="' + (yb - 6) + '" x2="' + xa + '" y2="' + (yb + 6) + '" stroke="' + C.ink + '" stroke-width="1.5"/>';
      if (qr >= 1) o += '<line x1="' + XM(90) + '" y1="' + (yb - 6) + '" x2="' + XM(90) + '" y2="' + (yb + 6) + '" stroke="' + C.ink + '" stroke-width="1.5"/>';
      var bl = eo(prog(T, 3.9, .3)); if (bl > 0) o += '<text class="halo" x="' + (XM(10) + XM(90))/2 + '" y="' + (yb - 8) + '" font-size="' + fs(13) + '" font-weight="700" fill="' + C.ink + '" text-anchor="middle" opacity="' + bl + '">9× more labelled prompts</text>'; }
    return o + lab;
  };
}
var resPlayers = [], resCap = 512;
document.querySelectorAll('svg[data-res]').forEach(function(svg){
  var key = svg.getAttribute('data-res'), cur = { draw:resDraw(512, key, svg) };
  var pl = player(svg, function(t){ return cur.draw(t); }, 4.3);
  resPlayers.push({ set:function(cap){ cur.draw = resDraw(cap, key, svg); pl.replay(); } });
});
document.querySelectorAll('.tabs [data-rescap]').forEach(function(b){
  b.addEventListener('click', function(){
    b.parentNode.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    resCap = Number(b.getAttribute('data-rescap')); resPlayers.forEach(function(p){ p.set(resCap); });
  });
});

/* ---------- ablations: plain bars from 0, grouped by the part of the method they change ---------- */
var GROUPS = [
  { h:'Coverage alone', c:'#2E8B80', ic:'clusters', rows:[['Spread the budget over clusters, no scores', 8.23, 13.80]] },
  { h:'Replace neighbour transfer', c:'#3F6FC6', ic:'graph', rows:[['Random scores', 10.02, 17.16], ['Linear model (Ridge)', 8.80, 14.94], ['Linear model + extra probes', 10.86, 18.08], ['Small neural net (MLP)', 11.32, 20.14]] },
  { h:'Change the utility', c:'#C0842A', ic:'gauge', rows:[['No extra weight on harder prompts', 10.43, 17.89], ['Stricter easy-prompt filter', 11.12, 16.15]] },
  { h:'Change the schedule', c:'#B4527A', ic:'clock', rows:[['Score once, never refresh', 10.03, 16.47], ['Admit new prompts more slowly', 9.51, 16.23]] }
];
var FULL = [13.12, 21.33], RAND = [10.38, 18.44];
function tint(hex, a){ var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
  function f(x){ return Math.round(255 + (x - 255)*a); } return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
function icon(kind, cx, cy, c){
  var o = '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="' + c + '"/>', w = '#fff';
  if (kind === 'clusters') [[-3.5,-2.5],[3.5,-2.5],[0,3.5]].forEach(function(d){ o += '<circle cx="' + (cx + d[0]) + '" cy="' + (cy + d[1]) + '" r="2.5" fill="' + w + '"/>'; });
  if (kind === 'graph'){ [[-4.5,-3.5],[4.8,-3],[.5,5]].forEach(function(d){ o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + d[0]) + '" y2="' + (cy + d[1]) + '" stroke="' + w + '" stroke-width="1.3"/><circle cx="' + (cx + d[0]) + '" cy="' + (cy + d[1]) + '" r="1.8" fill="' + w + '"/>'; }); o += '<circle cx="' + cx + '" cy="' + cy + '" r="2.3" fill="' + w + '"/>'; }
  if (kind === 'gauge') o += '<path d="M' + (cx - 5.5) + ' ' + (cy + 2.5) + ' A5.5 5.5 0 0 1 ' + (cx + 5.5) + ' ' + (cy + 2.5) + '" fill="none" stroke="' + w + '" stroke-width="1.6" stroke-linecap="round"/><line x1="' + cx + '" y1="' + (cy + 2.5) + '" x2="' + (cx + 3.3) + '" y2="' + (cy - 2) + '" stroke="' + w + '" stroke-width="1.6" stroke-linecap="round"/>';
  if (kind === 'clock') o += '<circle cx="' + cx + '" cy="' + cy + '" r="5.5" fill="none" stroke="' + w + '" stroke-width="1.6"/><path d="M' + cx + ' ' + (cy - 3.3) + ' L' + cx + ' ' + cy + ' L' + (cx + 2.8) + ' ' + (cy + 1.5) + '" fill="none" stroke="' + w + '" stroke-width="1.6" stroke-linecap="round"/>';
  if (kind === 'check') o += '<path d="M' + (cx - 4.3) + ' ' + cy + ' L' + (cx - 1.2) + ' ' + (cy + 3.3) + ' L' + (cx + 4.5) + ' ' + (cy - 3) + '" fill="none" stroke="' + w + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  return o;
}
var AL;   // layout, rebuilt for narrow screens: labels then sit above their bars
function ablLayout(narrow){
  var L = narrow ? { AW:440, ROW:24, ITEM:40, GAP:10, LX:6, BX0:14, BX1:378, TOP:40, F:15, FH:15.5 }
                 : { AW:960, ROW:26, ITEM:26, GAP:10, LX:14, BX0:360, BX1:860, TOP:42, F:13, FH:13.5 };
  L.narrow = narrow; L.lay = []; var yy = L.TOP + L.ROW + L.GAP;
  GROUPS.forEach(function(g){ var G = { g:g, hy:yy, rows:[] }; yy += L.ROW; g.rows.forEach(function(r){ G.rows.push({ r:r, y:yy + (narrow ? 14 : 0) }); yy += L.ITEM; }); yy += L.GAP; L.lay.push(G); });
  L.AYB = yy - L.GAP + 4; L.AH = L.AYB + 46; return L;
}
function ablDraw(ci){
  var XHI = ci === 0 ? 14 : 24, ticks = ci === 0 ? [0, 4, 8, 12] : [0, 6, 12, 18, 24];
  return function(T){
    var L = AL, AW = L.AW, LX = L.LX, BX0 = L.BX0, BX1 = L.BX1, TOP = L.TOP, AYB = L.AYB, lay = L.lay, ROW = L.ROW;
    function XM(x){ return BX0 + (BX1 - BX0)*x/XHI; }
    var o = '', lbl = '', fy = L.narrow ? 14 : 0;   // in the narrow layout the full-method bar sits under its label too
    lay.forEach(function(G){ var top = G.hy - ROW/2 + 2, bot = G.rows[G.rows.length - 1].y + (L.narrow ? 12 : ROW/2 - 2);
      o += '<rect x="2" y="' + top + '" width="' + (AW - 4) + '" height="' + (bot - top) + '" rx="8" fill="' + tint(G.g.c, .08) + '"/><rect x="2" y="' + top + '" width="3.5" height="' + (bot - top) + '" rx="1.75" fill="' + G.g.c + '"/>'; });
    ticks.forEach(function(t){ o += '<line x1="' + XM(t) + '" y1="' + (TOP - 14) + '" x2="' + XM(t) + '" y2="' + AYB + '" stroke="' + C.rule + '"' + (t ? ' stroke-dasharray="2 4"' : '') + '/><text x="' + XM(t) + '" y="' + (AYB + 17) + '" font-size="' + L.F + '" fill="' + C.ink3 + '" text-anchor="middle">' + t + '</text>'; });
    o += '<line x1="' + BX0 + '" y1="' + AYB + '" x2="' + (BX1 + 14) + '" y2="' + AYB + '" stroke="' + C.ink3 + '" stroke-width="1.2"/>';
    if (!L.narrow) o += '<line x1="' + BX0 + '" y1="' + (TOP - 14) + '" x2="' + BX0 + '" y2="' + AYB + '" stroke="' + C.ink3 + '" stroke-width="1.2"/>';
    o += '<text x="' + (BX0 + BX1)/2 + '" y="' + (AYB + 38) + '" font-size="' + L.F + '" fill="' + C.ink2 + '" text-anchor="middle">avg. accuracy (%)</text>';
    var fhy = L.narrow ? TOP - 6 : TOP;
    o += icon('check', LX + 12, fhy, C.accent) + '<text x="' + (LX + 30) + '" y="' + (fhy + 5) + '" font-size="' + (L.FH + .5) + '" font-weight="700" fill="' + C.accent + '">Full ' + DSC + '</text>';
    lay.forEach(function(G){ o += icon(G.g.ic, LX + 12, G.hy, G.g.c) + '<text x="' + (LX + 30) + '" y="' + (G.hy + 5) + '" font-size="' + L.FH + '" font-weight="700" fill="' + G.g.c + '">' + G.g.h + '</text>';
      G.rows.forEach(function(R){ var ty = L.narrow ? R.y - 13 : R.y + 4.5; o += '<text x="' + (L.narrow ? BX0 : LX + 36) + '" y="' + ty + '" font-size="' + L.F + '" fill="' + C.ink + '">' + R.r[0] + '</text>'; }); });
    function bar(y, val, q, c, bold){ if (q <= 0) return; var w = (XM(val) - BX0)*eio(q);
      o += '<rect x="' + BX0 + '" y="' + (y - 7) + '" width="' + Math.max(w, 0) + '" height="14" rx="3" fill="' + c + '"/>';
      if (q >= 1) lbl += '<text class="halo" x="' + (XM(val) + 6) + '" y="' + (y + 4.5) + '" font-size="' + (L.F - 1) + '" font-weight="' + (bold ? 700 : 400) + '" fill="' + (bold ? C.accent : C.ink2) + '">' + val.toFixed(2) + '</text>'; }
    bar(TOP + fy, FULL[ci], prog(T, .2, .7), C.accent, true);
    lay.forEach(function(G, gi){ G.rows.forEach(function(R, k){ bar(R.y, R.r[1 + ci], prog(T, 1.1 + gi*.6 + k*.08, .6), G.g.c, false); }); });
    var qr = eo(prog(T, .9, .3));
    if (qr > 0){ var x = XM(RAND[ci]); o += '<line x1="' + x + '" y1="' + (TOP - 16 + fy) + '" x2="' + x + '" y2="' + AYB + '" stroke="' + C.ink3 + '" stroke-width="1.5" stroke-dasharray="5 4" opacity="' + qr + '"/><text class="halo" x="' + x + '" y="' + (TOP - 22) + '" font-size="' + (L.F - 1) + '" font-weight="700" fill="' + C.ink3 + '" text-anchor="' + (L.narrow ? 'end' : 'middle') + '" opacity="' + qr + '">Random-10%</text>'; }
    return o + lbl;
  };
}
var asvg = document.getElementById('ablChart');
if (asvg){
  var fitAbl = function(){ AL = ablLayout(asvg.parentNode.clientWidth < 560); asvg.setAttribute('viewBox', '0 0 ' + AL.AW + ' ' + AL.AH); };
  fitAbl();
  var acur = { draw:ablDraw(0) }, apl = player(asvg, function(t){ return acur.draw(t); }, 4);
  var lastNarrow = AL.narrow;
  addEventListener('resize', function(){ fitAbl(); if (AL.narrow !== lastNarrow){ lastNarrow = AL.narrow; apl.replay(); } });
  document.querySelectorAll('.tabs [data-ablcap]').forEach(function(b){
    b.addEventListener('click', function(){
      b.parentNode.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      acur.draw = ablDraw(b.getAttribute('data-ablcap') === '512' ? 0 : 1); apl.replay();
    });
  });
}
})();
