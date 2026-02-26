# Maria Silva Advocacia - Site Institucional

## Português

Website institucional moderno focado em **credibilidade, conversão e performance**, construído com seções modulares em PHP e suporte a geração estática.

O projeto combina:
- estrutura semântica para serviços jurídicos;
- UX orientada à conversão (WhatsApp e formulário de contato);
- interface responsiva com abordagem mobile-first;
- práticas de produção (SEO, cache e fluxo de deploy).

### Live Demo

- [https://site-advogada-eosin.vercel.app](https://site-advogada-eosin.vercel.app)

### Objetivo do Projeto

Este projeto foi desenvolvido com dois objetivos complementares:
- entregar um site institucional jurídico completo, com foco em apresentação profissional e conversão;
- servir como vitrine técnica para a plataforma de gestão de artigos que está em desenvolvimento, demonstrando na prática a integração entre frontend estático, API de conteúdo e fluxo de publicação.

Na prática, o site funciona como camada pública de exibição, enquanto o ecossistema de gestão de artigos evolui no backend.

### Funcionalidades Principais

- Composição modular da página com includes PHP.
- Geração estática completa (`index.html`) a partir dos mesmos componentes.
- UX do formulário de contato com validação e máscara de telefone/celular.
- Cards de serviço com link para WhatsApp e mensagem pré-preenchida.
- Seção de Google Maps integrada.
- Listagem de artigos integrada a API externa.
- Menu mobile com atributos de acessibilidade.

### Stack

- **HTML5** (estrutura semântica)
- **CSS3** (`css/main.css` + `flexboxgrid`)
- **JavaScript Vanilla**
- **PHP** (composição de componentes)
- **Bash + Node.js** (pipeline de build estático)

### Estrutura do Projeto

```text
.
|- index.php
|- index.html
|- build-static.sh
|- header.php
|- carousel.php
|- about.php
|- history.php
|- areas.php
|- services.php
|- articles.php
|- contact.php
|- footer.php
|- scripts/
|  |- generate-static-articles.mjs
|- css/
|  |- flexboxgrid.css
|  |- main.css
|- images/
|- videos/
|- vercel.json
```

### Execução Local

1) Modo PHP (recomendado para desenvolvimento)

```bash
php -S localhost:8000
```

Acesse: `http://localhost:8000`

2) Modo build estático

```bash
./build-static.sh
```

Esse comando regenera:
- `index.html` (página principal)
- `artigos/<slug>/index.html` (uma página estática por artigo publicado, com SEO no `<head>`)

Variáveis opcionais no build:

```bash
ARTICLES_API_BASE="https://sua-api.example.com" SITE_BASE_URL="https://seu-site.example.com" GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com" ./build-static.sh
```

### Deploy

Hospedagem PHP:
- publique o projeto como está e sirva `index.php`.

Hospedagem estática (Vercel/CDN):
1. rode `./build-static.sh`
2. publique:
- `index.html`
- `artigos/`
- assets (`css`, `images`, `videos`)

### Arquitetura e Integrações (Fim a Fim)

Serviços usados:
- **Frontend (site público)**: Vercel (hospedagem estática + CDN)
- **Backend (API/Auth/Comentários/Artigos)**: Render (API Node)
- **Imagens dos artigos**: Cloudinary (armazenamento e entrega de URL)
- **Login social**: Google Identity Services + Google OAuth Client ID

Fluxo de dados:
1. Conteúdo é criado no backoffice/CMS (artigo + SEO + imagem de capa).
2. Backend persiste os dados do artigo.
3. Se houver upload de capa, backend salva/usa URL do Cloudinary.
4. No build, `build-static.sh` executa `scripts/generate-static-articles.mjs`.
5. O script consulta `GET /articles?status=published...` na API do Render.
6. O script gera:
- `index.html`
- `artigos/<slug>/index.html` (com tags SEO no `<head>`)
7. Repositório é deployado na Vercel e servido pela CDN.
8. No artigo, comentários e autenticação rodam em tempo real via API do Render.

