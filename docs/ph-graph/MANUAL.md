# Manual de Uso · Predictive History (Futuristas & Historiadores)

## Links
- Grafo: `/ph-graph/`
- War Room (simulação): `/ph-app/`
- Manual web: `/ph-graph/manual-futuristas-historiadores.html`

---

## 1) “Risco do quê?” (definições práticas)
No app, **risco** não é “risco genérico”. É composto por 4 eixos:

1. **Risco de conflito** (`riskConflict`)  
   Probabilidade relativa de escalada de antagonismos (interestatal, blocos ou doméstico).

2. **Estabilidade institucional** (`institutionalStability`)  
   Capacidade de instituições manterem coordenação e governança sob choque.

3. **Polarização** (`polarization`)  
   Fragmentação social/política e aumento de atrito entre grupos/narrativas.

4. **Resiliência econômica** (`economicResilience`)  
   Capacidade de absorver choques e manter funcionamento macro.

### Como ler os números
- **0–100%** em cartões/visuais são escala relativa do modelo (não probabilidade literal de evento único).
- Em geral:
  - **Risco de conflito / polarização**: quanto maior, pior.
  - **Estabilidade / resiliência**: quanto maior, melhor.

---

## 2) Como usar para simulações (playbook rápido)

### Passo 1 — Defina a pergunta
Exemplos:
- “Se aumentar tensão Taiwan, quais blocos ficam mais frágeis?”
- “Como um choque energético afeta G20 + Oriente Médio?”

### Passo 2 — Abra o War Room
1. Acesse `/ph-app/`
2. Vá em **Timeline & Playback**
3. Clique em **Play** ou mova o slider de tempo

### Passo 3 — Escolha recorte de análise
- Filtros por tipo: `country`, `leader`, `person`, `company`, `institution`
- Filtro por região
- Quick views:
  - **Só países**
  - **Só líderes**
  - **Só empresas**
  - **Top influenciadores**

### Passo 4 — Leia resultados
- **Overview**: fotografia dos KPIs
- **Network**: estrutura, hubs e nós-ponte
- **Drivers**: fatores que mais empurram risco no frame atual

### Explainability v2 (aba Drivers)
Use a aba **Drivers** para responder rapidamente “por que o risco mudou”:

1. **Why risk moved**
   - Cadeia causal: **Evento -> Macro -> Relações -> KPI**.
   - Mostra o encadeamento principal em linguagem direta.

2. **Top drivers com evidência**
   - Ranking dos drivers por contribuição.
   - Cada item traz evidência do frame (dados macro, volatilidade relacional, sinais de grupos).

3. **Mini timeline causa-efeito**
   - Últimos frames com variação de risco (em pontos), evento dominante e causa dominante.
   - Ideal para briefing executivo rápido.

### Passo 5 — Compare cenários
Faça 2–3 rodadas mudando premissas (tempo/filtro/recorte) e compare:
- quais nós sobem influência
- quais relações ficam mais voláteis
- quais blocos perdem coesão

---

## 3) Como interpretar o grafo corretamente
- **Nó** = ator (país, líder, empresa, instituição etc.)
- **Aresta** = relação (cooperação, rivalidade, dependência, influência, governança)
- **Peso/Sinal** = intensidade e direção da relação
- **Densidade** = grau de interconexão do recorte visível

### Heurísticas úteis
- Nó-ponte com alta centralidade + alta volatilidade = ponto crítico.
- Cluster isolando rápido = sinal de fragmentação.
- Alta dependência concentrada em poucos nós = fragilidade estrutural.

---

## 4) Fluxo recomendado (historiador x futurista)

### Historiadores
1. Compare padrão atual com períodos análogos
2. Identifique continuidade vs ruptura
3. Registre hipóteses de trajetória

### Futuristas
1. Foque sinais fracos (periferia ganhando conexões)
2. Teste cenários de choque (geopolítico/econômico/tecnológico)
3. Defina gatilhos de monitoramento

---

## 5) Limites (importante)
- Não é oráculo; é **simulação condicional**.
- Correlação visual não prova causalidade.
- Qualidade depende da qualidade/atualização dos dados.
- Use o app para **decisão orientada por cenário**, não para previsão determinística.

---

## 6) Checklist de sessão
- [ ] Pergunta clara de decisão
- [ ] Recorte (tipo/região) definido
- [ ] 3 nós críticos identificados
- [ ] 2 hipóteses concorrentes formuladas
- [ ] Drivers e implicações anotados
- [ ] Próxima coleta de dados planejada
