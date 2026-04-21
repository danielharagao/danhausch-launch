# CRM Funnel Operating System — Qualificação → Inscrição (com Next Action + SLA)

> Versão operacional consolidada a partir de:
> `apps/openclaw-cockpit/docs/crm/followup-playbook-v1.md`,
> `mentoria-spin-playbook.md`,
> `mentoria-inscricao.md`,
> `roteiro-call-vendas.md`,
> `script-vendas-completo.md`.

**Objetivo:** garantir execução comercial disciplinada do primeiro contato até a inscrição, sem lead “órfão”, com próxima ação explícita e SLA de follow-up.

---

## 1) Padrão de operação (regra-mãe)

Todo lead **ativo** deve ter, obrigatoriamente:
- `stage` (estágio atual do funil)
- `owner` (responsável)
- `nextActionAt` (data/hora da próxima ação)
- `nextActionType` (`whatsapp_followup` | `email_followup` | `call` | `proposal` | `nurture`)
- `lastOutcome` (resultado da última interação)

### Definição de atraso (SLA)
- Lead entra em **overdue** quando: `agora > nextActionAt + 24h`.
- Nenhum lead pode ficar sem atualização de atividade por mais de **48h** em dias úteis.
- Alertas de SLA: máximo de 1 alerta por lead a cada 6h (mesmo motivo).

### Regra de ouro de condução
1. Diagnóstico antes de proposta
2. Valor antes de preço
3. Objeção tratada com pergunta, não pressão
4. Toda conversa termina com decisão: **avança / pausa com data / perdido**
5. Nunca encerrar conversa sem próxima ação registrada

---

## 2) Fluxo por estágio com critérios, ações e SLA

## Estágio 0 — Novo Lead (Entrada)
**Objetivo:** fazer 1º contato e validar abertura para diagnóstico.

**Entrada no estágio:** lead novo vindo de formulário, inbound, indicação ou resposta de campanha.

**Ações obrigatórias:**
- Enviar mensagem inicial (WhatsApp ou e-mail)
- Confirmar canal preferido
- Tentar agendamento de mini-diagnóstico/call

**Critério para avançar:** lead responde e aceita conversar.

**Critério para desqualificar/pausar:**
- sem resposta após cadência completa de tentativa;
- contato inválido.

**SLA:**
- 1º toque: até **15 min** (ideal) / **2h úteis** (máximo)
- 2º toque: **D+1**
- 3º toque: **D+3**
- decisão de pausa/perda por inatividade: até **D+7**

**Next Action padrão:** `whatsapp_followup` ou `email_followup`.

---

## Estágio 1 — Qualificação (Pré-qualificação + SPIN curto)
**Objetivo:** confirmar fit comercial com dor real, impacto e urgência.

**Perguntas mínimas:**
- Situação: contexto atual (cargo, momento, tipo de desafio)
- Problema: onde trava hoje
- Implicação: custo de não resolver em 3–6 meses
- Need-payoff: resultado desejado e prioridade (0–10)

**Critério para avançar:**
- dor clara + impacto real + urgência mínima + abertura para solução.

**Critério para desqualificar:**
- sem fit de perfil;
- sem dor relevante;
- sem prioridade no horizonte próximo.

**SLA:**
- conclusão da qualificação após resposta inicial: até **24h**
- se pendente: novo toque em **D+1**

**Next Action padrão:** `call` ou `whatsapp_followup`.

---

## Estágio 2 — Diagnóstico / Call de Vendas
**Objetivo:** aprofundar cenário, organizar causa-raiz, gerar clareza de decisão.

**Estrutura da call (20–35 min):**
1. Abertura e alinhamento (2–3 min)
2. Diagnóstico (8–12 min)
3. Impacto e urgência (5–8 min)
4. Visão de futuro (3–5 min)
5. Encaminhamento para oferta

**Critério para avançar:**
- dor validada + objetivo concreto + aceitação do plano.

**Critério para reciclar para qualificação:**
- informações insuficientes ou baixa clareza decisória.

**SLA:**
- call agendada em até **72h** desde qualificação
- pós-call com resumo e próximo passo em até **24h**

**Next Action padrão:** `proposal` ou `whatsapp_followup`.

---

## Estágio 3 — Proposta / Oferta
**Objetivo:** apresentar solução, ancorar valor e confirmar aderência.

**Elementos obrigatórios da oferta:**
- para quem é
- transformação esperada
- formato de acompanhamento
- faixa de investimento (conforme política vigente)
- próximos passos de entrada

**Critério para avançar:** lead confirma interesse objetivo de entrada.

**Critério para negociação/follow-up:** surge objeção ou pendência de decisão.

**SLA:**
- proposta enviada: até **12h** após diagnóstico concluído
- confirmação de recebimento: até **24h**

**Next Action padrão:** `proposal` ou `call`.

