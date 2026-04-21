# Blueprint Único de Funil por Workshop

## Objetivo
Padronizar um único modelo operacional de funil para os 3 workshops (W1/W2/W3), com responsáveis, critérios claros de passagem, SLA, métricas mínimas e definição de pronto por etapa.

## Regras Globais do Funil
- **Janela de medição padrão:** D+1, D+3 e D+7 após cada workshop.
- **Critério de passagem:** ninguém avança sem cumprir o critério objetivo da etapa anterior.
- **SLA padrão de follow-up comercial:** primeiro contato até **15 minutos** para lead quente e até **2 horas** para lead morno.
- **Fonte de verdade:** CRM + planilha de controle diário (captura, presença, qualificação, proposta, fechamento).

---

## Trilha 1 — Workshop 1 (Topo de Funil / Aquecimento)

### Etapa 1 — Captação & Inscrição
- **Entrada:** campanha ativa + página de inscrição publicada.
- **Saída:** lead inscrito com nome, WhatsApp, e-mail e consentimento.
- **Owner:** Marketing Performance.
- **SLA:** validação de pixel/formulário e integração CRM em até 4h após ativação.
- **Critério de passagem:** lead salvo no CRM com origem da campanha e tag `W1-INSCRITO`.
- **Métricas mínimas:**
  - Taxa de conversão da página de inscrição **>= 20%**.
  - CPL dentro da meta definida da semana.
- **Riscos:** tráfego desqualificado; quebra de formulário; lead sem contato válido.
- **Mitigação:** checklist técnico pré-campanha, validação diária de leads teste e regra de bloqueio para contatos inválidos.

**Definition of Done (DoD):**
- Landing page publicada e funcional em mobile/desktop.
- Eventos de tracking disparando corretamente.
- Lead entrando no CRM com tag correta e timestamp.
- Painel diário atualizado até 10h do dia seguinte.

### Etapa 2 — Confirmação & Comparecimento
- **Entrada:** lista de inscritos W1.
- **Saída:** participante presente ao vivo ou com replay iniciado.
- **Owner:** Operações de Comunidade/Relacionamento.
- **SLA:** envio de lembretes em D-1, H-2 e H-0.
- **Critério de passagem:** presença registrada (ao vivo) ou replay iniciado por >= 10 minutos.
- **Métricas mínimas:**
  - Show-up ao vivo **>= 35%** dos inscritos.
  - Presença total (ao vivo + replay) **>= 50%** dos inscritos.
- **Riscos:** baixa entrega de mensagens; conflito de horário; desistência.
- **Mitigação:** multicanal (WhatsApp + e-mail), reforço de benefício prático e contingência com replay liberado em 2h.

**Definition of Done (DoD):**
- Sequência de lembretes enviada nos horários definidos.
- Lista de presença consolidada (ao vivo + replay).
- Segmentação atualizada em `W1-PRESENTE` e `W1-AUSENTE`.
- Dashboard de comparecimento fechado em D+1.

### Etapa 3 — Engajamento & Pré-qualificação
- **Entrada:** participantes presentes no W1.
- **Saída:** lead classificado em quente/morno/frio para W2.
- **Owner:** Pré-vendas (SDR).
- **SLA:** classificação inicial em até 24h após presença.
- **Critério de passagem:** lead com score e tag `W1-QUALIFICADO` apto para convite W2.
- **Métricas mínimas:**
  - >= 60% dos presentes com score preenchido.
  - >= 30% dos presentes classificados como quente ou morno.
- **Riscos:** atraso na qualificação; critérios subjetivos; perda de timing.
- **Mitigação:** roteiro único de qualificação, automações por comportamento e auditoria de 10% das classificações.

**Definition of Done (DoD):**
- Score preenchido no CRM com evidência (campo/nota).
- Segmentação por temperatura aplicada.
- Lista de convite W2 validada e sem duplicidade.
- Tabela de performance por SDR atualizada.

---

## Trilha 2 — Workshop 2 (Meio de Funil / Diagnóstico e Valor)

### Etapa 1 — Convite Inteligente para W2
- **Entrada:** base `W1-QUALIFICADO`.
- **Saída:** inscrição confirmada para W2.
- **Owner:** Marketing de Relacionamento + SDR.
- **SLA:** disparo inicial até D+1 do W1; 2 ondas de reforço em 48h.
- **Critério de passagem:** lead com confirmação registrada e tag `W2-INSCRITO`.
- **Métricas mínimas:**
  - Conversão de convite para inscrição W2 **>= 25%**.
  - Taxa de opt-out **<= 3%**.
- **Riscos:** excesso de mensagens; proposta de valor fraca; base mal segmentada.
- **Mitigação:** personalização por dor/interesse, cadência limitada e teste A/B de convite.

**Definition of Done (DoD):**
- Fluxo de convite com segmentação correta disparado.
- Lista `W2-INSCRITO` sincronizada no CRM.
- Opt-outs tratados e removidos da cadência.
- Relatório de conversão por canal disponível.

### Etapa 2 — Entrega de Conteúdo + Quebra de Objeções
- **Entrada:** inscritos e presentes do W2.
- **Saída:** lead com intenção declarada (interesse em proposta/diagnóstico).
- **Owner:** Especialista/Host do Workshop + Suporte de Chat.
- **SLA:** resposta a dúvidas críticas no chat em até 10 minutos durante evento.
- **Critério de passagem:** lead marcou CTA de interesse, respondeu formulário de diagnóstico ou pediu contato.
- **Métricas mínimas:**
  - Retenção média >= 40 minutos no W2.
  - CTR no CTA principal **>= 15%** dos presentes.
