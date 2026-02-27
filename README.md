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
|- article-detail.php
|- artigo.php (legacy redirect)
|- contact.php
|- footer.php
|- scripts/
|  |- generate-static-articles.mjs
|  |- articles/
|     |- app.js
|     |- domain/article.domain.js
|     |- domain/domain.error.js
|     |- adapters/articles.repository.js
|     |- application/load-articles.usecase.js
|     |- ui/articles.controller.js
|  |- contact/
|     |- app.js
|     |- domain/contact.domain.js
|     |- adapters/contact.repository.js
|     |- application/submit-contact.usecase.js
|     |- ui/contact.controller.js
|  |- services/
|     |- app.js
|     |- domain/services.domain.js
|     |- application/init-services.usecase.js
|     |- ui/services.controller.js
|  |- areas/
|     |- app.js
|     |- domain/areas.domain.js
|     |- application/init-areas-feedback.usecase.js
|     |- ui/areas.controller.js
|  |- about/
|     |- app.js
|     |- domain/about.domain.js
|     |- application/init-about-reveal.usecase.js
|     |- ui/about.controller.js
|  |- history/
|     |- app.js
|     |- domain/history.domain.js
|     |- application/init-history-reveal.usecase.js
|     |- ui/history.controller.js
|  |- header/
|     |- app.js
|     |- domain/header.domain.js
|     |- application/init-header-menu.usecase.js
|     |- ui/header.controller.js
|- app/
|  |- shared/
|  |  |- domain/domain-error.php
|  |- article-detail/
|     |- domain/article-detail.domain.php
|     |- adapters/article-http.repository.php
|     |- application/load-article-detail.usecase.php
|- css/
|  |- flexboxgrid.css
|  |- main.css
|- tests/
|  |- check-syntax.sh
|  |- run-tests.sh
|  |- php/
|  |  |- domain-error.test.php
|  |  |- article-detail.domain.test.php
|  |  |- load-article-detail.usecase.test.php
|  |- js/
|     |- domain.error.test.mjs
|     |- articles.domain.test.mjs
|     |- articles.integration.test.mjs
|     |- articles.controller.integration.test.mjs
|     |- contact.domain.test.mjs
|     |- contact.usecase.integration.test.mjs
|     |- services.domain.test.mjs
|     |- services.usecase.test.mjs
|     |- areas.domain.test.mjs
|     |- areas.usecase.test.mjs
|     |- about.domain.test.mjs
|     |- about.usecase.test.mjs
|     |- history.domain.test.mjs
|     |- history.usecase.test.mjs
|     |- header.domain.test.mjs
|     |- header.usecase.test.mjs
|- images/
|- videos/
|- .env.example
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

3) Testes locais (Fase 3)

```bash
tests/run-tests.sh
```

Esse comando regenera:
- `index.html` (página principal)
- `artigos/<slug>/index.html` (uma página estática por artigo publicado, com SEO no `<head>`)

Variáveis opcionais no build:

```bash
ARTICLES_API_BASE="https://sua-api.example.com" SITE_BASE_URL="https://seu-site.example.com" GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com" MICROSOFT_CLIENT_ID="seu-microsoft-client-id" ./build-static.sh
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
- **Login social**: Google Identity Services + Google OAuth Client ID + Microsoft Identity (MSAL)

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

Fluxo de login social (Google e Microsoft):
1. Front carrega os scripts Google (`https://accounts.google.com/gsi/client`) e Microsoft MSAL.
2. Usuário faz login em um dos provedores.
3. Front envia `idToken` para `/login/authGoogle` ou `/login/authMicrosoft`.
4. Backend valida token e grava cookie HttpOnly `access_token`.
5. Usuário comenta usando cookie de sessão (`credentials: include`).
6. Logout chama `/login/logout` (com fallback `/login/authLogout`).

Variáveis de ambiente:
- `SITE_BASE_URL`: domínio público do frontend (ex: `https://site-advogada-eosin.vercel.app`)
- `ARTICLES_API_BASE`: URL base da API no Render (ex: `https://blog-back-n6z4.onrender.com`)
- `GOOGLE_CLIENT_ID`: Client ID OAuth Web do Google
- `MICROSOFT_CLIENT_ID`: Client ID da aplicação Microsoft (Azure App Registration)
- `ARTICLES_FETCH_TIMEOUT`: timeout (segundos) na busca de artigos durante o build
- `ARTICLES_FETCH_RETRIES`: tentativas de retry na busca de artigos durante o build

### Refatoração Clean (Fase 1) - Módulo de Artigos

A listagem de artigos da home foi refatorada para um modelo de camadas (Clean/Hexagonal incremental), sem alterar comportamento funcional.

