import { SKY_CSS } from './sky-css.js'
export const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap'

export const CSS = `
.lf-root{--ink:#1F2328;--ink2:#5E645C;--ink3:#8A8F86;--ground:#E8EAE5;--card:#FFFFFF;--rule:#ECEEE9;--fill:#F1F2EE;--fill2:#E6E8E2;--line:#D5D8D1;--sheet:#F7F8F5;--move-ink:#157A51;--warn-ink:#9B1C20;--money-ink:#4B2FB0;--food-ink:#C26A1E;
  --sleep:#3D4FB8;--move:#1E9E6A;--food:#F2994A;--money:#7C5CE0;--body:#0E8A8A;--alert:#E5484D;
  position:relative;min-height:100%;box-sizing:border-box;background:var(--ground);color:var(--ink);
  font-family:'Bricolage Grotesque','PingFang SC','Noto Sans SC','Microsoft YaHei',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;container-type:inline-size;container-name:lf;overflow:clip}
/* 夜间：默认跟随 DSH 的深色主题，也可以在顶部开关里单独切 */
.lf-root[data-theme=dark]{--ink:#E6E8EE;--ink2:#A3A9B8;--ink3:#767D8E;--ground:#0B0E22;--card:#171B28;--rule:#252A3A;--fill:#222739;--fill2:#2A3042;--line:#353B50;--sheet:#131725;
  --move-ink:#5FD39C;--warn-ink:#FF8A8E;--money-ink:#BBA8F7;--food-ink:#F6B373;color-scheme:dark}
.lf-root[data-theme=dark] .lf-card{box-shadow:inset 0 0 0 1px rgba(170,185,255,.07),var(--lift,0 0 #0000)}
${SKY_CSS}
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
`