- **Riscos:** conteúdo desalinhado; falta de prova; objeções sem resposta.
- **Mitigação:** roteiro com provas/cases, FAQ ao vivo e bloco fixo de objeções no encerramento.

**Definition of Done (DoD):**
- CTA principal apresentado e rastreado.
- Perguntas críticas respondidas e catalogadas.
- Lista de interessados gerada com prioridade.
- Principais objeções registradas para ajuste da próxima turma.

### Etapa 3 — Qualificação Comercial (MQL → SQL)
- **Entrada:** lista de interessados do W2.
- **Saída:** lead aprovado para proposta no W3/oferta final.
- **Owner:** SDR/Closer.
- **SLA:** 1º contato em até 15 min (quente) ou 2h (morno); até 5 tentativas em 72h.
- **Critério de passagem:** lead com dor, urgência e capacidade mínimas confirmadas; tag `SQL-W3`.
- **Métricas mínimas:**
  - Taxa de contato efetivo **>= 50%**.
  - Conversão MQL→SQL **>= 35%**.
- **Riscos:** baixa taxa de resposta; no-show em calls; qualificação inconsistente.
- **Mitigação:** playbook de abordagem, janela estendida de contato, confirmação ativa de agenda.

**Definition of Done (DoD):**
- Tentativas de contato registradas no CRM.
- Classificação MQL/SQL com justificativa.
- Agenda de atendimentos W3 fechada por prioridade.
- Motivos de perda etiquetados para análise.

---

## Trilha 3 — Workshop 3 (Fundo de Funil / Oferta e Fechamento)

### Etapa 1 — Apresentação da Oferta
- **Entrada:** base `SQL-W3` + convidados estratégicos.
- **Saída:** proposta formal apresentada.
- **Owner:** Closer + Especialista.
- **SLA:** envio da proposta em até 2h após interação de alta intenção.
- **Critério de passagem:** proposta enviada com valor, escopo, prazo e próximo passo.
- **Métricas mínimas:**
  - Taxa de proposta emitida **>= 80%** dos SQL ativos.
  - Tempo médio para envio de proposta **<= 2h**.
- **Riscos:** proposta genérica; atraso no envio; desalinhamento de expectativa.
- **Mitigação:** templates por perfil, biblioteca de objeções e checklist de personalização antes do envio.

**Definition of Done (DoD):**
- Proposta registrada no CRM com versão e timestamp.
- Escopo e investimento explicados ao lead.
- Próximo passo agendado (deadline de decisão).
- Responsável por follow-up definido.

### Etapa 2 — Follow-up de Fechamento
- **Entrada:** propostas enviadas.
- **Saída:** venda fechada, negociação em curso ou perda declarada.
- **Owner:** Closer.
- **SLA:** follow-up em D+1, D+3 e D+7 após proposta.
- **Critério de passagem:** status final em `GANHO`, `PERDIDO` ou `NURTURING` com motivo.
- **Métricas mínimas:**
  - Taxa de fechamento sobre propostas **>= 20%**.
  - Ciclo médio de decisão **<= 7 dias**.
- **Riscos:** follow-up fraco; desconto sem critério; lead sem urgência.
- **Mitigação:** cadência consultiva, régua de concessão aprovada e reforço de custo de inação.

**Definition of Done (DoD):**
- Histórico de follow-up completo no CRM.
- Motivo de ganho/perda registrado.
- Condições comerciais aprovadas conforme política.
- Pipeline atualizado sem oportunidades “sem dono”.

### Etapa 3 — Onboarding & Handoff
- **Entrada:** leads fechados (`GANHO`).
- **Saída:** cliente ativado no onboarding com responsável e cronograma.
- **Owner:** Customer Success / Onboarding.
- **SLA:** contato de boas-vindas em até 24h após pagamento confirmado.
- **Critério de passagem:** kick-off agendado e dados de implantação completos.
- **Métricas mínimas:**
  - Ativação em até 7 dias **>= 90%** dos novos clientes.
  - NPS de onboarding inicial **>= 8.0**.
- **Riscos:** transição comercial→CS incompleta; atraso de acesso; expectativa errada.
- **Mitigação:** checklist de handoff obrigatório, e-mail de boas-vindas padronizado e call de alinhamento inicial.

**Definition of Done (DoD):**
- Handoff comercial documentado (escopo, promessa, riscos).
- Kick-off confirmado com decisor.
- Acessos e materiais iniciais entregues.
- Cliente marcado como `ONBOARDING-ATIVO` no CRM.

---

## Governança de Métricas (mínimo operacional)
- **Ritual diário (15 min):** inscritos, presença, contatos, propostas, vendas.
- **Ritual semanal (60 min):** conversões por etapa, gargalos, plano de correção.
- **Alertas de desvio:**
  - Queda > 20% em qualquer taxa crítica por 2 dias consecutivos.
  - SLA de contato rompido em > 15% dos leads quentes.

## Matriz de Donos por Trilha
- **W1:** Marketing Performance + Relacionamento + SDR.
- **W2:** Relacionamento + Host + SDR/Closer.
- **W3:** Closer + CS/Onboarding.

## Observação de Implementação
Este blueprint deve ser aplicado como template único para cada nova turma, alterando apenas metas de volume (não os critérios de passagem e DoD).