Camadas aplicadas:
- `domain`: regras puras e transformação de dados do artigo.
- `adapters/repository`: acesso HTTP e localStorage.
- `application/usecase`: orquestração de carga e sincronização de métricas.
- `ui/controller`: renderização, eventos e estado de interação.
- `app.js`: composition root (injeção de dependências e bootstrap).

Objetivo prático:
- reduzir acoplamento de regra dentro de `articles.php`;
- facilitar manutenção e evolução;
- preparar base para testes e próximas fases de refatoração.

### Refatoração Clean (Fase 2) - Página de Artigo (`article-detail.php`)

A página de detalhe foi evoluída para controller fino em PHP, com separação de camadas para busca e composição do artigo.

Camadas aplicadas:
- `domain`: normalização, sanitização e regras puras de exibição.
- `adapters/repository`: acesso HTTP JSON ao backend de artigos.
- `application/usecase`: orquestra busca por `id`/`slug` e monta view model.
- `article-detail.php`: recebe requisição e renderiza o resultado do use case.

Resultado:
- regra de negócio fora da view principal;
- menor acoplamento com infraestrutura;
- caminho claro para testes unitários no detalhe do artigo.

### Refatoração Clean (Fase 3) - Testes Iniciais

Foi adicionada uma suíte de testes sem dependências externas para validar domínio e caso de uso.

Cobertura inicial:
- `tests/php/domain-error.test.php`
- `tests/php/article-detail.domain.test.php`
- `tests/php/load-article-detail.usecase.test.php`
- `tests/js/domain.error.test.mjs`
- `tests/js/articles.domain.test.mjs`
- `tests/js/articles.integration.test.mjs`
- `tests/js/articles.controller.integration.test.mjs`

Runner único:
- `tests/run-tests.sh`

Padronização de erros de domínio:
- JS: `scripts/articles/domain/domain.error.js` (`DomainError` com `code` e `details`).
- PHP: `app/shared/domain/domain-error.php` (`DomainError` com `codeName`, `status` e `payload`).

### Refatoração Clean (Fase 4) - Módulo de Contato

O fluxo do formulário de contato foi extraído para camadas leves:
- `domain`: máscara/normalização/validação do payload.
- `adapters/repository`: envio simulado assíncrono.
- `application/usecase`: regras de submissão e retorno de resultado.
- `ui/controller`: eventos de input/submit e feedback ao usuário.
- `app.js`: bootstrap com injeção de dependências.

### Refatoração Clean (Fase 4.1) - Módulo de Serviços

A animação dos cards de serviços também foi extraída para camadas leves:
- `domain`: regra de motion preference e configuração do observer.
- `application/usecase`: plano de inicialização da seção.
- `ui/controller`: controle de visibilidade dos cards por `IntersectionObserver`.
- `app.js`: bootstrap da feature.

### Refatoração Clean (Fase 4.2) - Módulo de Áreas

O feedback dos botões \"Saiba mais\" foi extraído para camadas leves:
- `domain`: conteúdo da mensagem e delay de exibição.
- `application/usecase`: estado inicial do feedback.
- `ui/controller`: binding de clique e controle de visibilidade da mensagem.
- `app.js`: bootstrap da feature.

### Refatoração Clean (Fase 4.3) - Módulo About

O reveal dos elementos da seção \"Quem Somos\" foi extraído para camadas leves:
- `domain`: seletor alvo, classe de reveal e opções do observer.
- `application/usecase`: plano de inicialização do reveal.
- `ui/controller`: integração com `IntersectionObserver` e fallback sem observer.
- `app.js`: bootstrap da feature.

### Refatoração Clean (Fase 4.4) - Módulo História

O comportamento da seção de história foi extraído para camadas leves:
- `domain`: regras de breakpoint mobile/desktop e opções do observer.
- `application/usecase`: plano de inicialização para reveal e interações.
- `ui/controller`: reveal do texto principal e toggle da foto em mobile.
- `app.js`: bootstrap da feature.

### Refatoração Clean (Fase 4.5) - Módulo Header

O comportamento do menu de navegação foi centralizado em um módulo reutilizável:
- `domain`: regras de estado do menu, media queries e ajuste de hash.
- `application/usecase`: plano de inicialização do header.
- `ui/controller`: toggle, fechamento em eventos globais e ajuste de scroll em `#articles`.
- `app.js`: bootstrap compartilhado para home e página de detalhe.

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
3. Executar checks de sintaxe com `tests/check-syntax.sh`.
4. Executar testes locais com `tests/run-tests.sh`.
5. Regenerar estático com `./build-static.sh`.
6. Revisar `git diff`.
7. Commit e deploy.

