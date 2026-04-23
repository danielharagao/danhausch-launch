# Auditoria de Funil de Conversão — Danhausch (Workshops Pro)

**Data:** 2026-04-23 (UTC)  
**Escopo auditado:**
- Repositório: `/root/.openclaw/workspace/launch-repo`
- Produção: `https://lp.danhausch.com`
- Páginas-chave: `index.html` (hub), `workshop-*.html`, `checkout-*.html`, `lp.html`, `lp-isca.html`, `thank-you.html`, `ementa-lp/*`

---

## 1) Resumo executivo

O funil está **publicável e funcional no fluxo básico** (LP → workshop → checkout Asaas), mas ainda **não está pronto para escalar mídia com segurança** por 3 motivos centrais:

1. **Mensuração incompleta para aquisição paga** (atribuição parcial; sem padrão robusto de eventos por etapa e sem visibilidade de conversão final por origem/campanha no próprio stack).
2. **Credibilidade/comprovação insuficiente no topo e meio de funil** (múltiplos placeholders de prova social em páginas com tráfego).
3. **Pré-venda e follow-up subexplorados** (captura de lead pouco estruturada no funil de workshops, poucas alavancas de recuperação de indecisos e abandono).

**Diagnóstico macro:** boa base visual e clareza de proposta, porém com risco de desperdiçar CAC ao aumentar investimento antes de “fechar” tracking + prova social + rotina comercial.

---

## 2) Score por pilar (0–10)

| Pilar | Score | Leitura objetiva |
|---|---:|---|
| Oferta | **7.0** | Oferta clara (3 trilhas, preço único, escassez de vagas), porém sem diferenciação/prova suficiente por trilha. |
| Landing page (arquitetura) | **6.5** | Estrutura limpa e direta; ainda faltam blocos de objeção, FAQ forte e narrativa por estágio de consciência. |
| Copy | **6.0** | Mensagem principal boa; inconsistências entre promessas e provas; placeholders reduzem confiança. |
| UX/CRO | **7.0** | Navegação simples e sem fricção técnica grave; falta otimização de microconversões e redução de ansiedade pré-checkout. |
| Tracking/Analytics | **4.5** | GA4 básico ativo; eventos limitados; quebra de atribuição entre etapas e baixa capacidade de leitura de ROI por campanha. |
| CRM/Follow-up | **4.0** | Capturas existem em fluxos paralelos, mas sem evidência de cadência robusta de nutrição/recuperação para workshops. |
| Checkout | **6.5** | Checkout externo Asaas simplifica operação; porém sem instrumentação/ponte completa de dados e com pré-checkout raso. |
| Operação comercial | **5.5** | Estrutura mínima funciona; faltam playbook de SLA, rotina de contato e governança de indicadores. |

**Média geral ponderada (qualitativa): 5.9 / 10**

---

## 3) Evidências-chave observadas

1. **Produção em `lp.danhausch.com` está alinhada ao hub de workshops** (`docs/index.html`) com CTA para trilhas e checkout Asaas.
2. **GA4 presente** (`G-KQY9Y5HJGZ`) e eventos front-end básicos (`lp_view`, `cta_click`, `checkout_click`) nas páginas principais de workshops.
3. **UTM parcial:** no hub há passagem de `utm_*` para links dos workshops, mas o encadeamento até checkout pode perder granularidade operacional para CRM e análise de cohort.
4. **Prova social com placeholders** em páginas centrais (hub e outras LPs), impactando confiança no momento de decisão.
5. **Fluxos paralelos coexistem** (`lp.html`, `lp-isca.html`, `ementa-lp`), com propostas e maturidade diferentes; risco de dispersão de tráfego e leitura fragmentada de performance.
6. **Captura de lead existe em alguns fluxos** (API de capture/matrícula), mas sem evidência no front de automações de follow-up orientadas a estágio para quem não compra.

---

## 4) Gargalos por prioridade

## P0 (bloqueia escala eficiente de mídia)

1. **Tracking de funil incompleto para tomada de decisão de tráfego pago**
   - Falta padronização forte de eventos por etapa e reconciliação com resultado de receita.
   - Risco: escalar sem saber quais criativos/campanhas realmente geram pagamento.

2. **Prova social insuficiente nas páginas com intenção comercial**
   - Placeholders em blocos críticos de confiança.
   - Risco: queda de CVR em tráfego frio e aumento de CPC efetivo por baixa taxa de avanço.

3. **Arquitetura de funil fragmentada (múltiplas LPs com posicionamentos distintos)**
   - Hub/workshops + LP BA Pro + isca + ementa em níveis diferentes de consistência.
   - Risco: canibalização de mensagem, inconsistência de promessa e dificuldade de otimizar mídia.

## P1 (alto impacto, não bloqueante imediato)

1. **Pré-checkout pouco persuasivo por trilha**
   - Páginas de workshop curtas, com argumento funcional, porém sem aprofundar objeções (tempo, risco, garantia, “para quem não é”).

2. **Follow-up comercial subdimensionado**
   - Sem evidência explícita de cadência 24h/72h/7d para não compradores, nem segmentação por comportamento.

