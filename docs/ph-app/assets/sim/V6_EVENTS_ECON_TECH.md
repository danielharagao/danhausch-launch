# V6 Events Pack — Economy & Technology (2021–2026)

Arquivo alvo: `docs/ph-app/assets/sim/seed.v5.json` (seed ativa do ph-app)

Data: 2026-04-21

## Objetivo

Enriquecer o pack de eventos dos últimos 5 anos com foco em impacto global econômico/tecnológico, incluindo explicitamente:

- NVIDIA (ciclo de chips/IA e reprecificação de capex)
- Export controls e sanções tecnológicas (EUA/China e blocos aliados)
- Cadeia de semicondutores (TSMC, Samsung, ASML)
- Choques de energia e comércio (guerra, Red Sea, OPEC+, fragmentação comercial)
- Eventos macro relevantes (aperto/soft landing, confiança, inflação, comércio)

## Integração no seed ativo

A integração foi feita **diretamente na seed ativa** (`seed.v5.json`), mantendo compatibilidade com o engine/UI:

- `meta.version` atualizado para `6.0.0`
- `meta.name/description/snapshotDate` atualizados
- `events[]` substituído por cronologia focada em 2021–2026 com `atStep` monotônico (1..24)
- Mapeamento de efeitos preservado no formato do motor (`macro.*`, `players.*`, `groups.*`, `relations.*`)

## Expansões de cobertura (mapeabilidade)

### Players adicionados

- `nvidia`
- `tsmc`
- `samsung`
- `asml`
- `openai`

### Groups adicionados

- `chip-supply-chain-workers`
- `energy-intensive-industry-workers`
- `trade-exposed-smes`
- `ai-knowledge-workers`

### Relations adicionadas (exemplos)

- `us -> nvidia` (influência)
- `china -> nvidia` (rivalidade)
- `nvidia -> tsmc` (dependência)
- `asml -> tsmc/samsung` (dependência)
- `southkorea -> samsung` (governança)

## Eventos V6 (resumo)

1. Post-COVID supply-chain bottlenecks (2021-10)
2. Global semiconductor shortage (2021-12)
3. Russia-Ukraine war energy/trade shock (2022-02)
4. European energy crisis (2022-09)
5. US advanced chip export controls on China (2022-10)
6. ChatGPT generative AI demand shock (2022-11)
7. SVB/high-rate financial stress (2023-03)
8. NVIDIA AI supercycle (2023-05)
9. G7/EU sanctions tightening on Russia (2023-12)
10. Red Sea shipping disruption (2024-01)
11. US AI-chip rule tightening (2023-2024)
12. EU AI Act governance milestone (2024-03)
13. Data-center power/grid strain (2024-06)
14. China property/demand stabilization (2024-10)
15. OPEC+ supply management volatility (2025-01)
16. Lower-cost model shock (2025-01)
17. US controls expansion on chips/tooling (2025-04)
18. Semiconductor sovereignty subsidy race (2025-06)
19. Disinflation / soft-landing window (2025-09)
20. Taiwan Strait semiconductor risk premium (2025-11)
21. Trade fragmentation / tariff wave (2026-02)
22. AI capex credit-cycle risk (2026-03)
23. Critical minerals bottleneck (2026-04)
24. Coordinated tech sanctions/countermeasures (2026-05)

## Notas de modelagem

- Intensidades calibradas em faixa moderada-alta (`0.13` a `0.27`) para preservar estabilidade.
- Eventos combinam choques negativos e positivos para evitar viés monotônico.
- Efeitos foram distribuídos entre `macro`, `players`, `groups` e `relations` para explicar drivers no painel sem quebrar a semântica do engine.

## Compatibilidade

- Mantido schema esperado pelo `engine.js`.
- Campos extras (`date`, `category`, `target`) permanecem opcionais e não quebram execução.
- `main.js` já aponta para `./assets/sim/seed.v5.json`, portanto a integração é imediata.
