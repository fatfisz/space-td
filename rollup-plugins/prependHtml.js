import { readFileSync } from 'fs';

export default function replace() {
  return {
    name: 'prepend HTML',

    buildStart() {
      this.addWatchFile('./src/index.html');
    },

    renderChunk(code) {
      const html = readFileSync('./src/index.html', 'utf8').trim();
      return html + `<script>(()=>{${code}})()</script>`;
    },
  };
}