---

## Estágio 4 — Objeções & Negociação
**Objetivo:** destravar decisão com clareza e compromisso.

**Objeções padrão:** preço, tempo, “vou pensar”, “preciso falar com alguém”, “agora não”.

**Protocolo de resposta:**
1. Validar objeção sem confronto
2. Perguntar critério real de decisão
3. Reconectar com impacto da inação
4. Fechar microcompromisso com prazo

**Critério para avançar para inscrição:** aceite explícito + forma de pagamento definida.

**Critério para pausa/perda:**
- sem prioridade real;
- sem orçamento e sem janela definida;
- sem resposta após sequência final.

**SLA de follow-up de negociação:**
- D+1, D+3, D+7 (toques objetivos)
- sem retorno após D+7: marcar como **Perdido (Sem resposta)** ou **Pausado com data**

**Next Action padrão:** `whatsapp_followup` / `call` / `email_followup`.

---

## Estágio 5 — Inscrição (Fechamento)
**Objetivo:** converter decisão em matrícula confirmada e onboarding.

**Dados mínimos obrigatórios:**
- Nome completo
- E-mail
- WhatsApp
- Cargo atual
- Tempo de experiência
- Principal desafio

**Checklist de fechamento:**
1. Confirmou dor e objetivo
2. Confirmou aderência
3. Confirmou investimento e forma de pagamento
4. Recebeu comprovante (quando aplicável)
5. Atualizou CRM para **Fechado**
6. Enviou boas-vindas e próximo passo

**SLA:**
- envio de instruções de pagamento: imediato (até **15 min**)
- confirmação de inscrição após comprovante: até **2h úteis**
- mensagem de onboarding inicial: até **24h**

**Next Action padrão:** `nurture` (onboarding) ou encerramento comercial.

---

## Estágio 6 — Perdido / Pausado
**Objetivo:** encerrar ciclo com aprendizado e possibilidade de retomada qualificada.

**Motivos padronizados:**
- sem prioridade
- sem orçamento
- sem fit
- sem resposta

**Ações obrigatórias:**
- registrar motivo de perda/pausa
- registrar data de decisão
- definir data de retomada (se pausado)

**SLA:**
- registrar desfecho no mesmo dia da decisão

---

## 3) Cadência oficial de follow-up

### Cadência curta (lead morno)
- **D+1:** retomada contextual da dor
- **D+3:** reforço de risco da inação + pergunta objetiva
- **D+7:** último toque com fechamento de ciclo

### Encerramento obrigatório da cadência
Toda cadência termina em um dos 3 estados:
1. **Avança** (nova etapa + ação marcada)
2. **Pausa com data** (retomada agendada)
3. **Perdido** (motivo registrado)

---

## 4) Campos obrigatórios no CRM por interação

1. `stage`
2. `dorPrincipal`
3. `impactoDeclarado`
4. `urgencia` (baixa/média/alta)
5. `orcamentoFit` (ok/não ok/em validação)
6. `objecaoPrincipal`
7. `nextActionType`
8. `nextActionAt`
9. `resultadoInteracao` (avançou/pausou/perdido/aguardando)
10. `owner`

---

## 5) Checklist operacional

## Checklist diário (início do dia)
- [ ] Abrir visão **Sem próxima ação** e zerar pendências
- [ ] Abrir visão **Atrasados (overdue)** e priorizar por impacto/temperatura
- [ ] Revisar agenda de calls do dia
- [ ] Confirmar follow-ups D+1, D+3 e D+7 programados
- [ ] Garantir que todo lead tocado hoje terminou com `nextActionAt`

## Checklist diário (fim do dia)
- [ ] Nenhum lead ativo sem próxima ação
- [ ] Todas as calls do dia com resumo e outcome registrados
- [ ] Propostas enviadas marcadas com prazo de retorno
- [ ] Leads sem resposta receberam toque conforme cadência
- [ ] Pipeline atualizado com estágios reais (sem “falso avanço”)

## Checklist semanal
- [ ] Revisar taxa de avanço por estágio (Novo→Qualificado→Proposta→Fechado)
- [ ] Revisar tempo médio de ciclo (1º contato até decisão)
- [ ] Revisar principais objeções da semana e respostas mais eficazes
- [ ] Auditar 10 leads para checar qualidade de registro CRM
- [ ] Limpar pipeline parado (>14 dias sem progresso real)
- [ ] Definir plano de recuperação de leads pausados com data de retomada

---

## 6) Templates rápidos por estágio (WhatsApp e e-mail)

## Estágio 0 — Novo Lead
**WhatsApp (1º contato)**
> Oi, {{nome}}! Aqui é {{vendedor}}, do time Danhausch. Vi seu interesse e queria entender seu momento para te indicar o melhor caminho. Pode ser por aqui em 2 min?