### CI (GitHub Actions)

Pipeline configurado em:
- `.github/workflows/tests.yml`

Acionamento:
- push
- pull request

Execução:
- roda `./tests/check-syntax.sh` (PHP + JS syntax checks)
- roda `./tests/run-tests.sh` (unit + integration tests)
- ambiente Ubuntu com PHP 8.2 e Node 20

### Observações

- Parte dos conteúdos e contatos no repositório é de exemplo/template.
- Algumas imagens deste site foram geradas com apoio de IA.
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
|- article-detail.php
|- artigo.php (legacy redirect)
|- contact.php
|- footer.php
|- scripts/
|  |- generate-static-articles.mjs
|  |- articles/
|     |- app.js
|     |- domain/article.domain.js
|     |- domain/domain.error.js
|     |- adapters/articles.repository.js
|     |- application/load-articles.usecase.js
|     |- ui/articles.controller.js
|  |- contact/
|     |- app.js
|     |- domain/contact.domain.js
|     |- adapters/contact.repository.js
|     |- application/submit-contact.usecase.js
|     |- ui/contact.controller.js
|  |- services/
|     |- app.js
|     |- domain/services.domain.js
|     |- application/init-services.usecase.js
|     |- ui/services.controller.js
|  |- areas/
|     |- app.js
|     |- domain/areas.domain.js
|     |- application/init-areas-feedback.usecase.js
|     |- ui/areas.controller.js
|  |- about/
|     |- app.js
|     |- domain/about.domain.js
|     |- application/init-about-reveal.usecase.js
|     |- ui/about.controller.js
|  |- history/
|     |- app.js
|     |- domain/history.domain.js
|     |- application/init-history-reveal.usecase.js
|     |- ui/history.controller.js
|  |- header/
|     |- app.js
|     |- domain/header.domain.js
|     |- application/init-header-menu.usecase.js
|     |- ui/header.controller.js
|- app/
|  |- shared/
|  |  |- domain/domain-error.php
|  |- article-detail/
|     |- domain/article-detail.domain.php
|     |- adapters/article-http.repository.php
|     |- application/load-article-detail.usecase.php
|- css/
|  |- flexboxgrid.css
|  |- main.css
|- tests/
|  |- check-syntax.sh
|  |- run-tests.sh
|  |- php/
|  |  |- domain-error.test.php
|  |  |- article-detail.domain.test.php
|  |  |- load-article-detail.usecase.test.php
|  |- js/
|     |- domain.error.test.mjs
|     |- articles.domain.test.mjs
|     |- articles.integration.test.mjs
|     |- articles.controller.integration.test.mjs
|     |- contact.domain.test.mjs
|     |- contact.usecase.integration.test.mjs
|     |- services.domain.test.mjs
|     |- services.usecase.test.mjs
|     |- areas.domain.test.mjs
|     |- areas.usecase.test.mjs
|     |- about.domain.test.mjs
|     |- about.usecase.test.mjs
|     |- history.domain.test.mjs
|     |- history.usecase.test.mjs
|     |- header.domain.test.mjs
|     |- header.usecase.test.mjs
|- images/
|- videos/
|- .env.example
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

3) Local tests (Phase 3)

```bash
tests/run-tests.sh
```

This regenerates:
- `index.html` (main page)
- `artigos/<slug>/index.html` (one static page per published article, with SEO tags in `<head>`)

Optional build variables:

```bash
ARTICLES_API_BASE="https://your-api.example.com" SITE_BASE_URL="https://your-site.example.com" GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com" MICROSOFT_CLIENT_ID="your-microsoft-client-id" ./build-static.sh
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
- **Social login**: Google Identity Services + Google OAuth Client ID + Microsoft Identity (MSAL)

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

Social login flow (Google and Microsoft):
1. Front loads Google JS (`https://accounts.google.com/gsi/client`) and Microsoft MSAL script.
2. User signs in with Google or Microsoft button.
3. Front sends `idToken` to `/login/authGoogle` or `/login/authMicrosoft`.
4. Backend validates token and sets HttpOnly `access_token` cookie.
5. User posts comments with session cookie (`credentials: include`).
6. Logout calls `/login/logout` (fallback `/login/authLogout`).

Environment variables:
- `SITE_BASE_URL`: public frontend domain (ex: `https://site-advogada-eosin.vercel.app`)
- `ARTICLES_API_BASE`: API base URL on Render (ex: `https://blog-back-n6z4.onrender.com`)
- `GOOGLE_CLIENT_ID`: Google OAuth Web Client ID
- `MICROSOFT_CLIENT_ID`: Microsoft application client ID (Azure App Registration)
- `ARTICLES_FETCH_TIMEOUT`: article fetch timeout during build (seconds)
- `ARTICLES_FETCH_RETRIES`: article fetch retries during build

