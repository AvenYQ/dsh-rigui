import { build } from 'esbuild'
import fs from 'fs'
fs.mkdirSync('dist', { recursive: true })

// 1) DSH 插件的浏览器半边：cjs，react 由宿主的 require 提供
const r = await build({ entryPoints: ['src/plugin.jsx'], bundle: true, format: 'cjs', platform: 'browser', external: ['react'], write: false, jsx: 'transform', target: 'es2020', charset: 'utf8', minify: false })
const body = r.outputFiles[0].text
fs.writeFileSync('client.js',
`// 日晷 · 浏览器半边：DSH 左侧边栏里的「日晷」入口，点开是个人生活工作台。
window.__ModuleLoader__.load({
  id: 'dsh-rigui',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
${body}
    Object.defineProperty(module.exports, Symbol.toStringTag, { value: 'Module' })
    return module.exports
  },
})
`)
fs.copyFileSync('src/host.js', 'index.js')
fs.writeFileSync('cordis.patch.yml', `# 日晷：DSH 左侧边栏的一行入口 + 主区域的生活工作台\n- insert:\n    - id: rigui\n      name: dsh-rigui\n`)
// 2) 预览页：一个自包含的 html，模拟 DSH 侧边栏
const p = await build({ entryPoints: ['src/preview.jsx'], bundle: true, format: 'iife', platform: 'browser', write: false, jsx: 'transform', target: 'es2020', charset: 'utf8', minify: true,
  alias: { react: './src/react-shim.cjs', 'react-dom/client': './src/react-dom-shim.cjs' } })
fs.writeFileSync('dist/preview.html', `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>日晷</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap">
<style>html,body{margin:0;height:100%;background:#E8EAE5}#root{height:100%}</style>
<script>${fs.readFileSync('node_modules/react/umd/react.production.min.js','utf8')}</script>
<script>${fs.readFileSync('node_modules/react-dom/umd/react-dom.production.min.js','utf8')}</script>
</head><body><div id="root"></div><script>${p.outputFiles[0].text.replace(/<\/script/g, '<\\/script')}</script></body></html>
`)
console.log('client.js', fs.statSync('client.js').size, 'preview', fs.statSync('dist/preview.html').size)
