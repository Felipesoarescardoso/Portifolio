# Portfólio — Weverson Felipe Soares Cardoso

Site pessoal (HTML/CSS/JS puro, sem build) para LinkedIn e contato profissional.

## Estrutura

- `index.html` — página única: Sobre, Habilidades, Experiência, Galeria (agrupada por categoria: Manutenção e Automação, Maranguape, Analista Telecom, Desenvolvimento APIs e Integração), Projetos, Projetos Empresariais (com filtro por empresa), Educação e Contato
- `style.css` — design moderno premium: fontes Inter/Space Grotesk locais, navbar sticky com blur, cards, timeline, galeria agrupada com subtítulos, lightbox e cards de projetos empresariais com filtros
- `script.js` — ano dinâmico, menu mobile acessível (Escape, clique fora, `aria-current`), alternador PT/EN/ES com detecção de idioma do navegador, copiar e-mail, scroll-reveal, nav ativa, lightbox reutilizável da galeria, filtro de projetos por empresa e integração com o gerador de QR Code
- `qrcode.js` — gerador de QR Code do zero (Reed-Solomon, versões 1–10, níveis L/M/Q/H), sem dependências
- `tests/` — testes do gerador de QR Code contra a lib de referência `qrcode` (`npm test`)
- `assets/` — foto de perfil (webp/png), currículo em PDF, fontes `woff2` locais (sem CDNs), `galeria/` com 16 fotos reais da seção Galeria de Trabalho (originais do WhatsApp/celular, otimizados para máx. 1600px em `.webp`) e `galeria/projetos/` com placeholders usados anteriormente nos projetos empresariais
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
