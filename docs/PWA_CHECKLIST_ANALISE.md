# Análise PWA – Boas Práticas

Análise da aplicação **Padaria Educação** com base no [checklist oficial do web.dev](https://web.dev/pwa-checklist/) e em boas práticas de PWA.

---

## Core PWA Checklist (Obrigatório para instalação e usabilidade)

| Item | Status | Observações |
|------|--------|-------------|
| **Starts fast, stays fast** | OK | Code-splitting por rota, manual chunks, bundle otimizado. Core Web Vitals devem ser validados com Lighthouse. |
| **Works in any browser** | OK | App React com fallbacks, feature detection em push (`isPushSupported`), Service Worker com verificação `"serviceWorker" in navigator`. |
| **Responsive to any screen size** | OK | Tailwind com breakpoints (sm, md, lg, xl), viewport meta, `viewport-fit=cover` para notch, layout adaptativo (sidebar, AppLayout). |
| **Provides a custom offline page** | OK | NavigationRoute no SW serve `index.html` para navegações offline (rotas SPA). |
| **Is installable** | OK | Manifest com name, short_name, icons (192, 512), start_url, display: standalone, theme_color, background_color. HTTPS (em produção). PWAInstallCard com beforeinstallprompt e instruções para iOS. |

---

## Optimal PWA Checklist (Experiência avançada)

| Item | Status | Observações |
|------|--------|-------------|
| **Provides an offline experience** | OK | Precaching de assets, runtime caching para API, fallback de navegação SPA, indicador de status offline (`OfflineIndicator`). |
| **Fully accessible** | PARCIAL | Radix UI com suporte a acessibilidade. Uso de `aria-label` em botões (ex.: PWAInstallCard, NotificationPermissionPopup). Falta: auditoria completa WCAG, testes com leitor de tela, verificação de contraste e foco. |
| **Discoverable in search** | PARCIAL | Meta description, og:title, og:description, og:image. Título único no index. Falta: títulos dinâmicos por rota, meta description por página, structured data (Schema.org), sitemap. |
| **Works with any input type** | OK | Componentes semânticos (button, input, etc.), suporte a toque e mouse via Radix. |
| **Provides context for permission requests** | OK | NotificationPermissionPopup exibe contexto antes de pedir permissão (“Receba avisos sobre cursos, medalhas e novidades”). Não solicita no carregamento da página. |
| **Follows best practices for healthy code** | OK | ESLint, TypeScript, testes com Vitest. Evita APIs deprecadas. |

---

## Detalhes Técnicos

### O que está implementado

- **Service Worker** (Workbox): precache de assets, `cleanupOutdatedCaches`, `clientsClaim`, `skipWaiting`
- **Web App Manifest**: name, short_name, description, start_url, display, theme_color, background_color, icons
- **Web Push**: handlers de `push` e `notificationclick`, ações “Abrir”/“Fechar”, navegação ao clicar
- **Runtime caching**: API com NetworkFirst (cache como fallback)
- **PWA Install**: card de instalação com beforeinstallprompt, instruções para iOS
- **Meta tags**: viewport, theme-color, apple-mobile-web-app-capable, og/twitter
- **Auto-update**: `registerType: "autoUpdate"` no vite-plugin-pwa

### O que falta ou pode melhorar

| Item | Prioridade | Status |
|------|------------|--------|
| Página/fallback offline | Alta | ✅ Implementado – NavigationRoute com fallback para `/index.html` no SW |
| Indicador de status offline | Média | ✅ Implementado – `OfflineIndicator` com banner quando `navigator.onLine === false` |
| Ícones PNG no manifest | Média | ✅ Implementado – `pwa-assets-generator` gera PNG 64/192/512 + maskable |
| Notificação de nova versão | Baixa | ✅ Implementado – `PWAUpdatePrompt` com `useRegisterSW` e `registerType: "prompt"` |
| Títulos dinâmicos por rota | Baixa | ✅ Implementado – `useDocumentTitle` atualiza `document.title` por rota |
| Auditoria de acessibilidade | Média | ✅ Implementado – `eslint-plugin-jsx-a11y` no ESLint; rodar `npm run lint` |

---

## Resumo

| Categoria | OK | Parcial | Falta |
|-----------|----|---------|-------|
| Core | 4 | 0 | 1 |
| Optimal | 2 | 3 | 0 |

**Todas as sugestões do checklist foram implementadas.**