### Clean Refactor (Phase 1) - Articles Module

The home article listing was refactored to a layered model (incremental Clean/Hexagonal), with no functional behavior change.

Applied layers:
- `domain`: pure business/data transformation rules.
- `adapters/repository`: HTTP and localStorage access.
- `application/usecase`: loading flow and metrics synchronization orchestration.
- `ui/controller`: rendering, UI events and interaction state.
- `app.js`: composition root (dependency wiring and bootstrap).

### Clean Refactor (Phase 2) - Article Detail (`article-detail.php`)

The article detail page now follows a thin-controller PHP approach, with separated layers for data loading and view-model composition.

Applied layers:
- `domain`: normalization, sanitization and pure display rules.
- `adapters/repository`: HTTP JSON access to the articles backend.
- `application/usecase`: orchestrates `id`/`slug` lookup and builds the view model.
- `article-detail.php`: handles request/response rendering only.

### Clean Refactor (Phase 3) - Initial Tests

An initial no-dependency test suite was added to validate domain and use-case behavior.

Initial coverage:
- `tests/php/domain-error.test.php`
- `tests/php/article-detail.domain.test.php`
- `tests/php/load-article-detail.usecase.test.php`
- `tests/js/domain.error.test.mjs`
- `tests/js/articles.domain.test.mjs`
- `tests/js/articles.integration.test.mjs`
- `tests/js/articles.controller.integration.test.mjs`

Single runner:
- `tests/run-tests.sh`

Domain error standardization:
- JS: `scripts/articles/domain/domain.error.js` (`DomainError` with `code` and `details`).
- PHP: `app/shared/domain/domain-error.php` (`DomainError` with `codeName`, `status`, and `payload`).

### Clean Refactor (Phase 4) - Contact Module

The contact form flow was extracted into lightweight layers:
- `domain`: phone mask/normalization/payload validation.
- `adapters/repository`: async simulated submission.
- `application/usecase`: submission rules and result mapping.
- `ui/controller`: input/submit events and user feedback.
- `app.js`: dependency wiring and bootstrap.

### Clean Refactor (Phase 4.1) - Services Module

The services cards animation flow was also extracted into lightweight layers:
- `domain`: motion preference rule and observer configuration.
- `application/usecase`: section initialization plan.
- `ui/controller`: cards visibility behavior via `IntersectionObserver`.
- `app.js`: feature bootstrap.

### Clean Refactor (Phase 4.2) - Areas Module

The \"Learn more\" feedback flow in the areas section was extracted into lightweight layers:
- `domain`: feedback message content and display delay.
- `application/usecase`: feedback initial state.
- `ui/controller`: click binding and feedback visibility behavior.
- `app.js`: feature bootstrap.

### Clean Refactor (Phase 4.3) - About Module

The \"Who we are\" reveal flow was extracted into lightweight layers:
- `domain`: target selector, reveal class and observer options.
- `application/usecase`: reveal initialization plan.
- `ui/controller`: `IntersectionObserver` integration with no-observer fallback.
- `app.js`: feature bootstrap.

### Clean Refactor (Phase 4.4) - History Module

The history section behavior was extracted into lightweight layers:
- `domain`: mobile/desktop breakpoint rules and observer options.
- `application/usecase`: initialization plan for reveal and interactions.
- `ui/controller`: main text reveal and mobile image-card toggle.
- `app.js`: feature bootstrap.

### Clean Refactor (Phase 4.5) - Header Module

The navigation menu behavior was centralized in a reusable module:
- `domain`: menu state rules, media queries, and hash-adjust behavior.
- `application/usecase`: header initialization plan.
- `ui/controller`: toggle, global close handlers, and `#articles` scroll adjustment.
- `app.js`: shared bootstrap for home and article detail pages.

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
3. Run syntax checks with `tests/check-syntax.sh`.
4. Run local tests with `tests/run-tests.sh`.
5. Regenerate static output with `./build-static.sh`.
6. Review `git diff`.
7. Commit and deploy.

### CI (GitHub Actions)

Pipeline configured at:
- `.github/workflows/tests.yml`

Triggers:
- push
- pull request

Execution:
- runs `./tests/check-syntax.sh` (PHP + JS syntax checks)
- runs `./tests/run-tests.sh` (unit + integration tests)
- Ubuntu environment with PHP 8.2 and Node 20

### Notes

- Some content and contact data in this repository are placeholders/template values.
- Some images on this website were generated with AI assistance.
- This repository is a solid starter for small/medium institutional websites.

### Author

Developed by **toninews**.
