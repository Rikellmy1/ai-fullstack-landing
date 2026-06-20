# AGENTS.md

## Escopo

- Este repositório é uma landing page em Vite.
- Edite os arquivos-fonte; não altere `dist/`, que é saída de build.

## Arquivos de trabalho

- Estrutura principal da página: `index.html`, `styles.css`, `script.js`.
- A experiência interativa atual fica em `#signal-field`, definida em `index.html` e animada por `script.js`.
- `src/main.tsx` permanece como no-op para preservar o `<script type="module">`; reative `components/ui/*` só se a camada React/Spline voltar.
- O alias `@` aponta para a raiz do repositório em `vite.config.ts`.

## Comandos confirmados

```bash
npm run dev
npm run build
npm run preview
```

- `npm run dev` inicia o Vite em `127.0.0.1:8000`.
- `npm run build` roda `tsc --noEmit && vite build`.
- `npm run preview` publica o build localmente em `127.0.0.1:8000`.

## Fluxo de trabalho

- Para mudanças visuais, prefira editar primeiro `index.html`, `styles.css` e `script.js`.
- Use `script.js` para mudanças no canvas `#signal-field`; `src/main.tsx` está mantido apenas para preservar o hook de módulo do Vite.
- GSAP e Lenis entram via CDN no `index.html`; não assuma instalação via `package.json`.
- Formulário de contato usa atributos Netlify no HTML; o deploy usa `netlify.toml` com `publish = "dist"` e `command = "npm run build"`.

## TODO

- Confirmar depois se `components/ui/*` e as dependências de Spline seguem intencionais, já que `src/main.tsx` está em no-op.
- Revalidar `npm run build` fora do sandbox gerenciado; aqui o Vite/esbuild falhou ao resolver `vite.config.ts` com `Cannot read directory "../../.."`.