3. **Ausência de ativos de conversão assistida**
   - Falta FAQ robusto, comparativo entre trilhas, prova de transformação com antes/depois e mecanismos de urgência mais auditáveis.

## P2 (melhorias incrementais)

1. **Padronização de copy e design entre ativos**
2. **Melhorias de SEO/metadata/social previews por rota**
3. **Teste estruturado de variações de headline/CTA**

---

## 5) Plano de ação — 7 dias (objetivo + dono sugerido)

## Dia 1 — Instrumentação mínima confiável (P0)
- **Tarefa:** definir taxonomia única de eventos (view_lp, click_trilha, view_workshop, click_checkout, checkout_open, purchase_confirmed_proxy).
- **Dono sugerido:** Tech/Growth
- **Saída:** documento de tracking + eventos implantados no front em todas as etapas.

- **Tarefa:** padronizar persistência de `utm_source/medium/campaign/content/term` + `gclid/fbclid` no navegador e envio para endpoints de captura.
- **Dono:** Tech
- **Saída:** parâmetros preservados da entrada até lead/checkout click.

## Dia 2 — Prova social real e anti-objeção (P0)
- **Tarefa:** substituir placeholders por 3–6 provas reais (texto curto + contexto + resultado mensurável).
- **Dono:** Conteúdo/Founder
- **Saída:** blocos de prova social finais no hub + workshop BA (prioritário).

- **Tarefa:** criar bloco “objeções comuns” (tempo, nível técnico, retorno, gravação, suporte).
- **Dono:** Copy
- **Saída:** seção FAQ/objeções em páginas de workshop.

## Dia 3 — Reforço de página de workshop (P1)
- **Tarefa:** expandir cada workshop com: para quem é/não é, entregáveis, agenda, resultados esperados, bônus, política comercial.
- **Dono:** Copy + Produto
- **Saída:** versão v2 das 3 páginas de workshop.

## Dia 4 — CRM e follow-up (P1)
- **Tarefa:** desenhar cadência de 5 contatos (D0, D1, D3, D5, D7) para leads sem compra.
- **Dono:** CRM/Founder
- **Saída:** sequência pronta por e-mail/WhatsApp com gatilhos por comportamento.

- **Tarefa:** criar segmentações mínimas: (a) clicou checkout e não pagou, (b) lead frio, (c) lead quente por trilha.
- **Dono:** CRM + Tech
- **Saída:** listas/etiquetas operacionais.

## Dia 5 — Operação comercial (P1)
- **Tarefa:** definir SLA de contato (ex.: lead quente em até 15 min no horário comercial).
- **Dono:** Operação/Founder
- **Saída:** playbook de atendimento + script de WhatsApp.

- **Tarefa:** ritual diário de métricas (visitas, CTR CTA, click checkout, pagamento, CAC estimado).
- **Dono:** Growth
- **Saída:** dashboard simples (planilha/GA4/Looker Studio).

## Dia 6 — Checklist de checkout e risco (P0/P1)
- **Tarefa:** validar links Asaas, tempo de carregamento, consistência mobile e rastreio de saída para checkout.
- **Dono:** Tech + QA
- **Saída:** checklist assinado + incident log zero.

## Dia 7 — Go/No-Go para escala
- **Tarefa:** revisão final dos 8 pilares e decisão de aumento gradual de budget.
- **Dono:** Founder + Growth
- **Saída:** plano de escala em ondas (20%/48h com guardrails).

---

## 6) Quick wins (alto impacto, baixo esforço)

1. **Trocar todos os placeholders de prova social por provas reais curtas** (impacto direto em CVR).  
2. **Adicionar FAQ de objeções nas páginas de workshop** (reduz fricção pré-checkout).  
3. **Inserir CTA secundária de contato humano (“tirar dúvidas no WhatsApp”) antes do checkout** para leads indecisos.  
4. **Padronizar copy de urgência com data/horário real de fechamento de turma** (evita escassez genérica).  
5. **Garantir que toda captura de lead grave origem da campanha** (UTM + trilha).  
6. **Criar 1 régua curta de recuperação de abandono de checkout (D0 e D1)** com oferta de esclarecimento, não desconto imediato.  
7. **Adicionar seção “para quem não é”** para qualificar melhor e reduzir objeções tardias.

---

## 7) Riscos de conversão antes de escalar mídia

- **Risco de desperdício de verba:** sem visibilidade de ponta a ponta, otimização de mídia tende a ser “cego por clique”.
- **Risco de confiança:** placeholders e provas fracas reduzem performance em público frio.
- **Risco operacional:** sem rotina comercial e SLA, leads quentes esfriam rápido.
- **Risco estratégico:** múltiplas rotas de funil sem governança única fragmentam aprendizado e atrasam melhoria contínua.

---

## 8) Recomendação final (governança de escala)

**Não escalar agressivamente agora.**  
Recomendação: **ajuste de 7 dias** (acima), validação de baseline de conversão e só então escala progressiva.

**Critério mínimo para liberar escala:**
- tracking consistente entre etapas,
- prova social real publicada,
- cadência de follow-up ativa,
- leitura diária de métricas de funil.

Quando esses quatro pontos estiverem estáveis, a operação passa de “funil funcional” para “funil escalável com controle de risco”.