Fluxo de login Google:
1. Front carrega o script Google (`https://accounts.google.com/gsi/client`).
2. Usuário faz login no botão Google.
3. Front envia `idToken` para `/login/authGoogle`.
4. Backend valida token e grava cookie HttpOnly `access_token`.
5. Usuário comenta usando cookie de sessão (`credentials: include`).
6. Logout chama `/login/logout` (com fallback `/login/authLogout`).

Variáveis de ambiente:
- `SITE_BASE_URL`: domínio público do frontend (ex: `https://site-advogada-eosin.vercel.app`)
- `ARTICLES_API_BASE`: URL base da API no Render (ex: `https://blog-back-n6z4.onrender.com`)
- `GOOGLE_CLIENT_ID`: Client ID OAuth Web do Google
- `ARTICLES_FETCH_TIMEOUT`: timeout (segundos) na busca de artigos durante o build
- `ARTICLES_FETCH_RETRIES`: tentativas de retry na busca de artigos durante o build

Fluxo prático de publicação:
1. Publicar/atualizar artigo no backend/CMS.
2. Disparar novo build/deploy na Vercel (push/commit ou deploy hook).
3. Build regenera páginas estáticas com os dados atuais da API.
4. Novo slug fica disponível em `/artigos/<slug>/`.
5. Comentários e login social seguem funcionando online via API.

### Performance

O setup atual inclui:
- imagens responsivas com `srcset`/`sizes`;
- mídia otimizada (AVIF/WebP);
- lazy/eager loading por contexto;
- `preconnect` para domínios externos;
- cache longo para assets no `vercel.json`.

`vercel.json` aplica cache de longa duração para:
- `/css/*`
- `/images/*`
- `/videos/*`

### SEO e Acessibilidade

Base implementada:
- URL canônica;
- metadados Open Graph;
- headings e seções semânticas;
- ARIA labels e `aria-live` onde necessário;
- estados acessíveis de foco (`:focus-visible`).

### Fluxo Recomendado

1. Editar seções (`*.php`) e estilos (`css/main.css`).
2. Validar localmente em modo PHP.
3. Regenerar estático com `./build-static.sh`.
4. Revisar `git diff`.
5. Commit e deploy.

### Observações

- Parte dos conteúdos e contatos no repositório é de exemplo/template.
- O projeto é um bom ponto de partida para sites institucionais pequenos/médios.

### Autor

Desenvolvido por **toninews**.

---

## English

Modern institutional website focused on **credibility, conversion, and performance**, built with modular PHP sections and static export support.

The project combines:
- semantic content structure for legal services;
- conversion-oriented UX (WhatsApp and contact funnel);
- responsive UI with mobile-first behavior;
- practical production concerns (SEO, caching, and deployment flow).

### Live Demo

- [https://site-advogada-eosin.vercel.app](https://site-advogada-eosin.vercel.app)

### Project Purpose

This project has two complementary goals:
- deliver a complete legal institutional website focused on professional positioning and conversion;
- serve as a technical showcase for the article management platform currently being developed, proving the integration between static frontend, content API, and publishing workflow.

In practice, this website is the public presentation layer while the article management ecosystem evolves on the backend side.

### Core Features

- Modular page composition with PHP includes.
- Full static generation (`index.html`) from the same source components.
- Contact form UX with validation and phone/mobile masking.
- Service cards linked to WhatsApp with prefilled messages.
- Embedded Google Maps section.
- Article listing integration from external API.
- Mobile menu with accessibility attributes.

### Tech Stack

- **HTML5** (semantic structure)
- **CSS3** (`css/main.css` + `flexboxgrid`)
- **Vanilla JavaScript**
- **PHP** (component composition)
- **Bash + Node.js** (static build pipeline)

### Project Structure

```text
.
|- index.php
|- index.html
|- build-static.sh
|- header.php
|- carousel.php
|- about.php
|- history.php
|- areas.php
|- services.php
|- articles.php
|- contact.php
|- footer.php
|- scripts/
|  |- generate-static-articles.mjs
|- css/
|  |- flexboxgrid.css
|  |- main.css
|- images/
|- videos/
|- vercel.json
```

### Run Locally

1) PHP mode (recommended for development)