**E-mail (assunto: “Posso te orientar no próximo passo?”)**
> Olá, {{nome}}! Recebi seu contato e quero te ajudar a organizar o próximo passo com objetividade. Se fizer sentido, me responde com seu principal desafio hoje e eu te retorno com uma recomendação prática.

---

## Estágio 1 — Qualificação
**WhatsApp**
> Perfeito, {{nome}}. Para te orientar bem: hoje qual desafio mais trava sua evolução no trabalho? E se isso continuar por 3–6 meses, qual impacto real pra você?

**E-mail (assunto: “2 perguntas para entender seu cenário”)**
> {{nome}}, para eu te recomendar o caminho certo, preciso de 2 pontos: (1) principal dor atual; (2) impacto de manter isso como está nos próximos meses.

---

## Estágio 2 — Diagnóstico/Call
**WhatsApp (convite de call)**
> Pelo que você trouxe, faz sentido uma call rápida de 20–30 min para organizar diagnóstico + plano. Você prefere {{opção1}} ou {{opção2}}?

**E-mail (assunto: “Vamos fechar seu diagnóstico em 30 min?”)**
> {{nome}}, proponho uma conversa objetiva para mapear causa-raiz, impacto e plano prático. Duração: 30 min. Me diga o melhor horário.

---

## Estágio 3 — Proposta
**WhatsApp**
> {{nome}}, te enviei a proposta com foco no seu cenário: {{dor}} → {{resultado desejado}}. Queremos te colocar em execução com método e segurança. Consegue me confirmar hoje se avançamos?

**E-mail (assunto: “Sua proposta personalizada — próximos passos”)**
> Olá, {{nome}}. Segue proposta alinhada ao seu contexto, com formato, investimento e próximos passos. Se estiver de acordo, te envio imediatamente a etapa de pagamento para confirmar sua entrada.

---

## Estágio 4 — Objeções/Negociação
**WhatsApp — “Está caro”**
> Entendo totalmente. Posso te perguntar uma coisa objetiva? Comparado ao custo de continuar nesse cenário pelos próximos meses, como você enxerga esse investimento?

**WhatsApp — “Vou pensar”**
> Combinado. O que você precisa validar para decidir com segurança? Se quiser, te ajudo a fechar esse critério em 2 min.

**E-mail (assunto: “Te ajudo a decidir com clareza”)**
> {{nome}}, sem pressão: meu papel aqui é te ajudar a decidir com critério. Se você me disser a principal dúvida, eu te respondo de forma direta para facilitar sua decisão.

---

## Estágio 5 — Inscrição/Fechamento
**WhatsApp (pagamento)**
> Perfeito, {{nome}}. Vamos confirmar sua entrada agora. Você prefere PIX ou cartão? Assim que me enviar o comprovante, já libero seu onboarding.

**WhatsApp (confirmação de inscrição)**
> Fechado, {{nome}}! Sua inscrição está confirmada ✅
> Início: {{data}}
> Formato: {{formato}}
> Investimento: {{valor}}
> Próximo passo: {{proximo_passo}}

**E-mail (assunto: “Inscrição confirmada ✅ | próximos passos”)**
> Olá, {{nome}}! Sua entrada foi confirmada com sucesso. Neste e-mail estão resumo da contratação, data de início e instruções de onboarding.

---

## Estágio 6 — Follow-up de recuperação (morno)
**WhatsApp D+1**
> {{nome}}, fiquei pensando no seu cenário de {{dor}}. Quer que eu te mande um plano objetivo de evolução em 90 dias?

**WhatsApp D+3**
> Passando aqui porque esse ponto tende a piorar sem método. Ainda faz sentido avançar nisso agora?

**WhatsApp D+7 (encerramento)**
> Último toque por aqui: prefere avançar com sua entrada ou pausamos por enquanto e retomamos em {{data}}?

**E-mail (assunto: “Encerramos por agora ou retomamos com data?”)**
> {{nome}}, para respeitar seu timing, me sinaliza qual opção faz mais sentido: (1) avançar agora; (2) pausar com data de retomada; (3) encerrar neste momento.

---

## 7) KPIs operacionais mínimos

- % leads ativos com `nextActionAt` preenchido (meta: **100%**)
- # leads overdue >24h (meta: **0** no fechamento do dia)
- Taxa de avanço por estágio
- Tempo médio entre 1º contato e decisão
- Taxa de fechamento por origem
- Top 3 objeções da semana

---

## 8) Critério de qualidade de execução (auditoria rápida)

Um lead é considerado **bem operado** quando:
- tem histórico claro de conversas;
- teve diagnóstico antes de preço;
- teve objeção tratada com critério;
- sempre teve próxima ação com data;
- terminou em estado explícito (ganho, pausa com data, ou perdido com motivo).

Se qualquer item faltar, o lead está operacionalmente incompleto.
