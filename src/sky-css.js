// 日夜和天气相关的样式，插在 styles.js 的深色色板后面（保持原来的层叠顺序）
export const SKY_CSS = `
body[data-ds-dark-theme] .lf-host,.lf-host:has(> .lf-root[data-theme=dark]){background:#0B0E22!important}
body[data-ds-dark-theme] .lf-host:has(> .lf-root[data-theme=light]){background:#E8EAE5!important}
.lf-root[data-theme=dark] .lf-insight:hover,.lf-root[data-theme=dark] .lf-insight.on,.lf-root[data-theme=dark] .lf-where-menu button:hover,.lf-root[data-theme=dark] .lf-archive-item:hover{background:var(--fill)}
.lf-root[data-theme=dark] .lf-fog-hint{background:rgba(255,255,255,.1);color:#C9CEC8;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 4px 14px -6px rgba(0,0,0,.5)}
.lf-root[data-theme=dark] .lf-insight.pinned{background:rgba(124,92,224,.16)}
.lf-root[data-theme=dark] .lf-sweep-btn.pending:hover{background:rgba(30,158,106,.14)}
.lf-theme{position:absolute;top:26px;left:34px;z-index:3;display:flex;align-items:center;gap:10px;transition:opacity .3s}
.lf-theme-tip{font-size:12px;font-weight:600;color:rgba(255,255,255,.82);opacity:0;transform:translateX(-4px);transition:opacity .25s,transform .25s;pointer-events:none;white-space:nowrap}
.lf-theme:hover .lf-theme-tip{opacity:1;transform:none}
[data-card=hero] .lf-hero-left{padding-top:26px!important}
[data-card=hero].wx-on .lf-theme{opacity:0;pointer-events:none}
/* 日/夜开关：轨道是天空，滑块是太阳或月亮；滑块像一团果冻——先粘住，被扯长，撞到头扁一下再弹稳（动作由 rgJelly 算） */
.lf-root .lf-sw{position:relative;display:block;flex:none;width:52px;height:28px;padding:0!important;margin:0!important;border:0!important;border-radius:999px!important;min-width:0!important;min-height:0!important;line-height:0!important;font-size:0!important;
  background:none!important;box-shadow:none!important;overflow:visible;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent}
.lf-root .lf-sw:focus-visible{outline:2px solid rgba(255,255,255,.9);outline-offset:3px}
.lf-sw-tr{position:absolute;inset:0;border-radius:999px;overflow:hidden;isolation:isolate;
  background:linear-gradient(180deg,#9AD0FF,#4F98EA);box-shadow:inset 0 1px 3px rgba(0,30,90,.3),inset 0 0 0 1px rgba(255,255,255,.3),0 1px 0 rgba(255,255,255,.22)}
.lf-sw-tr::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#141A3A,#2A336B);opacity:var(--nt,0)}
.lf-sw-cloud{position:absolute;right:7px;top:13px;width:14px;height:6px;border-radius:6px;background:rgba(255,255,255,.92);opacity:calc(1 - var(--nt,0));transform:translateX(calc(var(--nt,0) * 8px))}
.lf-sw-cloud::before{content:'';position:absolute;left:3px;top:-4px;width:7px;height:7px;border-radius:50%;background:inherit}
.lf-sw-stars{position:absolute;left:8px;top:6px;width:16px;height:16px;opacity:var(--nt,0);transform:translateY(calc((1 - var(--nt,0)) * 5px))}
.lf-sw-stars i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 3px rgba(255,255,255,.9)}
.lf-sw-stars i:nth-child(1){left:2px;top:3px}.lf-sw-stars i:nth-child(2){left:10px;top:1px;width:1.5px;height:1.5px}.lf-sw-stars i:nth-child(3){left:7px;top:11px;width:1.5px;height:1.5px}
.lf-sw-k,.lf-sw-ks{position:absolute;left:2px;top:2px;width:24px;height:24px;border-radius:12px;pointer-events:none}
.lf-sw-ks{box-shadow:0 1px 3px rgba(0,30,80,.3)}
.lf-sw-k{overflow:hidden}
.lf-sw-sun,.lf-sw-moon{position:absolute;inset:0;border-radius:inherit}
.lf-sw-sun{background:radial-gradient(circle at 36% 32%,#FFF1A8,#FFC93E 62%,#F5A623)}
.lf-sw-ks::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:0 0 10px 2px rgba(255,214,90,.45);opacity:calc(1 - var(--nt,0))}
.lf-sw-moon{background:radial-gradient(circle at 36% 32%,#FFFFFF,#E3E7F2 60%,#C6CCDD);opacity:var(--nt,0)}
.lf-sw-moon::before,.lf-sw-moon::after{content:'';position:absolute;border-radius:50%;background:rgba(140,150,178,.55);box-shadow:inset 0 1px 1px rgba(80,90,120,.35)}
.lf-sw-moon::before{right:6px;top:5px;width:6px;height:6px}
.lf-sw-moon::after{left:6px;bottom:6px;width:4px;height:4px}
/* 白天整页是当天的天空：天气、太阳位置决定颜色、光晕和卡片投影 */
.lf-dsky,.lf-dfx{position:sticky;top:0;left:0;display:block;width:100%;height:var(--rg-h,100vh);margin-bottom:calc(-1 * var(--rg-h,100vh));pointer-events:none;overflow:hidden}
.lf-dsky{z-index:0}
.lf-dfx{z-index:2;transition:opacity .7s}
.lf-root[data-theme=dark] .lf-dfx{opacity:0}
.lf-dsky .g{position:absolute;inset:0;background:linear-gradient(180deg,var(--dsky-a,#3D86D9) 0%,var(--dsky-a,#3D86D9) 18%,var(--dsky-b,#8BC0EE) 50%,var(--dsky-c,#EAF1F6) 86%)}
.lf-dsky .sun{position:absolute;width:90vmax;height:90vmax;margin:-45vmax 0 0 -45vmax;left:var(--sun-x,50%);top:var(--sun-y,0%);border-radius:50%;opacity:var(--sun-o,0);transition:opacity .9s,left .9s,top .9s;
  background:radial-gradient(circle,rgba(var(--sun-rgb,255,244,214),.55) 0%,rgba(var(--sun-rgb,255,244,214),.18) 22%,transparent 55%);animation:lf-breathe 7s ease-in-out infinite}
@keyframes lf-breathe{50%{transform:scale(1.06)}}
.lf-dsky .flash{position:absolute;inset:0;background:#E9EEFF;opacity:0}
.lf-dsky canvas,.lf-dfx canvas{position:absolute;left:0;top:0;width:100%;height:100%}
.lf-dsky .clouds,.lf-dsky .fog,.lf-dfx .cs,.lf-dfx .haze{position:absolute;inset:0;opacity:0;transition:opacity 1.2s}
.lf-dsky .clouds i{position:absolute;left:-40vw;border-radius:50%;filter:blur(30px);background:rgba(255,255,255,var(--cl-a,.55));animation:lf-drift var(--t,120s) linear infinite;animation-delay:var(--dl,0s)}
.lf-dsky .fog i{position:absolute;left:-60vw;width:120vw;height:30%;border-radius:50%;filter:blur(40px);background:rgba(244,245,246,.55);animation:lf-drift var(--t,90s) linear infinite;animation-delay:var(--dl,0s)}
.lf-dfx .cs{mix-blend-mode:multiply}
.lf-dfx .cs i{position:absolute;left:-60vw;width:60vw;height:50%;border-radius:50%;filter:blur(50px);background:rgba(40,60,90,.2);animation:lf-drift var(--t,70s) linear infinite;animation-delay:var(--dl,0s)}
.lf-dfx .haze{background:linear-gradient(180deg,transparent 35%,rgba(236,238,239,.5) 100%)}
@keyframes lf-drift{to{transform:translateX(180vw)}}
.lf-dsky .clouds i,.lf-dsky .fog i,.lf-dfx .cs i{animation-play-state:paused}
.lf-root[data-theme=light]:is([data-wx=partly],[data-wx=cloudy],[data-wx=drizzle],[data-wx=rain],[data-wx=thunder],[data-wx=snow]) .lf-dsky .clouds i,.lf-root[data-theme=light][data-wx=fog] .lf-dsky .fog i,.lf-root[data-theme=light][data-wx=partly] .lf-dfx .cs i{animation-play-state:running}
.lf-root:is([data-theme=dark],[data-wx=indoor]) .lf-dsky .sun{animation-play-state:paused}
.lf-root[data-wx=partly] .lf-dsky .clouds{opacity:.5}
.lf-root[data-wx=cloudy] .lf-dsky .clouds{opacity:1}
.lf-root[data-wx=drizzle] .lf-dsky .clouds,.lf-root[data-wx=snow] .lf-dsky .clouds{opacity:.6}
.lf-root[data-wx=rain] .lf-dsky .clouds{opacity:.8}
.lf-root[data-wx=thunder] .lf-dsky .clouds{opacity:.9}
.lf-root[data-wx=partly] .lf-dfx .cs{opacity:1}
.lf-root[data-wx=fog] .lf-dsky .fog,.lf-root[data-wx=fog] .lf-dfx .haze{opacity:1}
.lf-root[data-wx=rain] .lf-dfx .haze,.lf-root[data-wx=drizzle] .lf-dfx .haze,.lf-root[data-wx=thunder] .lf-dfx .haze{opacity:.35}
/* 大面板：白天夜里都融进整页的天空 */
.lf-sky-hero{display:none!important}
.lf-root [data-card=hero]{background:transparent!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.24)!important;text-shadow:0 1px 2px rgba(0,20,50,.18),0 2px 18px rgba(0,20,50,.3)}
/* 卡片投影跟着太阳 */
.lf-root[data-theme=light] .lf-card:not([data-card=hero]):not(.armed):not(.hl){box-shadow:var(--sun-lit,0 0 #0000),var(--sun-cast,0 0 #0000),var(--lift,0 0 #0000)}
.lf-root[data-theme=light] .lf-card:not([data-card=hero])::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:var(--sun-glaze,none)}
.lf-capslayer{position:absolute;left:0;top:0;width:0;height:0;z-index:50;pointer-events:none}
.lf-snowcap{position:absolute;left:0;top:0;height:48px;pointer-events:none}
.lf-root[data-theme=dark] .lf-snowcap{display:none}
@media (prefers-reduced-motion:reduce){.lf-dsky .sun,.lf-dsky .clouds i,.lf-dsky .fog i,.lf-dfx .cs i{animation:none}}
/* 夜里整页是一片夜空：贴在滚动区域顶上不动，卡片从前面滑过 */
.lf-nsky{position:sticky;top:0;left:0;display:block;width:100%;height:var(--rg-h,100vh);margin-bottom:calc(-1 * var(--rg-h,100vh));z-index:0;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .7s cubic-bezier(.4,0,.2,1);
  background:radial-gradient(90% 60% at 30% 0%,#25306A 0%,transparent 70%),radial-gradient(70% 50% at 90% 10%,#1E2556 0%,transparent 70%),linear-gradient(180deg,#151B40 0%,#0F1330 55%,#0B0E22 100%)}
.lf-root[data-theme=dark] .lf-nsky{opacity:1}
.lf-nsky canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.lf-nsky .tw{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 5px 1px rgba(220,230,255,.8);opacity:0}
.lf-root[data-theme=dark] .lf-nsky .tw{animation:lf-tw 3.4s ease-in-out infinite;animation-delay:var(--d)}
@keyframes lf-tw{0%,100%{opacity:.9}50%{opacity:.2}}
/* 换主题的那 0.7 秒：所有颜色一起渐变 */
.lf-root.lf-theming,.lf-root.lf-theming *{transition:background-color .7s cubic-bezier(.4,0,.2,1),color .7s cubic-bezier(.4,0,.2,1),border-color .7s cubic-bezier(.4,0,.2,1),box-shadow .7s cubic-bezier(.4,0,.2,1),fill .7s,stroke .7s,opacity .7s cubic-bezier(.4,0,.2,1)!important}
/* 夜里大卡把自己的天空收起来，融进整页夜空，只留一圈淡边 */
.lf-sky-hero{transition:opacity .7s cubic-bezier(.4,0,.2,1)}
.lf-root[data-theme=dark] [data-card=hero]{background:transparent!important;box-shadow:inset 0 0 0 1px rgba(170,185,255,.09)!important}
.lf-root[data-theme=dark] [data-card=hero] .lf-sky-hero{opacity:0}
@media (prefers-reduced-motion:reduce){.lf-root[data-theme=dark] .lf-nsky .tw{animation:none;opacity:.7}}
`
