# V5 — Middle East + Russia Expansion

Arquivo alvo: `docs/ph-app/assets/sim/seed.v5.json`

## Objetivo
Expandir o baseline V4 com foco em **Oriente Médio + Rússia**, adicionando atores estatais, lideranças e instituições-chave, além de relações estratégicas (energia, segurança, alianças e rivalidades), mantendo compatibilidade com a engine client-side e com os filtros de UI (`entityType`, `region`, `riskThreshold`, `quickView`).

## Escopo aplicado

### 1) Novos atores (players)
Incluídos países/lideranças/instituições para cobertura regional:
- **Israel**: país + liderança + Ministério da Fazenda + Banco Central.
- **Irã**: país + liderança + Ministério de Economia + Banco Central.
- **EAU**: país + liderança + Ministério da Fazenda + Banco Central.
- **Qatar**: país + liderança + Ministério da Fazenda + Banco Central.
- **Egito**: país + liderança + Ministério da Fazenda + Banco Central.
- **Instituições regionais**: GCC, Liga Árabe, SCO.
- **Rússia (aprofundamento)**: Conselho de Segurança da Rússia, Ministério de Energia, Gazprom (company).

### 2) Novos grupos sociais (groups)
Adicionados clusters com peso político/econômico na região:
- Levant Displaced Communities
- Gulf Expat Labor Force
- Iran Urban Middle Class
- Israel Security Reservists and Families
- Russia Urban Professionals
- Russia Defense-Industrial Workforce

### 3) Relações estratégicas (relations)
Incluídas conexões em quatro camadas:
- **Governança interna (triads state-leader-institutions)** dos novos países.
- **Energia e recursos**: Rússia–OPEC+, Arábia Saudita–Rússia, Qatar–UE, corredores eurasiáticos.
- **Segurança e rivalidade**: Irã–Israel, Irã–Arábia Saudita, vínculos com EUA/UK e volatilidade elevada.
- **Blocos globais**: conexões com G20/IMF/OPEC/SCO e países já presentes no V4.

### 4) Eventos (events)
Adicionados eventos no horizonte de steps 34–39:
- Risco no Estreito de Ormuz
- Janela diplomática no Levante
- Rotação de investimento energético no Golfo
- Repriorização orçamentária de defesa da Rússia
- Ajuste de corredores energéticos eurasiáticos
- Janela de financiamento para gás no Mediterrâneo Oriental

## Critérios de modelagem
1. **Compatibilidade de schema**: mantidos campos usados pela engine (`players/groups/relations/events/macro`) e ranges numéricos esperados (`[0..1]`, `[-1..1]` para `identityPole` e `influence`).
2. **Sem breaking change**: tipos e chaves seguem padrão existente; dados continuam parseáveis pelo `PHSim.normalizeSeed`.
3. **Compatibilidade UI/filtros**:
   - `type` consistente com `inferEntityType` (incluindo `country`, `leader`, `institution`, `company`).
   - uso de `region` para melhorar filtro geográfico e exploração de rede.
4. **Integração com blocos globais**: relações conectadas aos nós já existentes (`us`, `eu-country`, `china`, `india`, `opec`, `imf`, `g20`, `turkiye`, `saudi`, `russia`).
5. **Risco sistêmico realista**: eventos de energia/segurança aumentam volatilidade em relações e trade/inflation, sem extrapolar limites de normalização.

## Mudanças de integração
- `docs/ph-app/assets/js/main.js` agora aponta para `./assets/sim/seed.v5.json`.
- `docs/ph-graph/assets/js/app.js` agora aponta para `../ph-app/assets/sim/seed.v5.json`.

## Resumo quantitativo V5
- `players`: **115**
- `groups`: **17**
- `relations`: **242**
- `events`: **40**

---

### Observação
A V5 é uma expansão temática sobre V4 (não substitui metodologia anterior), preservando a lógica de triads e a legibilidade para análise de cenários geopolíticos em UI.
