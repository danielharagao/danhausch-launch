# Workshops/Institucional — Checklist SEO + Prova Social (P1)

Data: 2026-04-21  
Escopo aplicado no repositório `launch-repo/docs` sem alteração de estrutura/layout base.

## Resumo

Pendências P1 tratadas em páginas ativas de aquisição/captura:

1. `docs/lp.html` (institucional / LP principal)
2. `docs/ementa-lp/index.html` (workshop/ementa)
3. `docs/ementa-lp/matricula.html` (workshop/candidatura)
4. `docs/lp-isca.html` (workshop/isca toolkit)

---

## Status por página

### 1) `docs/lp.html`
- **SEO essencial**: ✅
  - `<title>` ajustado para intenção de busca
  - `meta description`
  - `meta robots`
  - Open Graph básico (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`)
- **Prova social**: ✅
  - Seção nova `#prova-social` com:
    - 3 métricas em placeholder editável
    - 2 depoimentos em placeholder editável
- **Risco de layout**: Baixo (bloco novo reutilizando estilos existentes)

### 2) `docs/ementa-lp/index.html`
- **SEO essencial**: ✅
  - `<title>` refinado
  - `meta description`
  - `meta robots`
  - Open Graph básico (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`)
- **Prova social**: ✅
  - Seção nova `#proof` com placeholders para:
    - volume de alunos
    - casos de promoção/reposicionamento
    - nota média de satisfação
    - 2 depoimentos curtos
- **Risco de layout**: Baixo (seção em card no mesmo padrão visual)

### 3) `docs/ementa-lp/matricula.html`
- **SEO essencial**: ✅
  - `<title>` refinado
  - `meta description`
  - `meta robots`
  - Open Graph básico (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`)
- **Prova social**: ✅
  - Bloco novo `#social-proof-matricula` abaixo do formulário com placeholders editáveis
- **Risco de layout**: Baixo (bloco compacto no mesmo card)

### 4) `docs/lp-isca.html`
- **SEO essencial**: ✅
  - `<title>` refinado
  - `meta description`
  - `meta robots`
  - Open Graph básico (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`)
- **Prova social**: ✅
  - Seção nova `#proof-toolkit` com:
    - métrica principal placeholder
    - 2 depoimentos placeholders
- **Risco de layout**: Baixo (reuso de `.form-box`)

---

## Observações para fechamento final

- Os campos de prova social estão como **placeholders explícitos** para edição rápida pelo time sem refactor.
- `og:image` e algumas `og:url` usam caminhos canônicos esperados de produção; validar endpoint final no deploy.
- Recomendado próximo passo (P2): incluir `twitter:card` + schema.org (`Course`/`Organization`/`FAQPage`) após validação de conteúdo final.
