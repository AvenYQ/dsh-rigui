// 日晷的天空：白天跟着真实天气和太阳，夜里是一整页星空；还有那个果冻手感的日夜开关
import React, { useEffect, useRef } from 'react'
import { kindOf } from './weather.jsx'

// 整页夜空：星星一次生成；切到夜里时按离开关的远近依次亮起，亮完就停，不逐帧画
export function rgStarSky(el) {
  const cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
  const host = el.closest(".lf-host") || el.parentElement;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [], W = 0, H = 0, raf = 0, p = 1, ox = 0, oy = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const D = Math.hypot(W, H) || 1;
    for (const st of stars) {
      let k = 1;
      if (p < 1) {
        const d = Math.hypot(st.x - ox, st.y - oy) / D;
        k = Math.max(0, Math.min(1, (p - d * 0.7) / 0.3));
      }
      if (!k) continue;
      ctx.globalAlpha = st.a * k;
      ctx.fillStyle = st.c;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.z * (0.6 + 0.4 * k), 0, 6.283);
      ctx.fill();
      if (st.z > 1.5) {
        ctx.globalAlpha = st.a * k * 0.18;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.z * 3, 0, 6.283);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };
  const build = () => {
    const h = host.clientHeight || window.innerHeight;
    el.style.setProperty("--rg-h", h + "px");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = el.clientWidth;
    H = h;
    if (!W || !H) return;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let s = 13;
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    stars = Array.from({ length: Math.round(W * H / 5200) }, () => ({ x: r() * W, y: r() * H, z: r() < 0.08 ? 1.6 + r() * 0.8 : 0.5 + r(), a: 0.25 + r() * 0.65, c: r() < 0.15 ? "rgb(255,236,210)" : r() < 0.3 ? "rgb(210,222,255)" : "#fff" }));
    el.querySelectorAll(".tw").forEach((e) => e.remove());
    for (let i = 0; i < 12; i++) {
      const e = document.createElement("i");
      e.className = "tw";
      e.style.left = r() * 100 + "%";
      e.style.top = r() * 100 + "%";
      e.style.setProperty("--d", (r() * 3).toFixed(2) + "s");
      el.appendChild(e);
    }
    draw();
  };
  const ro = new ResizeObserver(build);
  ro.observe(el);
  if (host !== el.parentElement) ro.observe(host);
  build();
  return {
    full() {
      cancelAnimationFrame(raf);
      p = 1;
      draw();
    },
    bloom(x, y) {
      cancelAnimationFrame(raf);
      const rc = el.getBoundingClientRect();
      ox = x - rc.left;
      oy = y - rc.top;
      if (calm) return this.full();
      const t0 = performance.now();
      const f = (now) => {
        p = Math.min(1, (now - t0) / 1100);
        draw();
        if (p < 1) raf = requestAnimationFrame(f);
      };
      p = 0;
      draw();
      raf = requestAnimationFrame(f);
    },
    stop() {
      cancelAnimationFrame(raf);
      ro.disconnect();
    }
  };
}
// 日夜开关：滑块头尾两个点各挂一根弹簧。参数是 Aven 在手感台里调好的
var RG_JELLY = { stick: 50, press: 0.11, stiff: 420, damp: 0.62, tail: 0.58, stretch: 0.55, impact: 0.3, bounce: 0.35, bulge: 0.03, rubber: 0.55 };
function rgJelly(sw, onFlip) {
  const P = RG_JELLY, K = sw.querySelector(".lf-sw-k"), KS = sw.querySelector(".lf-sw-ks"), TR = sw.querySelector(".lf-sw-tr");
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TRAVEL = 24;
  const S = { on: false, h: 0, hv: 0, t: 0, tv: 0, sq: 0, sqv: 0, bg: 0, bgv: 0, hold: 0, press: 0, drag: null, raf: 0, last: 0 };
  const target = () => S.on ? TRAVEL : 0;
  const render = () => {
    const a = Math.min(S.h, S.t), span = Math.abs(S.h - S.t);
    const sq = Math.max(-0.35, Math.min(0.45, S.sq + S.press));
    const hgt = 24 * (1 - sq), extra = 24 * sq * 0.9, w = 24 + span + extra;
    const tf = "translate(" + (a - extra / 2) + "px," + (24 - hgt) / 2 + "px)";
    for (const el of [K, KS]) {
      el.style.width = w + "px";
      el.style.height = hgt + "px";
      el.style.borderRadius = hgt / 2 + "px";
      el.style.transform = tf;
    }
    sw.style.setProperty("--nt", Math.max(0, Math.min(1, (S.h + S.t) / 2 / TRAVEL)).toFixed(3));
    TR.style.transformOrigin = (S.on ? "right" : "left") + " center";
    TR.style.transform = S.bg ? "scale(" + (1 + S.bg) + "," + (1 + S.bg * 0.6) + ")" : "";
  };
  const step = (dt, now) => {
    const k = P.stiff, c = 2 * Math.sqrt(k) * P.damp;
    const T = S.drag ? S.drag.x : target();
    const held = now < S.hold;
    if (!held) {
      S.hv += (k * (T - S.h) - c * S.hv) * dt;
      S.h += S.hv * dt;
      const kt = k * P.tail, ct = 2 * Math.sqrt(kt) * Math.min(1, P.damp * 1.15);
      S.tv += (kt * (S.h - S.t) - ct * S.tv) * dt;
      S.t += S.tv * dt;
    }
    const maxSpan = 6 + 18 * P.stretch;
    if (Math.abs(S.h - S.t) > maxSpan) S.t = S.h - Math.sign(S.h - S.t) * maxSpan;
    for (const key of ["h", "t"]) {
      const vk = key + "v", lo = S.drag ? -6 : 0, hi = S.drag ? TRAVEL + 6 : TRAVEL;
      if (S[key] < lo || S[key] > hi) {
        const v = S[vk];
        S[key] = Math.max(lo, Math.min(hi, S[key]));
        if (key === "h" && Math.abs(v) > 40) {
          S.sqv += Math.min(Math.abs(v), 600) * P.impact * 0.02;
          S.bgv += Math.min(Math.abs(v), 600) * P.bulge * 0.06;
        }
        S[vk] = -v * P.bounce;
      }
    }
    S.sqv += (-520 * S.sq - 2 * Math.sqrt(520) * 0.32 * S.sqv) * dt;
    S.sq += S.sqv * dt;
    S.bgv += (-700 * S.bg - 2 * Math.sqrt(700) * 0.35 * S.bgv) * dt;
    S.bg += S.bgv * dt;
    S.press += ((S.drag || held ? P.press : 0) - S.press) * Math.min(1, dt * 22);
  };
  const loop = () => {
    if (S.raf) return;
    S.last = performance.now();
    const f = (now) => {
      let dt = Math.min(0.05, (now - S.last) / 1e3);
      S.last = now;
      while (dt > 0) {
        const d = Math.min(dt, 1 / 240);
        step(d, now);
        dt -= d;
      }
      render();
      const moving = S.drag || now < S.hold || Math.abs(S.h - target()) > 0.05 || Math.abs(S.t - target()) > 0.05 || Math.abs(S.hv) + Math.abs(S.tv) > 0.5 || Math.abs(S.sq) > 2e-3 || Math.abs(S.sqv) > 0.01 || Math.abs(S.bg) > 5e-4 || Math.abs(S.press) > 2e-3;
      S.raf = moving ? requestAnimationFrame(f) : 0;
      if (!moving) {
        S.h = S.t = target();
        S.hv = S.tv = S.sq = S.sqv = S.bg = S.bgv = S.press = 0;
        render();
      }
    };
    S.raf = requestAnimationFrame(f);
  };
  const flip = (on) => {
    if (S.on === on) return;
    S.on = on;
    onFlip(on);
  };
  const tap = () => {
    flip(!S.on);
    if (calm) {
      S.h = S.t = target();
      return render();
    }
    S.hold = performance.now() + P.stick;
    loop();
  };
  let down = null;
  const pd = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    down = { x: e.clientX, start: S.h, moved: false, id: e.pointerId };
    try {
      sw.setPointerCapture(e.pointerId);
    } catch (er) {
    }
    S.drag = null;
    if (calm) return;
    S.hold = performance.now() + 1e4;
    loop();
  };
  const pm = (e) => {
    if (!down || e.pointerId !== down.id) return;
    e.stopPropagation();
    const dx = e.clientX - down.x;
    if (!down.moved && Math.abs(dx) < 3) return;
    if (!down.moved) {
      down.moved = true;
      S.hold = 0;
    }
    let x = down.start + dx;
    const rb = (o) => o * (1 - P.rubber * 0.85) / (1 + Math.abs(o) * P.rubber * 0.12);
    if (x < 0) x = rb(x);
    else if (x > TRAVEL) x = TRAVEL + rb(x - TRAVEL);
    S.drag = { x };
    if (!S.on && x > TRAVEL / 2 + 1) flip(true);
    else if (S.on && x < TRAVEL / 2 - 1) flip(false);
    loop();
  };
  const pu = (e) => {
    if (!down || e.pointerId !== down.id) return;
    const moved = down.moved;
    down = null;
    S.hold = 0;
    if (!moved) return tap();
    S.drag = null;
    loop();
  };
  const kd = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      tap();
    }
  };
  const ck = (e) => e.preventDefault();
  sw.addEventListener("pointerdown", pd);
  sw.addEventListener("pointermove", pm);
  sw.addEventListener("pointerup", pu);
  sw.addEventListener("pointercancel", pu);
  sw.addEventListener("keydown", kd);
  sw.addEventListener("click", ck);
  return {
    // 外面改了主题（比如 DSH 自己切了深色）：安静地对齐，不做动作
    sync(on) {
      if (S.on === on) return;
      S.on = on;
      if (!S.raf) {
        S.h = S.t = target();
        render();
      }
    },
    stop() {
      cancelAnimationFrame(S.raf);
      sw.removeEventListener("pointerdown", pd);
      sw.removeEventListener("pointermove", pm);
      sw.removeEventListener("pointerup", pu);
      sw.removeEventListener("pointercancel", pu);
      sw.removeEventListener("keydown", kd);
      sw.removeEventListener("click", ck);
    }
  };
}
export function RgSwitch({ on, onChange }) {
  const R = React, ref = useRef(null), api = useRef(null), cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    api.current = rgJelly(ref.current, (v) => cb.current(v));
    api.current.sync(on);
    return () => api.current.stop();
  }, []);
  useEffect(() => {
    api.current && api.current.sync(on);
  }, [on]);
  return R.createElement("button", { ref, type: "button", role: "switch", "aria-checked": on, "aria-label": "夜间模式", className: "lf-sw" },
    R.createElement("span", { className: "lf-sw-tr" }, R.createElement("span", { className: "lf-sw-cloud" }), R.createElement("span", { className: "lf-sw-stars" }, R.createElement("i", null), R.createElement("i", null), R.createElement("i", null))),
    R.createElement("span", { className: "lf-sw-ks" }),
    R.createElement("span", { className: "lf-sw-k" }, R.createElement("span", { className: "lf-sw-sun" }), R.createElement("span", { className: "lf-sw-moon" })));
}
// 日出日落：天亮/天黑，以及下一次切换的时刻（取天气缓存里的时间，没有就按 6:30 / 17:30）
export function rgSunInfo(now) {
  let rise = 390, set = 1050;
  try {
    const w = JSON.parse(localStorage.getItem("dsh-rigui:weather"));
    const toMin = (iso) => +iso.slice(11, 13) * 60 + +iso.slice(14, 16);
    if (w && w.sunrise && w.sunset) {
      rise = toMin(w.sunrise);
      set = toMin(w.sunset);
    }
  } catch (e) {
  }
  const d = new Date(now), m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  const at = (min, plusDay) => {
    const x = new Date(now);
    x.setHours(0, 0, 0, 0);
    return x.getTime() + (min + (plusDay ? 1440 : 0)) * 6e4;
  };
  const dark = m < rise || m >= set;
  return { dark, rise, set, m, next: m < rise ? at(rise) : m < set ? at(set) : at(rise, true) };
}
// 白天的天空：颜色、光晕、云雾、卡片投影；雨雪只在进来时下十秒左右
var RG_WX = {
  clear: { sky: ["#3D86D9", "#8BC0EE", "#EAF1F6"], sun: 1 },
  partly: { sky: ["#4B83C4", "#9BBFE0", "#ECF0F3"], sun: 0.6 },
  cloudy: { sky: ["#6F7B88", "#A3ACB5", "#E3E5E7"], sun: 0, tone: 0.5 },
  fog: { sky: ["#7D868E", "#BDC2C7", "#EAEBEC"], sun: 0 },
  drizzle: { sky: ["#5C6A7D", "#8D98A6", "#E0E4E8"], sun: 0, rain: 0.35, tone: 0.35 },
  rain: { sky: ["#4B5A6F", "#7C8899", "#DADFE5"], sun: 0, rain: 1, tone: 0.3 },
  thunder: { sky: ["#353F53", "#636D80", "#D1D5DC"], sun: 0, rain: 1.25, thunder: 1, tone: 0.22 },
  snow: { sky: ["#7F95B0", "#C5D0DD", "#F1F4F7"], sun: 0, snow: 1, tone: 0.7 }
};
export function rgDaySky(root, bg, fx) {
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const host = root.closest(".lf-host") || root.parentElement;
  bg.innerHTML = '<div class="g"></div><div class="sun"></div><div class="clouds"></div><div class="fog"></div><div class="flash"></div><canvas></canvas>';
  fx.innerHTML = '<div class="cs"></div><div class="haze"></div><canvas></canvas>';
  const fill = (box, n, f) => {
    for (let i = 0; i < n; i++) {
      const e = document.createElement("i");
      f(e, i);
      box.appendChild(e);
    }
  };
  fill(bg.querySelector(".clouds"), 7, (e, i) => {
    const w = 30 + i * 37 % 30;
    e.style.width = w + "vw";
    e.style.height = w * 0.42 + "vw";
    e.style.top = 14 + i * 23 % 52 + "%";
    e.style.setProperty("--t", 110 + i * 17 + "s");
    e.style.setProperty("--dl", -i * 21 + "s");
  });
  fill(bg.querySelector(".fog"), 4, (e, i) => {
    e.style.top = 26 + i * 18 + "%";
    e.style.setProperty("--t", 70 + i * 19 + "s");
    e.style.setProperty("--dl", -i * 23 + "s");
  });
  fill(fx.querySelector(".cs"), 3, (e, i) => {
    e.style.top = 5 + i * 30 + "%";
    e.style.setProperty("--t", 55 + i * 14 + "s");
    e.style.setProperty("--dl", -i * 19 + "s");
  });
  const bc = bg.querySelector("canvas"), fc = fx.querySelector("canvas"), bx = bc.getContext("2d"), fxc = fc.getContext("2d");
  const flash = bg.querySelector(".flash");
  let W = 0, H = 0;
  const size = () => {
    H = host.clientHeight || window.innerHeight;
    bg.style.setProperty("--rg-h", H + "px");
    fx.style.setProperty("--rg-h", H + "px");
    W = bg.clientWidth;
    // 雨雪本来就是虚的，1 倍分辨率画就够，像素少四分之三
    for (const c of [bc, fc]) {
      c.width = W;
      c.height = H;
    }
    capSize();
  };
  const st = { kind: null, wind: 8, dark: false, indoor: false, snowBase: 0, mounted: false, raf: 0, until: 0, seen: true };
  const precip = () => !st.dark && !st.indoor && (RG_WX[st.kind] || {}).rain || !st.dark && !st.indoor && st.kind === "snow";
  const mix = (a, b, t) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (sh) => Math.round((pa >> sh & 255) * (1 - t) + (pb >> sh & 255) * t);
    return "#" + [16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, "0")).join("");
  };
  // ---- 积雪：每张卡一块小画布，贴着顶边和圆角 ----
  const RAD = 28, LIFT = 14, BIN = 3, caps = /* @__PURE__ */ new Map();
  const edge = (x, w) => {
    const dx = x < RAD ? RAD - x : x > w - RAD ? x - (w - RAD) : 0;
    if (!dx) return [LIFT, 1];
    const c = Math.sqrt(Math.max(0, RAD * RAD - dx * dx));
    return [LIFT + RAD - c, Math.pow(c / RAD, 3)];
  };
  const cardEls = () => [...root.querySelectorAll(".lf-card:not([data-card=hero])")];
  let layer = null, posT = 0;
  const capLayer = () => {
    const wrap = root.querySelector(".lf-wrap");
    if (!wrap) return null;
    if (!layer || layer.parentElement !== wrap) {
      layer = document.createElement("div");
      layer.className = "lf-capslayer";
      wrap.appendChild(layer);
    }
    return layer;
  };
  const capPos = () => {
    if (!layer) return;
    const wr = layer.getBoundingClientRect();
    for (const k of caps.values()) {
      const r = k.el.getBoundingClientRect();
      k.c.style.transform = "translate(" + (r.left - wr.left).toFixed(1) + "px," + (r.top - wr.top - LIFT).toFixed(1) + "px)";
      k.c.style.width = r.width + "px";
    }
  };
  const seedBins = (k) => {
    const n = Math.ceil(k.w / BIN) + 1, b = st.snowBase;
    let sd = (k.id || "x").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
    k.bins = Array.from({ length: n }, (_, i) => b ? b * (0.7 + 0.18 * Math.sin(i * 0.31 + sd) + 0.12 * Math.sin(i * 0.83 + sd * 2)) : 0);
  };
  const capSize = () => {
    for (const k of caps.values()) {
      const w = k.el.clientWidth;
      if (w === k.w) continue;
      k.w = w;
      k.c.width = w * 2;
      k.c.height = 96;
      k.g.setTransform(2, 0, 0, 2, 0, 0);
      seedBins(k);
      drawCap(k);
    }
  };
  const ensureCaps = () => {
    const els = cardEls(), live = new Set();
    for (const el of els) {
      const id = el.getAttribute("data-card") || "";
      live.add(id);
      let k = caps.get(id);
      if (k && k.el === el && k.c.isConnected) continue;
      if (k) k.c.remove();
      const c = document.createElement("canvas");
      c.className = "lf-snowcap";
      const L = capLayer();
      if (!L) continue;
      L.appendChild(c);
      k = { id, el, c, g: c.getContext("2d"), bins: [], w: 0 };
      caps.set(id, k);
    }
    for (const [id, k] of caps) if (!live.has(id)) {
      k.c.remove();
      caps.delete(id);
    }
    capSize();
    capPos();
    if (!posT) posT = setInterval(capPos, 300);
  };
  const dropCaps = () => {
    for (const k of caps.values()) k.c.remove();
    caps.clear();
    clearInterval(posT);
    posT = 0;
  };
  const heightAt = (k, x) => {
    const f = x / BIN, i = Math.floor(f), t = f - i, a = k.bins[i] || 0, b = k.bins[i + 1] || 0;
    return (a + (b - a) * t) * edge(x, k.w)[1];
  };
  const land = (k, x) => {
    const sig = 7;
    for (let i = Math.max(0, Math.floor((x - 3 * sig) / BIN)); i <= Math.min(k.bins.length - 1, Math.ceil((x + 3 * sig) / BIN)); i++) {
      const d = i * BIN - x;
      k.bins[i] = Math.min(9, k.bins[i] + 0.35 * Math.exp(-d * d / (2 * sig * sig)));
    }
    k.dirty = true;
  };
  function drawCap(k) {
    const g = k.g, w = k.w;
    k.dirty = false;
    g.clearRect(0, 0, w, 48);
    if (!k.bins.some((v) => v > 0.05)) return;
    const top = [], base = [];
    for (let x = 0; x <= w; x += 2) {
      const [y] = edge(x, w);
      base.push([x, y + 0.8]);
      top.push([x, y - heightAt(k, x)]);
    }
    const path = (dy) => {
      g.beginPath();
      g.moveTo(top[0][0], top[0][1] + dy);
      for (const [x, y] of top) g.lineTo(x, y + dy);
      for (let i = base.length - 1; i >= 0; i--) g.lineTo(base[i][0], base[i][1] + dy);
      g.closePath();
    };
    path(1.6);
    g.fillStyle = "rgba(110,130,165,.28)";
    g.fill();
    path(0);
    const gr = g.createLinearGradient(0, LIFT - 9, 0, LIFT + 2);
    gr.addColorStop(0, "#FFFFFF");
    gr.addColorStop(1, "#EDF2F8");
    g.fillStyle = gr;
    g.fill();
    g.beginPath();
    top.forEach(([x, y], i) => i ? g.lineTo(x, y + 0.6) : g.moveTo(x, y + 0.6));
    g.strokeStyle = "rgba(255,255,255,.9)";
    g.lineWidth = 1;
    g.stroke();
  }
  // ---- 开场雨雪：十秒左右，最后两三秒渐渐停 ----
  let drops = [], flakes = [], splashes = [], rects = [], lastMeasure = 0, bolt = 0;
  const measure = () => {
    const br = bg.getBoundingClientRect();
    rects = cardEls().map((el) => {
      const r = el.getBoundingClientRect();
      return { el, id: el.getAttribute("data-card") || "", l: r.left - br.left, r: r.right - br.left, t: r.top - br.top, w: r.width };
    });
  };
  const intro = () => {
    if (calm || !precip() || !W || !H) return;
    const P = RG_WX[st.kind];
    const n = Math.min(900, Math.round(W * H / 4200));
    drops = P.rain ? Array.from({ length: Math.round(n * Math.min(1, P.rain)) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 12 + Math.random() * 14, s: 750 + Math.random() * 350, a: 0.18 + Math.random() * 0.25 })) : [];
    flakes = P.snow ? Array.from({ length: Math.min(320, Math.round(W * H / 9e3)) }, () => ({ x: Math.random() * W, y: Math.random() * H - H, r: 0.8 + Math.random() * 2.2, s: 28 + Math.random() * 45, ph: Math.random() * 6.28, front: Math.random() < 0.3 })) : [];
    splashes = [];
    st.t0 = performance.now();
    st.until = st.t0 + 10500;
    bolt = P.thunder ? st.t0 + 2200 + Math.random() * 1500 : 0;
    measure();
    if (!st.raf) {
      st.last = performance.now();
      st.raf = requestAnimationFrame(frame);
    }
  };
  function frame(now) {
    st.raf = 0;
    const dt = Math.min(0.06, (now - st.last) / 1e3);
    if (dt < 1 / 32) {
      st.raf = requestAnimationFrame(frame);
      return;
    }
    st.last = now;
    const left = st.until - now;
    if (left <= 0 || !precip()) {
      bx.clearRect(0, 0, W, H);
      fxc.clearRect(0, 0, W, H);
      for (const k of caps.values()) if (k.dirty) drawCap(k);
      return;
    }
    // 开头半秒淡入，最后 2.5 秒渐稀
    const dens = Math.min(1, (now - st.t0) / 600) * Math.min(1, left / 2500);
    if (now - lastMeasure > 400) {
      measure();
      lastMeasure = now;
    }
    bx.clearRect(0, 0, W, H);
    fxc.clearRect(0, 0, W, H);
    const tilt = Math.min(0.45, (st.wind || 0) / 40 * 0.45);
    if (drops.length) {
      const P = RG_WX[st.kind];
      bx.lineWidth = 1;
      bx.lineCap = "round";
      const nn = Math.round(drops.length * dens);
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.s * dt;
        d.x += d.s * tilt * dt;
        if (d.y > H + 20) {
          d.y = -20 - Math.random() * 60;
          d.x = Math.random() * (W + 200) - 200 * tilt;
        }
        if (d.x > W + 30) d.x -= W + 60;
        if (i >= nn) continue;
        bx.strokeStyle = "rgba(235,242,250," + d.a + ")";
        bx.beginPath();
        bx.moveTo(d.x, d.y);
        bx.lineTo(d.x - d.l * tilt, d.y - d.l);
        bx.stroke();
      }
      for (const r of rects) {
        if (r.t < -10 || r.t > H) continue;
        if (Math.random() < r.w / 900 * Math.min(1, P.rain) * dens * dt * 18) {
          const x = r.l + 16 + Math.random() * (r.w - 32), y = r.t + 1;
          for (let k = 0; k < 3 + (Math.random() * 3 | 0); k++) splashes.push({ x, y, vx: (Math.random() - 0.5) * 90 + tilt * 60, vy: -60 - Math.random() * 90, life: 0.32 + Math.random() * 0.15, t: 0, r: 0.8 + Math.random() * 1.1 });
        }
      }
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const p = splashes[i];
      p.t += dt;
      if (p.t > p.life) {
        splashes.splice(i, 1);
        continue;
      }
      p.vy += 520 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      fxc.fillStyle = "rgba(225,236,248," + 0.85 * (1 - p.t / p.life) + ")";
      fxc.beginPath();
      fxc.arc(p.x, p.y, p.r, 0, 6.283);
      fxc.fill();
    }
    if (flakes.length) {
      const nn = Math.round(flakes.length * dens);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.s * dt;
        f.ph += dt * 1.3;
        f.x += (Math.sin(f.ph) * 18 + (st.wind || 0) * 1.2) * dt;
        if (f.front) {
          for (const r of rects) {
            const k = caps.get(r.id);
            if (!k || f.x <= r.l + 2 || f.x >= r.r - 2) continue;
            const lx = f.x - r.l, [ey, hold] = edge(lx, k.w);
            const surf = r.t - LIFT + ey - heightAt(k, lx);
            if (f.y > surf - 1 && f.y < surf + 5) {
              if (i < nn && Math.random() < hold) land(k, lx);
              f.y = -10 - Math.random() * 40;
              f.x = Math.random() * W;
              break;
            }
          }
        }
        if (f.y > H + 10) {
          f.y = -10;
          f.x = Math.random() * W;
        }
        if (f.x > W + 10) f.x = -10;
        if (i >= nn) continue;
        const c = f.front ? fxc : bx;
        c.fillStyle = f.front ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.75)";
        c.beginPath();
        c.arc(f.x, f.y, f.front ? f.r * 1.2 : f.r, 0, 6.283);
        c.fill();
      }
      for (const k of caps.values()) if (k.dirty) drawCap(k);
    }
    if (bolt && now > bolt) {
      bolt = 0;
      flash.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.08 }, { opacity: 0.05, offset: 0.22 }, { opacity: 0.35, offset: 0.3 }, { opacity: 0 }], { duration: 900, easing: "ease-out" });
    }
    st.raf = requestAnimationFrame(frame);
  }
  // ---- 从别处切回来：再下一阵 ----
  const io = new IntersectionObserver(([e]) => {
    const vis = e.isIntersecting;
    if (vis && !st.seen) intro();
    st.seen = vis;
  });
  io.observe(root);
  const ro = new ResizeObserver(size);
  ro.observe(host);
  ro.observe(bg);
  size();
  return {
    update({ w, dark }) {
      const kind = w ? kindOf(w.code) : "clear";
      const S = rgSunInfo(Date.now()), P = RG_WX[kind] || RG_WX.clear;
      const p = S.m < S.rise || S.m > S.set ? null : (S.m - S.rise) / Math.max(1, S.set - S.rise);
      const indoor = p === null;
      const prevPrecip = st.mounted && precip(), prevKind = st.kind;
      st.kind = kind;
      st.wind = w ? w.wind || 0 : 8;
      st.dark = dark;
      st.indoor = indoor;
      root.setAttribute("data-wx", indoor ? "indoor" : kind);
      // 天色：清晨黄昏偏暖
      const gold = indoor ? 0 : Math.max(0, 1 - Math.min(p, 1 - p) / 0.16) * (P.sun ? 1 : 0.35);
      let sky = P.sky.slice();
      if (indoor) sky = ["#A8977F", "#D9CFBF", "#EFEBE3"];
      else if (gold) sky = [mix(sky[0], "#5A6FB3", gold * 0.6), mix(sky[1], "#F0B07A", gold * 0.7), mix(sky[2], "#F6E6D6", gold * 0.8)];
      const set = (k, v) => root.style.setProperty(k, v);
      set("--dsky-a", sky[0]);
      set("--dsky-b", sky[1]);
      set("--dsky-c", sky[2]);
      set("--cl-a", P.tone != null ? (0.55 * P.tone + 0.25).toFixed(2) : "0.6");
      const elev = indoor ? 0 : Math.sin(Math.PI * p);
      set("--sun-x", (indoor ? 50 : 4 + p * 92) + "%");
      set("--sun-y", (indoor ? -30 : 18 - elev * 26) + "%");
      set("--sun-o", indoor ? "0" : (P.sun * (0.7 + 0.3 * gold)).toFixed(2));
      set("--sun-rgb", gold > 0.2 ? "255,196,140" : "255,244,214");
      // 卡片投影
      if (indoor) {
        set("--sun-cast", "0 10px 18px -10px rgba(70,50,30,.28)");
        set("--sun-lit", "inset 0 0 0 transparent");
        set("--sun-glaze", "none");
      } else if (P.sun) {
        const az = Math.cos(Math.PI * p), len = 8 + 46 * Math.pow(1 - elev, 1.3);
        const dx = az * len, dy = 8 + len * 0.32, blur = 10 + len * 0.7;
        const tone = gold > 0.2 ? "110,60,30" : "30,50,80", a = P.sun * (0.12 + 0.06 * elev) * (1 - gold * 0.25);
        set("--sun-cast", `${dx.toFixed(1)}px ${dy.toFixed(1)}px ${blur.toFixed(1)}px -6px rgba(${tone},${a.toFixed(3)})`);
        set("--sun-lit", `inset ${(-az * 1.5).toFixed(1)}px 1.5px 0 rgba(255,255,255,${(0.5 * P.sun).toFixed(2)})`);
        set("--sun-glaze", `linear-gradient(${az > 0 ? "to right" : "to left"},rgba(255,${gold > 0.2 ? 180 : 236},${gold > 0.2 ? 110 : 190},${((0.05 + gold * 0.1) * P.sun).toFixed(3)}),transparent 55%)`);
      } else {
        set("--sun-cast", "0 8px 22px -10px rgba(40,50,60,.22)");
        set("--sun-lit", P.rain || P.snow ? "inset 0 1px 0 rgba(255,255,255,.75)" : "inset 0 0 0 transparent");
        set("--sun-glaze", P.rain ? "linear-gradient(180deg,rgba(180,200,230,.10),transparent 40%)" : "none");
      }
      // 积雪：按今天已经下了几个小时预先铺好
      if (kind === "snow" && !indoor) {
        const base = Math.min(7, 1 + (w && w.snowHrs || 0) * 0.8);
        if (base !== st.snowBase || prevKind !== "snow") {
          st.snowBase = base;
          for (const k of caps.values()) {
            seedBins(k);
            drawCap(k);
          }
        }
        ensureCaps();
      } else {
        st.snowBase = 0;
        dropCaps();
      }
      // 进来时、或者天气刚变成雨雪时，下一阵
      if (precip() && (!st.mounted || !prevPrecip || prevKind !== kind)) requestAnimationFrame(intro);
      st.mounted = true;
    },
    stop() {
      cancelAnimationFrame(st.raf);
      io.disconnect();
      ro.disconnect();
      dropCaps();
    }
  };
}
export function rgIsDark() {
  return typeof window.__rgDark === "boolean" ? window.__rgDark : document.body.hasAttribute("data-ds-dark-theme");
}
