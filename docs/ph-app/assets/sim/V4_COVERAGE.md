# Predictive History Dataset V4 — Coverage

Arquivo de seed: `docs/ph-app/assets/sim/seed.v4.json`

## Objetivo

A V4 expande a V3 com foco em:
- maior cobertura de **empresas estratégicas globais** por domínio,
- ampliação de **pessoas-chave** (políticas, empresariais e institucionais),
- relações explicitamente tipadas por par de entidades:
  - `person-company`
  - `person-country`
  - `company-country`
  - `company-company`
  - `person-person`

A estrutura-base permanece compatível com o engine atual (`meta`, `players`, `groups`, `relations`, `events`, `macro`).

## Cobertura adicionada na V4

### 1) Empresas estratégicas por domínio (expansão)
Além do núcleo da V3, foram adicionadas empresas relevantes por setor:

- **Big Tech / software / plataforma**: Tencent, Alibaba, Oracle, IBM
- **Energia**: Chevron, TotalEnergies, Gazprom
- **Defesa**: Northrop Grumman, RTX
- **Semicondutores**: Intel, AMD, ASML, SMIC
- **Finanças**: Goldman Sachs, HSBC, Visa
- **Logística**: UPS, FedEx, MSC
- **Mídia**: Netflix, Warner Bros. Discovery, News Corp

### 2) Pessoas-chave globais (expansão)
Além de líderes/pessoas já presentes na V3 (incluindo **Elon Musk**), foram adicionados nomes com influência geopolítica, econômica e institucional, por exemplo:

- **Políticas**: Joe Biden, Luiz Inácio Lula da Silva, Volodymyr Zelenskyy, Mohammed bin Salman
- **Institucionais**: Jerome Powell, Kristalina Georgieva
- **Empresariais/financeiras**: Larry Fink, Jamie Dimon, Satya Nadella, Sundar Pichai, Tim Cook

### 3) Relações tipadas por classe de ator
A V4 mantém `type`, `influence` e `volatility` e adiciona `pairType` para explicitar a natureza do par.

Exemplos incluídos:
- **person-company**: `timcook -> apple`, `nadella -> microsoft`, `dimon -> jpmorgan`
- **person-country**: `lula -> brazil`, `mbs -> saudi`, `powell -> us`
- **company-country**: `asml -> eu`, `smic -> china`, `gazprom -> russia`
- **company-company**: `amd -> tsmc`, `nvidia -> asml`, `ups -> fedex`
- **person-person**: `elon -> samaltman`, `trump -> biden`, `dimon -> fink`

## Critérios de inclusão

1. **Importância sistêmica**: escala global e capacidade de impacto em segurança, energia, tecnologia, finanças, logística e informação.
2. **Diversidade de domínio**: equilíbrio entre setores com forte efeito de segunda ordem no sistema global.
3. **Conectividade de rede**: priorização de atores com interdependência visível (cadeias de chips, crédito global, energia e transporte).
4. **Utilidade para simulação**: entidades e vínculos que ajudam a gerar dinâmicas ricas sem quebrar compatibilidade do motor.

## Fontes públicas de referência (para seleção de atores)

Curadoria guiada por fontes abertas amplamente reconhecidas (não ingestão automática):

- **Instituições e economia internacional**: IMF, World Bank, OECD, UN Data, BIS
- **Energia e commodities**: IEA, EIA, OPEC Annual Statistical Bulletin
- **Defesa e segurança**: SIPRI, IISS (Military Balance), CSIS (bases abertas)
- **Semicondutores e tecnologia**: relatórios anuais de empresas, TSMC/ASML/Intel/NVIDIA filings, WSTS
- **Finanças**: relatórios anuais e 10-K/20-F, FSB, bancos centrais
- **Logística e comércio**: UNCTAD, WTO, World Bank Logistics Performance Index
- **Mídia e plataformas**: relatórios anuais e resultados trimestrais públicos

## Limitações

- A V4 continua sendo **dataset sintético**, não previsão factual.
- Pesos (`power`, `influence`, `volatility`, etc.) são **heurísticos de modelagem**.
- Há simplificação de relações complexas e multilaterais em vínculos direcionais.
- Snapshot temporal (`meta.snapshotDate`) pode envelhecer rápido em contexto político/regulatório.
- `pairType` é metadado adicional de classificação; não altera o contrato mínimo exigido pelo engine.

## Compatibilidade com engine

A V4 preserva o formato esperado pelo `engine.js`. Campos adicionados (como `pairType`) são opcionais e não quebram execução do simulador.
