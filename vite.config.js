import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import MarkdownIt from 'markdown-it'
import latexPlus from 'markdown-it-latex-plus'
import { instance } from '@viz-js/viz'

const viz = await instance()
// Graphviz must be told the size of every image a graph uses; ours are all square logos.
const dot = s => viz.renderString(s, { format: 'svg', images: [...s.matchAll(/(?:SRC|image)="(.+?)"/g)].map(m => ({ name: m[1], width: 46, height: 46 })) })
  .replace(/^[^]*?(?=<svg)/, '')
const md = MarkdownIt().use(latexPlus, { renderers: { dot: { render: dot } } })

// <!--md:file.md--> in a page becomes that file as HTML, its dot blocks drawn here at build time.
const markdown = {
  name: 'md',
  transformIndexHtml: {
    order: 'pre',
    async handler(html, { filename }) {
      const m = html.match(/<!--md:(.+?)-->/)
      if (!m) return html
      const out = await md.latexPlus.render(readFileSync(join(dirname(filename), m[1]), 'utf8'))
      return html.replace(m[0], () => out).replace('</head>', () => `<style>${md.latexPlus.css()}</style>\n</head>`)
    },
  },
  handleHotUpdate: ({ file, server }) => void (file.endsWith('.md') && server.ws.send({ type: 'full-reload' })),
}

export default {
  plugins: [markdown],
  build: { rolldownOptions: { input: ['index.html', 'contact/index.html', 'privacy/index.html', 'about/structure/index.html'] } },
}