```bash
php -S localhost:8000
```

Open: `http://localhost:8000`

2) Static build mode

```bash
./build-static.sh
```

This regenerates:
- `index.html` (main page)
- `artigos/<slug>/index.html` (one static page per published article, with SEO tags in `<head>`)

Optional build variables:

```bash
ARTICLES_API_BASE="https://your-api.example.com" SITE_BASE_URL="https://your-site.example.com" GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com" ./build-static.sh
```

### Deployment

PHP hosting:
- deploy as-is and serve `index.php`.

Static hosting (Vercel/CDN):
1. run `./build-static.sh`
2. deploy:
- `index.html`
- `artigos/`
- assets (`css`, `images`, `videos`)

### Architecture & Integrations (End-to-End)

Services:
- **Frontend (public website)**: Vercel (static hosting + CDN)
- **Backend (API/Auth/Comments/Articles)**: Render (Node API)
- **Article images**: Cloudinary (storage + delivery URL)
- **Social login**: Google Identity Services + Google OAuth Client ID

Data flow:
1. Content is created in backoffice/CMS (article + SEO + cover image).
2. Backend persists article data.
3. If a cover image is uploaded, backend stores/uses the Cloudinary URL.
4. During build, `build-static.sh` runs `scripts/generate-static-articles.mjs`.
5. Script calls `GET /articles?status=published...` on Render.
6. Script generates:
- `index.html`
- `artigos/<slug>/index.html` (with SEO tags in `<head>`)
7. Repository is deployed to Vercel and served via CDN.
8. In article pages, comments and auth run live against Render API.

Google login flow:
1. Front loads Google JS (`https://accounts.google.com/gsi/client`).
2. User signs in with Google button.
3. Front sends `idToken` to `/login/authGoogle`.
4. Backend validates token and sets HttpOnly `access_token` cookie.
5. User posts comments with session cookie (`credentials: include`).
6. Logout calls `/login/logout` (fallback `/login/authLogout`).

Environment variables:
- `SITE_BASE_URL`: public frontend domain (ex: `https://site-advogada-eosin.vercel.app`)
- `ARTICLES_API_BASE`: API base URL on Render (ex: `https://blog-back-n6z4.onrender.com`)
- `GOOGLE_CLIENT_ID`: Google OAuth Web Client ID
- `ARTICLES_FETCH_TIMEOUT`: article fetch timeout during build (seconds)
- `ARTICLES_FETCH_RETRIES`: article fetch retries during build

Practical publishing flow:
1. Publish/update article in backend/CMS.
2. Trigger new Vercel build/deploy (push/commit or deploy hook).
3. Build regenerates static pages from current API data.
4. New slug becomes available at `/artigos/<slug>/`.
5. Comments and social login keep working live through API.

### Performance

Current setup includes:
- responsive images with `srcset`/`sizes`;
- optimized media formats (AVIF/WebP);
- lazy/eager loading by context;
- `preconnect` for external domains;
- long-lived cache for assets in `vercel.json`.

`vercel.json` applies long cache to:
- `/css/*`
- `/images/*`
- `/videos/*`

### SEO & Accessibility

Implemented baseline:
- canonical URL;
- Open Graph metadata;
- semantic headings and sectioning;
- ARIA labels and `aria-live` where needed;
- accessible keyboard focus states (`:focus-visible`).

### Recommended Workflow

1. Edit section files (`*.php`) and styles (`css/main.css`).
2. Validate locally in PHP mode.
3. Regenerate static output with `./build-static.sh`.
4. Review `git diff`.
5. Commit and deploy.

### Notes

- Some content and contact data in this repository are placeholders/template values.
- This repository is a solid starter for small/medium institutional websites.

### Author

Developed by **toninews**.
