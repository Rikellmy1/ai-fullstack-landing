// A cena 3D (Spline) foi substituída por uma peça generativa leve em canvas
// (#signal-field), controlada por GSAP em script.js. Mantemos este módulo como
// no-op para preservar o <script type="module" src="/src/main.tsx"> do index.html
// sem carregar o runtime pesado do @splinetool nem fazer fetch externo.
import "./index.css"

export {}
