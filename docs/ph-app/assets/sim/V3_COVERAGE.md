# Predictive History Dataset V3 — Coverage

Arquivo de seed: `docs/ph-app/assets/sim/seed.v3.json`

## Objetivo

A V3 amplia o seed sintético para um baseline global com foco em:
- países e blocos institucionais,
- líderes e pessoas influentes,
- empresas estratégicas multissetoriais,
- relações tipadas e ponderadas para simulações geopolíticas/econômicas.

Mantida compatibilidade retroativa com o engine atual (`engine.js`) usando a mesma estrutura:
`meta`, `players`, `groups`, `relations`, `events`, `macro`.

## Cobertura incluída

### 1) Blocos institucionais
- **ONU** (`un`)
- **UE** (`eu`)
- **G20** (`g20`)

### 2) Países (inclui membros G20)
Foram incluídos os países centrais do G20:
- Argentina, Australia, Brazil, Canada, China, France, Germany, India, Indonesia, Italy,
  Japan, Mexico, Russia, Saudi Arabia, South Africa, South Korea, Turkiye, United Kingdom, United States.

Observação: a UE também está representada como bloco institucional, além de países europeus individuais.

### 3) Lideranças e pessoas influentes
Incluídos líderes globais e influenciadores de alto impacto político/tecnológico/financeiro, por exemplo:
- Donald Trump, Xi Jinping, Narendra Modi, Vladimir Putin,
- Ursula von der Leyen, Antonio Guterres,
- **Elon Musk** (explicitamente solicitado), Sam Altman, Jensen Huang, Christine Lagarde.

### 4) Empresas estratégicas por setor
- **Big Tech / IA / software / social**: Apple, Microsoft, Alphabet, Amazon, Meta, OpenAI, Tesla, X Corp
- **Semicondutores**: NVIDIA, TSMC, Samsung
- **Energia**: Saudi Aramco, ExxonMobil, Shell
- **Defesa**: Lockheed Martin, BAE Systems, NORINCO
- **Finanças**: JPMorgan Chase, BlackRock, ICBC
- **Logística**: Maersk, DHL, COSCO Shipping
- **Mídia**: Disney, Comcast/NBCUniversal, ByteDance

### 5) Relações tipadas e ponderadas
Relações usam `influence` em `[-1..1]` e `volatility` em `[0..1]`, com tipos:
- `influencia`
- `dependencia`
- `rivalidade`
- `cooperacao`
- `governanca`

Isso cobre os eixos solicitados (influência, dependência, rivalidade, cooperação e governança) sem alterar o contrato do engine.

## Critérios de inclusão

1. **Relevância sistêmica**: ator com capacidade material, regulatória, tecnológica ou simbólica de afetar cenário global.
2. **Diversificação setorial**: equilíbrio entre Estado, mercado, instituições multilaterais e informação/mídia.
3. **Conectividade de rede**: priorização de entidades com interdependência explícita (cadeias de chips, energia, finanças, segurança).
4. **Compatibilidade técnica**: manutenção dos campos numéricos e limites esperados pelo motor atual.

## Limitações

- Dataset é **sintético** e calibrado para simulação exploratória; não representa previsão factual.
- Lideranças políticas mudam no tempo; a V3 usa um **snapshot temporal** (`meta.snapshotDate`) e pode exigir atualização periódica.
- Nem todos os países/empresas globais relevantes estão incluídos (recorte por impacto sistêmico e tamanho operacional do seed).
- Os pesos (`power`, `cohesion`, `legitimacy`, `influence`, etc.) são heurísticos para estabilidade do modelo, não métricas oficiais.
- Relações são direcionais e simplificadas; não capturam toda a dinâmica multilateral real.

## Compatibilidade com engine

A V3 não introduz campos obrigatórios novos para a execução do simulador.
`engine.js` continua apto a processar:
- `players[]` com atributos normalizados,
- `groups[]` com pesos e variáveis sociais,
- `relations[]` com `influence/volatility`,
- `events[]` com `effects` por key-path,
- `macro` com os seis indicadores esperados.
