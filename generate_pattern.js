const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <g fill="none" stroke="#C62828" stroke-width="2" opacity="0.05">
    <path d="M10,10 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10 z"/>
    <circle cx="50" cy="50" r="10" />
    <path d="M45,60 v15 a5,5 0 0,0 10,0 v-15" />
    <rect x="75" y="20" width="15" height="25" rx="2" />
    <path d="M80,20 v-5 h5 v5" />
    <rect x="20" y="70" width="10" height="20" rx="5" />
    <line x1="20" y1="80" x2="30" y2="80" />
  </g>
</svg>`;
const encoded = Buffer.from(svg).toString('base64');
console.log(`data:image/svg+xml;base64,${encoded}`);
