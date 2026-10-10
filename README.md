# Portfólio — Weverson Felipe Soares Cardoso

Site pessoal (HTML/CSS/JS puro, sem build) para LinkedIn e contato profissional.

## Estrutura

- `index.html` — página única: Sobre, Habilidades, Experiência, Projetos, Educação e Contato
- `style.css` — design moderno premium: fontes Inter/Space Grotesk locais, navbar sticky com blur, cards, timeline
- `script.js` — ano dinâmico, menu mobile, scroll-reveal e nav ativa
- `assets/` — foto de perfil (webp/png), currículo em PDF e fontes `woff2` locais (sem CDNs)
- `.github/workflows/deploy.yml` — deploy automático no GitHub Pages a cada push em `main`

## Publicando

1. No repositório GitHub: **Settings → Pages → Source: GitHub Actions**
2. A cada push na branch `main` o site é publicado automaticamente em
   `https://felipesoarescardoso.github.io/Portifolio/`

## Rodando localmente

Abra `index.html` no navegador ou use um servidor estático:

```bash
python -m http.server 8000
```
