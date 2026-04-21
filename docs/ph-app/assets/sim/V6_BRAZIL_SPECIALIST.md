# V6 Brazil Specialist Pack (compatível com seed ativa V5)

## Escopo
Pacote de enriquecimento do Brasil para o motor de simulação (`seed.v5.json`) com granularidade nacional conectada ao contexto global.

Inclui:
1. **Entidades brasileiras ampliadas**
   - Estado e governança federal: `brazil_federal_state`, `br_congresso`, `br_stf`
   - Lideranças e condução econômica: `haddad`, `galipolo`
   - Instituições e financiamento: `bndes`
   - Setores/empresas estratégicas: `petrobras`, `vale`, `embraer`, `itau`, `br_agribusiness`
   - Subnível federativo: `sp_state`, `rj_state`
   - Conector LATAM: `mercosur`
2. **Grupos sociais Brasil**
   - `brazil-urban-informal`
   - `brazil-agro-exporters`
   - `brazil-evangelical-middle`
3. **Eventos dos últimos 5 anos com efeitos mapeáveis**
   - Fiscal, institucional, política, energia, agronegócio, relações exteriores e ciclo monetário.
4. **Relações estratégicas novas/ajustadas**
   - Brasil ↔ G20
   - Brasil ↔ LATAM (MERCOSUR/Argentina)
   - Brasil ↔ China/EUA/UE
   - Relações domésticas críticas (Executivo, Congresso, STF, BCB, Fazenda, BNDES e empresas-chave)

## Critérios de modelagem
- **Compatibilidade total de schema**: sem novos campos estruturais; apenas adição de nós/relações/eventos.
- **Escalas preservadas**: atributos em `[0..1]`; `relations.influence` em `[-1..1]`; `events.effects` no formato já aceito pelo engine.
- **Neutralidade operacional**: modelagem voltada a dinâmica sistêmica (não juízo normativo).
- **Conectividade**: novas entidades entram com arestas domésticas e externas para gerar efeito real nos KPIs.
- **Temporalidade**: eventos representam janelas 2021–2026 com intensidade calibrada para não saturar drift do engine.

## Limitações
- É um pacote de simulação estratégica, **não** base factual exaustiva nem previsão determinística.
- Pesos e intensidades são parâmetros heurísticos para cenários comparativos.
- Parte dos eventos agrega múltiplos episódios em janelas (ex.: ciclo SELIC, transição energética).
- Não há modelagem subnacional completa dos 27 estados; apenas pontos de alavanca (`sp_state`, `rj_state`).

## Integração no seed ativo (V5/V6)
- Arquivo integrado: `docs/ph-app/assets/sim/seed.v5.json`
- Metadata atualizada para `version: 5.1.0`.
- **Sem quebra de compatibilidade**: `main.js` continua apontando para `seed.v5.json`.
- O conteúdo já é utilizável como base V6 (especialização Brasil) mantendo runtime atual.

## Itens adicionados (resumo)
- **Players**: 14 novos
- **Groups**: 3 novos
- **Relations**: 32 novas
- **Events**: 9 novos

## Observação de governança de dados
Recomenda-se, em próximo ciclo, separar overlays regionais (`seed.v6.brazil.overlay.json`) para facilitar A/B de cenários sem alterar baseline global.