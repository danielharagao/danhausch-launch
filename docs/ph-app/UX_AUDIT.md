# UX Audit — ph-app (desktop + mobile)

Data: 2026-04-21  
Escopo: `docs/ph-app` após inclusão de novos recursos (timeline/playback, network explorer, drivers, presets, tutorial).  
Método: auditoria heurística (Nielsen + WCAG básica + consistência de fluxo), revisão de código UI/CSS e comportamento esperado em desktop/mobile.

---

## Resumo executivo

O produto já tem boa estrutura de informação (filtros → visões → drill-down), mas havia fricções importantes em **compreensão**, **navegação por teclado**, **feedback de estado** e **consistência de linguagem**.

### Top 5 prioridades (ordem de impacto)
1. **Crítico:** navegação por abas sem suporte completo de teclado (setas/Home/End), prejudicando acessibilidade e produtividade.
2. **Alta:** ausência de foco visível consistente para teclado.
3. **Alta:** microcopy inconsistente (mistura de PT/EN e termos técnicos brutos nos filtros).
4. **Média:** controles de playback sem estado claro (Play/Pause habilitados ao mesmo tempo).
5. **Média:** ações destrutivas sem confirmação (exclusão de preset).

---

## Issues priorizadas

## 🔴 Críticas

### C1) Navegação de abas incompleta para teclado
- **Onde:** barra de tabs principal.
- **Problema:** era possível clicar, mas sem padrão completo ARIA para troca via teclado.
- **Impacto:** usuários de teclado/assistivos têm fluxo mais lento e menos previsível.
- **Sugestão:** implementar roving tabindex + ArrowLeft/ArrowRight/Home/End e sincronizar `aria-selected`/`aria-hidden`.
- **Status:** ✅ **Implementado** (`assets/js/ui.js`, `index.html`).

---

## 🟠 Altas

### H1) Foco visual fraco/inexistente em elementos interativos
- **Onde:** botões, tabs, inputs, selects.
- **Problema:** sem estilo global de `:focus-visible`.
- **Impacto:** baixa navegabilidade por teclado (desktop) e validação de foco por usuários avançados.
- **Sugestão:** outline padrão de alto contraste e offset.
- **Status:** ✅ **Implementado** (`assets/css/components.css`).

### H2) Linguagem inconsistente nos filtros
- **Onde:** “Tipo de entidade” mostrava `country/leader/person/...`.
- **Problema:** termos internos expostos ao usuário final.
- **Impacto:** aumenta carga cognitiva e reduz percepção de acabamento.
- **Sugestão:** labels amigáveis em PT-BR, mantendo values técnicos internamente.
- **Status:** ✅ **Implementado** (`index.html`).

### H3) Atualizações dinâmicas sem pistas para leitor de tela
- **Onde:** KPIs, label da timeline, score, detalhes de nó.
- **Problema:** mudanças de estado não anunciadas.
- **Impacto:** baixa acessibilidade e perda de contexto.
- **Sugestão:** `aria-live="polite"` em áreas de atualização relevante.
- **Status:** ✅ **Implementado** (`index.html`).

---

## 🟡 Médias

### M1) Playback sem estado operacional claro
- **Onde:** botões Play/Pause.
- **Problema:** ambos clicáveis sem feedback explícito de “tocando/pausado”.
- **Impacto:** erro de operação e sensação de instabilidade.
- **Sugestão:** desabilitar botão não aplicável e atualizar `aria-pressed`.
- **Status:** ✅ **Implementado** (`assets/js/ui.js`, `assets/css/components.css`).

### M2) Exclusão de preset sem confirmação
- **Onde:** botão “Excluir preset”.
- **Problema:** ação destrutiva imediata.
- **Impacto:** risco de perda acidental.
- **Sugestão:** confirmação antes de excluir.
- **Status:** ✅ **Implementado** (`assets/js/ui.js`).

### M3) Discoverability baixa do conteúdo principal (a11y)
- **Onde:** início da página.
- **Problema:** sem skip-link para ir direto ao conteúdo.
- **Impacto:** usuários de teclado percorrem navegação repetitiva.
- **Sugestão:** incluir “Pular para conteúdo principal”.
- **Status:** ✅ **Implementado** (`index.html`, `assets/css/base.css`).

### M4) Sem texto de apoio no topo/filtros
- **Onde:** header e seção de filtros.
- **Problema:** pouco contexto para primeira execução.
- **Impacto:** onboarding mais lento.
- **Sugestão:** microcopy curta explicando objetivo e uso dos filtros.
- **Status:** ✅ **Implementado** (`index.html`).

---

## 🔵 Baixas

### L1) Compare mode existente no código, mas não exposto na UI
- **Onde:** `initCompareMode` em `ui.js`.
- **Problema:** recurso parcial/oculto gera expectativa não atendida.
- **Impacto:** baixo para uso atual, mas cria dívida de produto.
- **Sugestão:** ou remover dead path ou expor controles com estado claro + documentação.
- **Status:** ⏳ **Pendente**.

### L2) Hierarquia de painéis “overview” em duas seções separadas pode confundir manutenção
- **Onde:** duas `section` com `data-panel="overview"`.
- **Problema:** funciona, mas tende a erro em evolução de tabs.
- **Impacto:** baixo para usuário; médio para manutenção.
- **Sugestão:** agrupar em container único por aba ou documentar intencionalidade.
- **Status:** ⏳ **Pendente**.

---

## Quick wins aplicados diretamente na UI

1. **Acessibilidade e navegação**
   - Tabs com `aria-controls`, `tabindex` gerenciado e navegação por setas/Home/End.
   - `aria-hidden` sincronizado com painéis.
   - Skip-link para conteúdo principal.
   - `:focus-visible` global.

2. **Microcopy e consistência**
   - Texto contextual no header e filtros.
   - Labels de entidade traduzidas para PT-BR.

3. **Feedback e estados**
   - KPIs/timeline/detalhe de rede com `aria-live`.
   - Play/Pause com estado de botão (disabled + `aria-pressed`).
   - Confirmação antes de excluir preset.

4. **Mobile/touch básica**
   - Alvos interativos com altura mínima (`min-height: 40px`).

---

## Checklist de usabilidade (com status)

| Item | Desktop | Mobile | Status |
|---|---:|---:|---|
| Hierarquia visual clara (header → filtros → visões) | ✅ | ✅ | Concluído |
| Navegação por tabs com clique | ✅ | ✅ | Concluído |
| Navegação por tabs com teclado (setas/Home/End) | ✅ | ✅* | Concluído |
| Foco visível em controles | ✅ | ✅ | Concluído |
| Microcopy consistente PT-BR | ✅ | ✅ | Parcial (restam termos técnicos internos em cards/dados) |
| Feedback de atualização dinâmica (KPIs/timeline) | ✅ | ✅ | Concluído |
| Segurança em ação destrutiva (excluir preset) | ✅ | ✅ | Concluído |
| Tamanho mínimo de toque | ✅ | ✅ | Concluído |
| Empty states úteis | ✅ | ✅ | Parcial |
| Compare mode completo e descobrível | ❌ | ❌ | Pendente |

\* Em mobile o uso de teclado externo segue consistente com desktop.

---

## Próximos passos recomendados (fase 2)

1. Expor/fechar formalmente o Compare Mode (decisão de produto + implementação completa).  
2. Revisar densidade de informação no Network Detail em telas pequenas (accordion por blocos).  
3. Incluir estados de carregamento explícitos (skeleton/spinner curto) no bootstrap.  
4. Rodar validação rápida com 3 perfis de usuário (analista, executivo, primeira vez) para medir tempo até insight.
