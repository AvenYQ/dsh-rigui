// 日晷 · 浏览器半边：DSH 左侧边栏里的「日晷」入口，点开是个人生活工作台。
window.__ModuleLoader__.load({
  id: 'dsh-rigui',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugin.jsx
var plugin_exports = {};
__export(plugin_exports, {
  apply: () => apply,
  inject: () => inject,
  isPlugin: () => isPlugin
});
module.exports = __toCommonJS(plugin_exports);
var import_react9 = __toESM(require("react"));

// src/App.jsx
var import_react7 = __toESM(require("react"));

// src/weather.jsx
var import_react = __toESM(require("react"));
var CACHE = "dsh-rigui:weather";
var CITY = "dsh-rigui:city";
var ls = { get: (k) => {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch (e) {
    return null;
  }
}, set: (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
  }
} };
function kindOf(code) {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67 || code >= 80 && code <= 82) return "rain";
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return "snow";
  if (code >= 95) return "thunder";
  return "cloudy";
}
var LABEL = { clear: "晴", partly: "多云", cloudy: "阴", fog: "雾", drizzle: "小雨", rain: "雨", snow: "雪", thunder: "雷雨" };
var SKY = {
  clear: [["#2E7FD6", "#6FB4F0"], ["#081230", "#1C2A57"]],
  partly: [["#4282C6", "#8AB6E0"], ["#0F1934", "#283458"]],
  cloudy: [["#62758A", "#9DAAB8"], ["#1A2029", "#343C49"]],
  fog: [["#7E8A94", "#B6BDC2"], ["#262B33", "#41474F"]],
  drizzle: [["#4C6378", "#7F94A7"], ["#151C27", "#2C3645"]],
  rain: [["#3A4E62", "#677C90"], ["#10161F", "#26303D"]],
  snow: [["#7389A2", "#BCCADA"], ["#1C2534", "#39465A"]],
  thunder: [["#262A40", "#4A4C68"], ["#0E0F1A", "#2A2B3E"]]
};
var TONE = {
  meet: { a: "#2B3A9E", b: "#4F5FCF", name: "开会" },
  study: { a: "#5B3FC4", b: "#8E70EC", name: "学习" },
  move: { a: "#147A52", b: "#2DB880", name: "运动" },
  time: { a: "#1F2328", b: "#3A404A", name: "日程" }
};
async function api(endpoint, payload) {
  const r = await fetch("api/rigui", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint, payload }) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "failed");
  return j.result;
}
var OM = "https://api.open-meteo.com/v1/forecast?current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=2";
async function fetchForecast(lat, lon) {
  try {
    return await api("weather", { lat, lon });
  } catch (e) {
  }
  const r = await fetch(`${OM}&latitude=${lat}&longitude=${lon}`);
  return r.json();
}
async function geocode(name) {
  try {
    return await api("geo", { name });
  } catch (e) {
  }
  const r = await fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&name=" + encodeURIComponent(name));
  return r.json();
}
function useWeather() {
  const [city, setCityState] = (0, import_react.useState)(() => ls.get(CITY));
  const [w, setW] = (0, import_react.useState)(() => {
    const c = ls.get(CACHE);
    return c && c.city && city && c.city === city.name ? c : null;
  });
  const [err, setErr] = (0, import_react.useState)("");
  const load2 = async (c, force) => {
    if (!c) return;
    const cached = ls.get(CACHE);
    if (!force && cached && cached.city === c.name && Date.now() - cached.at < 30 * 6e4) {
      setW(cached);
      return;
    }
    try {
      const d = await fetchForecast(c.lat, c.lon);
      const cur = d.current, nowIso = cur.time;
      const i0 = Math.max(0, d.hourly.time.findIndex((t) => t >= nowIso.slice(0, 13)));
      const out = {
        city: c.name,
        at: Date.now(),
        temp: Math.round(cur.temperature_2m),
        feels: Math.round(cur.apparent_temperature),
        code: cur.weather_code,
        isDay: !!cur.is_day,
        hum: cur.relative_humidity_2m,
        wind: cur.wind_speed_10m,
        hi: Math.round(d.daily.temperature_2m_max[0]),
        lo: Math.round(d.daily.temperature_2m_min[0]),
        sunrise: d.daily.sunrise[0],
        sunset: d.daily.sunset[0],
        hourly: d.hourly.time.slice(i0 + 1, i0 + 6).map((t, k) => ({ h: +t.slice(11, 13), temp: Math.round(d.hourly.temperature_2m[i0 + 1 + k]), code: d.hourly.weather_code[i0 + 1 + k] })),
        rainSoon: d.hourly.weather_code.slice(i0, i0 + 6).some((x) => kindOf(x) === "rain" || kindOf(x) === "thunder" || kindOf(x) === "drizzle")
      };
      ls.set(CACHE, out);
      setW(out);
      setErr("");
    } catch (e) {
      setErr("天气没取到");
    }
  };
  (0, import_react.useEffect)(() => {
    load2(city);
    const iv = setInterval(() => load2(city), 30 * 6e4);
    return () => clearInterval(iv);
  }, [city && city.name]);
  const setCity = async (name) => {
    name = String(name || "").trim();
    if (!name) return;
    try {
      const g = await geocode(name), r = g.results && g.results[0];
      if (!r) {
        setErr("没找到「" + name + "」");
        return;
      }
      const c = { name: r.name, lat: r.latitude, lon: r.longitude };
      ls.set(CITY, c);
      setCityState(c);
      load2(c, true);
    } catch (e) {
      setErr("天气没取到");
    }
  };
  return { w, city, setCity, err };
}
function dawnDusk(w, now) {
  if (!w || !w.sunrise) return 0;
  const t = new Date(now), m = t.getHours() * 60 + t.getMinutes();
  const toMin = (iso) => +iso.slice(11, 13) * 60 + +iso.slice(14, 16);
  const d = Math.min(Math.abs(m - toMin(w.sunrise)), Math.abs(m - toMin(w.sunset)));
  return d < 60 ? 1 - d / 60 : 0;
}
function HeroSky({ w, now, tone }) {
  const cv = (0, import_react.useRef)(null), live = (0, import_react.useRef)({});
  const kind = w ? kindOf(w.code) : "partly";
  const night = w ? !w.isDay : new Date(now).getHours() < 6 || new Date(now).getHours() >= 19;
  live.current = { kind, night };
  (0, import_react.useEffect)(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W2 = 0, H2 = 0, raf2 = 0, vis = true, t0 = performance.now(), flash = 0;
    const rnd = (a2, b2) => a2 + Math.random() * (b2 - a2);
    let stars = [], clouds = [], drops = [], flakes = [], bands = [];
    const seed2 = () => {
      stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * 0.75, r: rnd(0.4, 1.4), p: rnd(0, 6) }));
      clouds = Array.from({ length: 7 }, (_, i) => ({ x: rnd(-0.2, 1.1), y: rnd(0.02, 0.55), s: rnd(0.7, 1.5), v: rnd(4e-3, 0.012), puffs: Array.from({ length: 5 }, () => ({ dx: rnd(-1, 1), dy: rnd(-0.35, 0.25), r: rnd(0.5, 1) })) }));
      drops = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.9, 1.5), l: rnd(10, 22) }));
      flakes = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.04, 0.11), r: rnd(1, 3), p: rnd(0, 6) }));
      bands = Array.from({ length: 5 }, (_, i) => ({ y: 0.2 + i * 0.16, x: Math.random(), v: rnd(3e-3, 8e-3), a: rnd(0.08, 0.16) }));
    };
    seed2();
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W2 = c.clientWidth;
      H2 = c.clientHeight;
      c.width = W2 * dpr;
      c.height = H2 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis && !raf2) raf2 = requestAnimationFrame(frame);
    });
    io.observe(c);
    const cloud = (cl, col, a2) => {
      const R = 70 * cl.s;
      ctx.fillStyle = col;
      cl.puffs.forEach((p) => {
        const g = ctx.createRadialGradient(cl.x * W2 + p.dx * R * 1.4, cl.y * H2 + p.dy * R, 0, cl.x * W2 + p.dx * R * 1.4, cl.y * H2 + p.dy * R, R * p.r * 1.25);
        g.addColorStop(0, col.replace("A", a2));
        g.addColorStop(1, col.replace("A", 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cl.x * W2 + p.dx * R * 1.4, cl.y * H2 + p.dy * R, R * p.r * 1.25, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    function frame(nowT) {
      raf2 = 0;
      const t = (nowT - t0) / 1e3, { kind: k, night: n } = live.current;
      ctx.clearRect(0, 0, W2, H2);
      if (n && (k === "clear" || k === "partly")) stars.forEach((s) => {
        ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.p));
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x * W2, s.y * H2, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (k === "clear" || k === "partly") {
        const sx = W2 * 0.86, sy = H2 * 0.12;
        if (!n) {
          const pulse = 1 + 0.04 * Math.sin(t * 0.9);
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 300 * pulse);
          g.addColorStop(0, "rgba(255,248,214,.85)");
          g.addColorStop(0.18, "rgba(255,236,170,.45)");
          g.addColorStop(0.5, "rgba(255,220,150,.12)");
          g.addColorStop(1, "rgba(255,220,150,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W2, H2);
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(t * 0.03);
          for (let i = 0; i < 10; i++) {
            ctx.rotate(Math.PI / 5);
            const gr = ctx.createLinearGradient(0, 0, 420, 0);
            gr.addColorStop(0, "rgba(255,245,210,.10)");
            gr.addColorStop(1, "rgba(255,245,210,0)");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(420, -22);
            ctx.lineTo(420, 22);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        } else {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 160);
          g.addColorStop(0, "rgba(220,230,255,.35)");
          g.addColorStop(1, "rgba(220,230,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W2, H2);
          ctx.fillStyle = "#F2F4FF";
          ctx.beginPath();
          ctx.arc(sx, sy, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.arc(sx + 10, sy - 7, 19, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }
      }
      const nCloud = { clear: 1, partly: 4, cloudy: 7, fog: 3, drizzle: 6, rain: 7, snow: 6, thunder: 7 }[k];
      const cc = n ? "rgba(170,185,215,A)" : k === "rain" || k === "thunder" || k === "drizzle" ? "rgba(200,210,222,A)" : "rgba(255,255,255,A)";
      const ca = { clear: 0.25, partly: 0.55, cloudy: 0.5, fog: 0.35, drizzle: 0.42, rain: 0.42, snow: 0.5, thunder: 0.38 }[k];
      clouds.slice(0, nCloud).forEach((cl) => {
        if (!reduce) cl.x += cl.v / 60;
        if (cl.x > 1.35) cl.x = -0.35;
        cloud(cl, cc, ca);
      });
      if (k === "fog") bands.forEach((b2) => {
        if (!reduce) b2.x = (b2.x + b2.v / 60) % 1;
        const g = ctx.createLinearGradient(0, b2.y * H2 - 40, 0, b2.y * H2 + 40);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, `rgba(255,255,255,${b2.a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, b2.y * H2 - 40, W2, 80);
      });
      if (k === "rain" || k === "drizzle" || k === "thunder") {
        const nD = k === "drizzle" ? 70 : 160;
        ctx.strokeStyle = "rgba(220,232,245,.45)";
        ctx.lineWidth = k === "drizzle" ? 1 : 1.3;
        ctx.lineCap = "round";
        ctx.beginPath();
        drops.slice(0, nD).forEach((d) => {
          if (!reduce) {
            d.y += d.v / 60 * (k === "drizzle" ? 0.6 : 1);
            if (d.y > 1.05) {
              d.y = -0.05;
              d.x = Math.random();
            }
          }
          const x = d.x * W2, y = d.y * H2;
          ctx.moveTo(x, y);
          ctx.lineTo(x - d.l * 0.25, y + d.l);
        });
        ctx.stroke();
      }
      if (k === "snow") flakes.forEach((f) => {
        if (!reduce) {
          f.y += f.v / 60;
          f.p += 0.02;
          if (f.y > 1.03) {
            f.y = -0.03;
            f.x = Math.random();
          }
        }
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.beginPath();
        ctx.arc(f.x * W2 + Math.sin(f.p) * 14, f.y * H2, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (k === "thunder" && !reduce) {
        if (flash <= 0 && Math.random() < 4e-3) flash = 1;
        if (flash > 0) {
          ctx.fillStyle = `rgba(255,255,255,${0.35 * flash * (Math.random() > 0.3 ? 1 : 0.4)})`;
          ctx.fillRect(0, 0, W2, H2);
          flash -= 0.06;
        }
      }
      if (vis && !reduce) raf2 = requestAnimationFrame(frame);
    }
    raf2 = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf2);
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  const [a, b] = SKY[kind][night ? 1 : 0];
  const warm = dawnDusk(w, now);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-sky-hero", "aria-hidden": "true" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-sky-grad", style: { background: `linear-gradient(170deg, ${a}, ${b})`, opacity: tone ? 0 : 1 } }), warm > 0 && !tone && /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-sky-grad", style: { background: "linear-gradient(0deg, rgba(255,160,110,.55), rgba(255,160,110,0) 60%)", opacity: warm } }), /* @__PURE__ */ import_react.default.createElement("canvas", { ref: cv, className: "lf-sky-cv", style: { opacity: tone ? 0 : 1 } }), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-tone" + (tone ? " on" : ""), style: tone ? { "--ta": TONE[tone.key].a, "--tb": TONE[tone.key].b } : null }, /* @__PURE__ */ import_react.default.createElement("i", null), /* @__PURE__ */ import_react.default.createElement("i", null), /* @__PURE__ */ import_react.default.createElement("i", null)), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-sky-glass" }));
}
var ICON = {
  clear: (n) => n ? /* @__PURE__ */ import_react.default.createElement("path", { d: "M15 4a7 7 0 1 0 5 12A8 8 0 0 1 15 4z", fill: "currentColor" }) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "4.5", fill: "currentColor" }), [0, 45, 90, 135, 180, 225, 270, 315].map((d) => /* @__PURE__ */ import_react.default.createElement("line", { key: d, x1: "12", y1: "2.5", x2: "12", y2: "5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", transform: `rotate(${d} 12 12)` }))),
  cloud: () => /* @__PURE__ */ import_react.default.createElement("path", { d: "M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 11 3.5 3.5 0 0 0 7 18z", fill: "currentColor" })
};
function WIcon({ code, night, size = 18 }) {
  const k = kindOf(code);
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true", className: "lf-wi k-" + k }, k === "clear" ? ICON.clear(night) : k === "partly" ? /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("g", { opacity: ".9", transform: "translate(-3 -3) scale(.8)" }, ICON.clear(night)), /* @__PURE__ */ import_react.default.createElement("g", { transform: "translate(3 3) scale(.85)" }, ICON.cloud())) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, ICON.cloud(), (k === "rain" || k === "drizzle" || k === "thunder") && [8, 12, 16].map((x) => /* @__PURE__ */ import_react.default.createElement("line", { key: x, x1: x, y1: "20", x2: x - 1, y2: "23", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" })), k === "snow" && [8, 12, 16].map((x) => /* @__PURE__ */ import_react.default.createElement("circle", { key: x, cx: x, cy: "21.5", r: "1.2", fill: "currentColor" }))));
}
function WeatherBadge({ weather, tone, now }) {
  const { w, city, setCity, err } = weather;
  const [edit, setEdit] = (0, import_react.useState)(false);
  if (tone) {
    const e = tone.e, left = Math.max(0, Math.round(((e.end || e.t + 36e5) - now) / 6e4)), p = Math.min(1, (now - e.t) / ((e.end || e.t + 36e5) - e.t));
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wbadge tone" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "lf-wb-tag" }, /* @__PURE__ */ import_react.default.createElement("i", { className: "lf-wb-live" }), "正在", TONE[tone.key].name), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-event" }, e.title), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-sub" }, "还剩 ", left >= 60 ? Math.floor(left / 60) + " 小时 " + left % 60 + " 分" : left + " 分钟"), /* @__PURE__ */ import_react.default.createElement("span", { className: "lf-wb-bar" }, /* @__PURE__ */ import_react.default.createElement("i", { style: { width: p * 100 + "%" } })), w && /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-mini" }, /* @__PURE__ */ import_react.default.createElement(WIcon, { code: w.code, night: !w.isDay, size: 14 }), w.temp, "° ", LABEL[kindOf(w.code)]));
  }
  if (!city || edit) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wbadge" }, /* @__PURE__ */ import_react.default.createElement("form", { onSubmit: (e) => {
      e.preventDefault();
      setCity(e.currentTarget.city.value);
      setEdit(false);
    } }, /* @__PURE__ */ import_react.default.createElement("input", { name: "city", className: "lf-wb-input", autoFocus: edit, defaultValue: city ? city.name : "", placeholder: "输入城市看天气", "aria-label": "城市", onBlur: (e) => {
      if (e.target.value.trim()) {
        setCity(e.target.value);
        setEdit(false);
      } else setEdit(false);
    } })), err && /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-sub" }, err));
  }
  if (!w) return /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wbadge" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-sub" }, err || "正在看天…"));
  const k = kindOf(w.code);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wbadge" }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "lf-wb-city", onClick: () => setEdit(true), title: "换城市" }, w.city), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-temp" }, w.temp, "°"), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-sub" }, /* @__PURE__ */ import_react.default.createElement(WIcon, { code: w.code, night: !w.isDay, size: 15 }), LABEL[k], " · 最高 ", w.hi, "° 最低 ", w.lo, "°"), /* @__PURE__ */ import_react.default.createElement("div", { className: "lf-wb-hours" }, w.hourly.map((h) => /* @__PURE__ */ import_react.default.createElement("span", { key: h.h }, /* @__PURE__ */ import_react.default.createElement("em", null, h.h, "时"), /* @__PURE__ */ import_react.default.createElement(WIcon, { code: h.code, night: h.h < 6 || h.h >= 18, size: 16 }), /* @__PURE__ */ import_react.default.createElement("b", null, h.temp, "°")))));
}
var WEATHER_CSS = `
.lf-sky-hero{position:absolute;inset:0;border-radius:inherit;overflow:hidden;z-index:0;pointer-events:none}
.lf-sky-grad{position:absolute;inset:0;transition:opacity 1.4s ease,background 2s ease}
.lf-sky-cv{position:absolute;inset:0;width:100%;height:100%;transition:opacity 1.4s ease}
.lf-sky-glass{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,0) 35%,rgba(0,0,0,.10));box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
.lf-tone{position:absolute;inset:0;opacity:0;transition:opacity 1.4s ease;background:linear-gradient(160deg,var(--ta,#1F2328),var(--tb,#3A404A))}
.lf-tone.on{opacity:1}
.lf-tone i{position:absolute;width:60%;height:120%;border-radius:50%;background:radial-gradient(circle,var(--tb,#3A404A),transparent 65%);opacity:.7;filter:blur(30px);animation:lf-aurora 14s ease-in-out infinite alternate}
.lf-tone i:nth-child(1){left:-10%;top:-30%}
.lf-tone i:nth-child(2){right:-15%;top:10%;animation-duration:18s;animation-delay:-5s;background:radial-gradient(circle,rgba(255,255,255,.22),transparent 60%)}
.lf-tone i:nth-child(3){left:30%;bottom:-60%;animation-duration:22s;animation-delay:-9s}
@keyframes lf-aurora{from{transform:translate(0,0) scale(1)}to{transform:translate(8%,6%) scale(1.15)}}
.lf-hero-sky{position:relative;z-index:1}
.lf-hero-sky h1,.lf-hero-sky p,.lf-hero-sky .lf-vision{text-shadow:0 1px 12px rgba(0,0,0,.18)}
/* 左栏只有一个“东西”：输入框。其余全是字，不做框，不跟它抢 */
.lf-root .lf-glassy .lf-input{height:62px;border-radius:999px;padding:0 66px 0 26px;font-size:17px;color:#fff;caret-color:#fff;
  background:rgba(255,255,255,.2)!important;-webkit-backdrop-filter:blur(24px) saturate(1.15);backdrop-filter:blur(24px) saturate(1.15);
  box-shadow:0 18px 40px -18px rgba(0,0,0,.38),0 2px 6px -2px rgba(0,0,0,.12)!important;transition:background .25s,box-shadow .25s}
.lf-glassy .lf-sayform{border-radius:999px}
.lf-glassy .lf-sayform::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,var(--edge-t,.6)),rgba(255,255,255,.08) 45%,rgba(255,255,255,.05) 70%,rgba(255,255,255,var(--edge-b,.2)));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);transition:opacity .25s;z-index:1}
.lf-glassy .lf-input::placeholder{color:rgba(255,255,255,.78)}
.lf-root .lf-glassy .lf-input:hover{background:rgba(255,255,255,.24)!important}
.lf-root .lf-glassy .lf-input:focus{background:rgba(255,255,255,.27)!important;box-shadow:0 0 0 6px rgba(255,255,255,.08),0 20px 44px -18px rgba(0,0,0,.42)!important}
.lf-glassy .lf-sayform:focus-within{--edge-t:.85;--edge-b:.3}
.lf-root .lf-glassy .lf-send{top:7px;right:7px;width:48px;height:48px;border-radius:999px;z-index:2}
.lf-root .lf-glassy .lf-send:disabled{background:rgba(255,255,255,.14);color:rgba(255,255,255,.7)}
/* 目标：输入框右边一颗可按压的靶子，悬停才说话 */
.lf-sayrow{display:flex;align-items:center;gap:14px}
.lf-root .lf-glassy .gl-entry{flex:none;width:52px;height:52px;padding:0;margin:0;justify-content:center;border-radius:999px;gap:0;
  background:rgba(255,255,255,.1);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -1px 0 rgba(255,255,255,.08),0 6px 16px -8px rgba(0,0,0,.35);
  transition:transform .25s cubic-bezier(.2,.9,.3,1.4),background .2s,box-shadow .2s}
.lf-root .lf-glassy .gl-entry>span{display:none}
.lf-root .lf-glassy .gl-entry svg{width:28px;height:28px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))}
.lf-root .lf-glassy .gl-entry:hover{background:rgba(255,255,255,.18);transform:translateY(-2px)}
.lf-root .lf-glassy .gl-entry:active{transform:translateY(1px) scale(.9);background:rgba(255,255,255,.08);box-shadow:inset 0 2px 6px rgba(0,0,0,.25),inset 0 -1px 0 rgba(255,255,255,.15)}
.lf-glassy .gl-entry.fresh::after{top:6px;right:6px}
.lf-glassy .gl-entry::before{content:attr(data-tip);position:absolute;bottom:calc(100% + 10px);left:50%;transform:translate(-50%,4px);padding:6px 11px;border-radius:999px;white-space:nowrap;
  background:rgba(20,24,40,.72);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;font-size:12.5px;line-height:1.2;pointer-events:none;opacity:0;transition:opacity .18s,transform .22s cubic-bezier(.2,.8,.2,1)}
.lf-glassy .gl-entry:hover::before,.lf-glassy .gl-entry:focus-visible::before{opacity:1;transform:translate(-50%,0)}
/* 输入框下方：平时两行字，点进/开始输入就退场 */
.lf-idle-stack{display:grid}
.lf-idle-stack>*{grid-area:1/1;align-self:start}
.lf-idle{display:flex;flex-direction:column;gap:12px;transition:opacity .25s,transform .35s cubic-bezier(.2,.8,.2,1),filter .25s}
.lf-idle-stack.focus .lf-idle{opacity:0;transform:translateY(6px);filter:blur(3px);pointer-events:none}
.lf-glassy .lf-idle .lf-vision{margin-top:0}
.lf-story{margin:0;font-size:14px;line-height:1.7;color:rgba(244,245,241,.7);max-width:520px}
.lf-glassy .lf-below>*{animation:lf-belowin .35s cubic-bezier(.2,.8,.2,1) both}
@keyframes lf-belowin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
/* 输入框沉到左栏底部，像对话框；它上面一格：平时是关系提示，点进输入框就换成建议 */
.lf-glassy .lf-nudges{display:grid;align-items:start;margin:0;gap:0}
.lf-glassy .lf-nudges>*{grid-area:1/1}
.lf-sugs{display:flex;flex-wrap:wrap;gap:4px 2px}
.lf-root .lf-sug{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:0;border-radius:999px;background:transparent;color:rgba(255,255,255,.85);font:inherit;font-size:13.5px;
  opacity:0;transform:translateY(-6px);pointer-events:none;transition:opacity .22s,transform .3s cubic-bezier(.2,.8,.2,1),background .2s}
.lf-sugs.on .lf-sug{opacity:1;transform:none;pointer-events:auto}
.lf-root .lf-sug:hover{background:rgba(255,255,255,.12);color:#fff}
.lf-sug em{font-style:normal;color:rgba(255,255,255,.5);font-variant-numeric:tabular-nums}
.lf-sug.due em{color:var(--c)}
.lf-sug-dot{width:6px;height:6px;border-radius:3px;background:var(--c)}
.lf-root .lf-glassy .lf-tip{padding:2px 0;margin:0;width:100%;max-width:560px;background:transparent!important;box-shadow:none!important;border-radius:0;color:rgba(255,255,255,.75);font-size:14px;gap:8px;transition:color .2s}
.lf-root .lf-glassy .lf-tip:hover,.lf-root .lf-glassy .lf-tip.on{color:#fff}
/* 和上面愿景那颗点左对齐：第一颗点宽 6，与愿景的点同宽 */
.lf-glassy .lf-tip-dots i{width:6px;height:6px;border-radius:3px}
.lf-glassy .lf-tip-dots b{width:10px}
.lf-glassy .lf-below{padding:0 0 0 2px}
.lf-glassy .lf-below .lf-sugs{margin:0 0 0 -8px;align-self:start}
.lf-root .lf-wb-hours,.lf-root .lf-wb-input{border-radius:999px}
.lf-root .lf-wb-hours{padding:8px 16px;background:rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
.lf-root .lf-glassy :focus-visible:not(input){outline:none;box-shadow:0 0 0 2px rgba(255,255,255,.5)}
.lf-wb-input:focus{background:rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 0 0 4px rgba(255,255,255,.08)}
/* 天气角标 */
.lf-wbadge{position:absolute;top:26px;right:30px;z-index:2;display:flex;flex-direction:column;align-items:flex-end;gap:2px;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.2);min-width:160px;animation:lf-swap .5s cubic-bezier(.2,.8,.2,1) both}
.lf-root .lf-wb-city{border:0;background:transparent;padding:0;color:rgba(255,255,255,.85);font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.lf-wb-city:hover{text-decoration:underline}
.lf-wb-temp{font-size:58px;font-weight:300;line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.lf-wb-sub{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:rgba(255,255,255,.88)}
.lf-wb-hours{display:flex;gap:12px;margin-top:10px;padding:8px 12px;border-radius:16px;background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.lf-wb-hours span{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:11.5px}
.lf-wb-hours em{font-style:normal;color:rgba(255,255,255,.7)}
.lf-wb-hours b{font-weight:600;font-variant-numeric:tabular-nums}
.lf-wb-input{width:170px;height:34px;padding:0 14px;border:0;border-radius:17px;background:rgba(255,255,255,.18);color:#fff;font:inherit;font-size:13px;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.lf-wb-input::placeholder{color:rgba(255,255,255,.7)}
.lf-wbadge.tone{align-items:flex-end}
.lf-wb-tag{display:inline-flex;align-items:center;gap:7px;height:26px;padding:0 11px;border-radius:13px;background:rgba(255,255,255,.18);font-size:12.5px;font-weight:600}
.lf-wb-live{width:7px;height:7px;border-radius:4px;background:#fff;animation:lf-blinkdot 1.4s ease-in-out infinite}
@keyframes lf-blinkdot{50%{opacity:.3}}
.lf-wb-event{font-size:26px;font-weight:700;margin-top:8px;letter-spacing:-.01em}
.lf-wb-bar{width:180px;height:4px;border-radius:2px;background:rgba(255,255,255,.2);overflow:hidden;margin-top:8px}
.lf-wb-bar i{display:block;height:100%;background:#fff;border-radius:2px;transition:width 1s}
.lf-wb-mini{display:inline-flex;align-items:center;gap:5px;margin-top:10px;font-size:12.5px;color:rgba(255,255,255,.8)}
.lf-wi{flex:none}
.lf-wi.k-clear{color:#FFE28A}
@media (prefers-reduced-motion:reduce){.lf-tone i{animation:none}}
`;

// src/foods.js
var FOODS = [
  // 早餐摊
  ["麻团", 230, "个"],
  ["油条", 230, "根"],
  ["煎饼果子", 520, "套"],
  ["煎饼", 450, "套"],
  ["手抓饼", 420, "个"],
  ["鸡蛋灌饼", 450, "个"],
  ["肉夹馍", 480, "个"],
  ["烧饼", 260, "个"],
  ["葱油饼", 330, "张"],
  ["馅饼", 300, "个"],
  ["烧麦", 90, "个"],
  ["烧卖", 90, "个"],
  ["生煎", 75, "个"],
  ["小笼包", 45, "个"],
  ["小笼", 45, "个"],
  ["汤包", 60, "个"],
  ["肉包", 230, "个"],
  ["菜包", 180, "个"],
  ["包子", 220, "个"],
  ["馒头", 220, "个"],
  ["花卷", 210, "个"],
  ["豆沙包", 230, "个"],
  ["奶黄包", 190, "个"],
  ["叉烧包", 220, "个"],
  ["粢饭团", 480, "个"],
  ["饭团", 320, "个"],
  ["粢饭糕", 300, "块"],
  ["糍粑", 260, "块"],
  ["年糕", 230, "份"],
  ["春卷", 110, "个"],
  ["蛋饼", 280, "个"],
  ["鸡蛋饼", 280, "个"],
  ["豆浆", 120, "杯"],
  ["豆腐脑", 150, "碗"],
  ["豆花", 150, "碗"],
  ["胡辣汤", 200, "碗"],
  ["小米粥", 120, "碗"],
  ["皮蛋瘦肉粥", 250, "碗"],
  ["八宝粥", 260, "碗"],
  ["白粥", 120, "碗"],
  ["粥", 150, "碗"],
  ["茶叶蛋", 80, "个"],
  ["煮鸡蛋", 75, "个"],
  ["荷包蛋", 110, "个"],
  ["煎蛋", 110, "个"],
  ["鸡蛋", 75, "个"],
  ["蛋", 75, "个"],
  ["玉米", 180, "根"],
  ["红薯", 200, "个"],
  ["紫薯", 160, "个"],
  ["山药", 100, "份"],
  ["芋头", 120, "份"],
  ["燕麦", 300, "碗"],
  ["麦片", 280, "碗"],
  ["吐司", 140, "片"],
  ["面包", 260, "个"],
  ["全麦面包", 220, "个"],
  ["贝果", 270, "个"],
  ["可颂", 230, "个"],
  ["牛角包", 230, "个"],
  ["三明治", 380, "个"],
  ["热狗", 300, "个"],
  ["蛋挞", 180, "个"],
  ["麻花", 150, "根"],
  ["开口笑", 120, "个"],
  // 面和粉
  ["牛肉面", 620, "碗"],
  ["拉面", 600, "碗"],
  ["兰州拉面", 600, "碗"],
  ["刀削面", 620, "碗"],
  ["油泼面", 680, "碗"],
  ["臊子面", 600, "碗"],
  ["热干面", 560, "碗"],
  ["炸酱面", 650, "碗"],
  ["担担面", 600, "碗"],
  ["重庆小面", 560, "碗"],
  ["阳春面", 420, "碗"],
  ["葱油拌面", 600, "碗"],
  ["拌面", 600, "碗"],
  ["炒面", 700, "份"],
  ["凉面", 520, "份"],
  ["冷面", 480, "碗"],
  ["乌冬面", 500, "碗"],
  ["方便面", 470, "包"],
  ["泡面", 470, "包"],
  ["意面", 650, "份"],
  ["意大利面", 650, "份"],
  ["面条", 550, "碗"],
  ["米线", 560, "碗"],
  ["过桥米线", 650, "碗"],
  ["米粉", 520, "碗"],
  ["螺蛳粉", 640, "碗"],
  ["桂林米粉", 520, "碗"],
  ["河粉", 600, "份"],
  ["炒河粉", 700, "份"],
  ["肠粉", 350, "份"],
  ["酸辣粉", 480, "碗"],
  ["粉丝", 300, "份"],
  ["凉皮", 420, "份"],
  ["馄饨", 380, "碗"],
  ["云吞", 380, "碗"],
  ["抄手", 400, "碗"],
  ["水饺", 50, "个"],
  ["饺子", 50, "个"],
  ["锅贴", 70, "个"],
  ["蒸饺", 50, "个"],
  // 饭
  ["米饭", 230, "碗"],
  ["白饭", 230, "碗"],
  ["炒饭", 700, "份"],
  ["蛋炒饭", 650, "份"],
  ["扬州炒饭", 700, "份"],
  ["盖饭", 720, "份"],
  ["盖浇饭", 720, "份"],
  ["黄焖鸡", 760, "份"],
  ["黄焖鸡米饭", 760, "份"],
  ["卤肉饭", 720, "份"],
  ["鸡排饭", 800, "份"],
  ["咖喱饭", 750, "份"],
  ["煲仔饭", 780, "份"],
  ["石锅拌饭", 650, "份"],
  ["拌饭", 650, "份"],
  ["烧腊饭", 780, "份"],
  ["猪脚饭", 820, "份"],
  ["隆江猪脚饭", 820, "份"],
  ["烤肉饭", 760, "份"],
  ["鳗鱼饭", 700, "份"],
  ["寿司", 45, "个"],
  ["手卷", 200, "个"],
  ["便当", 700, "份"],
  ["套餐", 750, "份"],
  ["定食", 750, "份"],
  ["快餐", 750, "份"],
  ["麻辣香锅", 900, "份"],
  ["香锅", 900, "份"],
  ["麻辣烫", 650, "份"],
  ["冒菜", 700, "份"],
  ["火锅", 1100, "顿"],
  ["串串", 800, "份"],
  ["烧烤", 900, "顿"],
  ["烤串", 90, "串"],
  ["羊肉串", 90, "串"],
  ["烤鱼", 900, "份"],
  ["小龙虾", 600, "份"],
  ["酸菜鱼", 800, "份"],
  ["水煮鱼", 850, "份"],
  ["家常菜", 650, "顿"],
  ["食堂", 700, "顿"],
  ["自助餐", 1300, "顿"],
  ["外卖", 750, "份"],
  ["轻食", 420, "份"],
  ["沙拉", 320, "份"],
  ["鸡胸肉", 200, "份"],
  ["鸡胸", 200, "份"],
  ["牛排", 600, "份"],
  ["汉堡", 550, "个"],
  ["巨无霸", 560, "个"],
  ["薯条", 350, "份"],
  ["炸鸡", 600, "份"],
  ["鸡块", 50, "块"],
  ["鸡翅", 110, "个"],
  ["鸡腿", 260, "个"],
  ["披萨", 280, "块"],
  ["卷饼", 450, "个"],
  ["塔可", 220, "个"],
  ["烤冷面", 380, "份"],
  ["关东煮", 250, "份"],
  ["煎饺", 70, "个"],
  ["番茄炒蛋", 260, "份"],
  ["西红柿炒蛋", 260, "份"],
  ["青菜", 80, "份"],
  ["炒青菜", 100, "份"],
  ["红烧肉", 550, "份"],
  ["宫保鸡丁", 450, "份"],
  ["鱼香肉丝", 450, "份"],
  ["回锅肉", 550, "份"],
  ["麻婆豆腐", 350, "份"],
  ["豆腐", 150, "份"],
  ["排骨", 400, "份"],
  ["鸭血粉丝汤", 350, "碗"],
  ["汤", 120, "碗"],
  ["紫菜蛋花汤", 60, "碗"],
  ["鸡汤", 200, "碗"],
  ["羊肉汤", 350, "碗"],
  ["烩面", 650, "碗"],
  ["盐水鸭", 350, "份"],
  ["鸭血", 80, "份"],
  ["烤鸭", 650, "份"],
  ["卤味", 350, "份"],
  ["鸭脖", 250, "份"],
  ["凉菜", 150, "份"],
  ["大盘鸡", 800, "份"],
  ["手抓饭", 750, "份"],
  ["馕", 330, "个"],
  // 水果
  ["苹果", 90, "个"],
  ["香蕉", 100, "根"],
  ["橙子", 70, "个"],
  ["橘子", 45, "个"],
  ["梨", 100, "个"],
  ["葡萄", 100, "份"],
  ["西瓜", 90, "块"],
  ["草莓", 50, "份"],
  ["蓝莓", 60, "盒"],
  ["芒果", 130, "个"],
  ["猕猴桃", 60, "个"],
  ["火龙果", 110, "个"],
  ["桃子", 60, "个"],
  ["柚子", 80, "份"],
  ["榴莲", 300, "份"],
  ["荔枝", 100, "份"],
  ["樱桃", 90, "份"],
  ["哈密瓜", 80, "块"],
  ["菠萝", 80, "份"],
  ["牛油果", 230, "个"],
  ["水果", 120, "份"],
  ["果切", 150, "盒"],
  // 零食甜点
  ["蛋糕", 420, "块"],
  ["芝士蛋糕", 450, "块"],
  ["提拉米苏", 450, "块"],
  ["泡芙", 150, "个"],
  ["甜甜圈", 300, "个"],
  ["曲奇", 50, "块"],
  ["饼干", 150, "份"],
  ["薯片", 520, "包"],
  ["巧克力", 230, "块"],
  ["冰淇淋", 220, "个"],
  ["雪糕", 200, "根"],
  ["冰棍", 90, "根"],
  ["坚果", 180, "份"],
  ["瓜子", 300, "份"],
  ["花生", 280, "份"],
  ["辣条", 180, "包"],
  ["月饼", 400, "个"],
  ["青团", 180, "个"],
  ["汤圆", 70, "个"],
  ["元宵", 70, "个"],
  ["粽子", 300, "个"],
  ["绿豆糕", 120, "块"],
  ["桂花糕", 140, "块"],
  ["发糕", 200, "块"],
  ["蛋黄酥", 220, "个"],
  ["凤梨酥", 180, "个"],
  ["麻薯", 120, "个"],
  ["驴打滚", 150, "块"],
  ["冰粉", 150, "碗"],
  ["双皮奶", 220, "碗"],
  ["烤红薯", 230, "个"],
  ["糖葫芦", 220, "串"],
  ["爆米花", 400, "份"],
  ["零食", 250, "份"],
  ["点心", 250, "份"],
  // 喝的
  ["奶茶", 380, "杯"],
  ["珍珠奶茶", 450, "杯"],
  ["果茶", 220, "杯"],
  ["柠檬茶", 180, "杯"],
  ["杨枝甘露", 400, "杯"],
  ["芋泥", 420, "杯"],
  ["咖啡", 120, "杯"],
  ["美式", 15, "杯"],
  ["拿铁", 190, "杯"],
  ["生椰拿铁", 230, "杯"],
  ["卡布奇诺", 150, "杯"],
  ["摩卡", 290, "杯"],
  ["澳白", 160, "杯"],
  ["牛奶", 150, "盒"],
  ["酸奶", 150, "杯"],
  ["豆奶", 130, "盒"],
  ["可乐", 150, "罐"],
  ["雪碧", 140, "罐"],
  ["果汁", 140, "杯"],
  ["橙汁", 120, "杯"],
  ["啤酒", 150, "罐"],
  ["红酒", 120, "杯"],
  ["白酒", 200, "两"],
  ["气泡水", 0, "瓶"],
  ["矿泉水", 0, "瓶"],
  ["茶", 0, "杯"],
  ["蛋白粉", 120, "勺"]
];
var SUFFIX = [
  [/(拉|拌|炒|汤|凉|冷|捞|烩|焖|宽|刀削|油泼|面)面$|面$/, 580, "碗"],
  [/(米线|米粉|河粉|粉丝|粉)$/, 540, "碗"],
  [/(炒|盖|拌|焖|卤|烧)?饭$/, 720, "份"],
  [/粥$/, 180, "碗"],
  [/(汤|羹)$/, 150, "碗"],
  [/(饺|饺子)$/, 50, "个"],
  [/(馄饨|抄手|云吞)$/, 380, "碗"],
  [/(包|馍|馒头|花卷)$/, 220, "个"],
  [/(饼|酥|挞)$/, 300, "个"],
  [/(团|丸子|圆子)$/, 200, "个"],
  [/(糕|糍粑|麻薯)$/, 220, "块"],
  [/(奶茶|拿铁|咖啡|茶|饮|汁|奶|昔|露)$/, 220, "杯"],
  [/(鸡|鸭|鹅|鱼|虾|蟹|肉|排骨|鸡翅|鸡腿|香肠|肉丁|肉丝|肉片)$/, 450, "份"],
  [/(菜|瓜|豆|笋|菇|藕|苗|芽)$/, 120, "份"],
  [/(串)$/, 90, "串"],
  [/(锅|煲)$/, 900, "份"]
];
var CN_NUM = { 半: 0.5, 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
var UNITS = "个|碗|杯|份|根|块|片|张|串|盒|包|罐|瓶|套|勺|只|条|袋|顿|两|盘|笼|屉|粒|颗";
function splitFoods(text, mine = {}) {
  text = text.replace(new RegExp("([^\\d\\s半一两二三四五六七八九十])((?:\\d+|[半一两二三四五六七八九十])\\s*(?:" + UNITS + "))", "g"), "$1 $2");
  const pieces = text.split(/[、，,；;和跟加配\+\s]+|还有|以及/).map((s) => s.trim()).filter(Boolean);
  const items = [];
  for (let raw of pieces) {
    let qty = 1;
    const q = raw.match(new RegExp("^(\\d+(?:\\.\\d+)?|[半一两二三四五六七八九十])\\s*(" + UNITS + ")?"));
    if (q && (q[2] || /^[半一两二三四五六七八九十]/.test(q[1]))) {
      qty = isNaN(+q[1]) ? CN_NUM[q[1]] : +q[1];
      raw = raw.slice(q[0].length);
    }
    const tail = raw.match(new RegExp("(\\d+|[一两二三四五六七八九十])\\s*(" + UNITS + ")$"));
    if (tail) {
      qty = isNaN(+tail[1]) ? CN_NUM[tail[1]] : +tail[1];
      raw = raw.slice(0, -tail[0].length);
    }
    raw = raw.replace(/^(吃了|喝了|来了|点了|买了|吃|喝|的)+/, "").replace(/(了|的)$/, "").trim();
    if (!raw || /^\d/.test(raw)) continue;
    const found = lookup(raw, mine);
    if (!found) continue;
    items.push({ name: raw, qty, kcal: Math.round(found.kcal * qty), per: found.kcal, unit: found.unit, source: found.source });
  }
  return items;
}
function lookup(name, mine = {}) {
  if (mine[name] != null) return { kcal: mine[name], unit: "份", source: "mine" };
  let best = null;
  for (const [w, k, u] of FOODS) if (name.includes(w) && (!best || w.length > best[0].length)) best = [w, k, u];
  if (best && best[0].length >= Math.min(2, name.length)) return { kcal: best[1], unit: best[2], source: best[0] === name ? "table" : "near" };
  for (const [re, k, u] of SUFFIX) if (re.test(name)) return { kcal: k, unit: u, source: "guess" };
  if (best) return { kcal: best[1], unit: best[2], source: "near" };
  return null;
}
var NOT_FOOD = /(打车|地铁|公交|高铁|机票|滴滴|加油|停车|房租|水电|物业|话费|会员|订阅|续费|工资|报销|开会|会议|评审|电话|快递|洗澡|理发|看病|挂号|狗粮|猫粮|衣服|鞋|充电|门票|电影)/;

// src/data.js
var DOMAIN = {
  sleep: { name: "睡眠", color: "#3D4FB8", soft: "color-mix(in srgb,#3D4FB8 15%,var(--card))" },
  move: { name: "运动", color: "#1E9E6A", soft: "color-mix(in srgb,#1E9E6A 15%,var(--card))" },
  food: { name: "饮食", color: "#F2994A", soft: "color-mix(in srgb,#F2994A 15%,var(--card))" },
  money: { name: "花销", color: "#7C5CE0", soft: "color-mix(in srgb,#7C5CE0 15%,var(--card))" },
  time: { name: "日程", color: "#1F2328", soft: "var(--fill)" },
  body: { name: "身体", color: "#0E8A8A", soft: "color-mix(in srgb,#0E8A8A 15%,var(--card))" }
};
var DEFAULT_GOALS = { kcal: 1800, budget: 7e3, sleep: 7.5, workoutsPerWeek: 4, weight: null };
var GOALS = { ...DEFAULT_GOALS };
function setGoals(g) {
  Object.assign(GOALS, DEFAULT_GOALS, g || {});
}
var WEATHER = { w: null };
function setWeather(w) {
  WEATHER.w = w || null;
}
var TONES = { meet: "#3D4FB8", study: "#7C5CE0", move: "#1E9E6A", time: "#1F2328" };
function eventTone(e) {
  if (!e) return null;
  if (e.domain === "move") return "move";
  const t = e.title || "";
  if (/学习|读书|看书|上课|课程|复习|背单词|练琴|写作|自习|网课|作业|考试/.test(t)) return "study";
  if (/会|评审|讨论|面试|沟通|电话|汇报|对齐|同步|复盘|拜访|访谈/.test(t)) return "meet";
  return "time";
}
var DAY = 864e5;
var startOfDay = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
var hourOf = (t) => {
  const d = new Date(t);
  return d.getHours() + d.getMinutes() / 60;
};
var fmtTime = (t) => {
  const d = new Date(t);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
};
var pad = (n) => (n < 10 ? "0" : "") + n;
var fmtHM = (h) => Math.floor(h) + ":" + pad(Math.round(h % 1 * 60));
var money = (n) => "¥" + Math.round(n).toLocaleString("en-US");
var num = (n) => Math.round(n).toLocaleString("en-US");
var seq = 0;
var uid = () => "r" + Date.now().toString(36) + (seq++).toString(36);
var CN = { 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
var cnNum = (x) => /^\d+$/.test(x) ? +x : x === "十" ? 10 : x.length === 2 && x[0] === "十" ? 10 + CN[x[1]] : x.length === 2 && x[1] === "十" ? CN[x[0]] * 10 : CN[x] || null;
function pastDay(text, now = Date.now()) {
  const t = String(text || ""), d0 = startOfDay(now);
  let m = t.match(/([一两二三四五六七八九十\d]{1,3})\s*(天|日|周|个?星期|个?礼拜|个月)(?:之)?前/);
  if (m) {
    const n = cnNum(m[1]);
    if (n) {
      const days = /周|星期|礼拜/.test(m[2]) ? n * 7 : /月/.test(m[2]) ? n * 30 : n;
      return { day: d0 - days * DAY, str: m[0] };
    }
  }
  m = t.match(/上(?:个)?(?:周|星期|礼拜)([一二三四五六日天])?/);
  if (m) {
    if (!m[1]) return { day: d0 - 7 * DAY, str: m[0] };
    const want = "日一二三四五六".indexOf(m[1] === "天" ? "日" : m[1]);
    const dow = new Date(now).getDay(), mon = d0 - (dow + 6) % 7 * DAY;
    return { day: mon - 7 * DAY + (want + 6) % 7 * DAY, str: m[0] };
  }
  m = t.match(/大前天/);
  if (m) return { day: d0 - 3 * DAY, str: m[0] };
  m = t.match(/前天/);
  if (m) return { day: d0 - 2 * DAY, str: m[0] };
  m = t.match(/昨天|昨晚|昨日|昨早/);
  if (m) return { day: d0 - DAY, str: m[0] };
  m = t.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?|(?:^|[^\d.])(\d{1,2})\/(\d{1,2})(?![\d/])/);
  if (m) {
    const mo = +(m[1] || m[3]), da = +(m[2] || m[4]);
    if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
      const y = new Date(now).getFullYear();
      let day = new Date(y, mo - 1, da).getTime();
      if (day > d0) day = new Date(y - 1, mo - 1, da).getTime();
      if (day < d0) return { day, str: m[0].replace(/^[^\d]/, "") };
    }
  }
  return null;
}
function stepsIn(text) {
  const m = String(text || "").match(/(\d+(?:\.\d+)?)\s*(万|千|k|K)?\s*步/);
  if (!m) return null;
  const v = +m[1] * (m[2] === "万" ? 1e4 : m[2] ? 1e3 : 1);
  return v >= 100 ? Math.round(v) : null;
}
var stepsText = (n) => Math.round(n).toLocaleString("en-US") + " 步";
var WORKOUT = [
  ["走路", 3.5, "走路"],
  ["走了", 3.5, "走路"],
  ["步行", 3.5, "走路"],
  ["跑步", 10.5, "跑步"],
  ["跑", 10.5, "跑步"],
  ["健身", 6.5, "力量训练"],
  ["力量", 6.5, "力量训练"],
  ["撸铁", 6.5, "力量训练"],
  ["骑行", 8, "骑行"],
  ["骑车", 8, "骑行"],
  ["游泳", 9, "游泳"],
  ["瑜伽", 3.5, "瑜伽"],
  ["羽毛球", 7, "羽毛球"],
  ["篮球", 8, "篮球"],
  ["散步", 3.5, "散步"],
  ["遛狗", 3, "遛狗"],
  ["爬山", 7, "爬山"],
  ["跳绳", 11, "跳绳"]
];
var MEAL_WORDS = [["早饭", "breakfast"], ["早餐", "breakfast"], ["午饭", "lunch"], ["午餐", "lunch"], ["中饭", "lunch"], ["晚饭", "dinner"], ["晚餐", "dinner"], ["夜宵", "snack"], ["加餐", "snack"], ["下午茶", "snack"]];
var MEAL_NAME = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
var MONEY_CATS = [
  ["餐饮", ["饭", "餐", "面", "奶茶", "咖啡", "外卖", "火锅", "烧烤", "零食", "水果"]],
  ["交通", ["打车", "地铁", "公交", "油费", "加油", "停车", "高铁", "机票", "滴滴"]],
  ["订阅", ["会员", "订阅", "续费", "云存储", "icloud", "iCloud"]],
  ["居家", ["房租", "水电", "物业", "燃气", "网费", "话费"]],
  ["宠物", ["狗粮", "猫粮", "宠物", "洗澡", "疫苗"]],
  ["运动", ["健身卡", "球鞋", "跑鞋", "私教", "球拍"]],
  ["购物", ["买", "衣服", "鞋", "淘宝", "京东"]]
];
var INCOME_WORDS = ["工资", "收入", "报销", "奖金", "红包", "退款"];
var MET_KCAL_PER_MIN = (met) => met * 3.5 * 68 / 200;
var catOf = (text) => {
  for (const [c, ws] of MONEY_CATS) if (ws.some((w) => text.includes(w))) return c;
  return "其他";
};
function parse(input, now = Date.now(), mine = {}) {
  const text = (input || "").trim();
  const out = { tokens: [], records: [], effects: /* @__PURE__ */ new Set(), text };
  if (!text) return out;
  const mark = (str, domain) => {
    if (str && text.includes(str)) out.tokens.push({ text: str, domain });
  };
  const past = pastDay(text, now);
  const dayShift = /明天/.test(text) ? 1 : /后天/.test(text) ? 2 : past ? Math.round((past.day - startOfDay(now)) / DAY) : 0;
  if (dayShift > 0) mark(text.match(/明天|后天/)[0], "time");
  if (past) mark(past.str, "time");
  const base = startOfDay(now) + dayShift * DAY;
  const clock = text.match(/(\d{1,2})[:：点](\d{2})?(?:分)?/);
  const clockAt = (fallback) => {
    if (!clock) return dayShift ? base + fallback * 36e5 : now;
    let h = +clock[1], m = clock[2] ? +clock[2] : 0;
    if (/下午|晚上/.test(text) && h < 12) h += 12;
    return base + (h + m / 60) * 36e5;
  };
  let amount = null, amountStr = null;
  const am = text.match(/[¥￥]\s?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s?(?:元|块钱|块)/);
  if (am) {
    amount = +(am[1] || am[2]);
    amountStr = am[0];
  } else {
    const bare2 = text.replace(/\d{1,2}[:：点]\d{0,2}/g, " ").match(/(?:^|[^\d.])(\d+(?:\.\d+)?)(?!\s?(?:分钟|min|公里|km|kg|斤|小时|h|个|次|杯|碗|千卡|卡|%|号|日|月|点))/i);
    if (bare2) {
      amount = +bare2[1];
      amountStr = bare2[1];
    }
  }
  const wt = text.match(/(?:体重|称重|重)\s*(\d{2,3}(?:\.\d)?)|(\d{2,3}(?:\.\d)?)\s?(?:kg|公斤)/i);
  if (wt && !/跑|骑/.test(text)) {
    const v = +(wt[1] || wt[2]);
    out.records.push({ id: uid(), type: "weight", t: dayShift < 0 ? clockAt(8) : now, kg: v, title: "体重 " + v + " kg" });
    out.tokens.push({ text: wt[0], domain: "body" });
    out.effects.add("body");
    return out;
  }
  const sl = text.match(/睡了?\s*(\d+(?:\.\d+)?)\s*(?:个)?(?:小时|h)/i);
  const sl2 = text.match(/(\d{1,2})[:：点](\d{2})?\s*睡.*?(\d{1,2})[:：点](\d{2})?\s*起/);
  if (sl || sl2) {
    let hours, bedT;
    if (sl2) {
      let b = +sl2[1] + (sl2[2] ? +sl2[2] / 60 : 0), w = +sl2[3] + (sl2[4] ? +sl2[4] / 60 : 0);
      if (b < 12) b += 24;
      hours = w + 24 - b;
      bedT = startOfDay(now) - DAY + b * 36e5;
    } else {
      hours = +sl[1];
      bedT = startOfDay(now) + 7 * 36e5 - hours * 36e5;
    }
    out.records.push({ id: uid(), type: "sleep", t: bedT, hours, title: "睡了 " + fmtHM(hours) });
    out.tokens.push({ text: (sl2 || sl)[0], domain: "sleep" });
    out.effects.add("sleep");
    out.effects.add("time");
    return out;
  }
  const steps = stepsIn(text);
  const wk = WORKOUT.find(([w]) => text.includes(w)) || (steps ? ["步", 3.5, "走路"] : null);
  if (wk && !/买|会员|卡/.test(text)) {
    const mins = text.match(/(\d+(?:\.\d+)?)\s*(分钟|min|小时|h)/i);
    const km = text.match(/(\d+(?:\.\d+)?)\s*(?:公里|km)/i);
    let minutes = mins ? +mins[1] * (/小时|h/i.test(mins[2]) ? 60 : 1) : steps ? Math.round(steps / 110) : km ? Math.round(+km[1] * 6) : 45;
    const kcal = steps ? Math.round(steps * 0.04) : Math.round(MET_KCAL_PER_MIN(wk[1]) * minutes);
    const isPlan = !!clock && (dayShift > 0 || clockAt(19) > now);
    mark(wk[0], "move");
    if (mins) mark(mins[0], "move");
    if (km) mark(km[0], "move");
    if (clock) mark(clock[0], "time");
    if (isPlan) {
      const t = clockAt(19);
      out.records.push({ id: uid(), type: "event", t, end: t + minutes * 6e4, title: wk[2], domain: "move", minutes, kcal });
      out.effects.add("time");
      out.effects.add("move");
    } else {
      out.records.push({ id: uid(), type: "workout", t: dayShift < 0 ? clockAt(18.5) : now - minutes * 6e4, minutes, kcal, kind: wk[2], km: km ? +km[1] : null, steps, title: wk[2] + " " + (steps ? stepsText(steps) : minutes + " 分钟") });
      out.effects.add("move");
      out.effects.add("food");
      out.effects.add("time");
    }
    if (amount && /私教|门票|场地/.test(text)) {
      out.records.push({ id: uid(), type: "expense", t: now, amount, cat: "运动", title: wk[2] + "费用" });
      out.effects.add("money");
    }
    linkAll(out.records);
    return out;
  }
  if (INCOME_WORDS.some((w) => text.includes(w)) && amount) {
    const w = INCOME_WORDS.find((x) => text.includes(x));
    out.records.push({ id: uid(), type: "income", t: now, amount, title: w });
    mark(w, "money");
    mark(amountStr, "money");
    out.effects.add("money");
    return out;
  }
  const todo = text.match(/^(?:待办|记得|提醒我|别忘了|要)\s*(.+)$/);
  if (todo) {
    const body = todo[1].replace(/[¥￥]?\s?\d+(\.\d+)?\s?(元|块)?/, "").trim();
    out.records.push({ id: uid(), type: "todo", t: now, title: body, amount: amount || null, cat: amount ? catOf(body) : null, done: false });
    mark(todo[0].slice(0, todo[0].length - todo[1].length).trim(), "time");
    if (amountStr) mark(amountStr, "money");
    out.effects.add("time");
    if (amount) out.effects.add("money");
    return out;
  }
  const meal = MEAL_WORDS.find(([w]) => text.includes(w));
  const rest = text.replace(amountStr || "\0", " ").replace(clock ? clock[0] : "\0", " ").replace(meal ? meal[0] : "\0", " ").replace(/明天|后天|昨天|昨晚|今天|今早|早上|上午|中午|下午|晚上|刚才|刚刚|吃了|喝了|花了|元|块钱|[¥￥]/g, " ");
  const items = NOT_FOOD.test(text) ? [] : splitFoods(rest, mine);
  const bare = !meal && !items.length && !amount && !clock && !NOT_FOOD.test(text) && /^[\u4e00-\u9fa5]{1,6}$/.test(rest.trim());
  if (meal || items.length || bare) {
    const t = clock ? clockAt(12) : dayShift ? base + 12 * 36e5 : now;
    const mealKey = meal ? meal[1] : guessMeal(t);
    const fallback = mealKey === "snack" ? 220 : mealKey === "breakfast" ? 380 : 600;
    const list = items.length ? items : [{ name: rest.trim() || MEAL_NAME[mealKey], qty: 1, kcal: fallback, per: fallback, unit: "份", source: "unknown" }];
    const kcal = list.reduce((a, i) => a + i.kcal, 0);
    const title = list.map((i) => i.name + (i.qty !== 1 ? " ×" + i.qty : "")).join(" · ");
    out.records.push({ id: uid(), type: "meal", t, meal: mealKey, kcal, title, items: list, estimated: true });
    if (meal) mark(meal[0], "food");
    list.forEach((i) => mark(i.name, "food"));
    out.effects.add("food");
    out.effects.add("body");
    out.effects.add("time");
    if (amount) {
      out.records.push({ id: uid(), type: "expense", t, amount, cat: "餐饮", title });
      mark(amountStr, "money");
      out.effects.add("money");
    }
    linkAll(out.records);
    return out;
  }
  if (clock && !amount) {
    const t = clockAt(9);
    const title = text.replace(clock[0], "").replace(/明天|后天|今天|上午|下午|晚上/g, "").trim() || "日程";
    out.records.push({ id: uid(), type: "event", t, end: t + 36e5, title, domain: "time" });
    mark(clock[0], "time");
    out.effects.add("time");
    return out;
  }
  if (amount) {
    const title = text.replace(amountStr, "").replace(/花了|买了|付了/g, "").trim() || "一笔花销";
    out.records.push({ id: uid(), type: "expense", t: now, amount, cat: catOf(text), title });
    mark(amountStr, "money");
    out.effects.add("money");
    for (const [, ws] of MONEY_CATS) {
      const w = ws.find((x) => text.includes(x));
      if (w) {
        mark(w, "money");
        break;
      }
    }
    return out;
  }
  return out;
}
var guessMeal = (t) => {
  const h = hourOf(t);
  return h < 10 ? "breakfast" : h < 15 ? "lunch" : h < 17 ? "snack" : h < 21 ? "dinner" : "snack";
};
function linkAll(rs) {
  if (rs.length > 1) {
    const g = "g" + rs[0].id;
    rs.forEach((r) => {
      r.link = g;
    });
  }
}
function completeEvent(ev, now = Date.now()) {
  const t = Math.min(ev.t, now);
  return { id: uid(), type: "workout", t, minutes: ev.minutes || 45, kcal: ev.kcal || 300, kind: ev.title, title: ev.title + " " + (ev.minutes || 45) + " 分钟", from: ev.id };
}
function todoToExpense(todo, now = Date.now()) {
  return { id: uid(), type: "expense", t: now, amount: todo.amount, cat: todo.cat || catOf(todo.title), title: todo.title, from: todo.id };
}
function derive(records, now = Date.now()) {
  const today = startOfDay(now);
  const inDay = (r, d2) => r.t >= d2 && r.t < d2 + DAY;
  const T = records.filter((r) => inDay(r, today));
  const sum = (arr, k) => arr.reduce((s, r) => s + (r[k] || 0), 0);
  const meals = T.filter((r) => r.type === "meal").sort((a, b) => a.t - b.t);
  const workouts = T.filter((r) => r.type === "workout");
  const kcalIn = sum(meals, "kcal"), burned = sum(workouts, "kcal");
  const allowance = GOALS.kcal + burned - kcalIn;
  const d = new Date(now), y = d.getFullYear(), m = d.getMonth();
  const monthStart = new Date(y, m, 1).getTime(), daysInMonth = new Date(y, m + 1, 0).getDate();
  const dayOfMonth = d.getDate();
  const exp = records.filter((r) => r.type === "expense");
  const monthExp = exp.filter((r) => r.t >= monthStart);
  const spent = sum(monthExp, "amount"), todaySpent = sum(exp.filter((r) => inDay(r, today)), "amount");
  const pendingBills = records.filter((r) => r.type === "todo" && !r.done && r.amount).reduce((s, r) => s + r.amount, 0);
  const remaining = GOALS.budget - spent;
  const daysLeft = daysInMonth - dayOfMonth + 1;
  const perDay = Math.max(0, (remaining - pendingBills) / daysLeft);
  const fixed = monthExp.filter((r) => r.cat === "居家").reduce((a, r) => a + r.amount, 0);
  const pace = fixed + (spent - fixed) / dayOfMonth * daysInMonth;
  const byCat = {};
  monthExp.forEach((r) => {
    byCat[r.cat] = (byCat[r.cat] || 0) + r.amount;
  });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const sleeps = records.filter((r) => r.type === "sleep").sort((a, b) => a.t - b.t);
  const wakeDay = (s) => startOfDay(s.t + s.hours * 36e5);
  const lastNight = sleeps.filter((s) => wakeDay(s) === today).pop() || null;
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const day = today - i * DAY;
    const s = sleeps.filter((x) => wakeDay(x) === day).pop();
    const w = records.filter((r) => r.type === "workout" && inDay(r, day));
    const mk = records.filter((r) => r.type === "meal" && inDay(r, day));
    const ex = exp.filter((r) => inDay(r, day));
    week.push({
      day,
      label: "日一二三四五六"[new Date(day).getDay()],
      today: i === 0,
      sleep: s ? { bed: hourOf(s.t) < 12 ? hourOf(s.t) + 24 : hourOf(s.t), hours: s.hours } : null,
      workoutMin: sum(w, "minutes"),
      workoutKcal: sum(w, "kcal"),
      steps: sum(w, "steps"),
      kcalIn: sum(mk, "kcal"),
      spend: sum(ex, "amount")
    });
  }
  const sleepAvg = avg(week.filter((x) => x.sleep).map((x) => x.sleep.hours));
  const weekWorkouts = week.filter((x) => x.workoutMin > 0).length;
  const weekMinutes = sum(week, "workoutMin");
  const weekKcal = sum(week, "workoutKcal");
  const weights = records.filter((r) => r.type === "weight").sort((a, b) => a.t - b.t);
  const wNow = weights.length ? weights[weights.length - 1].kg : null;
  const wWeekAgo = weights.filter((r) => r.t <= now - 6 * DAY).pop();
  const wDelta = wNow != null && wWeekAgo ? wNow - wWeekAgo.kg : null;
  const events = records.filter((r) => r.type === "event").sort((a, b) => a.t - b.t);
  const todayEvents = events.filter((e) => inDay(e, today));
  const next = events.find((e) => (e.end || e.t) > now && !e.done && e.t < today + 2 * DAY) || null;
  const nowEvent = events.find((e) => e.t <= now && (e.end || e.t + 36e5) > now && !e.done) || null;
  const todos = records.filter((r) => r.type === "todo" && !r.archived && !(r.done && r.doneAt && r.doneAt < today)).sort((a, b) => a.done - b.done || (a.done ? (b.doneAt || 0) - (a.doneAt || 0) : a.t - b.t));
  const heat = [];
  for (let i = 34; i >= 0; i--) {
    const day = today - i * DAY;
    heat.push({ day, v: sum(exp.filter((r) => inDay(r, day)), "amount") });
  }
  const groups = /* @__PURE__ */ new Map();
  T.filter((r) => r.type !== "todo" && r.type !== "event").forEach((r) => {
    const k = r.link || r.id;
    if (!groups.has(k)) groups.set(k, { key: k, t: r.t, items: [] });
    groups.get(k).items.push(r);
    groups.get(k).t = Math.min(groups.get(k).t, r.t);
  });
  if (lastNight && !T.includes(lastNight)) groups.set(lastNight.id, { key: lastNight.id, t: lastNight.t + lastNight.hours * 36e5, items: [lastNight], wake: true });
  const timeline = [...groups.values()].sort((a, b) => b.t - a.t);
  const S2 = {
    now,
    today,
    meals,
    workouts,
    kcalIn,
    burned,
    allowance,
    spent,
    todaySpent,
    remaining,
    perDay,
    pace,
    daysLeft,
    dayOfMonth,
    daysInMonth,
    nowEvent,
    cats,
    pendingBills,
    lastNight,
    week,
    sleepAvg,
    weekWorkouts,
    weekMinutes,
    weekKcal,
    wNow,
    wDelta,
    weights,
    events,
    todayEvents,
    next,
    todos,
    heat,
    timeline
  };
  S2.insights = insights(S2, records);
  S2.nextAdvice = adviceFor(S2);
  return S2;
}
var avg = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
function insights(S2, records) {
  const list = [];
  const h = hourOf(S2.now);
  const w = WEATHER.w;
  if (w) {
    const outdoor = S2.events.find((e) => e.domain === "move" && !e.done && e.t > S2.now && e.t < S2.today + DAY && /跑|骑|徒步|爬山|球/.test(e.title));
    if (outdoor && w.rainSoon) list.push({
      id: "weather-move",
      from: "sleep",
      to: "move",
      tone: "warn",
      ev: ["week.move", "next.title"],
      text: "接下来几小时有雨，" + fmtTime(outdoor.t) + " 的" + outdoor.title + "可以换成室内练，或者带伞。"
    });
    else if (w.temp >= 32) list.push({
      id: "weather-hot",
      from: "move",
      to: "food",
      tone: "warn",
      ev: ["energy.num", "move.today"],
      text: "外面 " + w.temp + "°，练的时候多补水，强度降一点。"
    });
    else if (w.temp <= 3) list.push({
      id: "weather-cold",
      from: "move",
      to: "food",
      tone: "warn",
      ev: ["move.today", "energy.num"],
      text: "外面只有 " + w.temp + "°，出门练先热身久一点。"
    });
  }
  if (S2.lastNight && S2.lastNight.hours < 6.5) {
    list.push({
      id: "sleep-move",
      from: "sleep",
      to: "move",
      tone: "warn",
      ev: ["sleep.last", "next.title"],
      text: "昨晚只睡了 " + fmtHM(S2.lastNight.hours) + "，今天的训练强度降一档，早点睡比多练有用。"
    });
  }
  if (S2.burned > 0) {
    list.push({
      id: "move-food",
      from: "move",
      to: "food",
      tone: "good",
      ev: ["move.today", "energy.num"],
      text: "今天练掉 " + num(S2.burned) + " 千卡，晚饭的额度多了这么多，还能吃 " + num(Math.max(0, S2.allowance)) + "。"
    });
  }
  if (S2.allowance < 0) {
    list.push({
      id: "food-body",
      from: "food",
      to: "body",
      tone: "warn",
      ev: ["energy.num", "body.num"],
      text: "今天已超出 " + num(-S2.allowance) + " 千卡。散步 " + Math.ceil(-S2.allowance / 4) + " 分钟能补回来。"
    });
  }
  const over = S2.pace - GOALS.budget;
  if (S2.dayOfMonth >= 3) {
    if (over > 50) list.push({
      id: "money-pace",
      from: "money",
      to: "money",
      tone: "warn",
      ev: ["money.today", "money.perday"],
      text: "按现在的速度，月底会超支 " + money(over) + "。每天控制在 " + money(S2.perDay) + " 以内就不会。"
    });
    else list.push({
      id: "money-pace",
      from: "money",
      to: "money",
      tone: "good",
      ev: ["money.today", "money.num"],
      text: "照这个节奏，月底还能剩 " + money(-over) + "。"
    });
  }
  const DAYMS = 864e5, rows = [];
  for (let i = 1; i <= 14; i++) {
    const day = S2.today - i * DAYMS;
    const s = records.find((r) => r.type === "sleep" && startOfDay(r.t + r.hours * 36e5) === day);
    if (!s) continue;
    const food = records.filter((r) => r.type === "expense" && r.cat === "餐饮" && r.t >= day && r.t < day + DAYMS).reduce((a2, r) => a2 + r.amount, 0);
    rows.push({ short: s.hours < 7, food });
  }
  const a = rows.filter((r) => r.short).map((r) => r.food), b = rows.filter((r) => !r.short).map((r) => r.food);
  if (a.length >= 2 && b.length >= 2 && avg(a) - avg(b) > 8) {
    list.push({
      id: "sleep-money",
      from: "sleep",
      to: "money",
      tone: "info",
      ev: ["sleep.bars", "money.today"],
      text: "最近两周，睡不到 7 小时的日子，你在吃上平均多花 " + money(avg(a) - avg(b)) + "。"
    });
  }
  if (S2.wDelta != null) {
    list.push({
      id: "body",
      from: "food",
      to: "body",
      tone: S2.wDelta <= 0 ? "good" : "info",
      ev: ["energy.eaten", "body.line"],
      text: "体重一周" + (S2.wDelta <= 0 ? "轻了 " : "重了 ") + Math.abs(S2.wDelta).toFixed(1) + " kg，" + (S2.wDelta <= 0 ? "吃和练的节奏是对的。" : "这周吃得比消耗多。")
    });
  }
  if (S2.pendingBills > 0) {
    list.push({
      id: "bills",
      from: "time",
      to: "money",
      tone: "info",
      ev: ["todos.amount", "money.perday"],
      text: "待办里还有 " + money(S2.pendingBills) + " 要付，已经从每日可花里预留。"
    });
  }
  if (S2.weekWorkouts < GOALS.workoutsPerWeek && h > 12) {
    list.push({
      id: "move-goal",
      from: "move",
      to: "time",
      tone: "info",
      ev: ["move.count", "week.move"],
      text: "这周练了 " + S2.weekWorkouts + " 次，离 " + GOALS.workoutsPerWeek + " 次还差 " + (GOALS.workoutsPerWeek - S2.weekWorkouts) + " 次。"
    });
  }
  const hm2 = (x) => {
    const m = Math.round((x % 24 + 24) % 24 * 60);
    return pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60);
  };
  if (S2.kcalIn > 0 && S2.allowance > 0) {
    const next = h < 11 ? "lunch" : h < 17.5 ? "dinner" : null;
    if (next && !S2.meals.some((m) => m.meal === next)) {
      const leave = Math.round(S2.allowance * (next === "lunch" ? 0.5 : 0.9) / 10) * 10;
      list.push({
        id: "food-next",
        from: "food",
        to: "time",
        tone: "info",
        ev: ["energy.eaten", "slot." + next],
        text: "已经吃了 " + num(S2.kcalIn) + " 千卡，" + (next === "lunch" ? "午饭吃 " + num(leave) + " 千卡左右，晚饭还能留 " + num(S2.allowance - leave) + "。" : "晚饭还能吃 " + num(leave) + " 千卡左右。")
      });
    }
  }
  if (S2.lastNight && S2.lastNight.hours >= 7 && h < 20 && !S2.workouts.length) {
    const planned = S2.events.find((e) => e.domain === "move" && !e.done && e.t > S2.now && e.t < S2.today + DAYMS);
    list.push({
      id: "sleep-good",
      from: "sleep",
      to: "move",
      tone: "good",
      ev: ["sleep.last", planned ? "next.title" : "move.count"],
      text: "昨晚睡了 " + fmtHM(S2.lastNight.hours) + "，状态不错，" + (planned ? "今天的" + planned.title + "可以按计划练。" : "今天适合练一次，这周" + (S2.weekWorkouts ? "还差 " + Math.max(0, GOALS.workoutsPerWeek - S2.weekWorkouts) + " 次。" : "还没练过。"))
    });
  }
  if (S2.lastNight && h < 22) {
    const wake = hourOf(S2.lastNight.t + S2.lastNight.hours * 36e5);
    list.push({
      id: "sleep-tonight",
      from: "sleep",
      to: "time",
      tone: "info",
      ev: ["sleep.last", "dial"],
      text: "今天 " + hm2(wake) + " 起床，想睡够 " + GOALS.sleep + " 小时，今晚 " + hm2(wake - GOALS.sleep) + " 前睡下。"
    });
  }
  if (S2.wNow != null) {
    const tdee = Math.round(S2.wNow * 30 / 50) * 50, gap = tdee - GOALS.kcal;
    if (gap > 150) list.push({
      id: "body-food",
      from: "body",
      to: "food",
      tone: "info",
      ev: ["body.num", "energy.num"],
      text: "按 " + S2.wNow + " kg 估，你每天大约消耗 " + num(tdee) + " 千卡；每天吃到 " + num(GOALS.kcal) + "，一周约轻 " + (gap * 7 / 7700).toFixed(1) + " kg。"
    });
  }
  const rank = (x) => (x.from !== x.to ? 0 : 2) + (x.tone === "warn" ? 0 : 1);
  return list.sort((a2, b2) => rank(a2) - rank(b2));
}
function adviceFor(S2) {
  const n = S2.next;
  if (!n) return null;
  if (n.domain === "move" && S2.lastNight && S2.lastNight.hours < 6.5) return "没睡够，建议改成 30 分钟轻量";
  if (n.domain === "move" && S2.allowance < 0) return "今天吃多了，正好练掉 " + num(-S2.allowance) + " 千卡";
  if (n.domain === "move") return "练完约消耗 " + num(n.kcal || 300) + " 千卡，自动记入";
  return null;
}
function seed(now = Date.now()) {
  let s = 7;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const R = [];
  const today = startOfDay(now);
  const at = (day, h) => day + h * 36e5;
  const add = (r) => {
    r.id = uid();
    r.sample = true;
    R.push(r);
    return r;
  };
  const lunches = [["牛肉面", 32, 620], ["黄焖鸡米饭", 28, 760], ["轻食沙拉", 36, 380], ["麻辣烫", 31, 650], ["饺子", 26, 540], ["盖饭", 30, 720]];
  const dinners = [["番茄炒蛋 + 米饭", 0, 620], ["外卖烧烤", 88, 900], ["火锅", 126, 1100], ["鸡胸沙拉", 0, 420], ["米线", 29, 560]];
  for (let i = 34; i >= 0; i--) {
    const day = today - i * DAY, dow = new Date(day).getDay(), weekend = dow === 0 || dow === 6;
    const bed = 23 + rnd() * 1.4 + (weekend ? 0.6 : 0), hours = 6.1 + rnd() * 2 + (weekend ? 0.7 : 0);
    if (i > 0 || true) add({ type: "sleep", t: at(day - DAY, bed), hours: +hours.toFixed(2), title: "睡了 " + fmtHM(hours) });
    const short = hours < 7;
    if (i === 0) continue;
    add({ type: "meal", t: at(day, 7.7), meal: "breakfast", kcal: 410, title: "燕麦 · 鸡蛋 · 美式" });
    const L = lunches[Math.floor(rnd() * lunches.length)];
    linkAll([add({ type: "meal", t: at(day, 12.2), meal: "lunch", kcal: L[2], title: L[0] }), add({ type: "expense", t: at(day, 12.2), amount: L[1], cat: "餐饮", title: L[0] })]);
    const D = dinners[Math.floor(rnd() * (short ? 5 : 3)) + (short ? 0 : 0)];
    const dm = add({ type: "meal", t: at(day, 19), meal: "dinner", kcal: D[2], title: D[0] });
    if (D[1]) linkAll([dm, add({ type: "expense", t: at(day, 19), amount: D[1] + (short ? 20 : 0), cat: "餐饮", title: D[0] })]);
    if (short && rnd() > 0.3) linkAll([add({ type: "meal", t: at(day, 15.5), meal: "snack", kcal: 380, title: "奶茶" }), add({ type: "expense", t: at(day, 15.5), amount: 19, cat: "餐饮", title: "奶茶" })]);
    if (!weekend) add({ type: "expense", t: at(day, 8.6), amount: 6, cat: "交通", title: "地铁" });
    if (rnd() > 0.82) add({ type: "expense", t: at(day, 20.5), amount: Math.round(60 + rnd() * 240), cat: "购物", title: ["日用品", "书", "T 恤", "耳机套"][Math.floor(rnd() * 4)] });
    if ([1, 3, 5].includes(dow) || dow === 0 && rnd() > 0.4) {
      const k = dow === 0 ? ["骑行", 90, 8] : dow === 3 ? ["跑步", 35, 10.5] : ["力量训练", 55, 6.5];
      add({ type: "workout", t: at(day, 19.5), minutes: k[1], kcal: Math.round(MET_KCAL_PER_MIN(k[2]) * k[1]), kind: k[0], title: k[0] + " " + k[1] + " 分钟" });
    }
    if (i % 2 === 0) add({ type: "weight", t: at(day, 7.2), kg: +(69.6 - (34 - i) * 0.035 + (rnd() - 0.5) * 0.3).toFixed(1), title: "称体重" });
  }
  const pdom = new Date(today).getDate();
  if (pdom > 1) add({ type: "expense", t: new Date(new Date(today).getFullYear(), new Date(today).getMonth(), 1).getTime() + 10 * 36e5, amount: 2800, cat: "居家", title: "房租" });
  else add({ type: "expense", t: today + 10 * 36e5, amount: 2800, cat: "居家", title: "房租" });
  add({ type: "expense", t: today - 26 * DAY + 20 * 36e5, amount: 680, cat: "运动", title: "跑鞋" });
  add({ type: "meal", t: at(today, 7.7), meal: "breakfast", kcal: 410, title: "燕麦 · 鸡蛋 · 美式" });
  add({ type: "expense", t: at(today, 8.6), amount: 6, cat: "交通", title: "地铁" });
  linkAll([add({ type: "meal", t: at(today, 12.17), meal: "lunch", kcal: 620, title: "牛肉面" }), add({ type: "expense", t: at(today, 12.17), amount: 32, cat: "餐饮", title: "牛肉面" })]);
  add({ type: "weight", t: at(today, 7.2), kg: 68.4, title: "称体重" });
  const ev = (d, h1, h2, title, domain, extra) => add(Object.assign({ type: "event", t: at(today + d * DAY, h1), end: at(today + d * DAY, h2), title, domain }, extra || {}));
  ev(0, 9.5, 10.5, "项目周会", "time");
  ev(0, 14, 15.5, "设计评审", "time");
  ev(0, 19.5, 20.5, "力量训练 · 胸背", "move", { minutes: 60, kcal: 450 });
  ev(0, 22, 22.5, "遛狗", "time");
  ev(1, 14, 15, "季度复盘", "time");
  ev(1, 19.5, 20.2, "跑步 5 公里", "move", { minutes: 35, kcal: 420 });
  ev(2, 15, 16, "供应商会议", "time");
  ev(2, 15, 16.5, "方案评审", "time");
  ev(3, 19.5, 20.5, "力量训练 · 腿", "move", { minutes: 60, kcal: 450 });
  ev(4, 10, 11, "带狗洗澡", "time", {});
  add({ type: "todo", t: at(today, 9), title: "续费视频会员", amount: 25, cat: "订阅", done: false });
  add({ type: "todo", t: at(today, 9.1), title: "买狗粮", amount: 189, cat: "宠物", done: false });
  add({ type: "todo", t: at(today, 9.2), title: "整理季度复盘材料", amount: null, done: false });
  add({ type: "todo", t: at(today, 9.3), title: "交方案初稿", amount: null, done: true });
  return R.filter((r) => r.t <= now || r.type === "event" || r.type === "todo");
}
var MEAL_KEYS = /* @__PURE__ */ new Set(["breakfast", "lunch", "dinner", "snack"]);
var CATS = /* @__PURE__ */ new Set(["餐饮", "交通", "购物", "居家", "订阅", "宠物", "运动", "医疗", "娱乐", "社交", "其他"]);
var nOr = (v, d) => typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : d;
function fromAI(res, input, now = Date.now()) {
  const out = { tokens: [], records: [], effects: /* @__PURE__ */ new Set(), text: input, ai: true, note: res && res.note || "" };
  const day0 = startOfDay(now);
  const hm2 = (s, base) => {
    const m = /^(\d{1,2})[:：](\d{2})/.exec(String(s || ""));
    return m ? base + (+m[1] + +m[2] / 60) * 36e5 : null;
  };
  const dayOf = (d) => {
    if (!d) return day0;
    const t = (/* @__PURE__ */ new Date(String(d) + "T00:00:00")).getTime();
    return isNaN(t) ? day0 : t;
  };
  const past = pastDay(input, now);
  const baseOf = (r) => {
    const d = r.date ? dayOf(r.date) : null;
    return d != null && d < day0 ? d : past ? past.day : day0;
  };
  const at = (r, h) => {
    const b = baseOf(r);
    return b === day0 ? null : hm2(r.time, b) ?? b + h * 36e5;
  };
  if (past) out.tokens.push({ text: past.str, domain: "time" });
  let mealT = null;
  for (const r of res && res.records || []) {
    if (!r || typeof r !== "object") continue;
    if (r.type === "meal") {
      const items = (Array.isArray(r.items) ? r.items : []).filter((i) => i && i.name).map((i) => ({
        name: String(i.name).slice(0, 30),
        qty: nOr(i.qty, 1),
        unit: i.unit || "份",
        kcal: Math.max(0, Math.round(nOr(i.kcal, 0))),
        source: "ai"
      }));
      if (!items.length) continue;
      let t = at(r, { breakfast: 8, lunch: 12.2, dinner: 18.7, snack: 15 }[r.meal] || 12) ?? hm2(r.time, day0);
      if (t == null || t > now + 36e5) t = now;
      mealT = t;
      const meal2 = MEAL_KEYS.has(r.meal) ? r.meal : guessMeal(t);
      out.records.push({ id: uid(), type: "meal", t, meal: meal2, kcal: items.reduce((a, i) => a + i.kcal, 0), title: items.map((i) => i.name + (i.qty !== 1 ? " ×" + i.qty : "")).join(" · "), items, estimated: true, ai: true });
    } else if (r.type === "expense" && nOr(r.amount, 0) > 0) {
      const title = String(r.title || "一笔花销").slice(0, 30);
      out.records.push({ id: uid(), type: "expense", t: at(r, 12) ?? now, amount: nOr(r.amount, 0), cat: CATS.has(r.cat) ? r.cat : catOf(title), title, ai: true });
    } else if (r.type === "income" && nOr(r.amount, 0) > 0) {
      out.records.push({ id: uid(), type: "income", t: at(r, 10) ?? now, amount: nOr(r.amount, 0), title: String(r.title || "收入"), ai: true });
    } else if (r.type === "workout") {
      const steps = nOr(r.steps, null) || stepsIn(input);
      const minutes = Math.max(1, Math.round(nOr(r.minutes, steps ? steps / 110 : 45)));
      const kind = String(r.kind || (steps ? "走路" : "运动"));
      out.records.push({ id: uid(), type: "workout", t: at(r, 18.5) ?? now - minutes * 6e4, minutes, kcal: Math.round(nOr(r.kcal, steps ? steps * 0.04 : MET_KCAL_PER_MIN(6) * minutes)), kind, km: nOr(r.km, null), steps: steps || null, title: kind + " " + (steps ? stepsText(steps) : minutes + " 分钟"), ai: true });
    } else if (r.type === "sleep") {
      const sb = baseOf(r);
      let wake = hm2(r.wake, sb), bed = hm2(r.bed, sb);
      if (bed != null && new Date(bed).getHours() >= 12) bed -= DAY;
      if (wake != null && wake > now) wake -= DAY;
      let hours = nOr(r.hours, null);
      if (bed != null && wake != null) {
        if (wake <= bed) wake += DAY;
        hours = (wake - bed) / 36e5;
      }
      if (!hours || hours <= 0 || hours > 16) continue;
      if (bed == null) bed = (wake != null ? wake : sb + 7 * 36e5) - hours * 36e5;
      out.records.push({ id: uid(), type: "sleep", t: bed, hours: +hours.toFixed(2), title: "睡了 " + fmtHM(hours), ai: true });
    } else if (r.type === "weight" && nOr(r.kg, 0) > 20) {
      out.records.push({ id: uid(), type: "weight", t: at(r, 8) ?? now, kg: nOr(r.kg, 0), title: "体重 " + nOr(r.kg, 0) + " kg", ai: true });
    } else if (r.type === "event" && r.title) {
      const base = dayOf(r.date);
      const t = hm2(r.start, base) ?? base + 9 * 36e5;
      const minutes = nOr(r.minutes, null);
      const end = hm2(r.end, base) ?? t + (minutes || 60) * 6e4;
      const domain = r.domain === "move" ? "move" : "time";
      out.records.push({ id: uid(), type: "event", t, end: end > t ? end : t + 36e5, title: String(r.title).slice(0, 40), domain, ...domain === "move" ? { minutes: minutes || Math.round((end - t) / 6e4), kcal: Math.round(nOr(r.kcal, 400)) } : {}, ai: true });
    } else if (r.type === "todo" && r.title) {
      const amount = nOr(r.amount, null);
      out.records.push({ id: uid(), type: "todo", t: now, title: String(r.title).slice(0, 40), amount: amount && amount > 0 ? amount : null, cat: amount ? catOf(String(r.title)) : null, done: false, ai: true });
    }
  }
  const meal = out.records.find((r) => r.type === "meal"), exp = out.records.filter((r) => r.type === "expense" && r.cat === "餐饮");
  if (meal && exp.length) {
    exp.forEach((e) => {
      e.t = meal.t;
    });
    linkAll([meal, ...exp]);
  }
  ;
  (res && res.tokens || []).forEach((tk) => {
    if (tk && tk.text && input.includes(tk.text) && DOMAIN[tk.domain]) out.tokens.push({ text: tk.text, domain: tk.domain });
  });
  return out;
}
var MEAL_WORD = { breakfast: "早饭", lunch: "午饭", dinner: "晚饭", snack: "加餐" };
function frequent(records, now = Date.now(), n = 6) {
  const since = now - 30 * DAY, groups = /* @__PURE__ */ new Map();
  records.filter((r) => r.t >= since && r.t <= now).forEach((r) => {
    const k = r.link || r.id;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  });
  const count = /* @__PURE__ */ new Map();
  for (const g of groups.values()) {
    const meal = g.find((r) => r.type === "meal"), exp = g.find((r) => r.type === "expense"), w = g.find((r) => r.type === "workout");
    let s = null;
    if (meal) s = MEAL_WORD[meal.meal] + " " + meal.title.replace(/\s*·\s*/g, " ") + (exp ? " " + Math.round(exp.amount) : "");
    else if (exp) s = exp.title + " " + Math.round(exp.amount);
    else if (w) s = w.kind + " " + (w.steps ? Math.round(w.steps) + " 步" : w.minutes + " 分钟");
    if (s && s.length <= 24) count.set(s, (count.get(s) || 0) + 1);
  }
  return [...count.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([s]) => s);
}
function ghostSlots(records, now = Date.now()) {
  const today = startOfDay(now), since = today - 30 * DAY;
  const past = records.filter((r) => r.t >= since && r.t < today);
  const T = records.filter((r) => r.t >= today && r.t < today + DAY);
  const med = (a) => {
    const s = [...a].sort((x, y) => x - y);
    return s[Math.floor(s.length / 2)];
  };
  const top = (arr) => {
    const c = /* @__PURE__ */ new Map();
    arr.forEach((p) => c.set(p, (c.get(p) || 0) + 1));
    const b = [...c].sort((a, b2) => b2[1] - a[1])[0];
    return b && b[1] >= 2 ? b[0] : null;
  };
  const slots = [];
  const sleptToday = records.some((r) => r.type === "sleep" && startOfDay(r.t + r.hours * 36e5) === today);
  if (!sleptToday) {
    const ss = past.filter((r) => r.type === "sleep");
    const bed = ss.length >= 3 ? med(ss.map((r) => hourOf(r.t) < 12 ? hourOf(r.t) + 24 : hourOf(r.t))) : 23.5;
    const wake = ss.length >= 3 ? med(ss.map((r) => hourOf(r.t + r.hours * 36e5))) : 7;
    const hm2 = (h) => Math.floor(h % 24) + ":" + pad(Math.round(h % 1 * 60 / 5) * 5 % 60);
    slots.push({ key: "sleep", h: wake, title: "昨晚睡得怎么样", hint: ss.length >= 3 ? "平时大约 " + hm2(bed) + " 睡、" + hm2(wake) + " 起" : "几点睡、几点起？", phrase: "昨晚 " + hm2(bed) + " 睡 " + hm2(wake) + " 起", domain: "sleep" });
  }
  const ws = past.filter((r) => r.type === "weight");
  if (ws.length >= 4 && !T.some((r) => r.type === "weight")) {
    const last = ws.sort((a, b) => a.t - b.t)[ws.length - 1];
    slots.push({ key: "weight", h: med(ws.map((r) => hourOf(r.t))), title: "称一下体重", hint: "上次 " + last.kg + " kg", phrase: "体重 ", domain: "body" });
  }
  const DEF = { breakfast: 7.75, lunch: 12.25, dinner: 18.75 };
  for (const m of ["breakfast", "lunch", "dinner"]) {
    if (T.some((r) => r.type === "meal" && r.meal === m)) continue;
    const ms = past.filter((r) => r.type === "meal" && r.meal === m);
    const phrase = top(ms.map((r) => {
      const exp = r.link && past.find((e) => e.link === r.link && e.type === "expense");
      return MEAL_WORD[m] + " " + r.title.replace(/\s*·\s*/g, " ") + (exp ? " " + Math.round(exp.amount) : "");
    }));
    slots.push({
      key: m,
      h: ms.length >= 3 ? med(ms.map((r) => hourOf(r.t))) : DEF[m],
      title: MEAL_NAME[m],
      hint: phrase ? "常吃 " + phrase.slice(3) : "吃了什么？",
      phrase: phrase || MEAL_WORD[m] + " ",
      domain: "food"
    });
  }
  const dow = new Date(now).getDay();
  if (dow > 0 && dow < 6) {
    const cm = past.filter((r) => r.type === "expense" && r.cat === "交通" && hourOf(r.t) < 10.5);
    const phrase = top(cm.map((r) => r.title + " " + Math.round(r.amount)));
    if (cm.length >= 5 && phrase && !T.some((r) => r.type === "expense" && r.cat === "交通")) {
      slots.push({ key: "commute", h: med(cm.map((r) => hourOf(r.t))), title: "通勤", hint: "平时 " + phrase, phrase, domain: "money" });
    }
  }
  return slots;
}

// src/styles.js
var FONT_HREF = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap";
var CSS = `
.lf-root{--ink:#1F2328;--ink2:#5E645C;--ink3:#8A8F86;--ground:#E8EAE5;--card:#FFFFFF;--rule:#ECEEE9;--fill:#F1F2EE;--fill2:#E6E8E2;--line:#D5D8D1;--sheet:#F7F8F5;--move-ink:#157A51;--warn-ink:#9B1C20;--money-ink:#4B2FB0;--food-ink:#C26A1E;
  --sleep:#3D4FB8;--move:#1E9E6A;--food:#F2994A;--money:#7C5CE0;--body:#0E8A8A;--alert:#E5484D;
  position:relative;min-height:100%;box-sizing:border-box;background:var(--ground);color:var(--ink);
  font-family:'Bricolage Grotesque','PingFang SC','Noto Sans SC','Microsoft YaHei',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;container-type:inline-size;container-name:lf;overflow:clip}
/* 夜间：跟随 DSH 的深色主题（body[data-ds-dark-theme]） */
body[data-ds-dark-theme] .lf-root{--ink:#E8E9E5;--ink2:#A7ACA4;--ink3:#7D827B;--ground:#111214;--card:#1B1D20;--rule:#2A2D31;--fill:#25282C;--fill2:#2E3136;--line:#3A3E44;--sheet:#16181A;
  --move-ink:#5FD39C;--warn-ink:#FF8A8E;--money-ink:#BBA8F7;--food-ink:#F6B373;color-scheme:dark}
body[data-ds-dark-theme] .lf-root .lf-card{box-shadow:inset 0 0 0 1px rgba(255,255,255,.04),var(--lift,0 0 #0000)}
body[data-ds-dark-theme] .lf-host{background:#111214!important}
.lf-root.lf-scrolling .lf-wrap{pointer-events:none}
.lf-root *,.lf-root *::before,.lf-root *::after{box-sizing:border-box}
.lf-root button{font:inherit;color:inherit;cursor:pointer}
.lf-root :focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.lf-root input:focus,.lf-root textarea:focus,.lf-root input:focus-visible,.lf-root textarea:focus-visible{outline:none}
.lf-num{font-variant-numeric:tabular-nums;letter-spacing:-0.03em}
.lf-wrap{max-width:1400px;margin:0 auto;padding:24px 24px 56px}
.lf-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
.lf-card{position:relative;background:var(--card);border-radius:28px;padding:20px 22px;min-width:0;
  transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s;--c:var(--ink);box-shadow:var(--lift,0 0 #0000)}
.lf-card.lf-hov{transition:opacity .25s;z-index:4;will-change:transform}
.lf-sheen{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;opacity:var(--sheen,0);
  background:radial-gradient(circle 260px at var(--mx,50%) var(--my,0%),var(--sheen-c,color-mix(in srgb,var(--c) 10%,transparent)),transparent 100%)}
[data-card=hero]>.lf-sheen{background:radial-gradient(circle 180px at var(--mx,50%) var(--my,0%),rgba(255,255,255,.09),transparent 100%);mix-blend-mode:soft-light}
.lf-card.dim{opacity:.45;transition:opacity .25s}
.lf-card.armed{box-shadow:0 0 0 2px var(--ground),0 0 0 4px var(--c),var(--lift,0 0 #0000)}
.lf-card.flash{animation:lf-flash 1.4s cubic-bezier(.2,.8,.2,1)}
.lf-card.hl{box-shadow:0 0 0 2px var(--ground),0 0 0 4px var(--c),var(--lift,0 0 #0000);transform:translateY(-2px)}
.lf-h{margin:0;font-size:16px;font-weight:600;letter-spacing:-0.01em}
.lf-sub{font-size:13px;color:var(--ink2)}
.lf-row{display:flex;align-items:center;gap:10px}
.lf-chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:13px;font-size:12.5px;white-space:nowrap}
.lf-dot{width:8px;height:8px;border-radius:4px;flex:none}
.lf-btn{height:36px;padding:0 14px;border-radius:18px;border:0;background:var(--fill);font-size:13px}
.lf-btn:hover{background:var(--fill2)}
.lf-icon{width:32px;height:32px;border-radius:16px;border:0;background:transparent;display:inline-flex;align-items:center;justify-content:center;color:var(--ink3)}
.lf-icon:hover{background:var(--fill);color:var(--ink)}
.s12{grid-column:span 12}.s8{grid-column:span 8}.s7{grid-column:span 7}.s5{grid-column:span 5}.s4{grid-column:span 4}.s3{grid-column:span 3}.r2{grid-row:span 2}
@container lf (max-width:1080px){.s8,.s7,.s5,.s4{grid-column:span 6}.s3{grid-column:span 6}.r2{grid-row:span 1}}
@container lf (max-width:680px){.s12,.s8,.s7,.s5,.s4,.s3{grid-column:1/-1}.lf-hero{grid-template-columns:1fr!important}}
.lf-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:28px;align-items:center}
.lf-input{width:100%;height:60px;border:0;outline:0;border-radius:30px;padding:0 64px 0 24px;font:inherit;font-size:18px;
  background:rgba(255,255,255,.08);color:#F4F5F1;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);transition:box-shadow .2s,background .2s}
.lf-input::placeholder{color:rgba(244,245,241,.45)}
.lf-input:focus{background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5)}
.lf-send{position:absolute;right:8px;top:8px;width:44px;height:44px;border-radius:22px;border:0;background:var(--food);color:var(--ink);
  display:flex;align-items:center;justify-content:center;transition:transform .2s}
.lf-send:disabled{background:rgba(255,255,255,.12);color:rgba(255,255,255,.4);cursor:default}
.lf-send:not(:disabled):hover{transform:scale(1.06)}
.lf-token{border-radius:8px;padding:1px 6px;margin:0 1px;font-weight:600;animation:lf-pop .25s cubic-bezier(.2,.9,.3,1.3)}
.lf-tl-item{animation:lf-in .5s cubic-bezier(.2,.8,.2,1) both}
.lf-check{width:22px;height:22px;border-radius:7px;border:1.5px solid var(--line);background:var(--card);display:inline-flex;align-items:center;justify-content:center;flex:none;transition:all .2s}
.lf-check.on{background:var(--ink);border-color:var(--ink);color:var(--card)}
.lf-arc{transition:opacity .25s,stroke-width .25s}
.lf-arc:hover{stroke-width:24}
.lf-enter{animation:lf-rise .7s cubic-bezier(.2,.8,.2,1) both}
.lf-thread{fill:none;stroke-width:2;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;stroke-width:2.5;animation:lf-draw .6s cubic-bezier(.4,0,.2,1) forwards,lf-fade .45s .85s forwards}
.lf-thread.pre{stroke-dasharray:.012 .012;stroke-dashoffset:0;opacity:.55;animation:lf-march 1.2s linear infinite}
.lf-thread.link{stroke-dashoffset:0;stroke-dasharray:none;animation:lf-draw .45s ease-out both;stroke-width:2.5}
.lf-dialdraw{stroke-dasharray:1;stroke-dashoffset:1;animation:lf-draw 1.1s cubic-bezier(.4,0,.2,1) forwards}

.lf-skel{display:block;height:24px;border-radius:12px;background:linear-gradient(90deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.14) 40%,rgba(255,255,255,.06) 80%);background-size:300% 100%;animation:lf-shine 1.2s linear infinite}
@keyframes lf-shine{from{background-position:100% 0}to{background-position:-200% 0}}
.lf-widget{display:flex;flex-direction:column;overflow:hidden;padding:0}
.lf-widget>.lf-widget-body{padding:20px 22px;flex:auto;min-height:0;display:flex;flex-direction:column}
.lf-widget>.lf-widget-body>*:only-child{flex:auto}
.lf-widget.clip::after{content:'';position:absolute;left:0;right:0;bottom:0;height:44px;background:linear-gradient(to bottom,transparent,var(--bgc));pointer-events:none;border-radius:0 0 28px 28px}
.lf-grip,.lf-resize{position:absolute;z-index:3;border:0;display:flex;align-items:center;justify-content:center;color:currentColor;opacity:0;transition:opacity .2s,background .2s,transform .2s;touch-action:none}
.lf-grip{top:3px;left:50%;margin-left:-32px;width:64px;height:20px;border-radius:10px;background:transparent;cursor:grab}
.lf-grip-bar{width:36px;height:5px;border-radius:3px;background:currentColor}
.lf-resize{right:6px;bottom:6px;width:28px;height:28px;border-radius:10px;background:transparent;cursor:nwse-resize}
.lf-widget:hover .lf-grip,.lf-widget:hover .lf-resize,.lf-grip:focus-visible,.lf-resize:focus-visible,.lf-lifted .lf-grip,.lf-lifted .lf-resize{opacity:.55}
.lf-grip:hover,.lf-resize:hover{opacity:1!important;background:rgba(127,127,127,.2)}
.lf-lifted{z-index:20;box-shadow:0 24px 48px -12px rgba(31,35,40,.35),0 0 0 2px var(--c)!important;cursor:grabbing}
.lf-lifted .lf-grip{cursor:grabbing}
.lf-size-tag{position:absolute;right:40px;bottom:10px;z-index:3;height:24px;padding:0 10px;border-radius:12px;background:#1F2328;color:#fff;font-size:12px;display:flex;align-items:center;font-variant-numeric:tabular-nums}
.lf-root.lf-scrolling .lf-grip,.lf-root.lf-scrolling .lf-resize{opacity:0}
.lf-confirm{animation:lf-pop .2s cubic-bezier(.2,.9,.3,1.3)}
.lf-ghost{display:flex;gap:14px;width:100%;border:0;background:transparent;padding:5px 0;text-align:left;align-items:stretch;color:inherit}
.lf-ghost-time{width:44px;flex:none;font-size:13px;color:var(--ink3);padding-top:13px}
.lf-ghost-box{flex:1;min-width:0;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:10px;row-gap:2px;align-items:center;padding:9px 10px 9px 14px;border-radius:14px;border:1.5px dashed var(--line);transition:transform .25s cubic-bezier(.2,.8,.2,1),background .25s,border-color .25s}
.lf-ghost-title{font-size:15px;font-weight:500;color:var(--ink2)}
.lf-ghost-hint{grid-column:1;font-size:13px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lf-ghost-cta{grid-column:2;grid-row:1/3;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink2)}
.lf-ghost-plus{width:28px;height:28px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--fill);color:var(--ink2);font-size:18px;line-height:1;transition:transform .3s cubic-bezier(.2,.8,.2,1),background .25s,color .25s}
.lf-ghost.due .lf-ghost-box{background:color-mix(in srgb,var(--g) 6%,var(--card));animation:lf-ghost-breathe 2.8s ease-in-out infinite}
.lf-ghost.due .lf-ghost-cta{color:color-mix(in srgb,var(--g) 55%,var(--ink));font-weight:600}
.lf-ghost.future{opacity:.6}
.lf-ghost:hover,.lf-ghost:focus-visible{opacity:1}
.lf-ghost:hover .lf-ghost-box,.lf-ghost:focus-visible .lf-ghost-box{border-style:solid;border-color:var(--g);background:color-mix(in srgb,var(--g) 10%,var(--card));transform:translateX(4px);animation:none}
.lf-ghost:hover .lf-ghost-plus,.lf-ghost:focus-visible .lf-ghost-plus{background:var(--g);color:#fff;transform:rotate(90deg) scale(1.08)}
.lf-ghost:active .lf-ghost-box{transform:translateX(4px) scale(.98)}
@keyframes lf-ghost-breathe{0%,100%{border-color:color-mix(in srgb,var(--g) 22%,transparent)}50%{border-color:color-mix(in srgb,var(--g) 65%,transparent)}}
.lf-now{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:12.5px;color:#B4530F;font-weight:600}
.lf-now-dot{flex:none;width:10px;height:10px;border-radius:5px;background:#F2994A;margin:0 6px 0 17px;animation:lf-ping 2s ease-out infinite}
.lf-now-line{flex:1;height:1.5px;border-radius:1px;background:linear-gradient(90deg,#F2994A,rgba(242,153,74,0))}
@keyframes lf-ping{0%{box-shadow:0 0 0 0 rgba(242,153,74,.55)}70%{box-shadow:0 0 0 10px rgba(242,153,74,0)}100%{box-shadow:0 0 0 0 rgba(242,153,74,0)}}
.lf-float{position:absolute;right:22px;z-index:4;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;pointer-events:none;animation:lf-floatup 1.6s cubic-bezier(.2,.8,.2,1) forwards;text-shadow:0 1px 0 rgba(0,0,0,.04)}
@keyframes lf-floatup{0%{opacity:0;transform:translateY(14px) scale(.8)}18%{opacity:1;transform:translateY(0) scale(1.08)}30%{transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-26px)}}
.lf-pour>span{position:absolute;inset:0;background:linear-gradient(100deg,transparent 0,rgba(255,255,255,.85) 45%,transparent 70%);transform:translateX(-100%);animation:lf-pour 1.1s cubic-bezier(.4,0,.2,1) forwards}
@keyframes lf-pour{to{transform:translateX(120%)}}
.lf-shake{animation:lf-shake .5s cubic-bezier(.36,.07,.19,.97)}
@keyframes lf-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(3px)}30%,50%,70%{transform:translateX(-5px)}40%,60%{transform:translateX(5px)}}
.lf-cell-hit{animation:lf-cellhit .7s cubic-bezier(.2,.8,.2,1)}
@keyframes lf-cellhit{0%{transform:scaleY(1)}30%{transform:scaleY(1.7);box-shadow:0 0 0 3px rgba(255,255,255,.35)}100%{transform:scaleY(1)}}
.lf-growy{transform-origin:bottom;animation:lf-growy .7s cubic-bezier(.2,.9,.3,1.25)}
@keyframes lf-growy{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.lf-growx{transform-origin:left;animation:lf-growx .9s cubic-bezier(.4,0,.2,1)}
@keyframes lf-growx{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.lf-strike{background:linear-gradient(currentColor,currentColor) no-repeat 0 58%/0 1.5px;transition:background-size .35s cubic-bezier(.4,0,.2,1),color .3s}
.lf-todo.done .lf-strike{background-size:100% 1.5px}
.lf-todo .lf-check{transition:transform .15s}
.lf-todo:active .lf-check{transform:scale(.85)}
.lf-todo.done .lf-check{animation:lf-checkpop .45s cubic-bezier(.2,.9,.3,1.5)}
@keyframes lf-checkpop{0%{transform:scale(.6)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
.lf-tick{stroke-dasharray:1;stroke-dashoffset:1;animation:lf-draw .3s .1s ease-out forwards}
.lf-confetti{position:absolute;left:0;top:0;animation-name:lf-confetti;animation-timing-function:cubic-bezier(.15,.7,.3,1);animation-fill-mode:forwards;opacity:0}
@keyframes lf-confetti{0%{opacity:1;transform:translate(-50%,-50%) rotate(0) scale(.4)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy) + 60px)) rotate(var(--r)) scale(1)}}
.lf-ring{position:absolute;left:0;top:0;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid #F2994A;animation:lf-ring .8s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes lf-ring{from{transform:scale(.2);opacity:1}to{transform:scale(9);opacity:0}}
.lf-todo{border-radius:12px}
.lf-cascade{animation:lf-cascade .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes lf-cascade{0%{background:transparent;transform:none}40%{background:color-mix(in srgb,#1E9E6A 14%,var(--card));transform:translateX(6px)}100%{background:transparent;transform:none}}
.lf-alldone{flex:1;min-height:130px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding-top:8px}
.lf-alldone.play .lf-ad-badge{animation:lf-badge .6s var(--delay) cubic-bezier(.2,.9,.3,1.45) both}
.lf-alldone.play .lf-ad-check{stroke-dasharray:1;stroke-dashoffset:1;animation:lf-draw .4s calc(var(--delay) + .35s) ease-out forwards}
.lf-alldone.play .lf-ad-text{animation:lf-rise .5s calc(var(--delay) + .45s) both}
@keyframes lf-badge{from{transform:scale(0) rotate(-30deg);opacity:0}to{transform:none;opacity:1}}
.lf-rain{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit;z-index:2}
.lf-rain i{position:absolute;top:-14px;opacity:0;animation:lf-fall var(--dur) var(--d) cubic-bezier(.35,.4,.6,1) forwards}
@keyframes lf-fall{0%{opacity:1;transform:translate(0,0) rotate(0)}80%{opacity:1}100%{opacity:0;transform:translate(var(--sx),420px) rotate(var(--r))}}
.lf-insight{border-radius:12px;transition:background .2s}
.lf-insight:hover,.lf-insight.on{background:#F6F7F4}
.lf-insight.pinned{background:#F1EEFC;box-shadow:inset 3px 0 0 #7C5CE0}
.lf-cause{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:lf-draw .45s cubic-bezier(.4,0,.2,1) forwards}
.lf-arrive{opacity:0;transform-box:fill-box;transform-origin:center;animation:lf-arrive 1.8s ease-out infinite}
@keyframes lf-arrive{0%{opacity:0;transform:scale(.4)}15%{opacity:.9}100%{opacity:0;transform:scale(2.6)}}
.lf-ev-on{position:relative;z-index:6;border-radius:10px;outline:2px solid var(--ev);outline-offset:4px;box-shadow:0 0 0 8px color-mix(in srgb,var(--ev) 18%,transparent);animation:lf-evpop .45s cubic-bezier(.2,.9,.3,1.4)}
@keyframes lf-evpop{0%{outline-offset:12px;box-shadow:0 0 0 0 transparent}100%{outline-offset:4px}}
.lf-think{display:inline-flex;gap:3px}.lf-think i{width:5px;height:5px;border-radius:3px;background:#F2994A;animation:lf-bounce 1s infinite ease-in-out}
.lf-think i:nth-child(2){animation-delay:.15s;background:#7C5CE0}.lf-think i:nth-child(3){animation-delay:.3s;background:#1E9E6A}
.lf-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(31,35,40,.25);border-top-color:var(--ink);animation:lf-rot .7s linear infinite}
.lf-root input[type=number]::-webkit-inner-spin-button{opacity:.4}
@keyframes lf-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}
@keyframes lf-rot{to{transform:rotate(360deg)}}
@keyframes lf-draw{to{stroke-dashoffset:0}}
@keyframes lf-fade{to{opacity:0}}
@keyframes lf-march{to{stroke-dashoffset:-.024}}
@keyframes lf-flash{0%{box-shadow:0 0 0 0 var(--c)}25%{box-shadow:0 0 0 2px var(--ground),0 0 0 5px var(--c);transform:translateY(-3px)}100%{box-shadow:0 0 0 0 transparent;transform:none}}
@keyframes lf-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes lf-in{from{opacity:0;transform:translateX(-10px);background:color-mix(in srgb,#F2994A 10%,var(--card))}to{opacity:1;transform:none}}
@keyframes lf-pop{from{transform:scale(.7);opacity:0}to{transform:none;opacity:1}}
@keyframes lf-breathe{0%,100%{opacity:1}50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.lf-root *{animation:none!important;transition:none!important}.lf-dialdraw,.lf-thread{stroke-dashoffset:0}}
`;

// src/hover.js
var S = /* @__PURE__ */ new Map();
var raf = 0;
var gx = 0;
var gt = 0;
var gvx = 0;
var reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
var clamp = (v, a) => Math.max(-a, Math.min(a, v));
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    const t = performance.now(), dt = Math.max(8, t - gt);
    gvx = gvx * 0.5 + (e.clientX - gx) / dt * 0.5;
    gx = e.clientX;
    gt = t;
  }, { passive: true });
}
function state(el) {
  let s = S.get(el);
  if (!s) {
    s = { rx: 0, ry: 0, vx: 0, vy: 0, rz: 0, vz: 0, l: 0, vl: 0, trx: 0, tryy: 0, tl: 0, hover: false, k: 1 };
    S.set(el, s);
  }
  return s;
}
function settle(el) {
  el.style.transform = "";
  el.style.transformOrigin = "";
  el.style.removeProperty("--lift");
  el.style.removeProperty("--sheen");
  el.classList.remove("lf-hov");
  S.delete(el);
}
function tick() {
  raf = 0;
  let busy = false;
  S.forEach((s, el) => {
    if (!el.isConnected) {
      S.delete(el);
      return;
    }
    s.vx = (s.vx + (s.trx - s.rx) * 0.11) * 0.76;
    s.rx += s.vx;
    s.vy = (s.vy + (s.tryy - s.ry) * 0.11) * 0.76;
    s.ry += s.vy;
    s.vl = (s.vl + (s.tl - s.l) * 0.13) * 0.72;
    s.l += s.vl;
    s.vz = (s.vz - s.rz * 0.055) * 0.935;
    s.rz += s.vz;
    const still = !s.hover && Math.abs(s.rx) + Math.abs(s.ry) + Math.abs(s.rz) + Math.abs(s.l) < 0.02 && Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vz) + Math.abs(s.vl) < 0.02;
    if (still) {
      settle(el);
      return;
    }
    busy = true;
    const l = Math.max(0, s.l), k = s.k;
    el.style.transform = `perspective(1100px) translateY(${(-5 * l).toFixed(2)}px) rotateX(${(s.rx * k).toFixed(2)}deg) rotateY(${(s.ry * k).toFixed(2)}deg) rotateZ(${(s.rz * k).toFixed(2)}deg) scale(${(1 + 0.01 * l).toFixed(4)})`;
    el.style.setProperty("--lift", `${(-s.ry * 1.6 - s.rz * 2).toFixed(1)}px ${(8 + 16 * l).toFixed(1)}px ${(18 + 30 * l).toFixed(1)}px -12px rgba(31,35,40,${(0.3 * l).toFixed(3)})`);
    el.style.setProperty("--sheen", l.toFixed(3));
  });
  if (busy) raf = requestAnimationFrame(tick);
}
var run = () => {
  if (!raf) raf = requestAnimationFrame(tick);
};
function blocked(el) {
  return !!document.querySelector(".lf-lifted") || (el.closest(".lf-root") || document.body).classList.contains("lf-scrolling") || document.body.classList.contains("lf-dragging");
}
function nudgeNeighbors(el, impulse) {
  const grid = el.parentElement;
  if (!grid) return;
  const r = el.getBoundingClientRect();
  for (const n of grid.children) {
    if (n === el || !n.classList || !n.classList.contains("lf-card")) continue;
    const q = n.getBoundingClientRect();
    if (Math.abs(q.top - r.top) > 24) continue;
    const d = Math.abs(q.left + q.width / 2 - (r.left + r.width / 2));
    const s = state(n);
    s.k = Math.max(0.25, Math.min(1, 420 / Math.max(1, n.offsetWidth)));
    n.style.transformOrigin = "50% -14px";
    n.classList.add("lf-hov");
    s.vz += impulse * 0.32 * Math.exp(-d / 520);
  }
}
function bindHover(el) {
  if (!el || reduced()) return () => {
  };
  const enter = () => {
    if (blocked(el)) return;
    const s = state(el);
    s.k = Math.max(0.25, Math.min(1, 420 / Math.max(1, el.offsetWidth)));
    s.hover = true;
    s.tl = 1;
    el.style.transformOrigin = "50% -14px";
    el.classList.add("lf-hov");
    const imp = clamp(gvx * 0.55, 1.1);
    s.vz += imp;
    if (Math.abs(imp) > 0.25) nudgeNeighbors(el, imp);
    run();
  };
  const move = (e) => {
    if (blocked(el)) {
      const s2 = S.get(el);
      if (s2) {
        s2.hover = false;
        s2.tl = 0;
        s2.trx = s2.tryy = 0;
      }
      return;
    }
    const s = S.get(el);
    if (!s || !s.hover) return enter();
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    s.trx = clamp((0.5 - py) * 4.5, 3);
    s.tryy = clamp((px - 0.5) * 5, 3);
    s.vz += clamp(gvx * 0.02, 0.08);
    el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    run();
  };
  const leave = () => {
    const s = S.get(el);
    if (!s) return;
    s.hover = false;
    s.tl = 0;
    s.trx = 0;
    s.tryy = 0;
    const imp = clamp(gvx * 0.4, 0.9);
    s.vz += imp;
    run();
  };
  const down = (e) => {
    if (e.target.closest && e.target.closest(".lf-grip,.lf-resize")) settle(el);
  };
  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  el.addEventListener("pointerdown", down, true);
  return () => {
    el.removeEventListener("pointerenter", enter);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
    el.removeEventListener("pointerdown", down, true);
    settle(el);
  };
}

// src/liquid.jsx
var import_react2 = __toESM(require("react"));
var TUBE_H = 20;
var PAD_T = 5;
var H = TUBE_H + PAD_T * 2;
function LiquidBar({ eaten, goal, burned, cap, meals, preview, pour }) {
  const cv = (0, import_react2.useRef)(null);
  const live = (0, import_react2.useRef)({});
  live.current = { eaten, goal, burned, cap, meals, preview };
  const sim = (0, import_react2.useRef)({ fe: null, ve: 0, fp: null, vp: 0, bubbles: [], t: 0, w: 0, hot: 0 });
  (0, import_react2.useEffect)(() => {
    if (pour) {
      const s = sim.current;
      s.burst = 16;
      s.hot = 2;
    }
  }, [pour]);
  (0, import_react2.useEffect)(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf2 = 0, visible = true, lastT = performance.now();
    const resize = () => {
      const dpr = window.devicePixelRatio || 1, w = c.parentElement.clientWidth;
      sim.current.w = w;
      c.width = Math.round(w * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = w + "px";
      c.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c.parentElement);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf2) raf2 = requestAnimationFrame(frame);
    });
    io.observe(c);
    const tube = (w) => {
      const r = TUBE_H / 2, y = PAD_T;
      ctx.beginPath();
      ctx.moveTo(r, y);
      ctx.lineTo(w - r, y);
      ctx.arc(w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(r, y + TUBE_H);
      ctx.arc(r, y + r, r, Math.PI / 2, Math.PI * 1.5);
      ctx.closePath();
    };
    const liquid = (x0, x1, amp, phase, lean) => {
      const y0 = PAD_T, y1 = PAD_T + TUBE_H;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const y = y0 + TUBE_H * i / steps, u = (y - y0) / TUBE_H - 0.5;
        ctx.lineTo(x1 + Math.sin(i * 0.9 + phase) * amp - u * lean, y);
      }
      ctx.lineTo(x0, y1);
      ctx.closePath();
    };
    function frame(now) {
      raf2 = 0;
      const dt = Math.min(48, now - lastT) / 16.67;
      lastT = now;
      const L = live.current, s = sim.current, w = s.w;
      if (!w) {
        raf2 = requestAnimationFrame(frame);
        return;
      }
      const X = (v) => Math.max(0, Math.min(w, v / L.cap * w));
      const xe = X(L.eaten), xg = X(L.goal), xb = X(L.goal + L.burned);
      if (s.fe == null) {
        s.fe = reduce ? xe : 0;
        s.fp = xe;
      }
      s.ve = (s.ve + (xe - s.fe) * 0.08 * dt) * Math.pow(0.8, dt);
      s.fe += s.ve * dt;
      const tp = L.preview != null ? Math.max(s.fe, X(L.preview)) : s.fe;
      const prevFp = s.fp;
      s.vp = (s.vp + (tp - s.fp) * 0.16 * dt) * Math.pow(0.74, dt);
      s.fp += s.vp * dt;
      const speed = Math.abs(s.fp - prevFp);
      s.t += 0.06 * dt;
      if (L.preview != null && speed > 0.6) s.hot = Math.min(2, s.hot + speed * 0.02);
      s.hot = Math.max(0, s.hot - 0.012 * dt);
      const B = s.bubbles;
      if (!reduce) {
        if (s.fe > 12 && Math.random() < 0.05 * dt * Math.min(1, s.fe / 120)) B.push({ x: 6 + Math.random() * (s.fe - 10), y: PAD_T + TUBE_H - 2, r: 1 + Math.random() * 1.8, vy: 0.12 + Math.random() * 0.18, ph: Math.random() * 6, kind: 0 });
        if (s.fp - s.fe > 6 && Math.random() < (0.04 + s.hot * 0.25) * dt) B.push({ x: s.fp - 2 - Math.random() * Math.min(40, s.fp - s.fe), y: PAD_T + TUBE_H - 2, r: 0.9 + Math.random() * 2.1, vy: 0.2 + Math.random() * 0.35, ph: Math.random() * 6, kind: 1 });
        if (s.burst) {
          for (let i = 0; i < s.burst; i++) B.push({ x: Math.random() * Math.max(10, s.fe), y: PAD_T + 4 + Math.random() * (TUBE_H - 6), r: 0.8 + Math.random() * 1.8, vy: 0.25 + Math.random() * 0.4, ph: Math.random() * 6, kind: 0 });
          s.burst = 0;
        }
      }
      for (let i = B.length - 1; i >= 0; i--) {
        const b = B[i];
        b.y -= b.vy * dt;
        b.ph += 0.1 * dt;
        b.x += Math.sin(b.ph) * 0.15 * dt;
        const limit = b.kind ? s.fp : s.fe;
        if (b.y < PAD_T + b.r + 0.5 || b.x > limit - 1) {
          if (b.y < PAD_T + b.r + 0.5) b.pop = 1;
          if (!b.pop || b.pop > 6) {
            B.splice(i, 1);
            continue;
          }
        }
        if (b.pop) b.pop += dt;
      }
      if (B.length > 60) B.splice(0, B.length - 60);
      ctx.clearRect(0, 0, w, H);
      ctx.save();
      tube(w);
      ctx.clip();
      const dk = document.body.hasAttribute("data-ds-dark-theme");
      ctx.fillStyle = dk ? "#25282C" : "#F1F2EE";
      ctx.fillRect(0, 0, w, H);
      ctx.fillStyle = dk ? "#2E3136" : "#E6E8E2";
      ctx.fillRect(0, 0, xg, H);
      if (L.burned > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(xg, 0, xb - xg, H);
        ctx.clip();
        ctx.fillStyle = dk ? "#1C3A2E" : "#DDF2E8";
        ctx.fillRect(xg, 0, xb - xg, H);
        ctx.strokeStyle = dk ? "#24503D" : "#BFE6D3";
        ctx.lineWidth = 3;
        for (let x = xg - H; x < xb + H; x += 8) {
          ctx.beginPath();
          ctx.moveTo(x, H);
          ctx.lineTo(x + H, 0);
          ctx.stroke();
        }
        ctx.restore();
      }
      const lean = Math.max(-6, Math.min(6, s.vp * 0.9));
      if (s.fp - s.fe > 0.5) {
        const over = s.fp > xb;
        const g = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + TUBE_H);
        g.addColorStop(0, "rgba(242,153,74,.3)");
        g.addColorStop(1, "rgba(242,153,74,.55)");
        ctx.fillStyle = g;
        liquid(Math.max(0, s.fe - 4), s.fp, 1.2 + Math.min(2.5, speed * 0.25) + s.hot * 0.6, s.t * 2.2, lean);
        ctx.fill();
        if (over) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(xb, 0, w, H);
          ctx.clip();
          ctx.fillStyle = "rgba(229,72,77,.55)";
          liquid(Math.max(0, s.fe - 4), s.fp, 1.2, s.t * 2.2, lean);
          ctx.fill();
          ctx.restore();
        }
      }
      if (s.fe > 0.5) {
        const g = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + TUBE_H);
        g.addColorStop(0, "#F8B26E");
        g.addColorStop(1, "#EE8A35");
        ctx.fillStyle = g;
        liquid(0, s.fe, 1.1 + Math.min(2, Math.abs(s.ve) * 0.3), s.t, Math.max(-4, Math.min(4, s.ve * 0.8)));
        ctx.fill();
        let acc = 0;
        ctx.strokeStyle = "rgba(255,255,255,.45)";
        ctx.lineWidth = 1;
        L.meals.slice(0, -1).forEach((m) => {
          acc += m.kcal;
          const x = X(acc);
          if (x < s.fe - 3) {
            ctx.beginPath();
            ctx.moveTo(x, PAD_T + 3);
            ctx.lineTo(x, PAD_T + TUBE_H - 3);
            ctx.stroke();
          }
        });
      }
      B.forEach((b) => {
        const a = b.pop ? Math.max(0, 1 - b.pop / 6) : 0.85;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * (b.pop ? 1 + b.pop * 0.25 : 1), 0, Math.PI * 2);
        if (b.pop) {
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255,255,255,${b.kind ? 0.75 : 0.55})`;
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.9)";
          ctx.beginPath();
          ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.fillStyle = "rgba(255,255,255,.38)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(6, PAD_T + 2.5, w - 12, 2.5, 1.25) : ctx.rect(6, PAD_T + 2.5, w - 12, 2.5);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = dk ? "#E8E9E5" : "#1F2328";
      ctx.fillRect(Math.round(xb) - 1, 1, 2, H - 2);
      const busy = !reduce && visible && (L.preview != null || B.length > 0 || Math.abs(s.ve) + Math.abs(s.vp) > 0.02 || Math.abs(xe - s.fe) > 0.3 || true);
      if (busy) raf2 = requestAnimationFrame(frame);
    }
    raf2 = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf2);
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  return /* @__PURE__ */ import_react2.default.createElement("canvas", { ref: cv, style: { display: "block", width: "100%", height: H }, "aria-hidden": "true" });
}

// src/fog.jsx
var import_react3 = __toESM(require("react"));
var store = { revealed: false, subs: /* @__PURE__ */ new Set(), timer: 0 };
var setRevealed = (v) => {
  store.revealed = v;
  store.subs.forEach((f) => f(v));
};
var REFOG_MS = 12e3;
function WeightFog({ label = "擦一擦玻璃，看看体重" }) {
  const cv = (0, import_react3.useRef)(null), wrap = (0, import_react3.useRef)(null), anchor = (0, import_react3.useRef)(null);
  const [revealed, setR] = (0, import_react3.useState)(store.revealed);
  const [clearing, setClearing] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
    const f = (v) => {
      setR(v);
      if (!v) setClearing(false);
    };
    store.subs.add(f);
    return () => store.subs.delete(f);
  }, []);
  (0, import_react3.useEffect)(() => {
    const card = anchor.current && anchor.current.closest(".lf-card");
    if (!card) return;
    const leave = () => {
      clearTimeout(store.timer);
      if (store.revealed) store.timer = setTimeout(() => setRevealed(false), REFOG_MS);
    };
    const enter = () => clearTimeout(store.timer);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("pointerenter", enter);
    return () => {
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("pointerenter", enter);
    };
  }, []);
  (0, import_react3.useEffect)(() => {
    if (revealed) return;
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = 0, h = 0, dpr = 1, last = null, strokes = 0;
    const paint = () => {
      dpr = window.devicePixelRatio || 1;
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createLinearGradient(0, 0, w, h);
      const dk = document.body.hasAttribute("data-ds-dark-theme");
      g.addColorStop(0, dk ? "rgb(52,57,60)" : "rgb(234,239,237)");
      g.addColorStop(1, dk ? "rgb(42,46,49)" : "rgb(224,231,229)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      let s = 11;
      const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < w * h / 55; i++) {
        ctx.fillStyle = `rgba(255,255,255,${(dk ? 0.06 : 0.25) + r() * (dk ? 0.12 : 0.5)})`;
        ctx.fillRect(r() * w, r() * h, 1.2, 1.2);
      }
      for (let i = 0; i < 26; i++) {
        const x = r() * w, y = r() * h, rr = 1.5 + r() * 3.5;
        const dg = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.3, 0, x, y, rr);
        dg.addColorStop(0, dk ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.95)");
        dg.addColorStop(0.7, dk ? "rgba(120,130,130,.35)" : "rgba(210,220,218,.6)");
        dg.addColorStop(1, dk ? "rgba(90,100,100,.15)" : "rgba(180,195,192,.25)");
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    paint();
    const ro = new ResizeObserver(() => {
      if (!store.revealed) paint();
    });
    ro.observe(c);
    const brush = (x, y) => {
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(x, y, 0, x, y, 30);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.55, "rgba(0,0,0,.85)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    };
    const cleared = () => {
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0, n = 0;
      const step = Math.max(4, Math.floor(c.width / 40)) * 4;
      for (let i = 3; i < data.length; i += step) {
        n++;
        if (data[i] < 90) clear++;
      }
      return clear / n;
    };
    const move = (e) => {
      const rc = c.getBoundingClientRect(), x = e.clientX - rc.left, y = e.clientY - rc.top;
      if (last) {
        const d = Math.hypot(x - last.x, y - last.y), k = Math.max(1, Math.ceil(d / 8));
        for (let i = 1; i <= k; i++) brush(last.x + (x - last.x) * i / k, last.y + (y - last.y) * i / k);
      } else brush(x, y);
      last = { x, y };
      if (++strokes % 12 === 0 && cleared() > 0.42) {
        setClearing(true);
        setTimeout(() => setRevealed(true), 520);
      }
    };
    const up = () => {
      last = null;
    };
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerleave", up);
    return () => {
      ro.disconnect();
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerleave", up);
    };
  }, [revealed]);
  if (revealed) return /* @__PURE__ */ import_react3.default.createElement("span", { ref: anchor, hidden: true });
  return /* @__PURE__ */ import_react3.default.createElement("div", { ref: (n) => {
    wrap.current = n;
    anchor.current = n;
  }, className: "lf-fog" + (clearing ? " clearing" : ""), onClick: (e) => e.stopPropagation(), "aria-label": "体重已隐藏，用鼠标擦一擦就能看到" }, /* @__PURE__ */ import_react3.default.createElement("canvas", { ref: cv }), /* @__PURE__ */ import_react3.default.createElement("span", { className: "lf-fog-hint" }, /* @__PURE__ */ import_react3.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react3.default.createElement("path", { d: "M8 13V5.5a1.5 1.5 0 0 1 3 0V12" }), /* @__PURE__ */ import_react3.default.createElement("path", { d: "M11 11.5V4a1.5 1.5 0 0 1 3 0v7.5" }), /* @__PURE__ */ import_react3.default.createElement("path", { d: "M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L3 15.2a1.5 1.5 0 0 1 2.2-2l2.8 2.3" })), label));
}
function Private({ children }) {
  return /* @__PURE__ */ import_react3.default.createElement("span", { className: "lf-private" }, children);
}
var FOG_CSS = `
.lf-fog{position:absolute;inset:0;z-index:2;border-radius:inherit;overflow:hidden;cursor:grab;transition:opacity .5s ease;animation:lf-fogin .7s ease both}
.lf-fog canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.lf-fog.clearing{opacity:0}
@keyframes lf-fogin{from{opacity:0}to{opacity:1}}
.lf-fog-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:18px;background:rgba(255,255,255,.7);color:#4B5550;font-size:12.5px;font-weight:600;white-space:nowrap;pointer-events:none;box-shadow:0 4px 14px -6px rgba(31,35,40,.25);transition:opacity .3s}
.lf-fog-hint svg{animation:lf-wipe 1.6s ease-in-out infinite}
@keyframes lf-wipe{0%,100%{transform:translateX(-4px) rotate(-8deg)}50%{transform:translateX(4px) rotate(8deg)}}
.lf-fog:hover .lf-fog-hint{opacity:.35}
.lf-private{filter:blur(4.5px);transition:filter .25s;cursor:default}
.lf-private:hover{filter:none}
@media (prefers-reduced-motion:reduce){.lf-fog-hint svg{animation:none}}
`;

// src/receipt.jsx
var import_react4 = __toESM(require("react"));
var W = 272;
var PAD = 18;
var MONO = '"SF Mono", ui-monospace, Menlo, "PingFang SC", "Microsoft YaHei", monospace';
var SANS = '"Bricolage Grotesque", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';
var DAY2 = 864e5;
var pad2 = (n) => String(n).padStart(2, "0");
var yuan = (n) => "¥" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
var WEEK = "日一二三四五六";
function receiptData(records, S2, period) {
  const today = S2.today, d = new Date(today);
  let from, label, fmt;
  if (period === "week") {
    from = today - (d.getDay() + 6) % 7 * DAY2;
    const a = new Date(from);
    label = a.getMonth() + 1 + "月" + a.getDate() + "日 – " + (d.getMonth() + 1) + "月" + d.getDate() + "日";
    fmt = (t) => "周" + WEEK[new Date(t).getDay()];
  } else if (period === "month") {
    from = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    label = d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月";
    fmt = (t) => {
      const x = new Date(t);
      return pad2(x.getMonth() + 1) + "/" + pad2(x.getDate());
    };
  } else {
    from = today;
    label = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 周" + WEEK[d.getDay()];
    fmt = (t) => {
      const x = new Date(t);
      return pad2(x.getHours()) + ":" + pad2(x.getMinutes());
    };
  }
  const rows = records.filter((r) => r.type === "expense" && r.t >= from && r.t < today + DAY2).sort((a, b) => a.t - b.t).map((r) => ({ when: fmt(r.t), title: r.title || r.cat || "花销", cat: r.cat || "", amount: r.amount }));
  const total = rows.reduce((a, r) => a + r.amount, 0);
  const no = String(Math.abs(Math.round(total * 100) + today / 1e3) % 1e8).padStart(8, "0");
  return { period, label, rows, total, no, printed: Date.now(), budget: S2.spent + S2.remaining, spent: S2.spent, remaining: S2.remaining, perDay: S2.perDay };
}
function layout(data) {
  const shown = data.rows.slice(0, 16);
  const h = 150 + 22 + Math.max(1, shown.length) * 21 + (data.rows.length > shown.length ? 20 : 0) + 64 + 92 + 70 + 40;
  return { shown, h };
}
function drawReceipt(canvas, data, scale = 2) {
  const probe = document.createElement("canvas");
  const end = paintReceipt(probe, data, 1, layout(data).h + 200);
  const h = Math.ceil(end + 26);
  paintReceipt(canvas, data, scale, h);
  return h;
}
function paintReceipt(canvas, data, scale, h) {
  const { shown } = layout(data);
  canvas.width = W * scale;
  canvas.height = h * scale;
  const c = canvas.getContext("2d");
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.fillStyle = "#FCFBF6";
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(W, 0);
  c.lineTo(W, h - 7);
  for (let x = W; x > 0; x -= 8) {
    c.lineTo(x - 4, h);
    c.lineTo(x - 8, h - 7);
  }
  c.closePath();
  c.fill();
  let s = 3;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 260; i++) {
    c.fillStyle = `rgba(120,110,80,${0.03 + r() * 0.04})`;
    c.fillRect(r() * W, r() * h, 1, 1);
  }
  const ink = "#24211C", soft = "#8C877C";
  let y = 30;
  const center = (t, font, color = ink) => {
    c.font = font;
    c.fillStyle = color;
    c.textAlign = "center";
    c.fillText(t, W / 2, y);
  };
  const lr = (l, rgt, font, color = ink) => {
    c.font = font;
    c.fillStyle = color;
    c.textAlign = "left";
    c.fillText(l, PAD, y);
    c.textAlign = "right";
    c.fillText(rgt, W - PAD, y);
  };
  const dash = () => {
    c.strokeStyle = "#C9C4B8";
    c.setLineDash([3, 3]);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(PAD, y);
    c.lineTo(W - PAD, y);
    c.stroke();
    c.setLineDash([]);
  };
  center("· 日 晷 ·", `700 20px ${SANS}`);
  y += 18;
  center("RIGUI  消费小票", `500 10px ${MONO}`, soft);
  y += 22;
  dash();
  y += 20;
  lr("日期", data.label, `12px ${MONO}`);
  y += 18;
  const pt = new Date(data.printed);
  lr("打印", pad2(pt.getHours()) + ":" + pad2(pt.getMinutes()) + "   No." + data.no, `12px ${MONO}`, soft);
  y += 16;
  dash();
  y += 20;
  c.font = `600 11px ${MONO}`;
  c.fillStyle = soft;
  c.textAlign = "left";
  c.fillText(data.period === "day" ? "时间" : "日期", PAD, y);
  c.fillText("项目", PAD + 56, y);
  c.textAlign = "right";
  c.fillText("金额", W - PAD, y);
  y += 22;
  if (!shown.length) {
    center("这段时间一分没花", `12px ${MONO}`, soft);
    y += 21;
  }
  shown.forEach((row) => {
    c.font = `12px ${MONO}`;
    c.fillStyle = soft;
    c.textAlign = "left";
    c.fillText(row.when, PAD, y);
    c.fillStyle = ink;
    let t = row.title;
    const maxW = W - PAD * 2 - 56 - 70;
    c.font = `13px ${SANS}`;
    while (c.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1);
    if (t !== row.title) t = t.slice(0, -1) + "…";
    c.fillText(t, PAD + 56, y);
    c.font = `13px ${MONO}`;
    c.textAlign = "right";
    c.fillText(yuan(row.amount), W - PAD, y);
    y += 21;
  });
  if (data.rows.length > shown.length) {
    center("… 还有 " + (data.rows.length - shown.length) + " 笔", `11px ${MONO}`, soft);
    y += 20;
  }
  y += 2;
  dash();
  y += 30;
  lr("合计 " + data.rows.length + " 笔", "", `600 13px ${MONO}`);
  c.font = `700 24px ${MONO}`;
  c.textAlign = "right";
  c.fillText(yuan(data.total), W - PAD, y + 2);
  y += 26;
  dash();
  y += 22;
  lr("本月预算", yuan(data.budget), `12px ${MONO}`, soft);
  y += 18;
  lr("本月已花", yuan(data.spent), `12px ${MONO}`, soft);
  y += 18;
  lr(data.remaining < 0 ? "已超支" : "还能花", yuan(Math.abs(data.remaining)), `600 12px ${MONO}`);
  y += 18;
  lr("每天可花", yuan(data.perDay), `12px ${MONO}`, soft);
  y += 20;
  let bx = PAD + 14, k = 0;
  const seed2 = data.no + data.label;
  while (bx < W - PAD - 14) {
    const v = seed2.charCodeAt(k++ % seed2.length) + k * 7;
    const bw = 1 + v % 3;
    if (k % 2) {
      c.fillStyle = ink;
      c.fillRect(bx, y, bw, 38);
    }
    bx += bw + v % 2 + 0.6;
  }
  y += 52;
  center("— 谢谢惠顾自己 —", `11px ${MONO}`, soft);
  return y;
}
var PREF_KEY = "dsh-rigui:receipt-save";
var canPickFile = () => typeof window !== "undefined" && !!window.showSaveFilePicker;
var canPickDir = () => typeof window !== "undefined" && !!window.showDirectoryPicker;
var loadPref = () => {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY)) || {};
  } catch (e) {
    return {};
  }
};
var savePref = (p) => {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch (e) {
  }
};
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("dsh-rigui", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("handles");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function getDir() {
  try {
    const db = await idb();
    return await new Promise((res) => {
      const q = db.transaction("handles").objectStore("handles").get("receiptDir");
      q.onsuccess = () => res(q.result || null);
      q.onerror = () => res(null);
    });
  } catch (e) {
    return null;
  }
}
async function putDir(h) {
  try {
    const db = await idb();
    await new Promise((res) => {
      const t = db.transaction("handles", "readwrite");
      t.objectStore("handles").put(h, "receiptDir");
      t.oncomplete = res;
      t.onerror = res;
    });
  } catch (e) {
  }
}
function ReceiptPrinter({ open, onClose, records, S: S2, cardEl, rootEl }) {
  const [period, setPeriod] = (0, import_react4.useState)("day");
  const [shown, setShown] = (0, import_react4.useState)(open);
  const [phase, setPhase] = (0, import_react4.useState)("idle");
  const [box, setBox] = (0, import_react4.useState)(null);
  const [serial, setSerial] = (0, import_react4.useState)(0);
  const host = (0, import_react4.useRef)(null), cv = (0, import_react4.useRef)(null), paper = (0, import_react4.useRef)(null), stub = (0, import_react4.useRef)(null), fibers = (0, import_react4.useRef)(null), printAnim = (0, import_react4.useRef)(null), drag = (0, import_react4.useRef)(null);
  const [pull, setPull] = (0, import_react4.useState)(0);
  const [toast, setToast] = (0, import_react4.useState)("");
  const [hgt, setHgt] = (0, import_react4.useState)(300);
  const [pref, setPrefState] = (0, import_react4.useState)(() => ({ mode: canPickFile() ? "ask" : "downloads", dirName: "", ...loadPref() }));
  const [menu, setMenu] = (0, import_react4.useState)(false);
  const data = receiptData(records, S2, period);
  const setPref = (p) => {
    const n = { ...pref, ...p };
    setPrefState(n);
    savePref(n);
  };
  (0, import_react4.useLayoutEffect)(() => {
    if (!shown || !cardEl || !rootEl) return;
    let raf2 = 0;
    const measure = () => {
      let x = 0, y = 0, n = cardEl;
      while (n && n !== rootEl) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      setBox((b) => b && b.left === x && b.top === y && b.width === cardEl.offsetWidth && b.height === cardEl.offsetHeight ? b : { left: x, top: y, width: cardEl.offsetWidth, height: cardEl.offsetHeight });
    };
    const follow = () => {
      const h = host.current;
      if (h) {
        h.style.transform = cardEl.style.transform || "";
        h.style.transformOrigin = cardEl.style.transformOrigin || "50% 50%";
      }
      raf2 = requestAnimationFrame(follow);
    };
    measure();
    raf2 = requestAnimationFrame(follow);
    const ro = new ResizeObserver(measure);
    ro.observe(cardEl);
    ro.observe(rootEl);
    const iv = setInterval(measure, 500);
    return () => {
      cancelAnimationFrame(raf2);
      ro.disconnect();
      clearInterval(iv);
    };
  }, [shown, cardEl, rootEl]);
  (0, import_react4.useEffect)(() => {
    if (open) {
      setShown(true);
      setPhase("opening");
      const t2 = setTimeout(() => {
        setPhase("printing");
        setSerial((x) => x + 1);
      }, 720);
      return () => clearTimeout(t2);
    }
    if (!shown) return;
    setPhase("closing");
    setMenu(false);
    const p = paper.current;
    if (p && !p.classList.contains("torn")) {
      if (printAnim.current) {
        printAnim.current.cancel();
        printAnim.current = null;
      }
      p.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-hgt - 6}px)` }], { duration: 420, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" });
    }
    const t = setTimeout(() => {
      setShown(false);
      setPhase("idle");
    }, 760);
    return () => clearTimeout(t);
  }, [open]);
  (0, import_react4.useLayoutEffect)(() => {
    if (!open || !serial || !cv.current) return;
    const h = drawReceipt(cv.current, receiptData(records, S2, period), 2);
    cv.current.style.width = W + "px";
    cv.current.style.height = h + "px";
    setHgt(h);
    const p = paper.current;
    if (p) {
      p.classList.remove("torn");
      p.style.transform = "";
      const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const a = p.animate([{ transform: `translateY(${-h - 6}px)` }, { transform: "translateY(0)" }], { duration: reduce ? 1 : Math.min(2800, 800 + h * 3.4), easing: `steps(${Math.round(h / 14)}, end)`, fill: "both" });
      printAnim.current = a;
      a.onfinish = () => setPhase("done");
    }
  }, [serial]);
  const TEAR = 130;
  const ZN = 34;
  const zig = (amp, top) => {
    const pts = [];
    for (let i = 0; i <= ZN; i++) {
      const x = (i * 100 / ZN).toFixed(2) + "%", o = (i % 2 ? amp : 0) + (i % 3 === 1 ? amp * 0.35 : 0);
      pts.push(top ? `${x} ${o.toFixed(1)}px` : `${x} calc(100% - ${o.toFixed(1)}px)`);
    }
    return top ? `polygon(${pts.join(",")}, 100% 100%, 0 100%)` : `polygon(0 0, 100% 0, ${pts.reverse().join(",")})`;
  };
  const crack = (k, eff = 0) => {
    const c = cv.current, st = stub.current, f = fibers.current;
    const amp = Math.min(7, k * 14);
    if (c) c.style.clipPath = k > 0.02 ? zig(amp, true) : "none";
    if (st) {
      st.style.opacity = k > 0.02 ? 1 : 0;
      st.style.clipPath = zig(amp, false);
    }
    if (f) {
      f.style.height = Math.max(0, eff).toFixed(1) + "px";
      f.style.opacity = k > 0.05 ? (1 - Math.pow(k, 3)).toFixed(2) : 0;
      f.style.setProperty("--k", k.toFixed(3));
    }
  };
  const place = (dx, eff, k) => {
    const p = paper.current;
    if (!p) return;
    const shake = k > 0.55 ? Math.sin(performance.now() / 20) * (k - 0.55) * 2.2 : 0;
    p.style.transform = `translate(${(dx * 0.18 + shake).toFixed(1)}px, ${eff.toFixed(1)}px) rotate(${(dx * 0.02).toFixed(2)}deg)`;
    crack(k, eff);
    p.style.setProperty("--pull", k.toFixed(3));
    setPull(k);
  };
  const onDown = (e) => {
    if (phase !== "done" || e.target.closest("button") || e.target.closest(".lf-paper-bar")) return;
    const p = paper.current;
    if (!p) return;
    if (printAnim.current) {
      printAnim.current.cancel();
      printAnim.current = null;
    }
    p.style.transform = "translateY(0)";
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, vy: 0, ly: e.clientY, lt: performance.now(), eff: 0, dx: 0, raw: 0 };
    p.classList.add("pulling");
    setMenu(false);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now(), dy = e.clientY - d.y;
    d.vy = d.vy * 0.6 + (e.clientY - d.ly) / Math.max(8, now - d.lt) * 0.4;
    d.ly = e.clientY;
    d.lt = now;
    d.dx = e.clientX - d.x;
    d.raw = dy;
    d.eff = dy > 0 ? 34 * (1 - Math.exp(-dy / 110)) : dy * 0.08;
    if (dy >= TEAR) {
      rip();
      return;
    }
    place(d.dx, d.eff, Math.max(0, dy) / TEAR);
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    if (d.raw > TEAR * 0.5 && d.vy > 0.8) {
      rip();
      return;
    }
    drag.current = null;
    const p = paper.current;
    if (!p) return;
    p.classList.remove("pulling");
    setPull(0);
    const from = p.style.transform;
    p.style.transform = "translateY(0)";
    p.style.setProperty("--pull", 0);
    p.animate([{ transform: from }, { transform: "translateY(0)" }], { duration: 380, easing: "cubic-bezier(.3,1.4,.5,1)" });
    crack(0);
  };
  const rip = () => {
    const d = drag.current || { dx: 0, eff: 50 };
    drag.current = null;
    const p = paper.current;
    if (!p) return;
    setPhase("torn");
    setPull(1);
    p.classList.remove("pulling");
    p.classList.add("torn");
    const from = `translate(${(d.dx * 0.18).toFixed(1)}px, ${d.eff.toFixed(1)}px) rotate(${(d.dx * 0.02).toFixed(2)}deg)`;
    p.style.transform = from;
    if (cv.current) cv.current.style.clipPath = zig(7, true);
    const f = fibers.current;
    if (f) f.style.opacity = 0;
    const st = stub.current;
    if (st) {
      st.style.clipPath = zig(7, false);
      st.animate([{ transform: "none" }, { transform: "translateY(-3px)" }, { transform: "translateY(-10px)", opacity: 0 }], { duration: 700, delay: 500, easing: "ease-in", fill: "forwards" });
    }
    const a = p.animate([
      { transform: from },
      { transform: `translate(${d.dx * 0.22}px, ${d.eff + 30}px) rotate(${d.dx * 0.025 - 3}deg)`, offset: 0.16 },
      { transform: `translate(${d.dx * 0.6 + 40}px, ${d.eff + 320}px) rotate(${d.dx * 0.05 + 12}deg)`, opacity: 0 }
    ], { duration: 860, easing: "cubic-bezier(.4,.1,.7,.5)", fill: "forwards" });
    setToast("撕下来了，正在保存…");
    save().then((r) => {
      if (r === "cancel" || r === "fail") {
        setToast(r === "cancel" ? "没有保存" : "没存上，换个位置试试");
        setTimeout(() => {
          setToast("");
          a.cancel();
          if (st) st.getAnimations().forEach((x) => x.cancel());
          crack(0);
          setPull(0);
          setPhase("printing");
          setSerial((x) => x + 1);
        }, 1300);
        return;
      }
      setToast(r);
      setTimeout(() => {
        setToast("");
        onClose();
      }, 1500);
    });
  };
  const dropOld = (then) => {
    const p = paper.current;
    if (!p) {
      then();
      return;
    }
    const a = p.animate([{ transform: getComputedStyle(p).transform === "none" ? "none" : getComputedStyle(p).transform, opacity: 1 }, { transform: "translate(10px, 8px) rotate(2deg)", offset: 0.25 }, { transform: "translate(70px, 200px) rotate(14deg)", opacity: 0 }], { duration: 620, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" });
    a.onfinish = () => {
      a.cancel();
      then();
    };
  };
  const switchTo = (pd) => {
    if (pd === period || phase !== "done") return;
    setPhase("printing");
    dropOld(() => {
      setPeriod(pd);
      setSerial((x) => x + 1);
    });
  };
  const fileName = () => {
    const d = new Date(S2.today);
    return "日晷小票-" + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + { day: "今天", week: "本周", month: "本月" }[period] + "-" + pad2((/* @__PURE__ */ new Date()).getHours()) + pad2((/* @__PURE__ */ new Date()).getMinutes()) + ".png";
  };
  const save = async () => {
    const c = document.createElement("canvas");
    drawReceipt(c, data, 3);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const name = fileName();
    try {
      if (pref.mode === "folder" && canPickDir()) {
        let dir = await getDir();
        if (dir && await dir.queryPermission({ mode: "readwrite" }) !== "granted") {
          if (await dir.requestPermission({ mode: "readwrite" }) !== "granted") dir = null;
        }
        if (!dir) {
          dir = await window.showDirectoryPicker({ mode: "readwrite", id: "rigui-receipts" });
          await putDir(dir);
          setPref({ dirName: dir.name });
        }
        const fh = await dir.getFileHandle(name, { create: true }), w = await fh.createWritable();
        await w.write(blob);
        await w.close();
        return "已存进「" + dir.name + "」";
      }
      if (pref.mode === "ask" && canPickFile()) {
        const h = await window.showSaveFilePicker({ suggestedName: name, id: "rigui-receipts", types: [{ description: "PNG 图片", accept: { "image/png": [".png"] } }] });
        const w = await h.createWritable();
        await w.write(blob);
        await w.close();
        return "已保存：" + h.name;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return "cancel";
      if (pref.mode !== "downloads") return "fail";
    }
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2e3);
    return "已存到「下载」";
  };
  const pickFolder = async () => {
    try {
      const dir = await window.showDirectoryPicker({ mode: "readwrite", id: "rigui-receipts" });
      await putDir(dir);
      setPref({ mode: "folder", dirName: dir.name });
      setMenu(false);
    } catch (e) {
    }
  };
  const where = pref.mode === "folder" ? pref.dirName ? "存进「" + pref.dirName + "」" : "存进固定文件夹" : pref.mode === "ask" ? "每次问存哪" : "存到「下载」";
  if (!shown || !box) return null;
  const slotW = Math.min(box.width - 44, W + 40);
  const slotY = box.height - 15;
  return /* @__PURE__ */ import_react4.default.createElement("div", { ref: host, className: "lf-printer ph-" + phase, style: { left: box.left, top: box.top, width: box.width, height: box.height } }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "lf-slot", style: { width: slotW, top: slotY } }, /* @__PURE__ */ import_react4.default.createElement("i", { className: "lf-slot-seam" }), /* @__PURE__ */ import_react4.default.createElement("i", { className: "lf-slot-mouth" }), /* @__PURE__ */ import_react4.default.createElement("i", { className: "lf-slot-lip" }), /* @__PURE__ */ import_react4.default.createElement("i", { className: "lf-slot-led" })), toast && /* @__PURE__ */ import_react4.default.createElement("div", { className: "lf-print-toast", key: toast, style: { top: slotY + 20 } }, toast), /* @__PURE__ */ import_react4.default.createElement("div", { className: "lf-paper-win", style: { top: slotY + 2, width: W + 120, height: hgt + 90 } }, /* @__PURE__ */ import_react4.default.createElement("div", { ref: stub, className: "lf-stub", "aria-hidden": "true" }), /* @__PURE__ */ import_react4.default.createElement("div", { ref: fibers, className: "lf-fibers", "aria-hidden": "true" }, [8, 21, 37, 52, 66, 79, 91].map((x, i) => /* @__PURE__ */ import_react4.default.createElement("i", { key: i, style: { left: x + "%", "--d": i * 0.13 } }))), /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      ref: paper,
      className: "lf-paper",
      style: { transform: `translateY(${-hgt - 6}px)` },
      onPointerDown: onDown,
      onPointerMove: onMove,
      onPointerUp: onUp,
      onPointerCancel: onUp
    },
    /* @__PURE__ */ import_react4.default.createElement("div", { className: "lf-tear", "aria-hidden": "true" }),
    /* @__PURE__ */ import_react4.default.createElement("canvas", { ref: cv, "aria-label": "小票：" + data.label + "，" + data.rows.length + " 笔，合计 " + yuan(data.total) + "。往下扯，撕下来就会保存成图片", role: "img" }),
    /* @__PURE__ */ import_react4.default.createElement("div", { className: "lf-paper-bar" + (phase === "done" && pull === 0 ? " on" : "") }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "lf-seg" }, [["day", "今天"], ["week", "本周"], ["month", "本月"]].map(([k, t]) => /* @__PURE__ */ import_react4.default.createElement("button", { key: k, type: "button", className: period === k ? "on" : "", onClick: () => switchTo(k) }, t))), /* @__PURE__ */ import_react4.default.createElement("span", { className: "lf-where" }, /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "lf-where-btn", onClick: () => setMenu((m) => !m), "aria-expanded": menu, title: "撕下来以后存到哪里" }, /* @__PURE__ */ import_react4.default.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react4.default.createElement("path", { d: "M12 4v11" }), /* @__PURE__ */ import_react4.default.createElement("path", { d: "M7 10l5 5 5-5" }), /* @__PURE__ */ import_react4.default.createElement("path", { d: "M5 20h14" })), where), menu && /* @__PURE__ */ import_react4.default.createElement("span", { className: "lf-where-menu", role: "menu" }, canPickFile() && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", role: "menuitemradio", "aria-checked": pref.mode === "ask", className: pref.mode === "ask" ? "on" : "", onClick: () => {
      setPref({ mode: "ask" });
      setMenu(false);
    } }, "每次问我存到哪里"), canPickDir() && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", role: "menuitemradio", "aria-checked": pref.mode === "folder", className: pref.mode === "folder" ? "on" : "", onClick: () => pref.dirName ? (setPref({ mode: "folder" }), setMenu(false)) : pickFolder() }, pref.dirName ? "固定存进「" + pref.dirName + "」" : "固定存进一个文件夹…"), canPickDir() && pref.dirName && /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "sub", onClick: pickFolder }, "换个文件夹…"), /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", role: "menuitemradio", "aria-checked": pref.mode === "downloads", className: pref.mode === "downloads" ? "on" : "", onClick: () => {
      setPref({ mode: "downloads" });
      setMenu(false);
    } }, "直接存到「下载」")))),
    phase === "done" && pull === 0 && /* @__PURE__ */ import_react4.default.createElement("span", { className: "lf-pull-hint", "aria-hidden": "true" }, /* @__PURE__ */ import_react4.default.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ import_react4.default.createElement("path", { d: "M12 4v15" }), /* @__PURE__ */ import_react4.default.createElement("path", { d: "M6 13l6 6 6-6" })), "往下扯，撕下来就存好")
  )));
}
var RECEIPT_CSS = `
.lf-printer{position:absolute;z-index:40;pointer-events:none}
/* 出纸口：缝 → 张开的嘴 → 上唇的阴影 → 指示灯 */
.lf-slot{position:absolute;left:50%;height:14px;margin:-7px 0 0;translate:-50% 0}
.lf-slot i{position:absolute;display:block}
.lf-slot-seam{left:0;right:0;top:6px;height:2px;border-radius:1px;background:linear-gradient(rgba(20,12,40,.55),rgba(255,255,255,.35));transform:scaleX(0);animation:lf-seam .32s cubic-bezier(.3,.8,.3,1) forwards}
.lf-slot-mouth{left:0;right:0;top:7px;height:0;border-radius:7px;background:linear-gradient(#0B0816,#1E1830 70%,#2A2242);box-shadow:inset 0 3px 5px rgba(0,0,0,.75),inset 0 -1px 0 rgba(255,255,255,.12),0 1px 0 rgba(255,255,255,.3);animation:lf-mouth .36s .3s cubic-bezier(.2,.9,.3,1.25) forwards}
.lf-slot-lip{left:4px;right:4px;top:0;height:7px;border-radius:6px 6px 0 0;background:linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.18));opacity:0;animation:lf-fade .3s .45s forwards}
.lf-slot-led{right:-14px;top:4px;width:6px;height:6px;border-radius:3px;background:#7CF0B4;box-shadow:0 0 6px #7CF0B4;opacity:0;animation:lf-fade .2s .6s forwards}
.lf-printer.ph-printing .lf-slot-led{animation:lf-fade .2s .6s forwards,lf-blink .5s steps(2) infinite}
.lf-printer.ph-printing .lf-slot-mouth{animation:lf-mouth .36s .3s cubic-bezier(.2,.9,.3,1.25) forwards,lf-hum .09s linear infinite}
.lf-printer.ph-closing .lf-slot-mouth{animation:lf-mouthclose .3s ease-in forwards}
.lf-printer.ph-closing .lf-slot-seam{animation:lf-seamclose .3s .28s ease-in forwards;transform:scaleX(1)}
.lf-printer.ph-closing .lf-slot-led,.lf-printer.ph-closing .lf-slot-lip{animation:lf-fadeout .2s forwards}
@keyframes lf-seam{to{transform:scaleX(1)}}
@keyframes lf-seamclose{to{transform:scaleX(0)}}
@keyframes lf-mouth{from{height:0;top:7px}to{height:14px;top:0}}
@keyframes lf-mouthclose{from{height:14px;top:0}to{height:0;top:7px}}
@keyframes lf-hum{50%{translate:0 .5px}}
@keyframes lf-blink{50%{opacity:.25}}
@keyframes lf-fade{to{opacity:1}}
@keyframes lf-fadeout{to{opacity:0}}
.lf-paper-win{position:absolute;left:50%;translate:-50% 0;clip-path:inset(0 -400px -4000px -400px);display:flex;flex-direction:column;align-items:center;pointer-events:none}
.lf-stub{position:absolute;top:0;left:50%;width:272px;margin-left:-136px;height:9px;background:#FCFBF6;opacity:0;z-index:1;box-shadow:inset 0 3px 3px -2px rgba(0,0,0,.18)}
.lf-fibers{position:absolute;top:4px;left:50%;width:272px;margin-left:-136px;height:0;opacity:0;pointer-events:none}
.lf-fibers i{position:absolute;top:0;bottom:0;width:1px;background:linear-gradient(rgba(252,251,246,.95),rgba(220,214,200,.8) 50%,rgba(252,251,246,.95));transform:scaleX(calc(1.6 - var(--k,0)));opacity:calc(1 - var(--k,0) * (1 + var(--d,0)) * 1.2)}
.lf-paper{position:relative;width:272px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;pointer-events:auto;filter:drop-shadow(0 10px 18px rgba(31,35,40,.22)) drop-shadow(0 2px 3px rgba(31,35,40,.12));will-change:transform}
.lf-paper canvas{display:block}
.lf-paper.pulling{cursor:grabbing}
.lf-paper.torn canvas{clip-path:polygon(0.00% 0, 2.94% 7px, 5.88% 0, 8.82% 7px, 11.76% 0, 14.71% 7px, 17.65% 0, 20.59% 7px, 23.53% 0, 26.47% 7px, 29.41% 0, 32.35% 7px, 35.29% 0, 38.24% 7px, 41.18% 0, 44.12% 7px, 47.06% 0, 50.00% 7px, 52.94% 0, 55.88% 7px, 58.82% 0, 61.76% 7px, 64.71% 0, 67.65% 7px, 70.59% 0, 73.53% 7px, 76.47% 0, 79.41% 7px, 82.35% 0, 85.29% 7px, 88.24% 0, 91.18% 7px, 94.12% 0, 97.06% 7px, 100.00% 0, 100% 100%, 0 100%)}
.lf-tear{position:absolute;left:0;right:0;top:0;height:2px;background:repeating-linear-gradient(90deg,rgba(36,33,28,.5) 0 3px,transparent 3px 6px);opacity:calc(var(--pull,0) * 1.6 - .1);pointer-events:none;z-index:1}
.lf-paper.torn .lf-tear{opacity:0}
.lf-print-toast{position:absolute;left:50%;translate:-50% 0;z-index:3;padding:7px 14px;border-radius:16px;background:#1F2328;color:#fff;font-size:12.5px;font-weight:600;white-space:nowrap;box-shadow:0 10px 24px -10px rgba(0,0,0,.5);animation:lf-swap .3s cubic-bezier(.2,.9,.3,1.3) both}
.lf-paper-bar{display:flex;align-items:center;gap:6px;width:max-content;position:relative;left:50%;translate:-50% 0;margin:12px 0 0;padding:5px;border-radius:20px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);box-shadow:0 8px 22px -10px rgba(31,35,40,.35),0 0 0 1px rgba(31,35,40,.05);opacity:0;transform:translateY(-6px);transition:opacity .3s,transform .3s;pointer-events:none}
.lf-paper-bar.on{opacity:1;transform:none;pointer-events:auto}
.lf-seg{display:inline-flex;padding:3px;border-radius:15px;background:var(--fill)}
.lf-root .lf-seg button{height:24px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--ink2);font:inherit;font-size:12px;cursor:pointer;transition:background .2s,color .2s}
.lf-root .lf-seg button.on{background:var(--card);color:var(--ink);font-weight:600;box-shadow:0 1px 3px rgba(31,35,40,.15)}
.lf-where{position:relative}
.lf-root .lf-where-btn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 11px;border:0;border-radius:15px;background:transparent;color:var(--ink);font:inherit;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .2s}
.lf-root .lf-where-btn:hover{background:var(--fill)}
.lf-where-menu{position:absolute;right:0;bottom:calc(100% + 8px);display:flex;flex-direction:column;min-width:200px;padding:6px;border-radius:14px;background:var(--card);box-shadow:0 14px 34px -12px rgba(31,35,40,.4),0 0 0 1px rgba(31,35,40,.06);animation:lf-swap .2s cubic-bezier(.2,.9,.3,1.2) both;z-index:5}
.lf-root .lf-where-menu button{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;border:0;border-radius:9px;background:transparent;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;white-space:nowrap}
.lf-root .lf-where-menu button:hover{background:#F4F5F1}
.lf-root .lf-where-menu button::before{content:'';width:14px;height:14px;flex:none;border-radius:7px;box-shadow:inset 0 0 0 1.5px var(--line)}
.lf-root .lf-where-menu button.on::before{box-shadow:inset 0 0 0 4.5px #1E9E6A}
.lf-root .lf-where-menu button.sub{height:28px;font-size:12px;color:var(--ink2);padding-left:32px}
.lf-root .lf-where-menu button.sub::before{display:none}
.lf-pull-hint{position:absolute;left:50%;translate:-50% 0;top:calc(100% - 4px);display:inline-flex;align-items:center;gap:5px;margin-top:62px;font-size:12px;font-weight:600;color:var(--ink2);white-space:nowrap;pointer-events:none;opacity:0;animation:lf-fade .4s .3s forwards}
.lf-pull-hint svg{animation:lf-tug 1.4s ease-in-out infinite}
@keyframes lf-tug{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}
.lf-root .lf-printbtn{width:28px;height:28px;margin:-4px -4px -4px 4px;border:0;border-radius:9px;background:rgba(255,255,255,.12);color:#fff;display:inline-grid;place-items:center;cursor:pointer;transition:background .2s,transform .2s}
.lf-root .lf-printbtn:hover{background:rgba(255,255,255,.22)}
.lf-root .lf-printbtn:hover svg{animation:lf-printwig .5s ease-in-out}
.lf-root .lf-printbtn.on{background:#fff;color:#7C5CE0}
@keyframes lf-printwig{30%{transform:translateY(1.5px)}60%{transform:translateY(-1px)}}
`;

// src/cards.jsx
var import_react5 = __toESM(require("react"));
var C = { sleep: "#3D4FB8", move: "#1E9E6A", food: "#F2994A", money: "#7C5CE0", body: "#0E8A8A", ink: "var(--ink)" };
var WEEK2 = "日一二三四五六";
var md = (t) => {
  const d = new Date(t);
  return d.getMonth() + 1 + "月" + d.getDate() + "日";
};
var reduced2 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
var inside = (p, pad4 = 10) => !!p && p.x >= -2 && p.x <= p.w + 2 && p.y >= -pad4 && p.y <= p.h + pad4;
function useCardPointer(ref) {
  const [p, setP] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    const n = ref.current;
    if (!n) return;
    const card = n.closest(".lf-card");
    if (!card) return;
    let raf2 = 0, last = null;
    const move = (e) => {
      if (card.classList.contains("lf-flipping") || card.dataset.face === "1") {
        if (last) {
          last = null;
          setP(null);
        }
        return;
      }
      last = e;
      if (!raf2) raf2 = requestAnimationFrame(() => {
        raf2 = 0;
        if (!last) return;
        const r = n.getBoundingClientRect(), c = card.getBoundingClientRect();
        setP({ x: last.clientX - r.left, y: last.clientY - r.top, w: r.width, h: r.height, cy: (last.clientY - c.top) / c.height });
      });
    };
    const leave = () => {
      last = null;
      setP(null);
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf2);
    };
  }, []);
  return p;
}
function MoneyStrip({ S: S2, coin }) {
  const ref = (0, import_react5.useRef)(null);
  const p = useCardPointer(ref);
  const n = S2.daysInMonth;
  const monthStart = S2.today - (S2.dayOfMonth - 1) * 864e5;
  const spendOf = (i) => {
    const day2 = monthStart + i * 864e5, h = S2.heat.find((x) => x.day === day2);
    return h ? h.v : 0;
  };
  const fi = inside(p, 14) ? Math.max(0, Math.min(n - 1, p.x / p.w * n - 0.5)) : null;
  const hi = fi == null ? null : Math.round(fi);
  const day = hi == null ? null : monthStart + hi * 864e5;
  const past = hi != null && hi < S2.dayOfMonth - 1, isToday = hi === S2.dayOfMonth - 1;
  const v = hi != null && hi <= S2.dayOfMonth - 1 ? spendOf(hi) : null;
  const planDay = Math.max(1, GOALS.budget / n);
  const allowHi = hi == null ? 0 : past ? planDay : S2.perDay + (isToday ? S2.todaySpent : 0);
  return /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { ref, style: { display: "grid", gridTemplateColumns: `repeat(${n}, minmax(0,1fr))`, gap: 2, height: 18, alignItems: "end" } }, Array.from({ length: n }, (_, i) => {
    const g = fi == null ? 0 : Math.exp(-((i - fi) ** 2) / (2 * 1.5 ** 2));
    const ti = S2.dayOfMonth - 1;
    const allow = i < ti ? planDay : Math.max(1, S2.perDay + (i === ti ? S2.todaySpent : 0));
    const spent = i <= ti ? spendOf(i) : 0;
    const r = spent / allow, over = r > 1;
    return /* @__PURE__ */ import_react5.default.createElement(
      "span",
      {
        key: i,
        className: "lf-jar" + (i === ti ? " today" : "") + (i > ti ? " future" : "") + (i === hi ? " on" : ""),
        style: { transform: `scaleY(${(1 + 0.95 * g).toFixed(3)}) scaleX(${(1 + 0.25 * g).toFixed(3)})` }
      },
      /* @__PURE__ */ import_react5.default.createElement("i", { key: i === ti ? "f" + coin : "f", className: "lf-jar-fill" + (i === ti && coin ? " pour" : ""), style: { height: Math.min(1, r) * 100 + "%", background: over ? "#FFB8AE" : void 0 } }),
      over && /* @__PURE__ */ import_react5.default.createElement("b", { className: "lf-jar-over", style: { height: Math.min(7, 2 + (r - 1) * 4) } })
    );
  })), /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginTop: 12, fontSize: 13, opacity: 0.88, minHeight: 18 } }, hi == null ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("span", { "data-ev": "money.today" }, "今天花了 ", money(S2.todaySpent)), /* @__PURE__ */ import_react5.default.createElement("span", { "data-ev": "money.perday" }, "每天可花 ", money(S2.perDay))) : /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("span", { key: "scan-l", className: "lf-swap lf-tab" }, isToday ? "今天" : md(day) + " 周" + WEEK2[new Date(day).getDay()], v != null ? " 花了 " + money(v) : ""), /* @__PURE__ */ import_react5.default.createElement("span", { key: "scan-r", className: "lf-swap lf-tab" }, v == null ? "这天可花 " + money(S2.perDay) : isToday ? v > allowHi ? "超了 " + money(v - allowHi) : "还能花 " + money(allowHi - v) : v > allowHi ? "超出计划 " + money(v - allowHi) : v === 0 ? "一分没花" : "计划内，省下 " + money(allowHi - v)))));
}
var STARS = (() => {
  let s = 7;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 38 }, () => ({ x: r() * 100, y: r() * 100, z: 0.5 + r() * 1.1, tw: r() * 4 }));
})();
function SleepSky() {
  const ref = (0, import_react5.useRef)(null), dots = (0, import_react5.useRef)([]);
  (0, import_react5.useEffect)(() => {
    const n = ref.current;
    if (!n || reduced2()) return;
    const card = n.closest(".lf-card");
    if (!card) return;
    let raf2 = 0, pt = null;
    const paint = () => {
      raf2 = 0;
      const r = n.getBoundingClientRect();
      dots.current.forEach((d, i) => {
        if (!d) return;
        const st = STARS[i], sx = st.x / 100 * r.width, sy = st.y / 100 * r.height;
        let b = 0, dx = 0, dy = 0;
        if (pt) {
          dx = sx - (pt.x - r.left);
          dy = sy - (pt.y - r.top);
          b = Math.exp(-(dx * dx + dy * dy) / (2 * 75 * 75));
        }
        const dist = Math.hypot(dx, dy) || 1;
        d.style.opacity = (0.1 + 0.9 * b).toFixed(3);
        d.style.transform = `translate(${(dx / dist * b * 7 * st.z).toFixed(1)}px,${(dy / dist * b * 7 * st.z).toFixed(1)}px) scale(${(0.7 + 1.5 * b * st.z).toFixed(2)})`;
      });
    };
    const move = (e) => {
      pt = { x: e.clientX, y: e.clientY };
      if (!raf2) raf2 = requestAnimationFrame(paint);
    };
    const leave = () => {
      pt = null;
      if (!raf2) raf2 = requestAnimationFrame(paint);
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf2);
    };
  }, []);
  return /* @__PURE__ */ import_react5.default.createElement("div", { ref, className: "lf-sky", "aria-hidden": "true" }, STARS.map((s, i) => /* @__PURE__ */ import_react5.default.createElement("i", { key: i, ref: (el) => {
    dots.current[i] = el;
  }, style: { left: s.x + "%", top: s.y + "%", width: 2.4 * s.z, height: 2.4 * s.z, animationDelay: s.tw + "s" } })));
}
function useSleepRow(ref, n) {
  const p = useCardPointer(ref);
  if (!inside(p, 0)) return null;
  return Math.max(0, Math.min(n - 1, Math.floor(p.y / p.h * n)));
}
var kcalFood = (k) => k >= 500 ? (k / 250).toFixed(1).replace(/\.0$/, "") + " 碗饭" : k >= 150 ? Math.round(k / 110) + " 个鸡蛋" : "一根香蕉";
function MoveBars({ S: S2 }) {
  const ref = (0, import_react5.useRef)(null);
  const p = useCardPointer(ref);
  const hi = inside(p, 8) ? Math.max(0, Math.min(6, Math.floor(p.x / p.w * 7))) : null;
  const [hops, setHops] = (0, import_react5.useState)({});
  const last = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    if (hi != null && hi !== last.current) setHops((h) => ({ ...h, [hi]: (h[hi] || 0) + 1 }));
    last.current = hi;
  }, [hi]);
  const d = hi != null ? S2.week[hi] : null;
  return /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-sub lf-move-cap", style: { minHeight: 18, marginTop: -6, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, d ? /* @__PURE__ */ import_react5.default.createElement("span", { key: "scan", className: "lf-swap lf-tab" }, "周", d.label, d.today ? "（今天）" : "", " · ", d.workoutMin ? (d.steps ? num(d.steps) + " 步 · " : d.workoutMin + " 分钟 · ") + "消耗 " + num(d.workoutKcal) + " 千卡" : "没练") : /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-tab" }, "这周消耗 ", /* @__PURE__ */ import_react5.default.createElement("b", { style: { color: C.move } }, num(S2.weekKcal || 0)), " 千卡", S2.weekKcal ? " ≈ " + kcalFood(S2.weekKcal) : "")), /* @__PURE__ */ import_react5.default.createElement("div", { ref, style: { flex: 1, minHeight: 64, display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 6, alignItems: "stretch" } }, S2.week.map((x, i) => /* @__PURE__ */ import_react5.default.createElement("div", { key: x.day, style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6 } }, /* @__PURE__ */ import_react5.default.createElement(
    "span",
    {
      key: x.day + "-" + x.workoutMin + "-" + (hops[i] || 0),
      "data-ev": x.today ? "move.today" : void 0,
      className: hops[i] ? "lf-hop" : x.workoutMin ? "lf-growy" : "",
      style: { width: "100%", maxWidth: 22, height: x.workoutMin ? Math.max(10, Math.min(100, x.workoutMin / 0.9)) + "%" : 6, maxHeight: "calc(100% - 22px)", borderRadius: 6, background: x.workoutMin ? C.move : i === hi ? "#C9CEC6" : "#E2E5DF", transformOrigin: "50% 100%", transition: "height .6s cubic-bezier(.2,.8,.2,1), background .2s" }
    }
  ), /* @__PURE__ */ import_react5.default.createElement("span", { style: { fontSize: 11.5, color: i === hi ? C.move : x.today ? C.ink : "var(--ink2)", fontWeight: x.today || i === hi ? 700 : 400, transition: "color .2s" } }, x.label)))));
}
function useTaste(ref, S2) {
  const p = useCardPointer(ref);
  if (!inside(p, 12)) return null;
  const cap = Math.max(GOALS.kcal + S2.burned, S2.kcalIn) * 1.05;
  const k = Math.max(0, Math.min(cap, p.x / p.w * cap));
  if (k <= S2.kcalIn) {
    let acc = 0;
    const m = S2.meals.find((x) => {
      acc += x.kcal;
      return k <= acc;
    });
    return { mode: "meal", meal: m, k };
  }
  const more = Math.round((k - S2.kcalIn) / 10) * 10;
  return { mode: "taste", k: S2.kcalIn + more, more, left: GOALS.kcal + S2.burned - S2.kcalIn - more, cap };
}
function WeightScrub({ weights, now, children }) {
  const ref = (0, import_react5.useRef)(null);
  const p = useCardPointer(ref);
  const pts = weights.filter((w) => w.t > now - 30 * 864e5);
  let dot = null;
  if (inside(p, 8) && pts.length >= 2) {
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const W2 = 220, H2 = 64, min = Math.min(...pts.map((q2) => q2.kg)) - 0.2, max = Math.max(...pts.map((q2) => q2.kg)) + 0.2;
    const tx = t0 + (p.x / p.w * W2 - 4) / (W2 - 8) * (t1 - t0);
    const q = pts.reduce((a, b) => Math.abs(b.t - tx) < Math.abs(a.t - tx) ? b : a);
    const x = ((q.t - t0) / (t1 - t0 || 1) * (W2 - 8) + 4) / W2, y = (H2 - 6 - (q.kg - min) / (max - min || 1) * (H2 - 12)) / H2;
    dot = { x, y, q };
  }
  return /* @__PURE__ */ import_react5.default.createElement("div", { ref, style: { position: "relative", height: "100%" } }, children, dot && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-wline", style: { left: dot.x * 100 + "%" } }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-wdot", style: { left: dot.x * 100 + "%", top: dot.y * 100 + "%" } }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-wtag", style: { left: `clamp(24px, ${dot.x * 100}%, calc(100% - 24px))` } }, new Date(dot.q.t).getMonth() + 1 + "/" + new Date(dot.q.t).getDate(), " · ", dot.q.kg.toFixed(1))));
}
function BackHead({ title, tone }) {
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginBottom: 12 } }, /* @__PURE__ */ import_react5.default.createElement("h2", { className: "lf-h" }, title), /* @__PURE__ */ import_react5.default.createElement("span", { style: { fontSize: 12, opacity: tone ? 0.75 : 1, color: tone ? void 0 : "var(--ink3)" } }, "点一下翻回去"));
}
function Eq({ rows, tone }) {
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-eq", style: { "--line": tone ? "rgba(255,255,255,.25)" : "var(--fill2)" } }, rows.map((r, i) => /* @__PURE__ */ import_react5.default.createElement("div", { key: i, className: "lf-eq-row" + (r.total ? " total" : ""), style: { animationDelay: 0.12 + i * 0.07 + "s" } }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-eq-op" }, r.op || ""), /* @__PURE__ */ import_react5.default.createElement("span", { style: { flex: 1 } }, r.label), /* @__PURE__ */ import_react5.default.createElement("b", { className: "lf-num" }, r.value))));
}
function BackEnergy({ S: S2 }) {
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back" }, /* @__PURE__ */ import_react5.default.createElement(BackHead, { title: "今天还能吃，怎么算的" }), /* @__PURE__ */ import_react5.default.createElement(Eq, { rows: [
    { label: "每天的目标", value: num(GOALS.kcal) },
    { op: "+", label: "练掉的", value: num(S2.burned) },
    { op: "−", label: "已经吃的", value: num(S2.kcalIn) },
    { op: "=", label: S2.allowance < 0 ? "超出了" : "还能吃", value: num(Math.abs(S2.allowance)), total: true }
  ] }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back-list" }, S2.meals.length ? S2.meals.map((m) => /* @__PURE__ */ import_react5.default.createElement("div", { key: m.id, className: "lf-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react5.default.createElement("span", { style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, fmtTime(m.t), " ", MEAL_NAME[m.meal] || "", " · ", m.title), /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-num" }, num(m.kcal)))) : /* @__PURE__ */ import_react5.default.createElement("span", null, "今天还没记吃的。")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "lf-back-note" }, "练得越多，能吃的越多；目标在「目标」里改。"));
}
function BackMoney({ S: S2 }) {
  const top = S2.cats.slice(0, 3), mx = top.length ? top[0][1] : 1;
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back" }, /* @__PURE__ */ import_react5.default.createElement(BackHead, { title: "还能花，怎么算的", tone: true }), /* @__PURE__ */ import_react5.default.createElement(Eq, { tone: true, rows: [
    { label: "这个月预算", value: money(GOALS.budget) },
    { op: "−", label: "已经花了", value: money(S2.spent) },
    ...S2.pendingBills ? [{ op: "−", label: "没付的账单", value: money(S2.pendingBills) }] : [],
    { op: "÷", label: "剩下 " + S2.daysLeft + " 天", value: "" },
    { op: "=", label: "每天可花", value: money(S2.perDay), total: true }
  ] }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back-list" }, top.length ? top.map(([c, v], i) => /* @__PURE__ */ import_react5.default.createElement("div", { key: c, className: "lf-row", style: { gap: 8 } }, /* @__PURE__ */ import_react5.default.createElement("span", { style: { width: 36 } }, c), /* @__PURE__ */ import_react5.default.createElement("span", { style: { flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,.18)", overflow: "hidden" } }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-growx", style: { display: "block", height: "100%", width: v / mx * 100 + "%", background: "#fff", borderRadius: 3, animationDelay: 0.3 + i * 0.08 + "s" } })), /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-num", style: { width: 64, textAlign: "right" } }, money(v)))) : /* @__PURE__ */ import_react5.default.createElement("span", null, "这个月还没记花销。")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "lf-back-note" }, "照现在的速度，月底大约花 ", money(S2.pace), "。"));
}
function BackSleep({ S: S2 }) {
  const goal = GOALS.sleep;
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back" }, /* @__PURE__ */ import_react5.default.createElement(BackHead, { title: "这一周每晚", tone: true }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back-list", style: { gap: 5 } }, S2.week.slice().reverse().map((d, i) => /* @__PURE__ */ import_react5.default.createElement("div", { key: d.day, className: "lf-row lf-eq-row", style: { gap: 10, animationDelay: 0.1 + i * 0.05 + "s" } }, /* @__PURE__ */ import_react5.default.createElement("span", { style: { width: 28, opacity: 0.8 } }, "周", d.label), /* @__PURE__ */ import_react5.default.createElement("span", { style: { flex: 1, opacity: d.sleep ? 1 : 0.55 } }, d.sleep ? fmtHM(d.sleep.bed % 24) + " 睡" : "没记"), /* @__PURE__ */ import_react5.default.createElement("b", { className: "lf-num", style: { color: d.sleep && d.sleep.hours < goal - 0.5 ? "#FFD0D2" : void 0 } }, d.sleep ? fmtHM(d.sleep.hours) : "—")))), /* @__PURE__ */ import_react5.default.createElement("p", { className: "lf-back-note" }, "平均 ", S2.sleepAvg ? fmtHM(S2.sleepAvg) : "—", "，目标 ", fmtHM(goal), "。少于目标半小时以上的那晚标成了粉色。"));
}
function BackMove({ S: S2, workouts }) {
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back" }, /* @__PURE__ */ import_react5.default.createElement(BackHead, { title: "这周练了什么" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back-list" }, workouts.length ? workouts.map((w) => /* @__PURE__ */ import_react5.default.createElement("div", { key: w.id, className: "lf-row", style: { justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ import_react5.default.createElement("span", { style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, "周", WEEK2[new Date(w.t).getDay()], " · ", w.kind || w.title), /* @__PURE__ */ import_react5.default.createElement("span", { className: "lf-num", style: { flex: "none" } }, w.steps ? num(w.steps) + " 步" : w.minutes + " 分", " · ", num(w.kcal), " 千卡"))) : /* @__PURE__ */ import_react5.default.createElement("span", null, "这周还没练。说「跑步 30 分钟」就会记上。")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "lf-back-note" }, "目标每周 ", GOALS.workoutsPerWeek, " 次，还差 ", Math.max(0, GOALS.workoutsPerWeek - S2.weekWorkouts), " 次。"));
}
function BackBody({ S: S2, monthWeight }) {
  const recent = S2.weights.slice(-5).reverse();
  const tdee = S2.wNow ? Math.round(S2.wNow * 30 / 50) * 50 : null;
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back" }, /* @__PURE__ */ import_react5.default.createElement(BackHead, { title: "最近几次称重" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "lf-back-list" }, recent.length ? recent.map((w) => /* @__PURE__ */ import_react5.default.createElement("div", { key: w.id, className: "lf-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react5.default.createElement("span", null, md(w.t), " ", fmtTime(w.t)), /* @__PURE__ */ import_react5.default.createElement("b", { className: "lf-num" }, w.kg.toFixed(1), " kg"))) : /* @__PURE__ */ import_react5.default.createElement("span", null, "还没称过。")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "lf-back-note" }, tdee ? `按 ${S2.wNow.toFixed(1)} kg 估，每天大约消耗 ${num(tdee)} 千卡。` : "", monthWeight ? ` Boss 战目标 ${monthWeight} kg。` : ""));
}
var CARDS_CSS = `
.lf-tab{font-variant-numeric:tabular-nums}
.lf-root .lf-name{border:0;background:transparent;padding:0;font:inherit;color:inherit;letter-spacing:inherit;cursor:text;border-radius:10px;transition:background .2s}
.lf-root .lf-name:hover{background:rgba(255,255,255,.06)}
.lf-name-add{color:rgba(244,245,241,.35);font-size:.6em;font-weight:500;letter-spacing:0;vertical-align:.25em}
.lf-name-input{width:6em;border:0;border-bottom:2px solid rgba(244,245,241,.4);background:transparent;color:inherit;font:inherit;letter-spacing:inherit;outline:none;padding:0}
.lf-todo-list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0 -10px;padding:0 10px 4px;scrollbar-width:thin;scrollbar-color:var(--line) transparent;-webkit-mask-image:linear-gradient(#000 calc(100% - 14px),transparent);mask-image:linear-gradient(#000 calc(100% - 14px),transparent)}
.lf-todo-list::-webkit-scrollbar{width:6px}
.lf-todo-list::-webkit-scrollbar-thumb{background:var(--line);border-radius:3px}
.lf-archive{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0 -6px;padding:0 6px 8px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}
.lf-archive-day{font-size:11.5px;font-weight:600;color:var(--ink3);letter-spacing:.04em;margin:2px 0 4px}
.lf-archive-item{display:flex;align-items:center;gap:10px;min-height:34px;padding:0 8px;margin:0 -8px;border-radius:10px;font-size:14px;color:var(--ink2);animation:lf-swap .3s cubic-bezier(.2,.8,.2,1) both;transition:background .2s}
.lf-archive-item:hover{background:#F4F5F1}
.lf-archive-item.out{pointer-events:none;animation:lf-archout .55s cubic-bezier(.45,0,.55,1) forwards;will-change:transform,opacity}
@keyframes lf-archout{0%{transform:none;opacity:1;max-height:40px;min-height:34px}45%{transform:translate(18px,-10px) rotate(2deg);opacity:.85;max-height:40px;min-height:34px}100%{transform:translate(70px,-30px) rotate(6deg) scale(.9);opacity:0;max-height:0;min-height:0}}
.lf-todo.lf-arrive{animation:lf-arrive 1.1s var(--ad,.5s) cubic-bezier(.22,1,.36,1) both}
@keyframes lf-arrive{0%{transform:translateY(-26px) rotate(-1.5deg);opacity:0}35%{opacity:1}100%{transform:none;opacity:1}}
@keyframes lf-arrivecheck_unused{0%{transform:scale(1)}40%{transform:scale(1.25);border-color:#1E9E6A;box-shadow:0 0 0 4px rgba(30,158,106,.18)}100%{transform:none}}
.lf-archive-tick{width:16px;height:16px;border-radius:5px;background:color-mix(in srgb,#1E9E6A 14%,var(--card));color:#1E9E6A;display:grid;place-items:center;flex:none}
.lf-archive-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lf-archive-amt{font-size:12.5px;color:#7C5CE0;font-variant-numeric:tabular-nums}
.lf-root .lf-archive-back{height:26px;padding:0 10px;border:0;border-radius:13px;background:transparent;color:#1E9E6A;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;opacity:0;transition:opacity .2s,background .2s}
.lf-archive-item:hover .lf-archive-back,.lf-archive-back:focus-visible{opacity:1}
.lf-root .lf-archive-back:hover{background:color-mix(in srgb,#1E9E6A 10%,var(--card))}
.lf-root .lf-todo{padding-left:8px;padding-right:6px;margin:0 -8px;width:calc(100% + 14px)}
.lf-nudges{display:flex;flex-direction:column;gap:12px;margin-top:auto}
.lf-nudge-row{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}
.lf-nudge-label{font-size:12.5px;color:rgba(244,245,241,.4);flex:none;width:40px}
.lf-root .lf-nudge{flex:none;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 12px 0 10px;border:0;border-radius:16px;background:rgba(255,255,255,.07);color:rgba(244,245,241,.88);font:inherit;font-size:13.5px;white-space:nowrap;cursor:pointer;transition:background .2s,transform .25s cubic-bezier(.2,.9,.3,1.4);animation:lf-rise .45s cubic-bezier(.2,.8,.2,1) both}
.lf-root .lf-nudge:hover{background:rgba(255,255,255,.14);transform:translateY(-2px)}
.lf-root .lf-nudge:active{transform:scale(.95)}
.lf-nudge.plain{padding:0 12px}
.lf-nudge-dot{width:8px;height:8px;border-radius:4px;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 22%,transparent)}
.lf-nudge.due .lf-nudge-dot{animation:lf-nudgeping 1.6s ease-out infinite}
@keyframes lf-nudgeping{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 55%,transparent)}100%{box-shadow:0 0 0 9px transparent}}
.lf-nudge-time{font-size:12px;color:rgba(244,245,241,.45);font-variant-numeric:tabular-nums}
.lf-nudge.due .lf-nudge-time{color:var(--c)}
.lf-root .lf-tip{display:flex;align-items:center;gap:12px;width:100%;max-width:560px;padding:12px 14px;border:0;border-radius:16px;background:linear-gradient(100deg,rgba(255,255,255,.07),rgba(255,255,255,.025));color:rgba(244,245,241,.85);font:inherit;font-size:14px;text-align:left;cursor:pointer;transition:background .25s,box-shadow .25s}
.lf-root .lf-tip:hover,.lf-root .lf-tip.on{background:linear-gradient(100deg,rgba(255,255,255,.12),rgba(255,255,255,.04));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
.lf-tip-dots{display:flex;align-items:center;flex:none}
.lf-tip-dots i{width:9px;height:9px;border-radius:5px}
.lf-tip-dots b{width:12px;height:2px;background:rgba(244,245,241,.25);position:relative;overflow:hidden}
.lf-tip-dots b::after{content:'';position:absolute;inset:0;background:#fff;transform:translateX(-100%);animation:lf-tipflow 1.8s ease-in-out infinite}
@keyframes lf-tipflow{60%,100%{transform:translateX(100%)}}
.lf-tip-win{flex:1;min-width:0;height:22px;overflow:hidden;position:relative}
.lf-tip-text{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:22px;animation:lf-tiproll .5s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes lf-tiproll{from{transform:translateY(100%);opacity:0;filter:blur(2px)}to{transform:none;opacity:1;filter:none}}
.lf-tip-pager{display:flex;gap:4px;flex:none}
.lf-tip-pager i{width:4px;height:4px;border-radius:2px;background:rgba(244,245,241,.25);transition:width .3s,background .3s}
.lf-tip-pager i.on{width:12px;background:rgba(244,245,241,.8)}
.lf-root .lf-alldone{flex:1;min-height:0;flex-direction:row;gap:14px;text-align:left;padding:14px 0 4px}
.lf-root .lf-alldone .lf-ad-badge{width:46px;height:46px;flex:none}
.lf-root .lf-sweep-btn,.lf-sweep-btn{position:relative;overflow:hidden;isolation:isolate;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border:0;border-radius:14px;background:var(--fill);color:#3A3F38;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .25s,color .25s,padding .3s cubic-bezier(.2,.9,.3,1.2),transform .2s,box-shadow .3s;animation:lf-pillin .35s cubic-bezier(.2,.9,.3,1.3)}
.lf-sweep-btn:hover{background:var(--fill2)}
.lf-sweep-btn:not(.pending):hover svg{animation:lf-broom .5s ease-in-out infinite alternate;transform-origin:70% 30%}
.lf-sweep-btn:active{transform:scale(.95)}
.lf-sweep-btn.pending{padding:0 4px 0 4px;background:var(--card);color:#1E9E6A;box-shadow:0 0 0 1px color-mix(in srgb,#1E9E6A 18%,var(--card)),0 6px 18px -6px rgba(30,158,106,.45)}
.lf-sweep-btn.pending:hover{background:#F6FBF8}
@keyframes lf-pillin{from{transform:scale(.85);opacity:.4}to{transform:none;opacity:1}}
.lf-sweep-glow{position:absolute;z-index:-1;left:0;top:0;bottom:0;width:100%;background:linear-gradient(90deg,rgba(30,158,106,.18),rgba(30,158,106,.06) 70%,transparent);transform-origin:0 50%;animation:lf-drain var(--dur,5s) linear forwards}
.lf-sweep-glow::after{content:'';position:absolute;right:-14px;top:50%;width:28px;height:28px;margin-top:-14px;border-radius:50%;background:radial-gradient(circle,rgba(30,158,106,.35),transparent 70%);filter:blur(2px)}
@keyframes lf-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.lf-sweep-num{position:relative;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:10px;background:#1E9E6A;color:#fff;font-size:11.5px;font-weight:700;overflow:hidden;font-variant-numeric:tabular-nums;box-shadow:0 0 0 3px rgba(30,158,106,.15);animation:lf-numpulse 1s ease-in-out infinite}
@keyframes lf-numpulse{50%{box-shadow:0 0 0 5px rgba(30,158,106,.08)}}
.lf-roll{display:block;animation:lf-roll .35s cubic-bezier(.2,.9,.3,1.25)}
@keyframes lf-roll{from{transform:translateY(110%);opacity:0;filter:blur(1.5px)}to{transform:none;opacity:1;filter:none}}
.lf-sweep-label{white-space:nowrap}
.lf-sweep-undo{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:10px;background:color-mix(in srgb,#1E9E6A 10%,var(--card));color:#1E9E6A;transition:transform .3s,background .2s}
.lf-sweep-btn.pending:hover .lf-sweep-undo{transform:rotate(-200deg);background:#1E9E6A;color:#fff}
.lf-todo{width:100%;padding:10px 0;min-height:44px;gap:10px;position:relative}
.lf-todo-hit{display:flex;align-items:center;gap:10px;flex:1;min-width:0;border:0;background:transparent;padding:0;text-align:left;color:inherit;font:inherit;cursor:pointer;min-height:24px}
.lf-todo-hit:active .lf-check{transform:scale(.85)}
.lf-todo-acts{display:flex;gap:2px;opacity:.32;transition:opacity .2s}
.lf-todo:hover .lf-todo-acts,.lf-todo:has(:focus-visible) .lf-todo-acts{opacity:1}
.lf-todo.done .lf-todo-acts{opacity:.22}
.lf-todo.done:hover .lf-todo-acts{opacity:1}
.lf-todo-act{width:28px;height:28px;border:0;border-radius:9px;background:transparent;color:var(--ink3);display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s,transform .15s}
.lf-todo-act:hover{background:var(--fill);color:var(--ink)}
.lf-todo-act.del:hover{background:color-mix(in srgb,#E5484D 13%,var(--card));color:#D9363E}
.lf-todo-act.del:hover svg{animation:lf-binshake .4s ease-in-out}
@keyframes lf-binshake{25%{transform:rotate(-12deg)}75%{transform:rotate(10deg)}}
.lf-todo-act:active{transform:scale(.88)}
.lf-ch{display:inline-block;white-space:pre}
.lf-todo.dust .lf-ch{animation:lf-dust .55s cubic-bezier(.3,.1,.6,1) both;animation-delay:calc(var(--i) * 28ms)}
@keyframes lf-dust{0%{transform:none;opacity:1;filter:none}30%{transform:translate(calc(var(--dx) * .15),-3px) scale(1.08);opacity:1;color:#D9363E}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(var(--s));opacity:0;filter:blur(2px);color:#D9363E}}
.lf-todo.dust .lf-check,.lf-todo.dust .lf-todo-amt{animation:lf-dustbox .45s cubic-bezier(.5,0,.75,0) both}
.lf-todo.dust .lf-todo-amt{animation-delay:.15s}
@keyframes lf-dustbox{30%{transform:scale(1.12) rotate(-6deg)}100%{transform:scale(0) rotate(30deg);opacity:0}}
.lf-todo.dust .lf-todo-acts{opacity:0!important}
.lf-todo.dust .lf-strike{background-size:0 1.5px!important}
.lf-todo.back .lf-ch{animation:lf-dust .5s cubic-bezier(.2,.8,.3,1) reverse both;animation-delay:calc(var(--i) * 22ms)}
.lf-todo.back .lf-check,.lf-todo.back .lf-todo-amt{animation:lf-dustbox .4s cubic-bezier(.2,.9,.3,1.4) reverse both}
.lf-root .lf-todo-undo .lf-sweep-btn.pending{padding:0 3px;height:24px;font-size:12px;gap:5px}
.lf-todo-undo .lf-sweep-num,.lf-todo-undo .lf-sweep-undo{width:17px;height:17px;font-size:10.5px}
.lf-todo-undo{justify-content:space-between;background:linear-gradient(90deg,var(--card),transparent);border-radius:12px;animation:lf-swap .3s cubic-bezier(.2,.8,.2,1) both}
.lf-todo-undo.gone{overflow:hidden;animation:lf-undogone .36s cubic-bezier(.5,0,.75,0) forwards}
@keyframes lf-undogone{to{max-height:0;min-height:0;padding-top:0;padding-bottom:0;opacity:0;border-top-width:0;transform:scale(.96)}}
.lf-todo-ghost{font-size:13.5px;color:var(--ink3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.lf-todo-ghost s{color:#B5B9B1;text-decoration-color:rgba(217,54,62,.55)}
.lf-todo-input:focus,.lf-todo-input:focus-visible{outline:none!important}
.lf-todo-input{flex:1;min-width:0;height:32px;margin:-4px 0;padding:0 10px;border:1.5px solid #1E9E6A;border-radius:9px;background:var(--card);font:inherit;font-size:15px;color:var(--ink);outline:none;box-shadow:0 0 0 4px rgba(30,158,106,.12);animation:lf-swap .2s ease both}
.lf-todo-hint{font-size:11.5px;color:var(--ink3);white-space:nowrap}
.lf-todo.saved .lf-strike{animation:lf-saved 1s ease both}
@keyframes lf-saved{0%{background-color:rgba(30,158,106,.22)}100%{background-color:transparent}}
.lf-todo.lf-pend{opacity:.38;transform:translateX(8px);transition:opacity .35s,transform .45s cubic-bezier(.2,.9,.3,1.2)}
.lf-todo{transition:opacity .35s,transform .45s cubic-bezier(.2,.9,.3,1.2)}
@keyframes lf-broom{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
.lf-todo.lf-swept{overflow:hidden;animation:lf-swept .5s cubic-bezier(.5,0,.75,0) both}
@keyframes lf-swept{0%{transform:none;opacity:1;max-height:64px}35%{transform:translateX(-10px);opacity:1;max-height:64px}100%{transform:translateX(110%) rotate(2deg);opacity:0;max-height:0;min-height:0;padding-top:0;padding-bottom:0;border-top-width:0}}
.lf-jar{position:relative;height:18px;border-radius:3px;background:rgba(255,255,255,.16);transform-origin:50% 100%;transition:transform .18s cubic-bezier(.2,.9,.3,1.3),background .2s,box-shadow .2s}
.lf-jar.future{background:transparent;box-shadow:inset 0 0 0 1px rgba(255,255,255,.32)}
.lf-jar.today{box-shadow:0 0 0 1.5px #fff}
.lf-jar.on{background:rgba(255,255,255,.28)}
.lf-jar.future.on{box-shadow:inset 0 0 0 1px rgba(255,255,255,.7)}
.lf-jar-fill{position:absolute;left:0;right:0;bottom:0;border-radius:2px;background:rgba(255,255,255,.78);transition:height .6s cubic-bezier(.2,.8,.2,1)}
.lf-jar.today .lf-jar-fill{background:#fff}
.lf-jar-fill.pour{animation:lf-jarpour .7s cubic-bezier(.3,1.5,.5,1)}
@keyframes lf-jarpour{0%{transform:scaleY(.2);transform-origin:50% 100%}60%{transform:scaleY(1.15)}100%{transform:none}}
.lf-jar-over{position:absolute;left:0;right:0;bottom:100%;margin-bottom:1px;border-radius:2px 2px 1px 1px;background:#FF8F80}
.lf-fadein{animation:lf-fadein .6s ease both}
@keyframes lf-fadein{from{opacity:0}to{opacity:1}}
.lf-swap{animation:lf-swap .22s cubic-bezier(.2,.8,.2,1) both}
@keyframes lf-swap{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.lf-sky{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:inherit}
.lf-sky i{position:absolute;border-radius:50%;background:#fff;opacity:.1;transition:opacity .35s,transform .45s cubic-bezier(.2,.8,.2,1);box-shadow:0 0 6px rgba(255,255,255,.9)}
.lf-sleep-body{position:relative;z-index:1;display:flex;flex-direction:column;flex:auto;min-height:0}
.lf-sleep-row{transition:opacity .2s}
.lf-sleep-body.scan .lf-sleep-row{opacity:.45}
.lf-sleep-body.scan .lf-sleep-row.on{opacity:1}
.lf-hop{animation:lf-hop .55s cubic-bezier(.3,1.6,.5,1)}
@keyframes lf-hop{0%{transform:scaleY(1)}30%{transform:scaleY(1.22) translateY(-3px)}55%{transform:scaleY(.9)}75%{transform:scaleY(1.05)}100%{transform:none}}
.lf-taste{position:absolute;top:7px;height:12px;border-radius:0 6px 6px 0;background:repeating-linear-gradient(135deg,rgba(242,153,74,.55) 0 4px,rgba(242,153,74,.25) 4px 8px);pointer-events:none;transition:width .12s}
.lf-taste-tip{position:absolute;top:-16px;transition:left .1s;font-variant-numeric:tabular-nums;transform:translateX(-50%);font-size:11.5px;font-weight:700;color:var(--food-ink);white-space:nowrap;pointer-events:none}
.lf-taste-pin{position:absolute;top:3px;bottom:3px;width:2px;margin-left:-1px;border-radius:1px;background:#F2994A;pointer-events:none}
.lf-wline{position:absolute;top:0;bottom:0;width:1px;transition:left .12s;background:rgba(14,138,138,.35);pointer-events:none}
.lf-wdot{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#fff;border:2.5px solid #0E8A8A;pointer-events:none;transition:left .12s,top .12s}
.lf-wtag{position:absolute;top:-20px;transition:left .12s;font-variant-numeric:tabular-nums;transform:translateX(-50%);font-size:11.5px;font-weight:600;color:#0E6E6E;white-space:nowrap;pointer-events:none}
.lf-flip{position:absolute;top:4px;left:50%;margin-left:38px;z-index:3;width:22px;height:20px;border:0;border-radius:10px;background:transparent;color:currentColor;opacity:0;display:grid;place-items:center;transition:opacity .2s,transform .3s}
.lf-widget:hover .lf-flip,.lf-flip:focus-visible{opacity:.55}
.lf-flip:hover{opacity:.9!important;transform:rotate(180deg)}
.lf-root.lf-scrolling .lf-flip{opacity:0}
.lf-card.has-back{cursor:pointer}
.lf-card.has-back .lf-grip{cursor:grab}
.lf-back{display:flex;flex-direction:column;flex:auto;min-height:0}
.lf-eq{display:flex;flex-direction:column}
.lf-eq-row{display:flex;align-items:baseline;gap:8px;font-size:13.5px;padding:2.5px 0;animation:lf-swap .35s cubic-bezier(.2,.8,.2,1) both}
.lf-eq-row.total{border-top:1.5px solid var(--line);margin-top:4px;padding-top:6px;font-size:15px}
.lf-eq-row.total b{font-size:18px}
.lf-eq-op{width:14px;opacity:.55;font-weight:600}
.lf-back-list{display:flex;flex-direction:column;gap:7px;margin-top:12px;font-size:13px;flex:0 1 auto;min-height:0;overflow:hidden;-webkit-mask-image:linear-gradient(#000 calc(100% - 18px),transparent);mask-image:linear-gradient(#000 calc(100% - 18px),transparent);padding-bottom:6px}
.lf-back-note{margin:auto 0 0;padding-top:10px;font-size:12.5px;opacity:.7;line-height:1.5}
@media (prefers-reduced-motion:reduce){.lf-hop,.lf-swap,.lf-eq-row{animation:none}}
`;

// src/goals.jsx
var import_react6 = __toESM(require("react"));
var LAYERS = [
  { key: "daily", game: "每日任务", name: "每天", color: "#F2994A", r: 40 },
  { key: "month", game: "Boss 战", name: "这个月", color: "#1E9E6A", r: 68 },
  { key: "year", game: "主线任务", name: "一年", color: "#3D4FB8", r: 96 },
  { key: "vision", game: "胜利条件", name: "愿景", color: "#7C5CE0", r: 124 },
  { key: "anti", game: "赌注", name: "反愿景", color: "#E5484D", r: 152 },
  { key: "rules", game: "规则", name: "底线", color: "#1F2328", r: 172 }
];
var LAYER = Object.fromEntries(LAYERS.map((l) => [l.key, l]));
var DAY3 = 864e5;
var pad3 = (n) => (n < 10 ? "0" : "") + n;
var hm = (h) => {
  const m = Math.round((h % 24 + 24) % 24 * 60);
  return pad3(Math.floor(m / 60) % 24) + ":" + pad3(m % 60);
};
var r50 = (x) => Math.round(x / 50) * 50;
function suggestGoals(S2, records) {
  const now = S2.now, since = now - 30 * DAY3;
  const w = S2.wNow;
  const recent = records.filter((r) => r.t >= since && r.t <= now);
  const expDays = new Set(recent.filter((r) => r.type === "expense").map((r) => startOfDay(r.t))).size;
  const spent30 = recent.filter((r) => r.type === "expense" && r.cat !== "居家").reduce((a, r) => a + r.amount, 0);
  const fixed = recent.filter((r) => r.type === "expense" && r.cat === "居家").reduce((a, r) => a + r.amount, 0);
  const wk = recent.filter((r) => r.type === "workout").length / 30 * 7;
  const wake = S2.lastNight ? hourOf(S2.lastNight.t + S2.lastNight.hours * 36e5) : 7;
  const tdee = w ? r50(w * 30) : 2200;
  const out = [];
  const add = (o) => out.push(o);
  add({
    id: "kcal",
    layer: "daily",
    title: "每天吃到",
    num: { key: "kcal", value: Math.max(1500, tdee - 500), min: 1400, max: 3500, step: 50, unit: "千卡" },
    why: w ? `按 ${w} kg 估，你每天大约消耗 ${num(tdee)} 千卡。少吃 500，一周约轻 0.5 kg，不会饿到撑不住。` : "先按 2,200 千卡的消耗估，记了体重以后会算得更准。"
  });
  add({
    id: "sleep",
    layer: "daily",
    title: "每晚睡够",
    num: { key: "sleep", value: 7.5, min: 6, max: 9, step: 0.5, unit: "小时", fmt: (v) => fmtHM(v) },
    why: (v) => `你大约 ${hm(wake)} 起床，睡够 ${fmtHM(v)} 就要 ${hm(wake - v)} 前睡下。`,
    after: (v) => `${hm(wake - v)} 前睡`
  });
  add({
    id: "lever",
    layer: "daily",
    title: "每天一个小动作",
    texts: ["每顿饭随手记一句，不用算，AI 来算", "午饭后走 15 分钟", "睡前 30 分钟不看手机"],
    why: "每天的动作要小到不用意志力，做了就能在页面上看到。"
  });
  const nowWk = Math.round(wk);
  add({
    id: "workouts",
    layer: "month",
    title: "这个月每周练",
    num: { key: "workoutsPerWeek", value: Math.min(4, Math.max(3, nowWk + 1)), min: 1, max: 7, step: 1, unit: "次" },
    why: nowWk ? `最近平均每周练 ${nowWk} 次，多加 1 次，刚好够得着。` : "最近还没怎么练，先定每周 3 次，比 4 次更容易坚持住一个月。"
  });
  if (w) add({
    id: "monthWeight",
    layer: "month",
    title: "30 天后体重",
    num: { key: "monthWeight", value: +(w - 2).toFixed(1), min: +(w - 4).toFixed(1), max: w, step: 0.5, unit: "kg", fmt: (v) => v.toFixed(1) },
    why: (v) => `每周约 ${((w - v) / 4.3).toFixed(1)} kg，这是不伤身体、也不容易反弹的速度。`
  });
  if (w) add({
    id: "yearWeight",
    layer: "year",
    title: "一年后体重",
    num: { key: "weight", value: +(w * 0.9).toFixed(1), min: +(w * 0.8).toFixed(1), max: w, step: 0.5, unit: "kg", fmt: (v) => v.toFixed(1) },
    why: (v) => `比现在轻 ${(w - v).toFixed(1)} kg（约 ${Math.round((1 - v / w) * 100)}%），平摊到 52 周，每周不到 ${((w - v) / 52 + 0.05).toFixed(1)} kg。`
  });
  add({
    id: "yearRun",
    layer: "year",
    title: "一年后能做到",
    texts: ["一口气跑完 10 公里", "体检报告每一项都在正常范围", "连续 100 天按时睡觉"],
    why: "一个看得见、能验证的标志，到时候你自己就知道有没有变成另一个人。"
  });
  add({
    id: "vision",
    layer: "vision",
    title: "我是一个……",
    texts: ["我是一个睡得规律、每周都在动、钱花在刀刃上的人", "我是一个说练就练、身体一天比一天轻的人", "我是一个对自己的时间和身体都有掌控感的人"],
    why: "写成身份，而不是愿望。每次犹豫时，问一句：这样的人现在会怎么做？"
  });
  add({
    id: "anti",
    layer: "anti",
    title: "我不要变成",
    texts: ["五年后还是作息乱、体重一年比一年高、月底不知道钱去哪了的人", "一个总说「下周开始」，结果五年都没开始的人", "体检单越来越长、爬几层楼就喘的人"],
    why: "想清楚什么都不改会变成什么样，这是这局游戏的赌注。"
  });
  const est = expDays >= 10 ? spent30 / Math.max(1, expDays) * 30 + fixed : null;
  add({
    id: "budget",
    layer: "rules",
    title: "每月花销不超过",
    num: { key: "budget", value: est ? r50(est * 0.9) : GOALS.budget, min: 1e3, max: 5e4, step: 100, unit: "元", fmt: (v) => money(v) },
    why: est ? `最近一个月大约花了 ${money(est)}，少花 10%，基本感觉不到。` : "你的花销记录还不够两周，先按这个数，记满两周后我会按真实花销重新建议。"
  });
  add({
    id: "floor",
    layer: "rules",
    title: "绝不",
    texts: ["每天吃得少于 1,500 千卡，不靠节食", "熬过 00:30", "为了练而带伤练"],
    why: "底线是为了目标也不牺牲的东西，守住它，这局游戏才能玩得久。"
  });
  return out;
}
var DX = 0.766;
var DY = -0.643;
var NX = 0.643;
var NY = 0.766;
var DS = 1.3;
var P = (t, n = 0) => (DS * (t * DX + n * NX)).toFixed(2) + "," + (DS * (t * DY + n * NY)).toFixed(2);
function dartMarkup(color) {
  return `<g class="gl-dart-shadow"><path d="M0,0 L${(22 * 0.96).toFixed(1)},${(22 * 0.12).toFixed(1)}" stroke="rgba(31,35,40,.22)" stroke-width="3.2" stroke-linecap="round" fill="none"/></g><circle r="2.4" fill="rgba(31,35,40,.28)"/><path d="M${P(0)} L${P(5)}" stroke="#8A8F86" stroke-width="1.3" stroke-linecap="round"/><path d="M${P(5)} L${P(14)}" stroke="#1F2328" stroke-width="4" stroke-linecap="round"/><path d="M${P(6.5, -0.9)} L${P(12.5, -0.9)}" stroke="rgba(255,255,255,.45)" stroke-width="1" stroke-linecap="round"/><path d="M${P(14)} L${P(21)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/><path d="M${P(18)} L${P(24, 5.6)} L${P(28.5, 5.2)} L${P(26)} Z" fill="${color}"/><path d="M${P(18)} L${P(24, -5.6)} L${P(28.5, -5.2)} L${P(26)} Z" fill="${color}" opacity=".78"/>`;
}
function GoalsPanel({ open, onClose, rootRect, suggestions, goals, onAdopt, onUndo, celebrate }) {
  const [shown, setShown] = (0, import_react6.useState)(open);
  const [closing, setClosing] = (0, import_react6.useState)(false);
  const [draft, setDraft] = (0, import_react6.useState)({});
  const [alt, setAlt] = (0, import_react6.useState)({});
  const [flip, setFlip] = (0, import_react6.useState)({});
  const [hot, setHot] = (0, import_react6.useState)(null);
  const [lit, setLit] = (0, import_react6.useState)({});
  const [plus, setPlus] = (0, import_react6.useState)([]);
  const [locked, setLocked] = (0, import_react6.useState)(false);
  const [fresh, setFresh] = (0, import_react6.useState)({});
  const svgRef = (0, import_react6.useRef)(null), cardRefs = (0, import_react6.useRef)({});
  (0, import_react6.useEffect)(() => {
    if (open) {
      setShown(true);
      setClosing(false);
    } else if (shown) {
      setClosing(true);
      const t = setTimeout(() => {
        setShown(false);
        setClosing(false);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [open]);
  (0, import_react6.useEffect)(() => {
    if (!open) return;
    const k = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  const adopted = goals.adopted || {};
  const layerDone = (k) => suggestions.some((s) => s.layer === k && adopted[s.id]);
  const doneCount = LAYERS.filter((l) => layerDone(l.key)).length;
  const picks = (k) => suggestions.filter((s) => s.layer === k && adopted[s.id]);
  const itemCount = suggestions.filter((s) => adopted[s.id]).length;
  const pipPos = (k, i) => {
    const L = LAYER[k], a = (-72 + LAYERS.indexOf(L) * 55 + i * 40) * Math.PI / 180, r = k === "daily" ? L.r - 4 : L.r;
    return { x: 180 + r * Math.cos(a), y: 180 + r * Math.sin(a) };
  };
  (0, import_react6.useEffect)(() => {
    if (open && doneCount === LAYERS.length) setLocked(true);
  }, [open]);
  if (!shown) return null;
  const valOf = (s) => s.num ? draft[s.id] != null ? draft[s.id] : goals[s.num.key] != null && adopted[s.id] ? goals[s.num.key] : s.num.value : s.texts[(alt[s.id] || 0) % s.texts.length];
  const fly = (s, cardEl) => {
    const L = LAYER[s.layer], svg = svgRef.current;
    if (!svg || !cardEl) return Promise.resolve();
    const sr = svg.getBoundingClientRect(), cr = cardEl.querySelector(".gl-adopt").getBoundingClientRect();
    const k = sr.width / 360, pp = pipPos(s.layer, picks(s.layer).length);
    const tx = sr.left + pp.x * k, ty = sr.top + pp.y * k;
    const sx = cr.left + cr.width / 2, sy = cr.top + cr.height / 2;
    const W2 = 56 * k, ox = 10 * k, oy = 46 * k;
    const el = document.createElement("div");
    el.className = "gl-flying";
    el.style.cssText = `left:${sx - ox}px;top:${sy - oy}px;width:${W2}px;height:${W2}px;transform-origin:${ox}px ${oy}px`;
    el.innerHTML = `<svg viewBox="-10 -46 56 56" width="${W2}" height="${W2}" style="overflow:visible">${dartMarkup(L.color).replace(/<g class="gl-dart-shadow">.*?<\/g>/, "").replace(/<circle[^>]*\/>/, "")}</svg>`;
    document.body.appendChild(el);
    const mx = (sx + tx) / 2, my = Math.min(sy, ty) - 90;
    const anim = el.animate([
      { transform: "translate(0,0) scale(2.6) rotate(18deg)", filter: "drop-shadow(14px 22px 10px rgba(0,0,0,.22))", offset: 0 },
      { transform: `translate(${mx - sx}px,${my - sy}px) scale(1.7) rotate(6deg)`, filter: "drop-shadow(8px 14px 6px rgba(0,0,0,.2))", offset: 0.5 },
      { transform: `translate(${tx - sx}px,${ty - sy}px) scale(1) rotate(0deg)`, filter: "drop-shadow(1px 2px 1px rgba(0,0,0,.2))", offset: 1 }
    ], { duration: 560, easing: "cubic-bezier(.5,0,.75,.4)" });
    return new Promise((res) => {
      anim.onfinish = () => {
        el.remove();
        res({ x: tx - sr.left, y: ty - sr.top, tip: pp });
      };
    });
  };
  const adopt = async (s) => {
    const v = valOf(s);
    const el = cardRefs.current[s.id];
    if (el) el.classList.add("gl-sent");
    const wasDone = layerDone(s.layer), before = doneCount;
    const hit = await fly(s, el);
    setFresh((f) => ({ ...f, [s.id]: true }));
    const sv = svgRef.current;
    if (sv) {
      sv.classList.remove("gl-thud");
      void sv.getBoundingClientRect();
      sv.classList.add("gl-thud");
    }
    onAdopt(s, v);
    setLit((x) => ({ ...x, [s.layer]: Date.now() }));
    if (hit) {
      const p = { id: Date.now(), ...hit, color: LAYER[s.layer].color, text: wasDone ? "+1" : "点亮" };
      setPlus((x) => x.concat(p));
      setTimeout(() => setPlus((x) => x.filter((y) => y !== p)), 1100);
    }
    if (el) el.classList.remove("gl-sent");
    if (!wasDone && before + 1 === LAYERS.length) {
      setTimeout(() => {
        setLocked(true);
        const r = svgRef.current && svgRef.current.getBoundingClientRect();
        if (r && celebrate) celebrate(r.left + r.width / 2, r.top + r.height / 2, true);
      }, 450);
    }
  };
  const shuffle = (s) => {
    setFlip((f) => ({ ...f, [s.id]: (f[s.id] || 0) + 1 }));
    setTimeout(() => setAlt((a) => ({ ...a, [s.id]: (a[s.id] || 0) + 1 })), 230);
  };
  const step = (s, dir) => {
    const n = s.num, cur = valOf(s);
    const v = Math.round(Math.min(n.max, Math.max(n.min, cur + dir * n.step)) * 100) / 100;
    setDraft((d) => ({ ...d, [s.id]: v }));
  };
  const box = rootRect || { left: 0, width: window.innerWidth };
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-overlay" + (closing ? " out" : ""), style: { left: box.left, width: box.width }, role: "dialog", "aria-modal": "true", "aria-label": "我的目标" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-backdrop", onClick: onClose }), /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-sheet" }, /* @__PURE__ */ import_react6.default.createElement("header", { className: "gl-head" }, /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("h2", { style: { margin: 0, fontSize: 26, fontWeight: 650, letterSpacing: "-0.02em" } }, "把日子当成一局游戏"), /* @__PURE__ */ import_react6.default.createElement("p", { style: { margin: "6px 0 0", fontSize: 14, color: "var(--ink2)", lineHeight: 1.6, maxWidth: 620 } }, "六层目标，从靶心的每天一圈圈往外。下面的建议是按你记下的数据算的，觉得合适就采纳，数字可以先调。结构参考 Dan Koe《How to fix your entire life in 1 day》。")), /* @__PURE__ */ import_react6.default.createElement("button", { className: "lf-icon", onClick: onClose, "aria-label": "关闭目标", style: { width: 40, height: 40, borderRadius: 20, background: "var(--fill)", color: "var(--ink)", flex: "none" } }, /* @__PURE__ */ import_react6.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react6.default.createElement("path", { d: "M6 6l12 12M18 6L6 18" })))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-body" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-target-col" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-target" + (locked ? " locked" : "") }, /* @__PURE__ */ import_react6.default.createElement("svg", { ref: svgRef, viewBox: "0 0 360 360", width: "100%", role: "img", "aria-label": "六层目标，已点亮 " + doneCount + " 层" }, LAYERS.slice().reverse().map((L, i) => {
    const on = layerDone(L.key), isRule = L.key === "rules";
    return /* @__PURE__ */ import_react6.default.createElement("g", { key: L.key, className: "gl-ring" + (on ? " on" : "") + (hot === L.key ? " hot" : ""), style: { "--c": L.color, animationDelay: (LAYERS.length - 1 - i) * 0.09 + "s" } }, L.key === "daily" ? /* @__PURE__ */ import_react6.default.createElement("circle", { cx: "180", cy: "180", r: L.r - 4, className: "gl-core", style: { fill: on ? L.color : "var(--fill)" } }) : null, /* @__PURE__ */ import_react6.default.createElement(
      "circle",
      {
        cx: "180",
        cy: "180",
        r: L.r,
        fill: "none",
        pathLength: "1",
        style: { stroke: on ? L.color : "var(--line)" },
        strokeWidth: isRule ? 2.5 : 14,
        strokeDasharray: isRule ? "0.012 0.012" : void 0,
        strokeOpacity: on ? L.key === "anti" ? 0.85 : 1 : 1,
        className: "gl-band" + (isRule ? " dash" : "")
      }
    ), lit[L.key] && /* @__PURE__ */ import_react6.default.createElement("circle", { key: lit[L.key], cx: "180", cy: "180", r: L.r, fill: "none", stroke: L.color, strokeWidth: "14", className: "gl-flash" }));
  }), plus.map((p) => /* @__PURE__ */ import_react6.default.createElement("g", { key: "hit" + p.id, transform: `translate(${p.tip.x} ${p.tip.y})`, style: { color: p.color }, className: "gl-impact" }, /* @__PURE__ */ import_react6.default.createElement("circle", { r: "4", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "gl-ripple" }), [0, 1, 2, 3, 4].map((j) => {
    const a = (150 + j * 32) * Math.PI / 180;
    return /* @__PURE__ */ import_react6.default.createElement("path", { key: j, d: `M${(Math.cos(a) * 5).toFixed(1)},${(Math.sin(a) * 5).toFixed(1)} L${(Math.cos(a) * 9).toFixed(1)},${(Math.sin(a) * 9).toFixed(1)}`, stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", className: "gl-chip", style: { "--dx": (Math.cos(a) * 7).toFixed(1) + "px", "--dy": (Math.sin(a) * 7).toFixed(1) + "px" } });
  }))), LAYERS.map((L, li) => picks(L.key).map((s, i) => {
    const q = pipPos(L.key, i);
    return /* @__PURE__ */ import_react6.default.createElement("g", { key: s.id, transform: `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})` }, /* @__PURE__ */ import_react6.default.createElement(
      "g",
      {
        className: "gl-dart" + (fresh[s.id] === true ? " thrown" : fresh[s.id] ? " still" : ""),
        style: { animationDelay: fresh[s.id] ? "0s" : 0.55 + li * 0.07 + i * 0.05 + "s" },
        onAnimationEnd: (e) => {
          if (e.animationName === "gl-wobble") setFresh((f) => ({ ...f, [s.id]: "done" }));
        },
        dangerouslySetInnerHTML: { __html: `<title>${L.game}：${s.title}</title>` + dartMarkup(L.color) }
      }
    ));
  })), /* @__PURE__ */ import_react6.default.createElement("g", { className: "gl-core-text" }, /* @__PURE__ */ import_react6.default.createElement("text", { x: "180", y: locked ? 186 : 182, textAnchor: "middle", fontSize: "15", fontWeight: "700", style: { fill: layerDone("daily") ? "#fff" : "var(--ink3)" } }, locked ? "开始" : doneCount + "/6"), !locked && /* @__PURE__ */ import_react6.default.createElement("text", { x: "180", y: "198", textAnchor: "middle", fontSize: "9.5", fontWeight: "600", style: { fill: layerDone("daily") ? "rgba(255,255,255,.85)" : "var(--ink3)" } }, "层点亮")), plus.map((p) => {
    return /* @__PURE__ */ import_react6.default.createElement("text", { key: p.id, x: p.tip.x + 20, y: p.tip.y - 34, textAnchor: "middle", fontSize: "15", fontWeight: "800", fill: p.color, className: "gl-plus" }, p.text);
  }))), /* @__PURE__ */ import_react6.default.createElement("p", { className: "gl-tally" }, /* @__PURE__ */ import_react6.default.createElement("b", null, "采纳 ", itemCount, " 项"), /* @__PURE__ */ import_react6.default.createElement("i", null, "·"), "点亮 ", /* @__PURE__ */ import_react6.default.createElement("b", null, doneCount, "/6"), " 层", /* @__PURE__ */ import_react6.default.createElement("span", null, "每采纳一项，就往那一圈扔一支飞镖。一圈上有了第一支，这层就点亮。")), /* @__PURE__ */ import_react6.default.createElement("ul", { className: "gl-legend" }, LAYERS.map((L) => /* @__PURE__ */ import_react6.default.createElement("li", { key: L.key, onMouseEnter: () => setHot(L.key), onMouseLeave: () => setHot(null), className: layerDone(L.key) ? "on" : "" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "gl-dot", style: { background: layerDone(L.key) ? L.color : "var(--line)" } }), /* @__PURE__ */ import_react6.default.createElement("b", null, L.game), /* @__PURE__ */ import_react6.default.createElement("span", null, L.name), layerDone(L.key) && /* @__PURE__ */ import_react6.default.createElement("em", { className: "gl-count", style: { background: L.color } }, picks(L.key).length)))), locked && /* @__PURE__ */ import_react6.default.createElement("p", { className: "gl-locked-msg" }, "六层都定好了。现在每一天，都是这局游戏里的一回合。")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-deck" }, LAYERS.map((L) => {
    const list = suggestions.filter((s) => s.layer === L.key);
    if (!list.length) return null;
    return /* @__PURE__ */ import_react6.default.createElement("section", { key: L.key, className: "gl-group", onMouseEnter: () => setHot(L.key), onMouseLeave: () => setHot(null) }, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "gl-group-title" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "gl-tag", style: { background: L.color } }, L.game), L.name), /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-cards" }, list.map((s, i) => {
      const v = valOf(s), done = !!adopted[s.id];
      const why = typeof s.why === "function" ? s.why(v) : s.why;
      return /* @__PURE__ */ import_react6.default.createElement("div", { key: s.id, ref: (n) => {
        cardRefs.current[s.id] = n;
      }, className: "gl-card" + (done ? " done" : ""), style: { "--c": L.color, animationDelay: 0.25 + i * 0.06 + "s" } }, /* @__PURE__ */ import_react6.default.createElement("div", { key: flip[s.id] || 0, className: flip[s.id] ? "gl-flip" : "" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-card-title" }, s.title), s.num ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-num-row" }, /* @__PURE__ */ import_react6.default.createElement("button", { className: "gl-step", onClick: () => step(s, -1), "aria-label": "减少" + s.title, disabled: done }, "−"), /* @__PURE__ */ import_react6.default.createElement("span", { key: v, className: "gl-num" }, s.num.fmt ? s.num.fmt(v) : num(v), /* @__PURE__ */ import_react6.default.createElement("small", null, s.num.fmt && s.num.unit === "元" ? "" : " " + s.num.unit)), /* @__PURE__ */ import_react6.default.createElement("button", { className: "gl-step", onClick: () => step(s, 1), "aria-label": "增加" + s.title, disabled: done }, "+"), s.after && /* @__PURE__ */ import_react6.default.createElement("span", { className: "gl-after" }, s.after(v))) : /* @__PURE__ */ import_react6.default.createElement("p", { className: "gl-text" }, v), /* @__PURE__ */ import_react6.default.createElement("p", { className: "gl-why" }, why)), /* @__PURE__ */ import_react6.default.createElement("div", { className: "gl-actions" }, done ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("span", { className: "gl-adopted" }, /* @__PURE__ */ import_react6.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react6.default.createElement("path", { d: "M5 12.5l4.5 4.5L19 7.5", pathLength: "1", className: "lf-tick" })), "已采纳"), /* @__PURE__ */ import_react6.default.createElement("button", { className: "gl-link", onClick: () => onUndo(s) }, "撤回")) : /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("button", { className: "gl-adopt", onClick: () => adopt(s) }, "采纳"), s.texts && s.texts.length > 1 && /* @__PURE__ */ import_react6.default.createElement("button", { className: "gl-link", onClick: () => shuffle(s) }, "换一个"))));
    })));
  })))));
}
function GoalsButton({ goals, suggestions, onClick }) {
  const adopted = goals.adopted || {};
  const done = LAYERS.filter((L) => suggestions.some((s) => s.layer === L.key && adopted[s.id])).length;
  const items = suggestions.filter((s) => adopted[s.id]).length;
  return /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "gl-entry" + (done === 0 ? " fresh" : ""), "data-tip": done === 0 ? "定个目标" : "目标 " + items + " 项 · 点亮 " + done + "/6 层", onClick, "aria-label": "我的目标，采纳 " + items + " 项，点亮 " + done + " 层" }, /* @__PURE__ */ import_react6.default.createElement("svg", { width: "22", height: "22", viewBox: "0 0 36 36", "aria-hidden": "true" }, LAYERS.slice(0, 5).reverse().map((L, i) => {
    const on = suggestions.some((s) => s.layer === L.key && adopted[s.id]);
    const r = 4 + (4 - i) * 3.2;
    return /* @__PURE__ */ import_react6.default.createElement("circle", { key: L.key, cx: "18", cy: "18", r, fill: "none", stroke: on ? L.color : "rgba(244,245,241,.35)", strokeWidth: "2.2" });
  }), /* @__PURE__ */ import_react6.default.createElement("circle", { cx: "18", cy: "18", r: "2.4", fill: done ? "#F2994A" : "rgba(244,245,241,.6)" })), /* @__PURE__ */ import_react6.default.createElement("span", null, done === 0 ? "定个目标" : "目标 " + items + " 项"));
}
var GOALS_CSS = `
.gl-entry{position:relative;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px 0 10px;border-radius:19px;border:0;background:rgba(255,255,255,.08);color:#F4F5F1;font:inherit;font-size:13.5px;cursor:pointer;transition:background .2s,transform .2s}
.gl-entry:hover{background:rgba(255,255,255,.16);transform:translateY(-1px)}
.gl-entry:hover svg{animation:gl-spin 1.2s cubic-bezier(.2,.8,.2,1)}
.gl-entry.fresh::after{content:'';position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:4px;background:#F2994A;animation:lf-ping 2s ease-out infinite}
@keyframes gl-spin{to{transform:rotate(360deg)}}
.gl-overlay{position:fixed;top:0;bottom:0;z-index:50;display:flex;align-items:flex-end;justify-content:center}
.gl-backdrop{position:absolute;inset:0;background:rgba(31,35,40,.38);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:gl-fade .35s ease both}
.gl-sheet{position:relative;width:min(1240px,calc(100% - 32px));height:calc(100% - 40px);background:var(--sheet);border-radius:32px 32px 0 0;box-shadow:0 -20px 60px rgba(31,35,40,.25);display:flex;flex-direction:column;overflow:hidden;animation:gl-up .55s cubic-bezier(.2,.9,.25,1.05) both}
.gl-overlay.out .gl-sheet{animation:gl-down .38s cubic-bezier(.4,0,.6,1) both}
.gl-overlay.out .gl-backdrop{animation:gl-fade .38s ease reverse both}
@keyframes gl-up{from{transform:translateY(100%)}to{transform:none}}
@keyframes gl-down{to{transform:translateY(100%)}}
@keyframes gl-fade{from{opacity:0}to{opacity:1}}
.gl-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding:28px 32px 18px;color:var(--ink)}
.gl-body{flex:1;min-height:0;display:flex;gap:28px;padding:0 32px 32px;overflow:hidden}
.gl-target-col{flex:0 0 340px;display:flex;flex-direction:column;gap:14px;color:var(--ink)}
.gl-target{width:100%;transition:transform 1s cubic-bezier(.3,1.4,.5,1)}
.gl-target svg{overflow:visible}
.gl-target.locked{transform:rotate(360deg)}
@keyframes gl-draw{0%{stroke-dasharray:1;stroke-dashoffset:1}99%{stroke-dasharray:1;stroke-dashoffset:0}100%{stroke-dasharray:none;stroke-dashoffset:0}}
@keyframes gl-fadein{from{opacity:0}to{opacity:1}}
.gl-ring .gl-band.dash{stroke-dasharray:.012 .012!important;stroke-dashoffset:0;animation:gl-fadein .6s ease both!important}
.gl-ring .gl-band{stroke-dasharray:1;stroke-dashoffset:1;animation:gl-draw .6s cubic-bezier(.4,0,.2,1) forwards;animation-delay:inherit;transition:stroke .4s,stroke-width .25s}
.gl-ring.hot .gl-band:not(.dash){stroke-width:18}
.gl-ring.hot .gl-band.dash{stroke-width:4}
.gl-ring[style] .gl-band{animation-delay:inherit}
.gl-ring .gl-core{transform-origin:180px 180px;transition:fill .4s;animation:gl-pop .5s cubic-bezier(.2,.9,.3,1.4) both}
.gl-target.locked .gl-core{animation:gl-beat 1.6s ease-in-out infinite}
@keyframes gl-pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes gl-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.gl-flash{transform-origin:180px 180px;animation:gl-flash .7s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-flash{0%{opacity:.9;stroke-width:14}100%{opacity:0;stroke-width:34}}
.gl-plus{animation:gl-plus 1.1s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-plus{0%{opacity:0;transform:translateY(8px)}20%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-18px)}}
.gl-flying{position:fixed;z-index:60;pointer-events:none;will-change:transform}
.gl-dart{transform-box:view-box;transform-origin:0 0;animation:gl-dartin .45s cubic-bezier(.2,.9,.3,1.3) both}
.gl-dart.still{animation:none}
.gl-dart.thrown{animation:gl-wobble .9s linear both}
@keyframes gl-dartin{from{opacity:0;transform:scale(1.4) rotate(10deg)}to{opacity:1;transform:none}}
@keyframes gl-wobble{0%{transform:scale(1.08) rotate(0)}8%{transform:scale(.9,1.04) rotate(-11deg)}22%{transform:rotate(8deg)}36%{transform:rotate(-5deg)}50%{transform:rotate(3deg)}64%{transform:rotate(-1.6deg)}80%{transform:rotate(.6deg)}100%{transform:none}}
.gl-dart .gl-dart-shadow{transition:opacity .3s}
.gl-dart:hover{filter:brightness(1.15)}
.gl-thud{animation:gl-thud .32s cubic-bezier(.3,.7,.4,1)}
@keyframes gl-thud{0%{transform:none}25%{transform:translate(-2.5px,1.5px) scale(.992)}60%{transform:translate(1px,-.5px)}100%{transform:none}}
.gl-ripple{animation:gl-ripple .6s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-ripple{from{opacity:.9;transform:scale(.6)}to{opacity:0;transform:scale(4.2)}}
.gl-impact .gl-ripple,.gl-impact .gl-chip{transform-box:view-box;transform-origin:0 0}
.gl-chip{animation:gl-chip .5s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes gl-chip{from{opacity:1;transform:none}to{opacity:0;transform:translate(var(--dx),var(--dy))}}
.gl-orb{position:fixed;z-index:60;width:26px;height:26px;border-radius:50%;pointer-events:none;box-shadow:0 0 0 6px rgba(255,255,255,.6),0 8px 24px rgba(0,0,0,.25)}
.gl-pip{animation:gl-pippop .5s cubic-bezier(.2,.9,.3,1.6) both}
@keyframes gl-pippop{0%{transform:scale(0) rotate(-120deg)}60%{transform:scale(1.6) rotate(20deg)}100%{transform:scale(1) rotate(0)}}
.gl-target:not(.locked) .gl-pip:hover{transform:scale(1.3)}
.gl-count{margin-left:auto;font-style:normal;font-size:11px;font-weight:700;color:#fff;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:inline-grid;place-items:center;box-sizing:border-box}
.gl-legend li{white-space:nowrap}
.gl-tally{margin:4px 0 12px;font-size:13.5px;color:var(--ink);display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 6px}
.gl-tally b{font-weight:650}.gl-tally i{font-style:normal;color:var(--ink3)}
.gl-tally span{flex-basis:100%;font-size:12px;color:var(--ink3);line-height:1.5}
.gl-legend{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}
.gl-legend li{display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 10px;border-radius:10px;transition:background .2s}
.gl-legend li:hover{background:var(--rule)}
.gl-legend b{font-weight:600}.gl-legend span:not(.gl-dot){color:var(--ink2)}
.gl-dot{width:9px;height:9px;border-radius:5px;flex:none;transition:background .4s}
.gl-locked-msg{margin:4px 0 0;font-size:14px;line-height:1.6;color:#1E6E4C;animation:lf-rise .5s .3s both}
.gl-deck{flex:1;min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 6px 40px 2px;display:flex;flex-direction:column;gap:26px;color:var(--ink)}
.gl-group-title{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:15px;font-weight:600}
.gl-tag{color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px}
.gl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.gl-card{position:relative;background:var(--card);border-radius:22px;padding:18px 18px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;box-shadow:0 1px 0 rgba(31,35,40,.04);transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,opacity .3s;animation:lf-rise .5s cubic-bezier(.2,.8,.2,1) both;perspective:800px}
.gl-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px -12px rgba(31,35,40,.25)}
.gl-card::before{content:'';position:absolute;left:0;top:18px;bottom:18px;width:0;border-radius:0 3px 3px 0;background:var(--c);transition:width .3s}
.gl-card.done{background:color-mix(in srgb,var(--c) 7%,var(--card))}
.gl-card.done::before{width:4px}
.gl-card.gl-sent{transform:scale(.96);opacity:.7}
.gl-flip{animation:gl-flip .46s cubic-bezier(.4,0,.2,1)}
@keyframes gl-flip{0%{transform:rotateY(0)}49%{transform:rotateY(90deg);opacity:.2}51%{transform:rotateY(-90deg);opacity:.2}100%{transform:rotateY(0)}}
.gl-card-title{font-size:13px;color:var(--ink2);margin-bottom:6px}
.gl-num-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.gl-num{font-size:30px;font-weight:600;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;animation:gl-tick .25s cubic-bezier(.2,.9,.3,1.4)}
.gl-num small{font-size:13px;font-weight:400;color:var(--ink2);letter-spacing:0}
@keyframes gl-tick{from{transform:translateY(-6px);opacity:.4}to{transform:none;opacity:1}}
.gl-step{width:30px;height:30px;border-radius:15px;border:0;background:var(--fill);color:var(--ink);font-size:17px;line-height:1;cursor:pointer;transition:background .2s,transform .15s}
.gl-step:hover:not(:disabled){background:color-mix(in srgb,var(--c) 18%,var(--card))}
.gl-step:active:not(:disabled){transform:scale(.88)}
.gl-step:disabled{opacity:.35;cursor:default}
.gl-after{font-size:12.5px;padding:3px 9px;border-radius:10px;background:color-mix(in srgb,var(--c) 12%,var(--card));color:color-mix(in srgb,var(--c) 60%,var(--ink))}
.gl-text{margin:0;font-size:16px;line-height:1.55;font-weight:500}
.gl-why{margin:8px 0 0;font-size:13px;line-height:1.6;color:var(--ink2)}
.gl-actions{display:flex;align-items:center;gap:10px}
.lf-root .gl-adopt,.gl-adopt{height:34px;padding:0 16px;border-radius:17px;border:0;background:var(--c);color:#fff;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:transform .15s,filter .2s}
.gl-adopt:hover{filter:brightness(1.08);transform:translateY(-1px)}
.gl-adopt:active{transform:scale(.94)}
.gl-link{border:0;background:transparent;color:var(--ink2);font:inherit;font-size:13px;cursor:pointer;padding:6px 4px}
.gl-link:hover{color:var(--ink);text-decoration:underline}
.gl-adopted{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:color-mix(in srgb,var(--c) 70%,var(--ink))}
.lf-vision{display:inline-flex;align-items:center;gap:8px;margin-top:10px;font-size:14px;color:rgba(244,245,241,.85);animation:lf-rise .6s both}
.lf-vision i{width:6px;height:6px;border-radius:3px;background:#B9A6F5;box-shadow:0 0 0 4px rgba(124,92,224,.25)}
@media (max-width:900px){.gl-body{flex-direction:column;overflow-y:auto}.gl-target-col{flex:none;max-width:360px;align-self:center}.gl-deck{overflow:visible}}
@media (prefers-reduced-motion:reduce){.gl-sheet,.gl-card,.gl-ring .gl-band,.gl-target{animation:none!important;transition:none!important}.gl-ring .gl-band{stroke-dashoffset:0}}
`;

// src/App.jsx
var KEY = "dsh-rigui:v1";
var FOODS_KEY = "dsh-rigui:foods";
var GOALS_KEY = "dsh-rigui:goals";
var loadGoals = () => {
  try {
    const g = JSON.parse(localStorage.getItem(GOALS_KEY));
    if (g && typeof g === "object") return { adopted: {}, texts: {}, ...g };
  } catch (e) {
  }
  return { adopted: {}, texts: {} };
};
var NUM_KEYS = ["kcal", "budget", "sleep", "workoutsPerWeek", "weight", "monthWeight"];
var loadMine = () => {
  try {
    return JSON.parse(localStorage.getItem(FOODS_KEY)) || {};
  } catch (e) {
    return {};
  }
};
async function askAI(text, mine, weightKg, signal) {
  const d = /* @__PURE__ */ new Date(), wk = "日一二三四五六"[d.getDay()];
  const nowStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + " 周" + wk;
  const res = await fetch("api/rigui", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: "parse", payload: { text, now: nowStr, weightKg, mine } }), signal });
  if (!res.ok) throw new Error(res.status === 404 ? "AI 接口还没加载，重启一次 DSH" : "AI 接口出错 " + res.status);
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "AI 没给出结果");
  return { result: j.result, model: j.model };
}
var C2 = { sleep: "#3D4FB8", move: "#1E9E6A", food: "#F2994A", money: "#7C5CE0", body: "#0E8A8A", time: "#1F2328", link: "#E5484D" };
function cardsFor(records, now = Date.now()) {
  const c = /* @__PURE__ */ new Set();
  const today = (t) => startOfDay(t) === startOfDay(now);
  records.forEach((r) => {
    if (r.type === "meal") {
      c.add("energy");
      c.add("timeline");
      if (today(r.t)) c.add("dial");
    }
    if (r.type === "expense" || r.type === "income") {
      c.add("money");
      c.add("timeline");
      if (today(r.t)) c.add("dial");
    }
    if (r.type === "workout") {
      c.add("move");
      c.add("energy");
      c.add("timeline");
      c.add("dial");
    }
    if (r.type === "sleep") {
      c.add("sleep");
      c.add("dial");
      c.add("next");
    }
    if (r.type === "weight") {
      c.add("body");
      c.add("timeline");
    }
    if (r.type === "event") {
      c.add("week");
      c.add("next");
      if (today(r.t)) c.add("dial");
    }
    if (r.type === "todo") {
      c.add("todos");
      if (r.amount) c.add("money");
    }
  });
  if (records.length) c.add("insights");
  return c;
}
var CARD_COLOR = { energy: C2.food, dial: "#F4F5F1", timeline: C2.time, money: C2.money, move: C2.move, sleep: C2.sleep, next: C2.move, week: C2.time, todos: C2.time, body: C2.body, insights: C2.link };
function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && Array.isArray(v.records)) return v;
  } catch (e) {
  }
  return { records: seed(Date.now()), sample: true };
}
function Num({ value, format = num, className = "lf-num", style }) {
  const [shown, setShown] = (0, import_react7.useState)(value);
  const from = (0, import_react7.useRef)(value);
  (0, import_react7.useEffect)(() => {
    const a = from.current, b = value;
    if (a === b) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(b);
      from.current = b;
      return;
    }
    let raf2, t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / 800), e = 1 - Math.pow(1 - p, 3);
      setShown(a + (b - a) * e);
      if (p < 1) raf2 = requestAnimationFrame(step);
      else from.current = b;
    };
    raf2 = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf2);
      from.current = b;
    };
  }, [value]);
  return /* @__PURE__ */ import_react7.default.createElement("span", { className, style }, format(shown));
}
var Icon = {
  send: /* @__PURE__ */ import_react7.default.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M5 12h14M13 6l6 6-6 6" })),
  x: /* @__PURE__ */ import_react7.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M6 6l12 12M18 6L6 18" })),
  check: /* @__PURE__ */ import_react7.default.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M5 12.5l4.5 4.5L19 7.5" })),
  arrow: /* @__PURE__ */ import_react7.default.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M5 12h14M13 6l6 6-6 6" }))
};
function Dial({ S: S2, size = 380, hover, setHover }) {
  const c = size / 2, R = c - 42;
  const pt = (r, h) => {
    const a = h / 24 * Math.PI * 2;
    return [c + r * Math.sin(a), c - r * Math.cos(a)];
  };
  const arc = (r, h1, h2) => {
    if (h2 < h1) h2 += 24;
    if (h2 - h1 >= 23.99) h2 = h1 + 23.99;
    const [x1, y1] = pt(r, h1), [x2, y2] = pt(r, h2);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${h2 - h1 > 12 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const now = hourOf(S2.now);
  const arcs = [];
  if (S2.lastNight) {
    const b = hourOf(S2.lastNight.t), w = b + S2.lastNight.hours;
    arcs.push({ k: "sleep", h1: b, h2: w % 24, color: C2.sleep, label: "睡了 " + fmtHM(S2.lastNight.hours), sub: fmtTime(S2.lastNight.t) + " 入睡" });
  }
  S2.todayEvents.forEach((e) => {
    arcs.push({ k: e.id, h1: hourOf(e.t), h2: hourOf(e.end || e.t + 36e5), color: e.domain === "move" ? C2.move : "#C9CDC5", label: e.title, sub: fmtTime(e.t) + " – " + fmtTime(e.end), future: e.t > S2.now, ring: 0 });
  });
  S2.workouts.filter((w) => !S2.todayEvents.some((e) => e.id === w.from)).forEach((w) => {
    arcs.push({ k: w.id, h1: hourOf(w.t), h2: hourOf(w.t) + w.minutes / 60, color: C2.move, label: w.title, sub: "消耗 " + w.kcal + " 千卡" });
  });
  const meals = S2.meals.map((m) => ({ k: m.id, h: hourOf(m.t), label: m.title, sub: MEAL_NAME[m.meal] + " · " + m.kcal + " 千卡" }));
  const spends = [];
  S2.timeline.forEach((g) => g.items.filter((r) => r.type === "expense").forEach((r) => spends.push({ k: r.id, h: hourOf(r.t), label: r.title, sub: money(r.amount) + " · " + r.cat })));
  const ticks = [];
  for (let i = 0; i < 96; i++) {
    const h = i / 4, major = i % 24 === 0, hour = i % 4 === 0;
    const [x1, y1] = pt(major ? R + 20 : hour ? R + 25 : R + 28, h), [x2, y2] = pt(R + 32, h);
    ticks.push(/* @__PURE__ */ import_react7.default.createElement("line", { key: i, x1, y1, x2, y2, stroke: major ? "#F4F5F1" : hour ? "rgba(244,245,241,.45)" : "rgba(244,245,241,.18)", strokeWidth: major ? 2 : 1, strokeLinecap: "round" }));
  }
  const [hx1, hy1] = pt(R - 18, now), [hx2, hy2] = pt(R + 36, now);
  const hv = hover && [...arcs, ...meals, ...spends].find((a) => a.k === hover);
  return /* @__PURE__ */ import_react7.default.createElement("div", { style: { position: "relative", width: "100%", maxWidth: size, aspectRatio: "1 / 1", justifySelf: "center" } }, /* @__PURE__ */ import_react7.default.createElement("svg", { viewBox: `0 0 ${size} ${size}`, width: "100%", height: "100%", role: "img", "aria-label": "今天的 24 小时：" + arcs.map((a) => a.label).join("，") }, /* @__PURE__ */ import_react7.default.createElement("circle", { cx: c, cy: c, r: R, fill: "none", stroke: "rgba(255,255,255,.07)", strokeWidth: "20" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: arc(R, 0, now), fill: "none", stroke: "rgba(255,255,255,.1)", strokeWidth: "20", className: "lf-dialdraw", pathLength: "1" }), ticks, arcs.map((a, i) => /* @__PURE__ */ import_react7.default.createElement(
    "path",
    {
      key: a.k,
      d: arc(R, a.h1, a.h2),
      fill: "none",
      stroke: a.color,
      strokeWidth: hover === a.k ? 26 : 20,
      strokeLinecap: "round",
      opacity: a.future ? 0.55 : 1,
      strokeDasharray: a.future ? void 0 : void 0,
      className: "lf-arc lf-dialdraw",
      pathLength: "1",
      style: { animationDelay: 0.25 + i * 0.12 + "s", cursor: "pointer" },
      onMouseMove: () => hover !== a.k && setHover(a.k),
      onMouseLeave: () => setHover(null)
    }
  )), meals.map((m, i) => {
    const [x, y] = pt(R - 30, m.h);
    return /* @__PURE__ */ import_react7.default.createElement("circle", { key: m.k, cx: x, cy: y, r: hover === m.k ? 9 : 6.5, fill: C2.food, className: "lf-enter", style: { animationDelay: 0.9 + i * 0.08 + "s", cursor: "pointer", transition: "r .2s" }, onMouseMove: () => hover !== m.k && setHover(m.k), onMouseLeave: () => setHover(null) });
  }), spends.map((s, i) => {
    const [x, y] = pt(R - 50, s.h);
    const z = hover === s.k ? 13 : 9;
    return /* @__PURE__ */ import_react7.default.createElement("rect", { key: s.k, x: x - z / 2, y: y - z / 2, width: z, height: z, rx: "2.5", fill: C2.money, className: "lf-enter", style: { animationDelay: 1 + i * 0.08 + "s", cursor: "pointer" }, onMouseMove: () => hover !== s.k && setHover(s.k), onMouseLeave: () => setHover(null) });
  }), [0, 6, 12, 18].map((h) => {
    const [x, y] = pt(R - 64, h);
    return /* @__PURE__ */ import_react7.default.createElement("text", { key: h, x, y, textAnchor: "middle", dominantBaseline: "central", fontSize: "12", fill: "rgba(244,245,241,.5)" }, h);
  }), /* @__PURE__ */ import_react7.default.createElement("line", { x1: hx1, y1: hy1, x2: hx2, y2: hy2, stroke: "#F4F5F1", strokeWidth: "3", strokeLinecap: "round" }), /* @__PURE__ */ import_react7.default.createElement("circle", { cx: hx2, cy: hy2, r: "6", fill: "#F4F5F1" }), /* @__PURE__ */ import_react7.default.createElement("circle", { cx: hx2, cy: hy2, r: "11", fill: "none", stroke: "#F4F5F1", strokeOpacity: ".4", style: { animation: "lf-breathe 2.4s ease-in-out infinite" } })), /* @__PURE__ */ import_react7.default.createElement("div", { style: { position: "absolute", inset: "32%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 4, pointerEvents: "none" } }, hv ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 22, fontWeight: 600, color: "#F4F5F1", lineHeight: 1.15 } }, hv.label), /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, color: "rgba(244,245,241,.6)" } }, hv.sub)) : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-num", style: { fontSize: 52, fontWeight: 500, color: "#F4F5F1", lineHeight: 1 } }, fmtTime(S2.now)), /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, color: "rgba(244,245,241,.6)" } }, "今天过去了 ", Math.round(now / 24 * 100), "%"))));
}
function AiBadge({ status, model, error }) {
  if (status === "wait" || status === "loading") return /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 8 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-think" }, /* @__PURE__ */ import_react7.default.createElement("i", null), /* @__PURE__ */ import_react7.default.createElement("i", null), /* @__PURE__ */ import_react7.default.createElement("i", null)), "AI 正在识别");
  if (status === "done") return /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 6 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: "#5FD3A2" } }), "AI 识别", model ? " · " + model : "", "，数字不对可以直接改");
  if (status === "error") return /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 6 }, title: error }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: "#E5A84D" } }), "AI 暂时用不了（", error, "），先按本地规则");
  return /* @__PURE__ */ import_react7.default.createElement("span", null, "本地预判");
}
var LAYOUT_KEY = "dsh-rigui:layout";
var ROW_H = 116;
var GAP = 14;
var WIDGETS = {
  energy: { name: "今天还能吃", w: 4, h: 2, minW: 3, minH: 2 },
  money: { name: "这个月还能花", w: 4, h: 2, minW: 3, minH: 2 },
  next: { name: "接下来", w: 4, h: 2, minW: 3, minH: 2 },
  timeline: { name: "今天记下的", w: 5, h: 6, minW: 4, minH: 3 },
  sleep: { name: "睡眠", w: 4, h: 3, minW: 3, minH: 3 },
  move: { name: "运动", w: 3, h: 3, minW: 3, minH: 2 },
  insights: { name: "它们之间的关系", w: 4, h: 3, minW: 3, minH: 2 },
  body: { name: "体重", w: 3, h: 3, minW: 3, minH: 2 },
  week: { name: "接下来七天", w: 8, h: 3, minW: 6, minH: 3 },
  todos: { name: "要做的事", w: 4, h: 3, minW: 3, minH: 2 }
};
var DEFAULT_LAYOUT = { order: Object.keys(WIDGETS), size: {} };
function loadLayout() {
  try {
    const v = JSON.parse(localStorage.getItem(LAYOUT_KEY));
    if (v && Array.isArray(v.order)) {
      const order = v.order.filter((id) => WIDGETS[id]).concat(Object.keys(WIDGETS).filter((id) => !v.order.includes(id)));
      return { order, size: v.size || {} };
    }
  } catch (e) {
  }
  return DEFAULT_LAYOUT;
}
var LayoutCtx = import_react7.default.createContext(null);
var FlipCtx = import_react7.default.createContext(null);
var clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
var Corner = /* @__PURE__ */ import_react7.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M20 10v10H10" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M20 20l-7-7" }));
function Card({ id, cls = "", bg, color, refs, flash, armed, hl, dim, children, idx = 0, style, floats, back }) {
  const [face, setFace] = (0, import_react7.useState)(0);
  const flipping = (0, import_react7.useRef)(false);
  const flip = () => {
    const n = el.current;
    if (!n || flipping.current) return;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFace((f) => 1 - f);
      return;
    }
    flipping.current = true;
    n.classList.add("lf-flipping");
    const dir = face ? -1 : 1;
    const a = n.animate([{ transform: "perspective(1000px) rotateY(0deg)" }, { transform: `perspective(1000px) rotateY(${90 * dir}deg) scale(.96)` }], { duration: 210, easing: "cubic-bezier(.55,0,.85,.45)" });
    a.onfinish = () => {
      setFace((f) => 1 - f);
      const b = n.animate([{ transform: `perspective(1000px) rotateY(${-90 * dir}deg) scale(.96)` }, { transform: `perspective(1000px) rotateY(${7 * dir}deg)`, offset: 0.68 }, { transform: "perspective(1000px) rotateY(0deg)" }], { duration: 420, easing: "cubic-bezier(.2,.8,.3,1)" });
      b.onfinish = () => {
        flipping.current = false;
        n.classList.remove("lf-flipping");
      };
    };
  };
  const onCardClick = (e) => {
    if (!back) return;
    if (e.target.closest("button,a,input,textarea,select,[role=button],.lf-grip,.lf-resize")) return;
    if (window.getSelection && String(window.getSelection())) return;
    flip();
  };
  const el = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    const n = el.current;
    if (!flash || !n) return;
    n.classList.remove("lf-enter");
    n.classList.remove("flash");
    void n.offsetWidth;
    n.classList.add("flash");
    const t = setTimeout(() => n.classList.remove("flash"), 1500);
    return () => clearTimeout(t);
  }, [flash]);
  (0, import_react7.useEffect)(() => bindHover(el.current), []);
  const [entered, setEntered] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    const t = setTimeout(() => setEntered(true), 1400);
    return () => clearTimeout(t);
  }, []);
  const L = (0, import_react7.useContext)(LayoutCtx);
  const W2 = L && WIDGETS[id];
  const [clip, setClip] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    const n = el.current;
    if (!n || !W2) return;
    const ro = new ResizeObserver(() => setClip(n.scrollHeight > n.clientHeight + 2));
    ro.observe(n);
    if (n.firstElementChild) ro.observe(n.firstElementChild);
    return () => ro.disconnect();
  }, [W2]);
  const lay = W2 ? L.place(id) : null;
  const dragging = W2 && L.active === id;
  return /* @__PURE__ */ import_react7.default.createElement(
    "section",
    {
      ref: (n) => {
        el.current = n;
        refs.current[id] = n;
      },
      "data-card": id,
      "data-face": face,
      onClick: onCardClick,
      className: ["lf-card", back ? "has-back" : "", entered ? "" : "lf-enter", W2 ? "lf-widget" : cls, armed ? "armed" : "", hl ? "hl" : "", dim ? "dim" : "", clip ? "clip" : "", dragging ? "lf-lifted" : ""].join(" "),
      style: Object.assign(
        { background: bg, color, "--c": CARD_COLOR[id] || "#1F2328", "--bgc": bg || "var(--card)", "--sheen-c": color && color !== "#1F2328" ? "rgba(255,255,255,.2)" : void 0, animationDelay: 0.15 + idx * 0.05 + "s" },
        lay ? { gridColumn: "span " + lay.span, gridRow: "span " + lay.h, order: lay.order } : null,
        W2 ? null : style
      )
    },
    W2 ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-widget-body", style }, /* @__PURE__ */ import_react7.default.createElement(FlipCtx.Provider, { value: flip }, face && back ? back : children)) : children,
    W2 && back && /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-flip", "aria-label": face ? "翻回正面" : "翻到背面，看看怎么算的", title: face ? "翻回去" : "看看怎么算的", onClick: flip }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M20 11a8 8 0 0 0-14.3-4.9L4 8" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M4 3v5h5" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M4 13a8 8 0 0 0 14.3 4.9L20 16" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M20 21v-5h-5" }))),
    W2 && /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement(
      "button",
      {
        type: "button",
        className: "lf-grip",
        "aria-label": "移动「" + W2.name + "」，方向键调整位置",
        title: "按住拖动",
        onPointerDown: (e) => L.startDrag(id, e),
        onKeyDown: (e) => L.keyMove(id, e)
      },
      /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-grip-bar" })
    ), /* @__PURE__ */ import_react7.default.createElement(
      "button",
      {
        type: "button",
        className: "lf-resize",
        "aria-label": "调整「" + W2.name + "」大小，方向键放大缩小",
        title: "拖动改变大小",
        onPointerDown: (e) => L.startResize(id, e),
        onKeyDown: (e) => L.keyResize(id, e)
      },
      Corner
    ), L.resizing === id && /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-size-tag" }, lay.w, " × ", lay.h)),
    /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sheen", "aria-hidden": "true" }),
    floats && floats.map((f, k) => /* @__PURE__ */ import_react7.default.createElement("span", { key: f.id, className: "lf-float", style: { color: f.color, top: 64 + k * 28 } }, f.text))
  );
}
function LifeApp() {
  const [db, setDb] = (0, import_react7.useState)(load);
  const [now, setNow] = (0, import_react7.useState)(Date.now());
  const [text, setText] = (0, import_react7.useState)("");
  const [mine, setMine] = (0, import_react7.useState)(loadMine);
  const [ai, setAi] = (0, import_react7.useState)({ text: "", status: "idle" });
  const [edits, setEdits] = (0, import_react7.useState)({});
  const aiCache = (0, import_react7.useRef)(/* @__PURE__ */ new Map()), aiInflight = (0, import_react7.useRef)(/* @__PURE__ */ new Map()), S0 = (0, import_react7.useRef)({}), mineRef = (0, import_react7.useRef)({});
  const [hover, setHover] = (0, import_react7.useState)(null);
  const [threads, setThreads] = (0, import_react7.useState)(null);
  const [flash, setFlash] = (0, import_react7.useState)({});
  const [focusInsight, setFocusInsight] = (0, import_react7.useState)(null);
  const [geo, setGeo] = (0, import_react7.useState)({ w: 0, h: 0 });
  const [toast, setToast] = (0, import_react7.useState)(null);
  const rootRef = (0, import_react7.useRef)(null), inputRef = (0, import_react7.useRef)(null), refs = (0, import_react7.useRef)({});
  (0, import_react7.useEffect)(() => {
    const t = setInterval(() => setNow(Date.now()), 3e4);
    return () => clearInterval(t);
  }, []);
  (0, import_react7.useEffect)(() => {
    if (document.querySelector("link[data-lf-font]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONT_HREF;
    l.setAttribute("data-lf-font", "");
    document.head.appendChild(l);
  }, []);
  (0, import_react7.useEffect)(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
    }
  }, [db]);
  (0, import_react7.useEffect)(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current && inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  (0, import_react7.useEffect)(() => {
    const root = rootRef.current;
    if (!root) return;
    let t, on = false;
    const onWheel = (e) => {
      const inner = e.target.closest && e.target.closest(".lf-inner-scroll");
      if (inner && inner.scrollHeight > inner.clientHeight + 1) {
        const atTop = inner.scrollTop <= 0, atEnd = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
        if (e.deltaY < 0 && !atTop || e.deltaY > 0 && !atEnd) return;
      }
      if (!on) {
        root.classList.add("lf-scrolling");
        on = true;
        setHover(null);
        setFocusInsight(null);
      }
      clearTimeout(t);
      t = setTimeout(() => {
        root.classList.remove("lf-scrolling");
        on = false;
      }, 160);
    };
    root.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      root.removeEventListener("wheel", onWheel);
      clearTimeout(t);
    };
  }, []);
  (0, import_react7.useLayoutEffect)(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setGeo({ w: el.clientWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [goals, setGoalsState] = (0, import_react7.useState)(loadGoals);
  const [goalsOpen, setGoalsOpen] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    try {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (e) {
    }
  }, [goals]);
  (0, import_react7.useMemo)(() => {
    const g = {};
    NUM_KEYS.forEach((k) => {
      if (goals[k] != null) g[k] = goals[k];
    });
    setGoals(g);
  }, [goals]);
  const weatherW = (() => {
    try {
      return JSON.parse(localStorage.getItem("dsh-rigui:weather"));
    } catch (e) {
      return null;
    }
  })();
  const [wTick, setWTick] = (0, import_react7.useState)(0);
  (0, import_react7.useEffect)(() => {
    const iv = setInterval(() => setWTick((x) => x + 1), 6e4);
    return () => clearInterval(iv);
  }, []);
  (0, import_react7.useMemo)(() => setWeather(weatherW), [wTick, weatherW && weatherW.at]);
  const S2 = (0, import_react7.useMemo)(() => derive(db.records, now), [db.records, now, goals, weatherW && weatherW.at]);
  const suggestions = (0, import_react7.useMemo)(() => suggestGoals(S2, db.records), [S2, db.records]);
  const adoptGoal = (sg, v) => setGoalsState((g) => {
    const n = { ...g, adopted: { ...g.adopted, [sg.id]: true }, texts: { ...g.texts } };
    if (sg.num) n[sg.num.key] = v;
    else n.texts[sg.id] = v;
    return n;
  });
  const undoGoal = (sg) => setGoalsState((g) => {
    const n = { ...g, adopted: { ...g.adopted }, texts: { ...g.texts } };
    delete n.adopted[sg.id];
    if (sg.num) delete n[sg.num.key];
    else delete n.texts[sg.id];
    return n;
  });
  const [rootRect, setRootRect] = (0, import_react7.useState)(null);
  const openGoals = () => {
    const r = rootRef.current && rootRef.current.getBoundingClientRect();
    setRootRect(r ? { left: r.left, width: r.width } : null);
    setGoalsOpen(true);
  };
  const usual = (0, import_react7.useMemo)(() => frequent(db.records, now), [db.records, now]);
  const ghosts = (0, import_react7.useMemo)(() => ghostSlots(db.records, now), [db.records, now]);
  const [sayFocus, setSayFocus] = (0, import_react7.useState)(false);
  const sayHint = (() => {
    const nowH = (now - S2.today) / 36e5;
    const due = ghosts.filter((g) => g.h <= nowH).sort((a, b) => b.h - a.h)[0];
    return due ? due.title.replace(/[？?]$/, "") + "？说一句就记下" : "吃了什么、花了多少、练了多久，说一句就记下";
  })();
  const fillFrom = (phrase) => {
    setText(phrase);
    const el = inputRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      el.focus({ preventScroll: true });
      el.setSelectionRange(phrase.length, phrase.length);
    }, 280);
  };
  S0.current = S2;
  (0, import_react7.useEffect)(() => {
    try {
      localStorage.setItem(FOODS_KEY, JSON.stringify(mine));
    } catch (e) {
    }
  }, [mine]);
  const [settled, setSettled] = (0, import_react7.useState)("");
  const composing = (0, import_react7.useRef)(false), [compTick, setCompTick] = (0, import_react7.useState)(0);
  const ctrl = (0, import_react7.useRef)(null);
  const runAI = (0, import_react7.useCallback)((t, own) => {
    const key = t.trim();
    if (aiCache.current.has(key)) return Promise.resolve(aiCache.current.get(key));
    if (aiInflight.current.has(key)) return aiInflight.current.get(key);
    const ac = new AbortController();
    if (own) {
      if (ctrl.current && ctrl.current.key !== key) ctrl.current.ac.abort();
      ctrl.current = { key, ac };
    }
    const p = askAI(key, mineRef.current, S0.current.wNow || 68, ac.signal).then((r) => {
      const v = { status: "done", ...r };
      aiCache.current.set(key, v);
      return v;
    }).catch((e) => e && e.name === "AbortError" ? { status: "aborted" } : { status: "error", error: e.message || String(e) }).finally(() => aiInflight.current.delete(key));
    aiInflight.current.set(key, p);
    return p;
  }, []);
  mineRef.current = mine;
  (0, import_react7.useEffect)(() => {
    const key = text.trim();
    if (!key) {
      setSettled("");
      return;
    }
    if (composing.current) return;
    const t = setTimeout(() => setSettled(key), 800);
    return () => clearTimeout(t);
  }, [text, compTick]);
  (0, import_react7.useEffect)(() => {
    const key = settled;
    setEdits({});
    if (key.length < 2) {
      setAi({ text: "", status: "idle" });
      return;
    }
    if (aiCache.current.has(key)) {
      setAi({ text: key, ...aiCache.current.get(key) });
      return;
    }
    setAi({ text: key, status: "loading" });
    runAI(key, true).then((v) => {
      if (v.status !== "aborted") setAi((cur) => cur.text === key ? { text: key, ...v } : cur);
    });
  }, [settled, runAI]);
  const typing = text.trim() !== settled;
  const preview = (0, import_react7.useMemo)(() => {
    const key = settled;
    let base = ai.text === key && ai.status === "done" ? fromAI(ai.result, key, now) : parse(key, now, mine);
    if (ai.text === key && ai.status === "done" && !base.records.length) base = parse(key, now, mine);
    base.records = base.records.map((r) => {
      if (r.type !== "meal" || !r.items) return r;
      const items = r.items.map((i) => edits[i.name] != null ? { ...i, kcal: edits[i.name], source: "mine" } : mine[i.name] != null && i.source !== "mine" ? { ...i, kcal: Math.round(mine[i.name] * (i.qty || 1)), source: "mine" } : i);
      return { ...r, items, kcal: items.reduce((a, i) => a + i.kcal, 0) };
    });
    return base;
  }, [settled, now, ai, mine, edits]);
  const aiFor = ai.text === settled ? ai.status : "idle";
  const editKcal = (item, v) => {
    const kcal = Math.max(0, Math.round(+v || 0));
    setEdits((e) => ({ ...e, [item.name]: kcal }));
    setMine((m) => ({ ...m, [item.name]: Math.round(kcal / (item.qty || 1)) }));
  };
  const [busy, setBusy] = (0, import_react7.useState)(false);
  const armedCards = (0, import_react7.useMemo)(() => {
    return cardsFor(preview.records, now);
  }, [preview]);
  const pathBetween = (0, import_react7.useCallback)((fromEl, toEl) => {
    const root = rootRef.current;
    if (!root || !fromEl || !toEl) return null;
    const R = root.getBoundingClientRect(), a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const ax = a.left + a.width / 2 - R.left, ay = a.bottom - R.top;
    if (b.top >= a.bottom - 4) {
      const bx2 = b.left + b.width / 2 - R.left, by2 = b.top - R.top + 2;
      const k2 = Math.max(60, (by2 - ay) * 0.5);
      return `M${ax} ${ay} C${ax} ${ay + k2}, ${bx2} ${by2 - k2}, ${bx2} ${by2}`;
    }
    const sx = a.right - R.left, sy = a.top + a.height / 2 - R.top, bx = b.left - R.left + 2, by = b.top + b.height / 2 - R.top;
    const k = Math.max(40, (bx - sx) * 0.5);
    return `M${sx} ${sy} C${sx + k} ${sy}, ${bx - k} ${by}, ${bx} ${by}`;
  }, []);
  const centerPath = (0, import_react7.useCallback)((aEl, bEl) => {
    const root = rootRef.current;
    if (!root || !aEl || !bEl) return null;
    const R = root.getBoundingClientRect(), a = aEl.getBoundingClientRect(), b = bEl.getBoundingClientRect();
    const ax = a.left + a.width / 2 - R.left, ay = a.top + a.height / 2 - R.top, bx = b.left + b.width / 2 - R.left, by = b.top + b.height / 2 - R.top;
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.abs(bx - ax) * 0.18 - 30;
    return `M${ax} ${ay} Q${mx} ${my} ${bx} ${by}`;
  }, []);
  const [pulse, setPulse] = (0, import_react7.useState)({ pour: 0, shake: 0, coin: 0 });
  const prevS = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    const p = prevS.current;
    prevS.current = { kcalIn: 0, allowance: 0, todaySpent: 0 };
    if (S2) prevS.current = { kcalIn: S2.kcalIn, allowance: S2.allowance, todaySpent: S2.todaySpent };
    if (!p) return;
    const next = {};
    if (S2.kcalIn > p.kcalIn) next.pour = Date.now();
    if (S2.allowance < 0 && S2.allowance < p.allowance) next.shake = Date.now();
    if (S2.todaySpent > p.todaySpent) next.coin = Date.now();
    if (Object.keys(next).length) setTimeout(() => setPulse((cur) => ({ ...cur, ...next })), 420);
  }, [S2.kcalIn, S2.allowance, S2.todaySpent]);
  const [floats, setFloats] = (0, import_react7.useState)([]);
  const addFloats = (0, import_react7.useCallback)((list, delay = 450) => {
    if (!list.length) return;
    setTimeout(() => {
      const items = list.map((f, i) => ({ ...f, id: Date.now() + "-" + i + Math.random() }));
      setFloats((cur) => cur.concat(items));
      setTimeout(() => setFloats((cur) => cur.filter((x) => !items.includes(x))), 1700);
    }, delay);
  }, []);
  const floatsFor = (recs) => {
    const out = [];
    recs.forEach((r) => {
      if (r.type === "meal") out.push({ card: "energy", text: "+" + num(r.kcal) + " 千卡", color: "#C2410C" });
      if (r.type === "expense") out.push({ card: "money", text: "−" + money(r.amount), color: "#fff" });
      if (r.type === "income") out.push({ card: "money", text: "+" + money(r.amount), color: "#fff" });
      if (r.type === "workout") {
        out.push({ card: "move", text: "+" + r.minutes + " 分钟", color: "var(--move-ink)" });
        out.push({ card: "energy", text: "额度 +" + num(r.kcal), color: "var(--move-ink)" });
      }
      if (r.type === "sleep") out.push({ card: "sleep", text: fmtHM(r.hours), color: "#fff" });
      if (r.type === "weight") out.push({ card: "body", text: r.kg + " kg", color: "#0E6E6E" });
    });
    return out;
  };
  const [bursts, setBursts] = (0, import_react7.useState)([]);
  const celebrate = (0, import_react7.useCallback)((x, y, big) => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#F2994A", "#7C5CE0", "#1E9E6A", "#3D4FB8", "#0E8A8A", "#E5484D", "#F7C948"];
    const n = big ? 46 : 18;
    const parts = Array.from({ length: n }, (_, i) => {
      const a = Math.PI * 2 * i / n + (Math.random() - 0.5) * 0.6;
      const d = (big ? 120 : 52) + Math.random() * (big ? 120 : 40);
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d - (big ? 60 : 24), r: Math.random() * 540 - 270, c: colors[i % colors.length], w: 5 + Math.random() * 5, round: Math.random() > 0.6, delay: Math.random() * 0.08 };
    });
    const b = { id: Date.now() + Math.random(), x, y, parts, big };
    setBursts((cur) => cur.concat(b));
    setTimeout(() => setBursts((cur) => cur.filter((z) => z !== b)), big ? 1600 : 1100);
  }, []);
  const commit = (0, import_react7.useCallback)((newRecords, cards, removeIds) => {
    setDb((d) => ({ ...d, records: d.records.filter((r) => !(removeIds || []).includes(r.id)).concat(newRecords) }));
    const src = inputRef.current;
    const lines = [...cards].map((c) => ({ id: c, d: pathBetween(src, refs.current[c]), color: CARD_COLOR[c] === "#F4F5F1" ? C2.food : CARD_COLOR[c] })).filter((l) => l.d);
    const stamp = Date.now();
    setThreads({ stamp, lines });
    setTimeout(() => setThreads((t) => t && t.stamp === stamp ? null : t), 1900);
    setTimeout(() => setFlash((f) => {
      const n = { ...f };
      cards.forEach((c, i) => {
        n[c] = stamp + i;
      });
      return n;
    }), 420);
    addFloats(floatsFor(newRecords));
  }, [pathBetween, addFloats]);
  const say = (msg, ms = 2600) => {
    setToast(msg);
    setTimeout(() => setToast((t) => t === msg ? null : t), ms);
  };
  const submit = async (e) => {
    e && e.preventDefault();
    const key = text.trim();
    if (!key || busy) return;
    let p = settled === key && aiFor !== "loading" ? preview : parse(text, Date.now(), mine);
    if (settled !== key || aiFor !== "done" && aiFor !== "error") {
      setBusy(true);
      const v = await Promise.race([runAI(key), new Promise((r) => setTimeout(() => r({ status: "timeout" }), 8e3))]);
      setBusy(false);
      if (v.status === "done") {
        p = fromAI(v.result, text, Date.now());
        if (!p.records.length) p = parse(text, Date.now(), mine);
      }
    }
    if (!p.records.length) {
      say("没听懂这句。换个说法试试，比如「早饭 两个麻团 一杯豆浆 8」", 3600);
      return;
    }
    commit(p.records, cardsFor(p.records));
    say(summaryOf(p.records));
    setText("");
  };
  const removeGroup = (g) => {
    const ids = g.items.map((r) => r.id);
    commit([], cardsFor(g.items), ids);
  };
  const doneEvent = (ev) => {
    const w = completeEvent(ev, Date.now());
    setDb((d) => ({ ...d, records: d.records.map((r) => r.id === ev.id ? { ...r, done: true } : r) }));
    commit([w], /* @__PURE__ */ new Set([...cardsFor([w]), "next", "week"]));
  };
  const [allDoneAt, setAllDoneAt] = (0, import_react7.useState)(null);
  const toggleTodo = (t, ev) => {
    if (t.done) setAllDoneAt(null);
    const flip = (d) => d.records.map((r) => r.id === t.id ? { ...r, done: !r.done, doneAt: r.done ? void 0 : Date.now() } : r);
    if (!t.done) {
      const box = ev && ev.currentTarget && ev.currentTarget.querySelector(".lf-check");
      const r = box ? box.getBoundingClientRect() : null;
      const left = S2.todos.filter((x) => !x.done && x.id !== t.id).length;
      if (r) celebrate(r.left + r.width / 2, r.top + r.height / 2, false);
      if (left === 0) setAllDoneAt(Date.now());
      if (t.amount) addFloats([{ card: "money", text: "−" + money(t.amount), color: "#fff" }]);
    }
    if (!t.done && t.amount) {
      const ex = todoToExpense(t, Date.now());
      setDb((d) => ({ ...d, records: flip(d).concat([ex]) }));
      commit([], /* @__PURE__ */ new Set(["todos", "money", "insights"]));
    } else if (t.done && t.amount) {
      setDb((d) => ({ ...d, records: flip(d).filter((r) => r.from !== t.id) }));
      commit([], /* @__PURE__ */ new Set(["todos", "money", "insights"]));
    } else setDb((d) => ({ ...d, records: flip(d) }));
  };
  const [confirm, setConfirm] = (0, import_react7.useState)(null);
  const [undo, setUndo] = (0, import_react7.useState)(null);
  (0, import_react7.useEffect)(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(null), 6e3);
    return () => clearTimeout(t);
  }, [confirm]);
  (0, import_react7.useEffect)(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 1e4);
    return () => clearTimeout(t);
  }, [undo]);
  const realCount = db.records.filter((r) => !r.sample).length;
  const replaceAll = (next, label) => {
    setUndo({ prev: db, label });
    setDb(next);
    setConfirm(null);
  };
  const clearSample = () => replaceAll({ records: [], sample: false }, db.sample ? "已清空示例数据" : "已清空 " + db.records.length + " 条记录");
  const restoreSample = () => replaceAll({ records: seed(Date.now()), sample: true }, "已换成示例数据");
  const [sweeping, setSweeping] = (0, import_react7.useState)(false);
  const [pend, setPend] = (0, import_react7.useState)(null);
  const [, setTick] = (0, import_react7.useState)(0);
  const PEND_S = 5;
  (0, import_react7.useEffect)(() => {
    if (!pend) return;
    const iv = setInterval(() => setTick((x) => x + 1), 200);
    const t = setTimeout(() => {
      const ids = pend.ids;
      setPend(null);
      setSweeping(true);
      setTimeout(() => {
        setDb((d) => ({ ...d, records: d.records.map((r) => ids.includes(r.id) ? { ...r, archived: true } : r) }));
        setSweeping(false);
      }, 420 + ids.length * 70);
    }, Math.max(0, pend.end - Date.now()));
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [pend]);
  const clearDone = () => {
    if (pend) {
      setPend(null);
      return;
    }
    const ids = S2.todos.filter((t) => t.done).map((t) => t.id);
    if (!ids.length || sweeping) return;
    setAllDoneAt(null);
    setPend({ ids, end: Date.now() + PEND_S * 1e3 });
  };
  const editTodo = (t, raw) => {
    const m = String(raw).trim().match(/^(.*?)\s*[¥￥]?\s*(\d+(?:\.\d+)?)\s*(?:元|块)?$/);
    const title = (m && m[1] ? m[1] : String(raw)).trim().slice(0, 40);
    const amount = m && m[1] ? +m[2] : null;
    if (!title) return;
    setDb((d) => ({ ...d, records: d.records.map((r) => r.id === t.id ? { ...r, title, amount, cat: amount ? r.cat || null : null } : r.from === t.id && r.type === "expense" ? amount ? { ...r, title, amount } : r : r) }));
  };
  const [dying, setDying] = (0, import_react7.useState)({});
  const dieTimers = (0, import_react7.useRef)({});
  const deleteTodo = (t) => {
    const end = Date.now() + 650 + 4e3;
    setDying((d) => ({ ...d, [t.id]: { end, phase: "dust" } }));
    const T = dieTimers.current;
    T[t.id] = [
      setTimeout(() => setDying((d) => d[t.id] ? { ...d, [t.id]: { ...d[t.id], phase: "undo" } } : d), 650),
      setTimeout(() => setDying((d) => d[t.id] ? { ...d, [t.id]: { ...d[t.id], phase: "gone" } } : d), end - Date.now()),
      setTimeout(() => {
        setDb((d) => ({ ...d, records: d.records.filter((r) => r.id !== t.id) }));
        setDying((d) => {
          const n = { ...d };
          delete n[t.id];
          return n;
        });
        delete T[t.id];
      }, end - Date.now() + 360)
    ];
  };
  const restoreTodo = (t) => {
    ;
    (dieTimers.current[t.id] || []).forEach(clearTimeout);
    delete dieTimers.current[t.id];
    setDying((d) => ({ ...d, [t.id]: { phase: "back" } }));
    setTimeout(() => setDying((d) => {
      const n = { ...d };
      if (n[t.id] && n[t.id].phase === "back") delete n[t.id];
      return n;
    }), 700);
  };
  const [printOpen, setPrintOpen] = (0, import_react7.useState)(false);
  const [arrivals, setArrivals] = (0, import_react7.useState)([]);
  const unarchiveTodo = (t) => {
    setDb((d) => ({ ...d, records: d.records.filter((r) => !(r.from === t.id && r.type === "expense")).map((r) => r.id === t.id ? { ...r, archived: false, done: false, doneAt: void 0 } : r) }));
    if (t.amount && t.done) addFloats([{ card: "money", text: "+" + money(t.amount), color: "#fff" }]);
    setArrivals((a) => a.concat(t.id));
  };
  const landed = (id) => setArrivals((a) => a.filter((x) => x !== id));
  const pendLeft = pend ? Math.max(1, Math.ceil((pend.end - Date.now()) / 1e3)) : 0;
  const doUndo = () => {
    if (!undo) return;
    setDb(undo.prev);
    setUndo(null);
    say("已恢复");
  };
  const [preLines, setPreLines] = (0, import_react7.useState)([]);
  (0, import_react7.useLayoutEffect)(() => {
    if (!text || !armedCards.size) {
      setPreLines([]);
      return;
    }
    setPreLines([...armedCards].map((c) => ({ id: c, d: pathBetween(inputRef.current, refs.current[c]), color: CARD_COLOR[c] === "#F4F5F1" ? C2.food : CARD_COLOR[c] })).filter((l) => l.d));
  }, [text, armedCards, geo, pathBetween]);
  const [layout2, setLayout] = (0, import_react7.useState)(loadLayout);
  const [active, setActive] = (0, import_react7.useState)(null), [resizing, setResizing] = (0, import_react7.useState)(null);
  const gridRef = (0, import_react7.useRef)(null), flipFrom = (0, import_react7.useRef)(null), dragRef = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout2));
    } catch (e) {
    }
  }, [layout2]);
  const gridW = Math.max(0, (geo.w || 1200) - 48);
  const cols = gridW >= 980 ? 12 : gridW >= 620 ? 6 : 1;
  const sizeOf = (id) => {
    const d = WIDGETS[id], v = layout2.size[id] || {};
    return { w: clamp2(v.w || d.w, d.minW, 12), h: clamp2(v.h || d.h, d.minH, 8) };
  };
  const place = (id) => {
    const { w, h: h2 } = sizeOf(id);
    const span = cols === 12 ? w : cols === 6 ? clamp2(Math.ceil(w / 2), 3, 6) : 1;
    return { w, h: h2, span, order: layout2.order.indexOf(id) };
  };
  const snapshot = () => {
    const m = {};
    Object.keys(WIDGETS).forEach((id) => {
      const n = refs.current[id];
      if (n) m[id] = n.getBoundingClientRect();
    });
    flipFrom.current = m;
  };
  (0, import_react7.useLayoutEffect)(() => {
    const from = flipFrom.current;
    flipFrom.current = null;
    if (!from) return;
    Object.keys(from).forEach((id) => {
      const n = refs.current[id];
      if (!n || id === (dragRef.current && dragRef.current.id)) return;
      const a = from[id], b = n.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy && a.width === b.width && a.height === b.height) return;
      n.style.transition = "none";
      n.style.transform = `translate(${dx}px, ${dy}px)`;
      void n.offsetWidth;
      n.style.transition = "transform .32s cubic-bezier(.2,.8,.2,1)";
      n.style.transform = "";
      setTimeout(() => {
        n.style.transition = "";
      }, 340);
    });
  }, [layout2, cols]);
  const startDrag = (id, e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const n = refs.current[id];
    if (!n) return;
    const r = n.getBoundingClientRect();
    dragRef.current = { id, kind: "move", gx: e.clientX - r.left, gy: e.clientY - r.top, last: null };
    setActive(id);
    n.style.transition = "none";
    document.body.style.userSelect = "none";
    const move = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const el = refs.current[id];
      el.style.transform = "";
      const slot = el.getBoundingClientRect();
      el.style.transform = `translate(${ev.clientX - d.gx - slot.left}px, ${ev.clientY - d.gy - slot.top}px)`;
      let target = null;
      for (const other of layout_order_ref.current) {
        if (other === id) continue;
        const on = refs.current[other];
        if (!on) continue;
        const q = on.getBoundingClientRect();
        if (ev.clientX >= q.left && ev.clientX <= q.right && ev.clientY >= q.top && ev.clientY <= q.bottom) {
          target = other;
          break;
        }
      }
      if (target && target !== d.last) {
        d.last = target;
        snapshot();
        setLayout((L0) => {
          const o = L0.order.filter((x) => x !== id), at = o.indexOf(target);
          const ti = L0.order.indexOf(target), si = L0.order.indexOf(id);
          o.splice(si < ti ? at + 1 : at, 0, id);
          return { ...L0, order: o };
        });
      } else if (!target) d.last = null;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.style.userSelect = "";
      const el = refs.current[id];
      if (el) {
        const cur = el.getBoundingClientRect();
        el.style.transform = "";
        const slot = el.getBoundingClientRect();
        el.style.transform = `translate(${cur.left - slot.left}px, ${cur.top - slot.top}px)`;
        void el.offsetWidth;
        el.style.transition = "transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s";
        el.style.transform = "";
        setTimeout(() => {
          el.style.transition = "";
        }, 320);
      }
      dragRef.current = null;
      setActive(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  const layout_order_ref = (0, import_react7.useRef)(layout2.order);
  layout_order_ref.current = layout2.order;
  const startResize = (id, e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const n = refs.current[id], g = gridRef.current;
    if (!n || !g) return;
    const top = n.getBoundingClientRect(), gw = g.getBoundingClientRect().width;
    const colW = (gw - GAP * (cols - 1)) / cols;
    const d = WIDGETS[id];
    setResizing(id);
    setActive(id);
    document.body.style.userSelect = "none";
    let lastKey = "";
    const move = (ev) => {
      const span = clamp2(Math.round((ev.clientX - top.left + GAP) / (colW + GAP)), 1, cols);
      const w = clamp2(cols === 12 ? span : cols === 6 ? span * 2 : sizeOf(id).w, d.minW, 12);
      const h2 = clamp2(Math.round((ev.clientY - top.top + GAP) / (ROW_H + GAP)), d.minH, 8);
      const key = w + "x" + h2;
      if (key === lastKey) return;
      lastKey = key;
      snapshot();
      setLayout((L0) => ({ ...L0, size: { ...L0.size, [id]: { w, h: h2 } } }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.style.userSelect = "";
      setResizing(null);
      setActive(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  const keyMove = (id, e) => {
    const k = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!k) return;
    e.preventDefault();
    snapshot();
    setLayout((L0) => {
      const o = L0.order.slice(), i = o.indexOf(id), j = clamp2(i + k, 0, o.length - 1);
      o.splice(i, 1);
      o.splice(j, 0, id);
      return { ...L0, order: o };
    });
  };
  const keyResize = (id, e) => {
    const dw = { ArrowLeft: -1, ArrowRight: 1 }[e.key] || 0, dh = { ArrowUp: -1, ArrowDown: 1 }[e.key] || 0;
    if (!dw && !dh) return;
    e.preventDefault();
    snapshot();
    const d = WIDGETS[id], cur = sizeOf(id);
    setLayout((L0) => ({ ...L0, size: { ...L0.size, [id]: { w: clamp2(cur.w + dw, d.minW, 12), h: clamp2(cur.h + dh, d.minH, 8) } } }));
  };
  const resetLayout = () => {
    snapshot();
    setLayout(DEFAULT_LAYOUT);
  };
  const layoutApi = { place, active, resizing, startDrag, startResize, keyMove, keyResize };
  const customized = JSON.stringify(layout2) !== JSON.stringify(DEFAULT_LAYOUT);
  const [pinned, setPinned] = (0, import_react7.useState)(null);
  const shownInsight = focusInsight || pinned;
  const [link, setLink] = (0, import_react7.useState)(null);
  (0, import_react7.useEffect)(() => {
    const k = (e) => {
      if (e.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  (0, import_react7.useEffect)(() => {
    if (!pinned) return;
    const k = (e) => {
      if (!(e.target.closest && e.target.closest(".lf-tip, .lf-insight"))) setPinned(null);
    };
    document.addEventListener("pointerdown", k, true);
    return () => document.removeEventListener("pointerdown", k, true);
  }, [pinned]);
  (0, import_react7.useLayoutEffect)(() => {
    const root = rootRef.current, it = shownInsight;
    document.querySelectorAll(".lf-ev-on").forEach((n) => {
      n.classList.remove("lf-ev-on");
      n.style.removeProperty("--ev");
    });
    if (!it || !root) {
      setLink(null);
      return;
    }
    const R = root.getBoundingClientRect();
    const box = (n) => {
      const r = n.getBoundingClientRect();
      return { l: r.left - R.left, t: r.top - R.top, r: r.right - R.left, b: r.bottom - R.top, cx: (r.left + r.right) / 2 - R.left, cy: (r.top + r.bottom) / 2 - R.top };
    };
    const q = (k) => root.querySelector('[data-ev="' + k + '"]');
    const start = q("insight." + it.id), cause = q(it.ev[0]), effect = q(it.ev[1]);
    if (!start) {
      setLink(null);
      return;
    }
    const edge = (b, tx, ty, pad4 = 5) => {
      const dx = tx - b.cx, dy = ty - b.cy, hw = (b.r - b.l) / 2 + pad4, hh = (b.b - b.t) / 2 + pad4;
      const k = Math.min(Math.abs(dx) > 0.01 ? hw / Math.abs(dx) : 1e9, Math.abs(dy) > 0.01 ? hh / Math.abs(dy) : 1e9);
      return [b.cx + dx * k, b.cy + dy * k];
    };
    const curve = (a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const bend = Math.min(90, d * 0.22), nx = -dy / d * bend, ny = dx / d * bend;
      const flip = ny > 0 ? -1 : 1;
      return `C${a[0] + dx * 0.3 + nx * flip} ${a[1] + dy * 0.3 + ny * flip}, ${a[0] + dx * 0.7 + nx * flip} ${a[1] + dy * 0.7 + ny * flip}, ${b[0]} ${b[1]}`;
    };
    const sb = box(start), segs = [];
    const fromC = C2[it.from], toC = C2[it.to] === "#1F2328" ? "#7C5CE0" : C2[it.to];
    let tail = [sb.cx, sb.cy], tailBox = sb;
    const hop = (n, color, isEnd) => {
      if (!n) return;
      const b = box(n);
      const a = edge(tailBox, b.cx, b.cy, 3), z = edge(b, tailBox.cx, tailBox.cy, 7);
      segs.push({ a, z, d: `M${a[0]} ${a[1]} ` + curve(a, z), c1: segs.length ? fromC : "#B4B8B0", c2: color, end: isEnd });
      n.classList.add("lf-ev-on");
      n.style.setProperty("--ev", color);
      tail = z;
      tailBox = b;
    };
    hop(cause, fromC, !effect);
    if (effect && effect !== cause) hop(effect, toC, true);
    setLink(segs.length ? { id: it.id + ":" + Date.now(), segs, full: segs.map((g) => g.d).join(" ").replace(/ M/g, " L"), color: toC } : null);
  }, [shownInsight, geo, layout2]);
  const hlCards = shownInsight ? /* @__PURE__ */ new Set(["insights", ...shownInsight.ev.map((k) => {
    const n = rootRef.current && rootRef.current.querySelector('[data-ev="' + k + '"]');
    const c = n && n.closest("[data-card]");
    return c ? c.dataset.card : null;
  }).filter(Boolean)]) : null;
  const weather = useWeather();
  const heroTone = S2.nowEvent ? { key: eventTone(S2.nowEvent), e: S2.nowEvent } : null;
  const todoEls = (0, import_react7.useRef)({});
  const todoOrder = useDisplayOrder(S2.todos.map((t) => t.id), 520);
  const shownTodos = todoOrder.map((id) => S2.todos.find((t) => t.id === id)).filter(Boolean);
  useFlipList(todoEls, todoOrder);
  const allDone = S2.todos.length > 0 && S2.todos.every((x) => x.done);
  const finale = allDone && allDoneAt && Date.now() - allDoneAt < 6e3;
  const finaleAt = 0.7 + S2.todos.length * 0.09 + 0.25;
  const rain = (0, import_react7.useMemo)(() => {
    const colors = ["#F2994A", "#7C5CE0", "#1E9E6A", "#3D4FB8", "#0E8A8A", "#E5484D", "#F7C948"];
    return Array.from({ length: 40 }, (_, i) => ({ x: Math.random() * 100, c: colors[i % colors.length], w: 5 + Math.random() * 5, round: Math.random() > 0.6, sx: (Math.random() - 0.5) * 80, r: Math.random() * 720 - 360, dur: 1.6 + Math.random() * 1.2, d: Math.random() * 0.6 }));
  }, [allDoneAt]);
  (0, import_react7.useEffect)(() => {
    if (!allDoneAt) return;
    const t = setTimeout(() => setAllDoneAt((x) => x ? x - 1e4 : x), 6100);
    return () => clearTimeout(t);
  }, [allDoneAt]);
  const P2 = (id, idx, extra) => ({ id, idx, refs, floats: floats.filter((f) => f.card === id), flash: flash[id], armed: !!settled && !typing && armedCards.has(id), hl: hlCards && hlCards.has(id), dim: hlCards && !hlCards.has(id), ...extra });
  const h = new Date(S2.now).getHours();
  const [userName, setUserName] = (0, import_react7.useState)(() => {
    try {
      return localStorage.getItem("dsh-rigui:name") || "";
    } catch (e) {
      return "";
    }
  });
  const [editName, setEditName] = (0, import_react7.useState)(false);
  const saveName = (v) => {
    const n = String(v || "").trim().slice(0, 16);
    setUserName(n);
    setEditName(false);
    try {
      localStorage.setItem("dsh-rigui:name", n);
    } catch (e) {
    }
  };
  const hello = h < 5 ? "夜深了" : h < 11 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
  const dateStr = (() => {
    const d = new Date(S2.now);
    return d.getMonth() + 1 + " 月 " + d.getDate() + " 日，周" + "日一二三四五六"[d.getDay()];
  })();
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-root", ref: rootRef }, /* @__PURE__ */ import_react7.default.createElement("style", null, CSS + GOALS_CSS + CARDS_CSS + FOG_CSS + RECEIPT_CSS + WEATHER_CSS), /* @__PURE__ */ import_react7.default.createElement(LayoutCtx.Provider, { value: layoutApi }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-wrap", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ import_react7.default.createElement("div", { style: { marginBottom: GAP } }, /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("hero", 0), cls: "s12", bg: "#3B6FA8", color: "#F4F5F1", style: { padding: "32px 36px" } }, /* @__PURE__ */ import_react7.default.createElement(HeroSky, { w: weather.w, now, tone: heroTone }), /* @__PURE__ */ import_react7.default.createElement(WeatherBadge, { weather, tone: heroTone, now }), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-hero lf-hero-sky lf-glassy" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-hero-left", style: { display: "flex", flexDirection: "column", gap: 44, alignSelf: "stretch", justifyContent: "center", padding: "4px 0" } }, /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ import_react7.default.createElement("h1", { style: { margin: 0, fontSize: "clamp(34px, 4.4cqi, 52px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 } }, hello, editName ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, "，", /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      autoFocus: true,
      className: "lf-name-input",
      defaultValue: userName,
      maxLength: 16,
      "aria-label": "怎么称呼你",
      onBlur: (e) => saveName(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setEditName(false);
      }
    }
  )) : /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-name", onClick: () => setEditName(true), title: userName ? "改称呼" : "告诉我怎么称呼你" }, userName ? "，" + userName : /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-name-add" }, "，怎么称呼你？")))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-sayrow" }, /* @__PURE__ */ import_react7.default.createElement("form", { onSubmit: submit, className: "lf-sayform", style: { position: "relative", flex: 1, minWidth: 0 } }, /* @__PURE__ */ import_react7.default.createElement("label", { htmlFor: "lf-say", style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" } }, "说一句来记录"), /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      id: "lf-say",
      ref: inputRef,
      className: "lf-input",
      value: text,
      autoComplete: "off",
      spellCheck: false,
      placeholder: sayHint,
      onChange: (e) => setText(e.target.value),
      onFocus: () => setSayFocus(true),
      onBlur: () => setSayFocus(false),
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: () => {
        composing.current = false;
        setCompTick((x) => x + 1);
      },
      onKeyDown: (e) => {
        if (e.key === "Escape") setText("");
      }
    }
  ), /* @__PURE__ */ import_react7.default.createElement("button", { type: "submit", className: "lf-send", disabled: !text.trim() || busy, "aria-label": "记下" }, busy ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-spin" }) : Icon.send)), /* @__PURE__ */ import_react7.default.createElement(GoalsButton, { goals, suggestions, onClick: openGoals })), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-below", style: { display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 10, minHeight: 100, marginTop: -12 } }, text.trim() && !settled ? /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, color: "rgba(244,245,241,.45)", minHeight: 20 } }, "说完停一下，我来理解这句话") : text.trim() ? /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, opacity: typing ? 0.4 : 1, transition: "opacity .25s" } }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { gap: 10, fontSize: 13, color: "rgba(244,245,241,.55)", minHeight: 20 } }, typing ? /* @__PURE__ */ import_react7.default.createElement("span", null, "输入中，停一下就重新识别") : /* @__PURE__ */ import_react7.default.createElement(AiBadge, { status: aiFor, model: ai.model, error: ai.error }), !typing && aiFor !== "loading" && preview.records.length > 0 && /* @__PURE__ */ import_react7.default.createElement("span", null, "· 会影响 ", armedCards.size, " 张卡")), aiFor === "loading" ? /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-skel", style: { width: "62%" } }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-skel", style: { width: "40%" } })) : preview.records.length > 0 ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("div", { style: { fontSize: 15, lineHeight: 1.7 } }, highlight(settled, preview.tokens)), /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, preview.records.map((r) => r.type === "meal" && r.items ? /* @__PURE__ */ import_react7.default.createElement("div", { key: r.id, className: "lf-row", style: { flexWrap: "wrap", gap: 6 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-chip", style: { background: "rgba(242,153,74,.18)", color: "#F8C08B" } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: C2.food } }), MEAL_NAME[r.meal], " · 共 ", r.kcal, " 千卡"), r.items.map((it, k) => /* @__PURE__ */ import_react7.default.createElement("label", { key: k, className: "lf-chip", style: { background: "rgba(255,255,255,.08)", gap: 6, paddingRight: 6 }, title: "热量不对就改，下次会记住" }, /* @__PURE__ */ import_react7.default.createElement("span", null, it.name, it.qty !== 1 ? " ×" + it.qty : ""), /* @__PURE__ */ import_react7.default.createElement(
    "input",
    {
      type: "number",
      min: "0",
      step: "10",
      value: it.kcal,
      onChange: (ev) => editKcal(it, ev.target.value),
      "aria-label": it.name + " 的热量",
      style: { width: 54, height: 22, border: 0, borderRadius: 6, background: it.source === "mine" ? "rgba(30,158,106,.35)" : "rgba(255,255,255,.1)", color: "#F4F5F1", font: "inherit", fontSize: 12.5, textAlign: "right", padding: "0 6px" }
    }
  ), /* @__PURE__ */ import_react7.default.createElement("span", { style: { opacity: 0.6 } }, "千卡")))) : /* @__PURE__ */ import_react7.default.createElement("div", { key: r.id, className: "lf-row", style: { flexWrap: "wrap", gap: 6 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-chip", style: { background: "rgba(255,255,255,.1)" } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: C2[domainOf(r)] } }), whenOf(r), labelOf(r)), r.title && r.type !== "workout" && r.type !== "sleep" && r.type !== "weight" && /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, color: "rgba(244,245,241,.6)" } }, r.title)))), preview.note ? /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 12.5, color: "rgba(244,245,241,.5)" } }, preview.note) : null) : /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 14, color: "rgba(244,245,241,.55)" } }, "还没听懂这句，换个说法试试")) : /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-idle-stack" + (sayFocus ? " focus" : "") }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-idle" }, goals.adopted.vision && goals.texts.vision ? /* @__PURE__ */ import_react7.default.createElement("span", { key: goals.texts.vision, className: "lf-vision" }, /* @__PURE__ */ import_react7.default.createElement("i", null), goals.texts.vision) : /* @__PURE__ */ import_react7.default.createElement("p", { className: "lf-story" }, storyOf(S2)), /* @__PURE__ */ import_react7.default.createElement(TodayNudges, { part: "tip", S: S2, ghosts, usual, focused: sayFocus, onPick: () => {
  }, onInsight: (it) => setPinned((p0) => p0 && p0.id === it.id ? null : it), pinned })), /* @__PURE__ */ import_react7.default.createElement(TodayNudges, { part: "sugs", S: S2, ghosts, usual, focused: sayFocus, onPick: (u) => {
    setText(u);
    inputRef.current && inputRef.current.focus();
  }, onInsight: (it) => setPinned((p0) => p0 && p0.id === it.id ? null : it), pinned })))), /* @__PURE__ */ import_react7.default.createElement("div", { ref: (el) => {
    refs.current.dial = el;
  }, "data-ev": "dial", style: { display: "grid" } }, /* @__PURE__ */ import_react7.default.createElement(Dial, { S: S2, hover, setHover }))))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-widgets", ref: gridRef, style: { display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: ROW_H + "px", gridAutoFlow: "dense", gap: GAP } }, /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("energy", 1), cls: "s4", back: /* @__PURE__ */ import_react7.default.createElement(BackEnergy, { S: S2 }) }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "今天还能吃"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, "目标 ", num(GOALS.kcal), " 千卡")), /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6, margin: "14px 0 16px" } }, /* @__PURE__ */ import_react7.default.createElement("span", { key: pulse.shake, "data-ev": "energy.num", className: pulse.shake ? "lf-shake" : "", style: { display: "inline-block" } }, /* @__PURE__ */ import_react7.default.createElement(Num, { value: Math.abs(S2.allowance), style: { fontSize: 52, fontWeight: 500, lineHeight: 1, color: S2.allowance < 0 ? C2.link : C2.ink }, className: "lf-num" })), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, S2.allowance < 0 ? "千卡，已超出" : "千卡")), /* @__PURE__ */ import_react7.default.createElement(EnergyTaste, { S: S2, pour: pulse.pour })), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("money", 2), cls: "s4", bg: C2.money, color: "#fff", back: /* @__PURE__ */ import_react7.default.createElement(BackMoney, { S: S2 }) }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, S2.remaining < 0 ? "这个月已超支" : "这个月还能花"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 8 } }, /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, opacity: 0.8 } }, "还剩 ", S2.daysLeft, " 天"), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-printbtn" + (printOpen ? " on" : ""), onClick: () => setPrintOpen((v) => !v), "aria-label": printOpen ? "收起小票" : "打印今天的花销小票", title: "打印小票" }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M7 9V3h10v6" }), /* @__PURE__ */ import_react7.default.createElement("rect", { x: "3", y: "9", width: "18", height: "8", rx: "2" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M7 14h10v7H7z" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M17.5 12h.01" }))))), /* @__PURE__ */ import_react7.default.createElement("div", { style: { margin: "14px 0 16px" } }, /* @__PURE__ */ import_react7.default.createElement("span", { "data-ev": "money.num", style: { display: "inline-block" } }, /* @__PURE__ */ import_react7.default.createElement(Num, { value: Math.abs(S2.remaining), format: money, style: { fontSize: 52, fontWeight: 500, lineHeight: 1 } }))), /* @__PURE__ */ import_react7.default.createElement(MoneyStrip, { S: S2, coin: pulse.coin })), /* @__PURE__ */ import_react7.default.createElement(NextCard, { P: P2, S: S2, onDone: doneEvent }), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("timeline", 4), cls: "s5 r2", style: { display: "flex", flexDirection: "column" } }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "今天记下的"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, S2.timeline.length ? S2.timeline.length + " 件" : "还空着", ghosts.filter((g) => S2.today + g.h * 36e5 <= S2.now).length ? " · " + ghosts.filter((g) => S2.today + g.h * 36e5 <= S2.now).length + " 件没记" : "")), /* @__PURE__ */ import_react7.default.createElement(TodayList, { S: S2, ghosts, onFill: fillFrom, onRemove: removeGroup })), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("sleep", 5), cls: "s4", bg: C2.sleep, color: "#fff", back: /* @__PURE__ */ import_react7.default.createElement(BackSleep, { S: S2 }) }, /* @__PURE__ */ import_react7.default.createElement(SleepSky, null), /* @__PURE__ */ import_react7.default.createElement(SleepBody, { S: S2 })), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("move", 6), cls: "s3", back: /* @__PURE__ */ import_react7.default.createElement(BackMove, { S: S2, workouts: db.records.filter((r) => r.type === "workout" && r.t >= S2.today - 6 * 864e5).sort((a, b) => b.t - a.t) }) }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "这周练了"), /* @__PURE__ */ import_react7.default.createElement("div", { "data-ev": "move.count", style: { display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0 10px", alignSelf: "flex-start" } }, /* @__PURE__ */ import_react7.default.createElement(Num, { value: S2.weekWorkouts, style: { fontSize: 44, fontWeight: 500, lineHeight: 1 } }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, "/ ", GOALS.workoutsPerWeek, " 次 · ", /* @__PURE__ */ import_react7.default.createElement(Num, { value: S2.weekMinutes }), " 分钟")), /* @__PURE__ */ import_react7.default.createElement(MoveBars, { S: S2 })), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("insights", 7), cls: "s4" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "它们之间的关系"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, pinned ? "已钉住 · 点别处或按 Esc 取消" : "悬停看因果，点一下钉住")), S2.insights.length === 0 ? /* @__PURE__ */ import_react7.default.createElement("p", { className: "lf-sub", style: { margin: "12px 0" } }, "多记几天，这里会找出睡眠、吃饭、花钱之间的规律。") : /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", flexDirection: "column" } }, S2.insights.slice(0, 4).map((it, i) => /* @__PURE__ */ import_react7.default.createElement(
    "div",
    {
      key: it.id,
      tabIndex: 0,
      role: "button",
      "aria-pressed": !!pinned && pinned.id === it.id,
      onMouseMove: () => setFocusInsight((f) => f && f.id === it.id ? f : it),
      onMouseLeave: () => setFocusInsight(null),
      onFocus: () => setFocusInsight(it),
      onBlur: () => setFocusInsight(null),
      onClick: () => setPinned((p0) => p0 && p0.id === it.id ? null : it),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setPinned((p0) => p0 && p0.id === it.id ? null : it);
        }
      },
      className: "lf-tl-item lf-insight" + (shownInsight && shownInsight.id === it.id ? " on" : "") + (pinned && pinned.id === it.id ? " pinned" : ""),
      style: { display: "flex", gap: 12, padding: "11px 8px", margin: "0 -8px", borderTop: i ? "1px solid var(--rule)" : 0, cursor: "pointer", animationDelay: i * 0.06 + "s" }
    },
    /* @__PURE__ */ import_react7.default.createElement("span", { "data-ev": "insight." + it.id, style: { display: "flex", alignItems: "center", paddingTop: 4, flex: "none", alignSelf: "flex-start" } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: it.from === "time" ? "var(--ink)" : C2[it.from], width: 10, height: 10, borderRadius: 5 } }), /* @__PURE__ */ import_react7.default.createElement("span", { style: { width: 12, height: 2, background: "var(--line)" } }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: it.to === "time" ? "var(--ink)" : C2[it.to], width: 10, height: 10, borderRadius: 5 } })),
    /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 14, lineHeight: 1.55, color: it.tone === "warn" ? "var(--warn-ink)" : C2.ink } }, it.text)
  )))), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("body", 8), cls: "s3", back: /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement(BackBody, { S: S2, monthWeight: goals.adopted.monthWeight ? goals.monthWeight : null }), S2.wNow != null && /* @__PURE__ */ import_react7.default.createElement(WeightFog, null)) }, S2.wNow != null && /* @__PURE__ */ import_react7.default.createElement(WeightFog, null), /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "体重"), /* @__PURE__ */ import_react7.default.createElement("div", { "data-ev": "body.num", style: { display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0 8px", alignSelf: "flex-start" } }, S2.wNow != null ? /* @__PURE__ */ import_react7.default.createElement(Num, { value: S2.wNow, format: (v) => v.toFixed(1), style: { fontSize: 44, fontWeight: 500, lineHeight: 1 } }) : /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 28, fontWeight: 500 } }, "—"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, "kg")), /* @__PURE__ */ import_react7.default.createElement("div", { "data-ev": "body.line", style: { flex: 1, minHeight: 56, margin: "4px 0 8px" } }, /* @__PURE__ */ import_react7.default.createElement(WeightScrub, { weights: S2.weights, now: S2.now }, /* @__PURE__ */ import_react7.default.createElement(WeightLine, { weights: S2.weights, now: S2.now }))), /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, color: S2.wDelta != null && S2.wDelta <= 0 ? "var(--move-ink)" : "var(--ink2)" } }, goals.adopted.monthWeight && S2.wNow != null ? "Boss 战：30 天到 " + goals.monthWeight + " kg，" + (S2.wNow <= goals.monthWeight ? "已经打赢了" : "还差 " + (S2.wNow - goals.monthWeight).toFixed(1) + " kg") : S2.wDelta == null ? S2.wNow != null ? "记满一周就能看到变化" : "说「体重 68.2」开始记录" : "一周 " + (S2.wDelta <= 0 ? "−" : "+") + Math.abs(S2.wDelta).toFixed(1) + " kg")), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("week", 9), cls: "s8" }, /* @__PURE__ */ import_react7.default.createElement(WeekBoard, { S: S2 })), /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("todos", 10), cls: "s4", back: /* @__PURE__ */ import_react7.default.createElement(BackTodos, { records: db.records, today: S2.today, onRestore: unarchiveTodo }) }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "要做的事"), S2.todos.some((x) => x.done) || pend ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 10 } }, !pend && /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, S2.todos.filter((x) => x.done).length, " / ", S2.todos.length, " 完成"), /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      type: "button",
      className: "lf-sweep-btn" + (pend ? " pending" : ""),
      onClick: clearDone,
      disabled: sweeping,
      "aria-label": pend ? "撤销清理，还剩 " + pendLeft + " 秒" : "清掉已完成的事",
      style: pend ? { "--dur": PEND_S + "s" } : null
    },
    pend ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", { key: "p" + pend.end, className: "lf-sweep-glow" }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-num" }, /* @__PURE__ */ import_react7.default.createElement("span", { key: pendLeft, className: "lf-roll" }, pendLeft)), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-label" }, "清理中"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-undo" }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M9 14L4 9l5-5" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M4 9h10a6 6 0 0 1 0 12h-3" })))) : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M14 4l6 6" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M17 7l-7.5 7.5" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M9.5 14.5L4 20h6l3.5-3.5" })), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-label" }, "清掉已完成"))
  )) : /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, "带金额的，勾掉就记账")), S2.todos.length === 0 ? /* @__PURE__ */ import_react7.default.createElement("p", { className: "lf-sub" }, "说「记得 交水电费 180」就会出现在这里。") : /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-todo-list lf-inner-scroll" }, shownTodos.map((t, i) => /* @__PURE__ */ import_react7.default.createElement(
    TodoRow,
    {
      key: t.id,
      rowRef: (n) => {
        todoEls.current[t.id] = n;
      },
      t,
      i,
      arrived: arrivals.indexOf(t.id),
      onLanded: landed,
      onToggle: toggleTodo,
      onEdit: editTodo,
      onDelete: deleteTodo,
      onRestore: restoreTodo,
      dying: dying[t.id],
      cls: (finale ? " lf-cascade" : "") + (sweeping && t.done ? " lf-swept" : "") + (pend && pend.ids.includes(t.id) ? " lf-pend" : ""),
      delay: finale ? 0.7 + i * 0.09 + "s" : sweeping && t.done ? S2.todos.filter((x) => x.done).indexOf(t) * 0.07 + "s" : void 0,
      evAmount: !t.done && t.id === (S2.todos.find((x) => !x.done && x.amount) || {}).id
    }
  ))), allDone && !sweeping && /* @__PURE__ */ import_react7.default.createElement("div", { key: allDoneAt || "static", className: "lf-alldone" + (finale ? " play" : ""), style: { "--delay": finaleAt + "s" } }, /* @__PURE__ */ import_react7.default.createElement("svg", { className: "lf-ad-badge", width: "64", height: "64", viewBox: "0 0 64 64", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("circle", { cx: "32", cy: "32", r: "30", style: { fill: "color-mix(in srgb,#1E9E6A 14%,var(--card))" } }), /* @__PURE__ */ import_react7.default.createElement("circle", { cx: "32", cy: "32", r: "22", fill: "#1E9E6A" }), /* @__PURE__ */ import_react7.default.createElement("path", { className: "lf-ad-check", d: "M22 32.5l7 7L42.5 25", fill: "none", stroke: "#fff", strokeWidth: "4.5", strokeLinecap: "round", strokeLinejoin: "round", pathLength: "1" })), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-ad-text" }, /* @__PURE__ */ import_react7.default.createElement("div", { style: { fontSize: 17, fontWeight: 600 } }, "全部完成"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-sub" }, "今天 ", S2.todos.length, " 件事都做完了"))), finale && /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-rain", "aria-hidden": "true" }, rain.map((q, k) => /* @__PURE__ */ import_react7.default.createElement("i", { key: k, style: { left: q.x + "%", background: q.c, width: q.w, height: q.round ? q.w : q.w * 0.42, borderRadius: q.round ? "50%" : 2, "--sx": q.sx + "px", "--r": q.r + "deg", "--dur": q.dur + "s", "--d": finaleAt + q.d + "s" } }))))), /* @__PURE__ */ import_react7.default.createElement("footer", { className: "lf-row", style: { justifyContent: "space-between", marginTop: 18, padding: "0 6px", fontSize: 13, color: "var(--ink2)", flexWrap: "wrap" } }, /* @__PURE__ */ import_react7.default.createElement("span", null, "数据存在这台电脑上 · ⌘K 随时记一句 · 按住卡片顶部的小横条换位置，拖右下角放大缩小"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 6 } }, customized && /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", onClick: resetLayout }, "恢复默认布局"), confirm === "clear" ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row lf-confirm", role: "alert", style: { gap: 8 } }, /* @__PURE__ */ import_react7.default.createElement("span", { style: { color: "var(--warn-ink)" } }, db.sample ? "清空示例数据" : "删除全部 " + db.records.length + " 条记录", realCount > 0 && db.sample ? "（含你自己记的 " + realCount + " 条）" : "", "，确定吗？"), /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", onClick: () => setConfirm(null) }, "取消"), /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", autoFocus: true, onClick: clearSample, style: { background: "#E5484D", color: "#fff" } }, "确定清空")) : confirm === "sample" ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row lf-confirm", role: "alert", style: { gap: 8 } }, /* @__PURE__ */ import_react7.default.createElement("span", { style: { color: "var(--warn-ink)" } }, "示例数据会替换掉你现在的 ", db.records.length, " 条记录，确定吗？"), /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", onClick: () => setConfirm(null) }, "取消"), /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", autoFocus: true, onClick: restoreSample, style: { background: "#E5484D", color: "#fff" } }, "确定替换")) : db.sample ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", null, "现在是示例数据"), /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", onClick: () => setConfirm("clear") }, "清空，开始用")) : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, db.records.length > 0 && /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", onClick: () => setConfirm("clear") }, "清空全部记录"), /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-btn", onClick: () => db.records.length ? setConfirm("sample") : restoreSample() }, "看示例数据")))))), /* @__PURE__ */ import_react7.default.createElement("svg", { "aria-hidden": "true", style: { position: "absolute", left: 0, top: 0, width: geo.w || "100%", height: geo.h || "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" } }, threads && threads.lines.map((l, i) => /* @__PURE__ */ import_react7.default.createElement("g", { key: threads.stamp + l.id }, /* @__PURE__ */ import_react7.default.createElement("path", { d: l.d, className: "lf-thread", stroke: l.color, pathLength: "1", style: { animationDelay: i * 0.05 + "s, " + (1.2 + i * 0.05) + "s" } }), /* @__PURE__ */ import_react7.default.createElement("circle", { r: "5", fill: l.color, opacity: "0" }, /* @__PURE__ */ import_react7.default.createElement("animate", { attributeName: "opacity", values: "0;1;1;0", keyTimes: "0;0.1;0.8;1", dur: "0.9s", begin: i * 0.05 + "s", fill: "freeze" }), /* @__PURE__ */ import_react7.default.createElement("animateMotion", { path: l.d, dur: "0.75s", begin: i * 0.05 + "s", fill: "freeze", keyPoints: "0;1", keyTimes: "0;1", calcMode: "spline", keySplines: "0.4 0 0.2 1" })))), link && /* @__PURE__ */ import_react7.default.createElement("g", { key: link.id }, /* @__PURE__ */ import_react7.default.createElement("defs", null, link.segs.map((g, i) => /* @__PURE__ */ import_react7.default.createElement("linearGradient", { key: i, id: "lfg-" + i, gradientUnits: "userSpaceOnUse", x1: g.a[0], y1: g.a[1], x2: g.z[0], y2: g.z[1] }, /* @__PURE__ */ import_react7.default.createElement("stop", { offset: "0", stopColor: g.c1 }), /* @__PURE__ */ import_react7.default.createElement("stop", { offset: "1", stopColor: g.c2 }))), /* @__PURE__ */ import_react7.default.createElement("marker", { id: "lf-arrow", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M0 0L10 5L0 10z", fill: link.color })), /* @__PURE__ */ import_react7.default.createElement("filter", { id: "lf-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, /* @__PURE__ */ import_react7.default.createElement("feGaussianBlur", { stdDeviation: "3" }))), link.segs.map((g, i) => /* @__PURE__ */ import_react7.default.createElement(
    "path",
    {
      key: i,
      d: g.d,
      className: "lf-cause",
      stroke: "url(#lfg-" + i + ")",
      pathLength: "1",
      markerEnd: g.end ? "url(#lf-arrow)" : void 0,
      style: { animationDelay: i * 0.35 + "s" }
    }
  )), link.segs.map((g, i) => /* @__PURE__ */ import_react7.default.createElement("circle", { key: "r" + i, cx: g.z[0], cy: g.z[1], r: "6", fill: "none", stroke: g.c2, strokeWidth: "2", className: "lf-arrive", style: { animationDelay: 0.35 + i * 0.35 + "s" } })), /* @__PURE__ */ import_react7.default.createElement("circle", { r: "9", fill: link.color, opacity: ".35", filter: "url(#lf-glow)" }, /* @__PURE__ */ import_react7.default.createElement("animateMotion", { dur: "1.8s", begin: "0.7s", repeatCount: "indefinite", path: link.full, keyPoints: "0;1", keyTimes: "0;1", calcMode: "spline", keySplines: "0.45 0 0.25 1" })), /* @__PURE__ */ import_react7.default.createElement("circle", { r: "4", fill: "#fff", stroke: link.color, strokeWidth: "2" }, /* @__PURE__ */ import_react7.default.createElement("animateMotion", { dur: "1.8s", begin: "0.7s", repeatCount: "indefinite", path: link.full, keyPoints: "0;1", keyTimes: "0;1", calcMode: "spline", keySplines: "0.45 0 0.25 1" })))), /* @__PURE__ */ import_react7.default.createElement(ReceiptPrinter, { open: printOpen, onClose: () => setPrintOpen(false), records: db.records, S: S2, cardEl: refs.current.money, rootEl: rootRef.current }), /* @__PURE__ */ import_react7.default.createElement(GoalsPanel, { open: goalsOpen, onClose: () => setGoalsOpen(false), rootRect, suggestions, goals, onAdopt: adoptGoal, onUndo: undoGoal, celebrate }), bursts.map((b) => /* @__PURE__ */ import_react7.default.createElement("div", { key: b.id, "aria-hidden": "true", style: { position: "fixed", left: b.x, top: b.y, width: 0, height: 0, zIndex: 40, pointerEvents: "none" } }, b.big && /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-ring" }), b.parts.map((q, i) => /* @__PURE__ */ import_react7.default.createElement("i", { key: i, className: "lf-confetti", style: { "--dx": q.dx + "px", "--dy": q.dy + "px", "--r": q.r + "deg", background: q.c, width: q.w, height: q.round ? q.w : q.w * 0.45, borderRadius: q.round ? "50%" : 2, animationDelay: q.delay + "s", animationDuration: (b.big ? 1.3 : 0.9) + "s" } })))), undo && /* @__PURE__ */ import_react7.default.createElement("div", { role: "status", className: "lf-row", style: { position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 21, gap: 14, background: "#1F2328", color: "#F4F5F1", borderRadius: 24, padding: "8px 8px 8px 20px", fontSize: 14, boxShadow: "0 12px 32px rgba(31,35,40,.25)", animation: "lf-rise .35s cubic-bezier(.2,.8,.2,1)" } }, /* @__PURE__ */ import_react7.default.createElement("span", null, undo.label), /* @__PURE__ */ import_react7.default.createElement("button", { onClick: doUndo, style: { height: 34, padding: "0 16px", borderRadius: 17, border: 0, background: "#F2994A", color: "#1F2328", fontWeight: 600, fontSize: 14 } }, "撤销")), toast && !undo && /* @__PURE__ */ import_react7.default.createElement("div", { role: "status", style: { position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 20, background: "#1F2328", color: "#F4F5F1", borderRadius: 22, padding: "12px 20px", fontSize: 14, boxShadow: "0 12px 32px rgba(31,35,40,.25)", animation: "lf-rise .35s cubic-bezier(.2,.8,.2,1)" } }, toast));
}
function TodayList({ S: S2, ghosts, onFill, onRemove }) {
  const entries = [
    ...S2.timeline.map((g) => ({ kind: "real", t: Math.min(g.t, S2.now), key: g.key, g })),
    ...ghosts.map((s) => ({ kind: "ghost", t: S2.today + s.h * 36e5, key: "ghost-" + s.key, s }))
  ].sort((a, b) => b.t - a.t);
  const cut = entries.findIndex((e) => e.t <= S2.now);
  entries.splice(cut < 0 ? entries.length : cut, 0, { kind: "now", key: "now", t: S2.now });
  const hm2 = (h) => {
    const m = Math.round(h * 60);
    return String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  };
  return /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", flexDirection: "column" } }, S2.timeline.length === 0 && /* @__PURE__ */ import_react7.default.createElement("p", { className: "lf-enter", style: { margin: "2px 0 10px", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink2)" } }, "今天还没记。按你平时的习惯，先把今天的空位摆出来了，点一个就能补上。"), entries.map((e, i) => {
    const prev = entries[i - 1];
    if (e.kind === "now") return /* @__PURE__ */ import_react7.default.createElement("div", { key: "now", className: "lf-now", "aria-label": "现在 " + fmtTime(S2.now) }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-now-dot" }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-num" }, "现在 ", fmtTime(S2.now)), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-now-line" }));
    if (e.kind === "ghost") {
      const s = e.s, future = e.t > S2.now;
      return /* @__PURE__ */ import_react7.default.createElement(
        "button",
        {
          key: e.key,
          type: "button",
          "data-ev": "slot." + s.key,
          className: "lf-ghost lf-enter " + (future ? "future" : "due"),
          style: { "--g": C2[s.domain], animationDelay: 0.25 + i * 0.06 + "s" },
          onClick: () => onFill(s.phrase),
          "aria-label": (future ? "待会儿：" : "还没记：") + s.title + "，" + s.hint + "，点一下填进输入框"
        },
        /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-num lf-ghost-time" }, hm2(s.h)),
        /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-ghost-box" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-ghost-title" }, s.title), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-ghost-hint" }, s.hint), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-ghost-cta" }, future ? "待会儿" : "还没记", /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-ghost-plus", "aria-hidden": "true" }, "+")))
      );
    }
    const g = e.g;
    return /* @__PURE__ */ import_react7.default.createElement("div", { key: e.key, className: "lf-tl-item", style: { display: "flex", gap: 14, padding: "12px 0", borderTop: prev && prev.kind === "real" ? "1px solid var(--rule)" : 0, alignItems: "flex-start" } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-num", style: { width: 44, fontSize: 13, color: "var(--ink2)", paddingTop: 3, flex: "none" } }, fmtTime(g.t)), /* @__PURE__ */ import_react7.default.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 15, fontWeight: 500 } }, g.wake ? "醒来" : g.items[0].type === "weight" ? /* @__PURE__ */ import_react7.default.createElement(Private, null, g.items[0].title || labelOf(g.items[0])) : g.items[0].title || labelOf(g.items[0])), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { gap: 6, flexWrap: "wrap" } }, g.items.map((r, j) => /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, { key: r.id }, j > 0 && /* @__PURE__ */ import_react7.default.createElement("span", { style: { color: "#B4B8B0", display: "inline-flex" } }, Icon.arrow), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-chip", style: { background: DOMAIN[domainOf(r)].soft, color: "var(--ink)", height: 24 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: C2[domainOf(r)] } }), r.type === "weight" ? /* @__PURE__ */ import_react7.default.createElement(Private, null, labelOf(r)) : labelOf(r)))))), !g.wake && /* @__PURE__ */ import_react7.default.createElement("button", { className: "lf-icon", "aria-label": "删除 " + (g.items[0].title || ""), onClick: () => onRemove(g) }, Icon.x));
  }));
}
function NextCard({ P: P2, S: S2, onDone }) {
  const n = S2.next;
  if (!n) return /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("next", 3), cls: "s4", bg: "#F4F5F1" }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "接下来"), /* @__PURE__ */ import_react7.default.createElement("p", { style: { fontSize: 22, fontWeight: 600, margin: "18px 0 6px" } }, "后面没有安排了"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub" }, "说「明天 19:30 跑步」加一项。"));
  const isMove = n.domain === "move", toneBg = TONES[eventTone(n)];
  const mins = Math.round((n.t - S2.now) / 6e4);
  const when = mins <= 0 ? "进行中" : mins < 60 ? mins + " 分钟后" : mins < 24 * 60 ? Math.floor(mins / 60) + " 小时 " + mins % 60 + " 分后" : "明天 " + fmtTime(n.t);
  return /* @__PURE__ */ import_react7.default.createElement(Card, { ...P2("next", 3), cls: "s4", bg: toneBg, color: "#fff", style: { display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 } }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h", style: { fontWeight: 500, opacity: 0.85, fontSize: 14 } }, "接下来"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-chip", style: { background: "rgba(255,255,255,.18)" } }, when)), /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("div", { "data-ev": "next.title", style: { fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, display: "inline-block" } }, n.title), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-num", style: { fontSize: 14, opacity: 0.8, marginTop: 6 } }, fmtTime(n.t), " – ", fmtTime(n.end || n.t + 36e5))), S2.nextAdvice && /* @__PURE__ */ import_react7.default.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.5, background: "rgba(255,255,255,.14)", borderRadius: 14, padding: "9px 12px" } }, S2.nextAdvice), isMove && /* @__PURE__ */ import_react7.default.createElement("button", { onClick: () => onDone(n), style: { alignSelf: "flex-start", height: 40, padding: "0 18px", borderRadius: 20, border: 0, background: "var(--card)", color: C2.move, fontWeight: 600, fontSize: 14 } }, "练完了，记下"));
}
function dustOf(id, n) {
  let h = 0;
  for (const c of String(id)) h = h * 31 + c.charCodeAt(0) >>> 0;
  const r = () => (h = h * 1103515245 + 12345 >>> 0) / 4294967296;
  return Array.from({ length: n }, () => ({ x: 30 + r() * 70, y: -26 + r() * 40, rot: -60 + r() * 120, s: 0.3 + r() * 0.5 }));
}
function useDisplayOrder(ids, delay) {
  const [disp, setDisp] = (0, import_react7.useState)(ids);
  const key = ids.join(","), dk = disp.join(",");
  (0, import_react7.useEffect)(() => {
    if (key === dk) return;
    const same = ids.length === disp.length && ids.every((x) => disp.includes(x));
    if (!same) {
      setDisp(ids);
      return;
    }
    const t = setTimeout(() => setDisp(ids), delay);
    return () => clearTimeout(t);
  }, [key, dk]);
  return disp;
}
function useFlipList(els, order) {
  const prev = (0, import_react7.useRef)({});
  (0, import_react7.useLayoutEffect)(() => {
    const now = {};
    order.forEach((id) => {
      const n = els.current[id];
      if (n) now[id] = n.offsetTop;
    });
    const old = prev.current;
    const moved = order.filter((id) => old[id] != null && now[id] != null && Math.abs(old[id] - now[id]) > 2);
    if (moved.length && !(typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      const hero = moved.reduce((a, b) => Math.abs(old[b] - now[b]) > Math.abs(old[a] - now[a]) ? b : a);
      let k = 0;
      moved.forEach((id) => {
        const n = els.current[id], dy = old[id] - now[id];
        if (id === hero) {
          const down = dy < 0;
          n.style.zIndex = 2;
          const a = n.animate(down ? [
            { transform: `translateY(${dy}px)`, boxShadow: "0 0 0 rgba(0,0,0,0)", background: "rgba(255,255,255,0)" },
            { transform: `translate(14px, ${dy * 0.55}px) rotate(1.8deg) scale(1.03)`, boxShadow: "0 14px 28px -12px rgba(31,35,40,.3)", background: "var(--card)", offset: 0.42 },
            { transform: "translate(2px, 4px) scale(1.015, .94)", boxShadow: "0 4px 10px -6px rgba(31,35,40,.2)", background: "var(--card)", offset: 0.78 },
            { transform: "translateY(-2px) scale(.995, 1.02)", offset: 0.9 },
            { transform: "none", boxShadow: "0 0 0 rgba(0,0,0,0)", background: "rgba(255,255,255,0)" }
          ] : [
            { transform: `translateY(${dy}px)`, background: "rgba(255,255,255,0)" },
            { transform: `translate(-10px, ${dy * 0.5}px) rotate(-1.5deg) scale(1.03)`, background: "var(--card)", boxShadow: "0 12px 24px -12px rgba(30,158,106,.35)", offset: 0.45 },
            { transform: "translateY(-5px) scale(1.01)", offset: 0.75 },
            { transform: "none", background: "rgba(255,255,255,0)", boxShadow: "0 0 0 rgba(0,0,0,0)" }
          ], { duration: 640, easing: "cubic-bezier(.3,.7,.35,1)" });
          a.onfinish = a.oncancel = () => {
            n.style.zIndex = "";
          };
        } else {
          n.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 460, delay: 40 + k++ * 35, easing: "cubic-bezier(.25,1.25,.4,1)", fill: "backwards" });
        }
      });
    }
    prev.current = now;
  });
}
function TodoRow({ arrived = -1, onLanded, rowRef, t, i, onToggle, onEdit, onDelete, onRestore, dying, cls, delay, evAmount }) {
  const [edit, setEdit] = (0, import_react7.useState)(false);
  const [draft, setDraft] = (0, import_react7.useState)("");
  const [saved, setSaved] = (0, import_react7.useState)(0);
  const inp = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    if (edit && inp.current) {
      inp.current.focus();
      inp.current.select();
    }
  }, [edit]);
  const startEdit = () => {
    setDraft(t.title + (t.amount ? " " + t.amount : ""));
    setEdit(true);
  };
  const save = () => {
    if (!edit) return;
    setEdit(false);
    const v = draft.trim();
    if (v && v !== t.title + (t.amount ? " " + t.amount : "")) {
      onEdit(t, v);
      setSaved(Date.now());
    }
  };
  const phase = dying && dying.phase;
  const chars = [...t.title], dust = dustOf(t.id, chars.length);
  const [, tick2] = (0, import_react7.useState)(0);
  (0, import_react7.useEffect)(() => {
    if (phase !== "undo") return;
    const iv = setInterval(() => tick2((x) => x + 1), 250);
    return () => clearInterval(iv);
  }, [phase]);
  const left = dying && dying.end ? Math.max(1, Math.ceil((dying.end - Date.now()) / 1e3)) : 0;
  const base = { borderTop: i ? "1px solid var(--rule)" : 0, animationDelay: delay };
  if (phase === "undo" || phase === "gone") {
    return /* @__PURE__ */ import_react7.default.createElement("div", { ref: rowRef, className: "lf-row lf-todo lf-todo-undo" + (phase === "gone" ? " gone" : ""), style: base, role: "status" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-todo-ghost" }, "已删除 ", /* @__PURE__ */ import_react7.default.createElement("s", null, t.title)), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-sweep-btn pending", onClick: () => onRestore(t), style: { "--dur": "4s" }, "aria-label": "撤销删除，还剩 " + left + " 秒" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-glow" }), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-num" }, /* @__PURE__ */ import_react7.default.createElement("span", { key: left, className: "lf-roll" }, left)), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-label" }, "撤销"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sweep-undo" }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M9 14L4 9l5-5" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M4 9h10a6 6 0 0 1 0 12h-3" })))));
  }
  const dustOn = phase === "dust", back = phase === "back";
  return /* @__PURE__ */ import_react7.default.createElement(
    "div",
    {
      className: "lf-row lf-todo" + (t.done ? " done" : "") + cls + (dustOn ? " dust" : "") + (back ? " back" : "") + (edit ? " editing" : "") + (saved && Date.now() - saved < 1200 ? " saved" : "") + (arrived >= 0 ? " lf-arrive" : ""),
      style: arrived >= 0 ? { ...base, "--ad": 0.5 + arrived * 0.16 + "s" } : base,
      ref: rowRef,
      onAnimationEnd: (e) => {
        if (arrived >= 0 && e.animationName === "lf-arrive" && e.target === e.currentTarget) onLanded && onLanded(t.id);
      }
    },
    edit ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-check" + (t.done ? " on" : ""), "aria-hidden": "true" }, t.done && /* @__PURE__ */ import_react7.default.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M5 12.5l4.5 4.5L19 7.5" }))), /* @__PURE__ */ import_react7.default.createElement(
      "input",
      {
        ref: inp,
        className: "lf-todo-input",
        value: draft,
        onChange: (e) => setDraft(e.target.value),
        onBlur: save,
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setEdit(false);
          }
        },
        "aria-label": "改这件事，末尾写数字就是金额",
        placeholder: "比如：交水电费 180"
      }
    ), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-todo-hint" }, "回车保存 · Esc 取消")) : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-todo-hit", onClick: (ev) => !dying && onToggle(t, ev), "aria-pressed": t.done, disabled: !!dustOn }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-check" + (t.done ? " on" : "") }, t.done && /* @__PURE__ */ import_react7.default.createElement("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { className: "lf-tick", d: "M5 12.5l4.5 4.5L19 7.5", pathLength: "1" }))), /* @__PURE__ */ import_react7.default.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 15, color: t.done ? "var(--ink3)" : C2.ink, transition: "color .3s" } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-strike" }, chars.map((c, k) => /* @__PURE__ */ import_react7.default.createElement("span", { key: k, className: "lf-ch", style: { "--dx": dust[k].x + "px", "--dy": dust[k].y + "px", "--rot": dust[k].rot + "deg", "--s": dust[k].s, "--i": k } }, c))))), t.amount ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-chip lf-todo-amt", "data-ev": evAmount ? "todos.amount" : void 0, style: { background: t.done ? "var(--fill)" : DOMAIN.money.soft, color: t.done ? "var(--ink3)" : "var(--money-ink)", height: 24 } }, money(t.amount)) : null, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-todo-acts" }, /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-todo-act", onClick: startEdit, "aria-label": "改「" + t.title + "」", title: "改一下" }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M4 20h4L19 9l-4-4L4 16v4z" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M13.5 6.5l4 4" }))), /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-todo-act del", onClick: () => onDelete(t), "aria-label": "删除「" + t.title + "」", title: "删掉" }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M5 7h14" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M10 7V5h4v2" }), /* @__PURE__ */ import_react7.default.createElement("path", { d: "M7 7l1 12h8l1-12" })))))
  );
}
function BackTodos({ records, today, onRestore }) {
  const list = records.filter((r) => r.type === "todo" && (r.archived || r.done && r.doneAt && r.doneAt < today)).sort((a, b) => (b.doneAt || b.t) - (a.doneAt || a.t));
  const groups = [];
  list.forEach((t) => {
    const d = startOfDay(t.doneAt || t.t), days = Math.round((today - d) / 864e5);
    const label = days <= 0 ? "今天" : days === 1 ? "昨天" : days === 2 ? "前天" : new Date(d).getMonth() + 1 + "月" + new Date(d).getDate() + "日";
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(t);
    else groups.push({ label, items: [t] });
  });
  const [back, setBack] = (0, import_react7.useState)({});
  const putBack = (t) => {
    if (back[t.id]) return;
    setBack((b) => ({ ...b, [t.id]: true }));
    setTimeout(() => onRestore(t), 520);
  };
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-back" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "做完收起来的"), /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 12, color: "var(--ink3)" } }, list.length ? "共 " + list.length + " 件 · " : "", "点空白处翻回去")), list.length === 0 ? /* @__PURE__ */ import_react7.default.createElement("p", { className: "lf-sub", style: { margin: "8px 0" } }, "还没有收起来的事。清掉已完成的、或者前一天做完的，都会到这里。") : /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-archive lf-inner-scroll" }, groups.map((g) => /* @__PURE__ */ import_react7.default.createElement("div", { key: g.label, className: "lf-archive-group" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-archive-day" }, g.label), g.items.map((t, i) => /* @__PURE__ */ import_react7.default.createElement("div", { key: t.id, className: "lf-archive-item" + (back[t.id] ? " out" : ""), style: { animationDelay: Math.min(i, 8) * 0.04 + "s" } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-archive-tick" }, /* @__PURE__ */ import_react7.default.createElement("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react7.default.createElement("path", { d: "M5 12.5l4.5 4.5L19 7.5" }))), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-archive-title" }, t.title), t.amount ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-archive-amt" }, money(t.amount)) : null, /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-archive-back", onClick: () => putBack(t), title: "放回「要做的事」，重新变成没做完" }, "放回去")))))));
}
function TodayNudges({ part, S: S2, ghosts, usual, focused, onPick, onInsight, pinned }) {
  const slots = ghosts.slice().sort((a, b) => a.h - b.h).slice(0, 3);
  const tips = S2.insights.slice(0, 4);
  const [ti, setTi] = (0, import_react7.useState)(0);
  const [hold, setHold] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    if (hold || tips.length < 2) return;
    const iv = setInterval(() => setTi((x) => x + 1), 5200);
    return () => clearInterval(iv);
  }, [hold, tips.length]);
  const tip = tips.length ? tips[ti % tips.length] : null;
  const nowH = (S2.now - S2.today) / 36e5;
  const fmtH = (h) => String(Math.floor(h)).padStart(2, "0") + ":" + String(Math.round(h % 1 * 60)).padStart(2, "0");
  const tone = (d) => C2[d] && C2[d] !== "#1F2328" ? C2[d] : "#F4F5F1";
  const sugs = [
    ...slots.map((g) => ({ key: "g" + g.key, text: g.title.replace("吃了什么", ""), sub: g.h <= nowH ? "该记了" : fmtH(g.h), due: g.h <= nowH, phrase: g.phrase, c: tone(g.domain) })),
    ...usual.slice(0, 4).map((u) => ({ key: "u" + u, text: u, phrase: u }))
  ];
  const keep = (e) => e.preventDefault();
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-nudges" + (focused ? " focus" : "") }, part === "sugs" && /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-sugs" + (focused && sugs.length ? " on" : ""), "aria-hidden": !focused }, sugs.map((g, i) => /* @__PURE__ */ import_react7.default.createElement(
    "button",
    {
      key: g.key,
      type: "button",
      tabIndex: focused ? 0 : -1,
      className: "lf-sug" + (g.due ? " due" : ""),
      style: { "--c": g.c || "rgba(244,245,241,.5)", transitionDelay: (focused ? i * 0.03 : 0) + "s" },
      onMouseDown: keep,
      onClick: () => onPick(g.phrase)
    },
    g.c && /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sug-dot" }),
    g.text,
    g.sub && /* @__PURE__ */ import_react7.default.createElement("em", null, g.sub)
  ))), part === "tip" && tip && /* @__PURE__ */ import_react7.default.createElement("button", { type: "button", className: "lf-tip" + (pinned && pinned.id === tip.id ? " on" : ""), onMouseEnter: () => setHold(true), onMouseLeave: () => setHold(false), onClick: () => onInsight(tip), title: "点一下，在下面的卡片上看它们怎么连起来" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-tip-dots" }, /* @__PURE__ */ import_react7.default.createElement("i", { style: { background: tone(tip.from) } }), /* @__PURE__ */ import_react7.default.createElement("b", null), /* @__PURE__ */ import_react7.default.createElement("i", { style: { background: tone(tip.to) } })), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-tip-win" }, /* @__PURE__ */ import_react7.default.createElement("span", { key: tip.id + ti, className: "lf-tip-text" }, tip.text)), tips.length > 1 && /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-tip-pager" }, tips.map((_, k) => /* @__PURE__ */ import_react7.default.createElement("i", { key: k, className: k === ti % tips.length ? "on" : "" })))));
}
function EnergyTaste({ S: S2, pour }) {
  const ref = (0, import_react7.useRef)(null);
  const t = useTaste(ref, S2);
  const cap = Math.max(GOALS.kcal + S2.burned, S2.kcalIn) * 1.05;
  const pct = (v) => v / cap * 100 + "%";
  return /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("div", { ref, style: { position: "relative" } }, /* @__PURE__ */ import_react7.default.createElement(LiquidBar, { eaten: S2.kcalIn, goal: GOALS.kcal, burned: S2.burned, cap, meals: S2.meals, preview: t && t.mode === "taste" ? t.k : null, pour }), t && t.mode === "taste" && t.more > 0 && /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-taste-tip", style: { left: `clamp(20px, ${pct(t.k)}, calc(100% - 20px))`, color: t.left < 0 ? "#C8373C" : void 0 } }, "+", num(t.more))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginTop: 12, fontSize: 13, color: "var(--ink2)", minHeight: 18 } }, !t ? /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", "data-ev": "energy.eaten", style: { gap: 6 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: C2.food } }), "吃了 ", /* @__PURE__ */ import_react7.default.createElement(Num, { value: S2.kcalIn })), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-row", style: { gap: 6 } }, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-dot", style: { background: C2.move } }), "练掉 ", /* @__PURE__ */ import_react7.default.createElement(Num, { value: S2.burned }))) : t.mode === "meal" ? /* @__PURE__ */ import_react7.default.createElement("span", { key: "meal", className: "lf-swap lf-tab", style: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, t.meal ? fmtTime(t.meal.t) + " " + (MEAL_NAME[t.meal.meal] || "") + " · " + t.meal.title + " · " + num(t.meal.kcal) + " 千卡" : "今天还没吃东西") : /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-swap lf-tab", key: "t1" }, "要是再吃 ", /* @__PURE__ */ import_react7.default.createElement("b", { style: { color: "var(--food-ink)" } }, num(t.more)), " 千卡"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-swap lf-tab", key: "t2", style: { color: t.left < 0 ? C2.link : void 0 } }, t.left < 0 ? "会超出 " + num(-t.left) : "还剩 " + num(t.left)))));
}
function SleepBody({ S: S2 }) {
  const ref = (0, import_react7.useRef)(null);
  const row = useSleepRow(ref, 7);
  const d = row != null ? S2.week[row] : null;
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-sleep-body" + (d ? " scan" : "") }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", alignItems: "flex-end" } }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h", style: { opacity: 0.85, fontWeight: 500, fontSize: 14 } }, "这周平均每晚"), /* @__PURE__ */ import_react7.default.createElement(Num, { value: S2.sleepAvg, format: (v) => fmtHM(v), style: { fontSize: 44, fontWeight: 500, lineHeight: 1.05 } })), d ? /* @__PURE__ */ import_react7.default.createElement("span", { key: "scan", className: "lf-swap lf-tab", style: { fontSize: 13, opacity: 0.9, textAlign: "right" } }, "周", d.label, d.today ? "（昨晚）" : "", /* @__PURE__ */ import_react7.default.createElement("br", null), /* @__PURE__ */ import_react7.default.createElement("b", { style: { fontSize: 16 } }, d.sleep ? fmtHM(d.sleep.bed % 24) + " → " + fmtHM((d.sleep.bed + d.sleep.hours) % 24) : "没记")) : /* @__PURE__ */ import_react7.default.createElement("span", { style: { fontSize: 13, opacity: 0.8, textAlign: "right" } }, "昨晚", /* @__PURE__ */ import_react7.default.createElement("br", null), /* @__PURE__ */ import_react7.default.createElement("b", { "data-ev": "sleep.last", style: { fontSize: 16, display: "inline-block" } }, S2.lastNight ? fmtHM(S2.lastNight.hours) : "没记"))), /* @__PURE__ */ import_react7.default.createElement(SleepBars, { week: S2.week, rowsRef: ref, on: row }));
}
function SleepBars({ week, rowsRef, on }) {
  const span = 12;
  return /* @__PURE__ */ import_react7.default.createElement("div", { "data-ev": "sleep.bars", style: { display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, marginTop: 16, flex: 1 } }, /* @__PURE__ */ import_react7.default.createElement("div", { ref: rowsRef, style: { display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, flex: 1 } }, week.map((d, i) => /* @__PURE__ */ import_react7.default.createElement("div", { key: d.day, className: "lf-row lf-sleep-row" + (on === i ? " on" : ""), style: { gap: 10 } }, /* @__PURE__ */ import_react7.default.createElement("span", { style: { width: 14, fontSize: 12, opacity: d.today ? 1 : 0.7, fontWeight: d.today ? 700 : 400 } }, d.label), /* @__PURE__ */ import_react7.default.createElement("div", { style: { position: "relative", flex: 1, height: 12 } }, d.sleep && /* @__PURE__ */ import_react7.default.createElement("div", { key: d.day + "-" + d.sleep.hours, className: "lf-growx", title: fmtHM(d.sleep.hours), style: { position: "absolute", top: 0, height: 12, borderRadius: 6, left: (d.sleep.bed - 22) / span * 100 + "%", width: d.sleep.hours / span * 100 + "%", background: d.today || on === i ? "#fff" : "rgba(255,255,255,.4)", boxShadow: on === i ? "0 0 12px rgba(255,255,255,.6)" : "none", transition: "all .7s cubic-bezier(.2,.8,.2,1), box-shadow .2s, background .2s" } }))))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row lf-num", style: { justifyContent: "space-between", paddingLeft: 24, fontSize: 11.5, opacity: 0.75 } }, [22, 0, 2, 4, 6, 8, 10].map((x) => /* @__PURE__ */ import_react7.default.createElement("span", { key: x }, x))));
}
function WeightLine({ weights, now }) {
  const pts = weights.filter((w) => w.t > now - 30 * 864e5);
  if (pts.length < 2) return /* @__PURE__ */ import_react7.default.createElement("div", { style: { height: "100%" } });
  const W2 = 220, H2 = 64, min = Math.min(...pts.map((p) => p.kg)) - 0.2, max = Math.max(...pts.map((p) => p.kg)) + 0.2;
  const x = (t) => (t - pts[0].t) / (pts[pts.length - 1].t - pts[0].t || 1) * (W2 - 8) + 4;
  const y = (k) => H2 - 6 - (k - min) / (max - min || 1) * (H2 - 12);
  const d = pts.map((p, i) => (i ? "L" : "M") + x(p.t).toFixed(1) + " " + y(p.kg).toFixed(1)).join(" ");
  const last = pts[pts.length - 1];
  return /* @__PURE__ */ import_react7.default.createElement("svg", { viewBox: `0 0 ${W2} ${H2}`, width: "100%", height: "100%", preserveAspectRatio: "none", style: { display: "block" }, role: "img", "aria-label": "30 天体重从 " + pts[0].kg + " 到 " + last.kg }, /* @__PURE__ */ import_react7.default.createElement("path", { d: d + ` L${x(last.t)} ${H2} L4 ${H2} Z`, style: { fill: "color-mix(in srgb,#0E8A8A 16%,var(--card))" } }), /* @__PURE__ */ import_react7.default.createElement("path", { d, fill: "none", stroke: C2.body, strokeWidth: "2.2", strokeLinejoin: "round", strokeLinecap: "round", vectorEffect: "non-scaling-stroke", className: "lf-fadein" }));
}
function WeekBoard({ S: S2 }) {
  const nextMove = S2.events.find((e) => e.domain === "move" && !e.done && e.t > S2.now);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = S2.today + i * 864e5;
    const evs = S2.events.filter((e) => e.t >= day && e.t < day + 864e5);
    const clash = evs.filter((a) => evs.some((b) => b !== a && a.t < (b.end || b.t) && b.t < (a.end || a.t)));
    days.push({ day, evs, clash: new Set(clash.map((c) => c.id)), label: i === 0 ? "今天" : i === 1 ? "明天" : "周" + "日一二三四五六"[new Date(day).getDay()], date: new Date(day).getDate() });
  }
  const clashDay = days.find((d) => d.clash.size);
  return /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { justifyContent: "space-between", marginBottom: 14 } }, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "lf-h" }, "接下来七天"), /* @__PURE__ */ import_react7.default.createElement("span", { className: "lf-sub", style: { color: clashDay ? "var(--warn-ink)" : void 0 } }, clashDay ? clashDay.label + " 有两个安排撞了" : "没有冲突")), /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 8 } }, days.map((d, i) => /* @__PURE__ */ import_react7.default.createElement("div", { key: d.day, style: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 } }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-row", style: { gap: 6, height: 40, borderRadius: 14, justifyContent: "center", background: i === 0 ? "var(--ink)" : "var(--fill)", color: i === 0 ? "var(--card)" : C2.ink, fontSize: 13 } }, /* @__PURE__ */ import_react7.default.createElement("span", { style: { opacity: 0.75 } }, d.label), /* @__PURE__ */ import_react7.default.createElement("b", { className: "lf-num" }, d.date)), d.evs.length === 0 && /* @__PURE__ */ import_react7.default.createElement("span", { style: { height: 44, borderRadius: 12, border: "1.5px dashed var(--line)" } }), d.evs.map((e) => {
    const clash = d.clash.has(e.id), move = e.domain === "move", tc = TONES[eventTone(e)];
    return /* @__PURE__ */ import_react7.default.createElement("div", { key: e.id, "data-ev": nextMove && e.id === nextMove.id ? "week.move" : void 0, style: { borderRadius: 12, padding: "7px 9px", minWidth: 0, background: clash ? "color-mix(in srgb,#E5484D 13%,var(--card))" : move ? e.done ? "color-mix(in srgb,#1E9E6A 14%,var(--card))" : C2.move : e.t < S2.now ? "var(--fill)" : tc, color: clash ? "var(--warn-ink)" : move ? e.done ? "var(--move-ink)" : "#fff" : e.t < S2.now ? "var(--ink3)" : "#fff", boxShadow: clash ? "inset 0 0 0 1.5px #E5484D" : "none" } }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "lf-num", style: { fontSize: 11, opacity: 0.8 } }, fmtTime(e.t), e.done ? " · 已完成" : ""), /* @__PURE__ */ import_react7.default.createElement("div", { style: { fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, e.title));
  })))));
}
function domainOf(r) {
  return { meal: "food", expense: "money", income: "money", workout: "move", sleep: "sleep", weight: "body", todo: "time" }[r.type] || (r.domain === "move" ? "move" : "time");
}
function labelOf(r) {
  switch (r.type) {
    case "meal":
      return MEAL_NAME[r.meal] + " " + r.kcal + " 千卡";
    case "expense":
      return r.cat + " " + money(r.amount);
    case "income":
      return "收入 " + money(r.amount);
    case "workout":
      return r.kind + " " + (r.steps ? Math.round(r.steps).toLocaleString("en-US") + " 步 · 约 " + r.minutes + " 分" : r.minutes + " 分") + " · −" + r.kcal + " 千卡";
    case "sleep":
      return "睡眠 " + fmtHM(r.hours);
    case "weight":
      return "体重 " + r.kg + " kg";
    case "event":
      return "日程 " + fmtTime(r.t);
    case "todo":
      return "待办" + (r.amount ? " " + money(r.amount) : "");
    default:
      return r.title;
  }
}
function whenOf(r) {
  if (r.type === "event" || r.type === "todo") return "";
  const d0 = startOfDay(Date.now());
  if (r.t >= d0) return "";
  const d = new Date(r.t), days = Math.round((d0 - startOfDay(r.t)) / 864e5);
  return (days === 1 ? "昨天" : days === 2 ? "前天" : d.getMonth() + 1 + "月" + d.getDate() + "日") + " · ";
}
function summaryOf(rs) {
  return "记下了：" + rs.map((r) => whenOf(r) + labelOf(r)).join("，");
}
function highlight(text, tokens) {
  const marks = [];
  tokens.forEach((t) => {
    const i = text.indexOf(t.text);
    if (i >= 0 && !marks.some((m) => i < m.e && i + t.text.length > m.s)) marks.push({ s: i, e: i + t.text.length, d: t.domain });
  });
  marks.sort((a, b) => a.s - b.s);
  const out = [];
  let p = 0;
  marks.forEach((m, k) => {
    if (m.s > p) out.push(/* @__PURE__ */ import_react7.default.createElement("span", { key: "t" + k }, text.slice(p, m.s)));
    const bg = C2[m.d] === "#1F2328" ? "#F4F5F1" : C2[m.d];
    out.push(/* @__PURE__ */ import_react7.default.createElement("span", { key: "m" + k, className: "lf-token", style: { background: bg, color: m.d === "food" || m.d === "time" ? "#1F2328" : "#fff" } }, text.slice(m.s, m.e)));
    p = m.e;
  });
  if (p < text.length) out.push(/* @__PURE__ */ import_react7.default.createElement("span", { key: "end" }, text.slice(p)));
  return out;
}
function storyOf(S2) {
  const bits = [];
  if (S2.kcalIn) bits.push("吃了 " + num(S2.kcalIn) + " 千卡");
  if (S2.burned) bits.push("练掉 " + num(S2.burned) + " 千卡");
  if (S2.todaySpent) bits.push("花了 " + money(S2.todaySpent));
  const sl = S2.lastNight ? "昨晚睡了 " + fmtHM(S2.lastNight.hours) + (S2.lastNight.hours < 6.5 ? "，有点少" : "") + "。" : "";
  const s = sl + (bits.length ? "今天" + bits.join("，") + "。" : "");
  const n = S2.next ? "接下来是 " + fmtTime(S2.next.t) + " 的" + S2.next.title + "。" : "";
  return s + n;
}

// src/icon.jsx
var import_react8 = __toESM(require("react"));
function DialIcon(props) {
  const s = props && props.size || 18;
  return /* @__PURE__ */ import_react8.default.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round", "aria-hidden": "true" }, /* @__PURE__ */ import_react8.default.createElement("circle", { cx: "12", cy: "12", r: "8.5", strokeOpacity: ".35" }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M12 3.5a8.5 8.5 0 0 1 8.2 6.3" }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M5.2 17.1a8.5 8.5 0 0 0 4.6 3.1" }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M12 12l4.2 3" }), /* @__PURE__ */ import_react8.default.createElement("circle", { cx: "12", cy: "12", r: "1.6", fill: "currentColor", stroke: "none" }));
}

// src/plugin.jsx
var PANEL = "rigui";
function LifePanel() {
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: "lf-host", style: { flex: "auto", width: "100%", minWidth: 0, height: "100%", minHeight: 0, overflowX: "hidden", overflowY: "auto", overscrollBehavior: "contain", background: "#E8EAE5" } }, /* @__PURE__ */ import_react9.default.createElement(LifeApp, null));
}
var isPlugin = true;
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: PANEL, order: 5, label: () => "日晷" }, DialIcon));
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL }, LifePanel));
}

    Object.defineProperty(module.exports, Symbol.toStringTag, { value: 'Module' })
    return module.exports
  },
})
