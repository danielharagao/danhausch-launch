export const scenarioFrames = [
  {
    id: 0,
    label: "T0 · Base",
    score: 46,
    events: [
      { time: "08:00", title: "Oscilação em bloco Norte", impact: "+6" },
      { time: "09:30", title: "Volume anômalo em supernó S-12", impact: "+4" }
    ]
  },
  {
    id: 1,
    label: "T+1",
    score: 58,
    events: [
      { time: "10:10", title: "Propagação para cluster B2B", impact: "+8" },
      { time: "11:00", title: "Conexão de alto grau detectada", impact: "+4" }
    ]
  },
  {
    id: 2,
    label: "T+2",
    score: 71,
    events: [
      { time: "13:20", title: "Densidade crítica no bloco Leste", impact: "+9" },
      { time: "14:05", title: "Pessoa P-045 acionando múltiplos vetores", impact: "+4" }
    ]
  },
  {
    id: 3,
    label: "T+3",
    score: 63,
    events: [
      { time: "16:50", title: "Mitigação parcial em supernó S-12", impact: "-6" },
      { time: "18:15", title: "Persistência em bloco Oeste", impact: "+2" }
    ]
  }
];

export const networkData = {
  people: [
    { id: "P-045", label: "Pessoa P-045", region: "east", segment: "b2b", risk: 82, supernode: "S-12", block: "BLK-E1" },
    { id: "P-107", label: "Pessoa P-107", region: "north", segment: "public", risk: 65, supernode: "S-03", block: "BLK-N3" },
    { id: "P-230", label: "Pessoa P-230", region: "west", segment: "b2c", risk: 48, supernode: "S-09", block: "BLK-W2" },
    { id: "P-311", label: "Pessoa P-311", region: "south", segment: "b2b", risk: 74, supernode: "S-15", block: "BLK-S5" }
  ],
  supernodes: [
    { id: "S-12", label: "Supernó S-12", region: "east", risk: 79, blocks: ["BLK-E1", "BLK-E4"] },
    { id: "S-03", label: "Supernó S-03", region: "north", risk: 61, blocks: ["BLK-N3"] },
    { id: "S-09", label: "Supernó S-09", region: "west", risk: 52, blocks: ["BLK-W2", "BLK-W5"] },
    { id: "S-15", label: "Supernó S-15", region: "south", risk: 70, blocks: ["BLK-S5", "BLK-S7"] }
  ],
  blocks: [
    { id: "BLK-E1", label: "Bloco E1", region: "east", risk: 84 },
    { id: "BLK-N3", label: "Bloco N3", region: "north", risk: 59 },
    { id: "BLK-W2", label: "Bloco W2", region: "west", risk: 47 },
    { id: "BLK-S5", label: "Bloco S5", region: "south", risk: 68 }
  ]
};

export const riskDrivers = [
  { key: "centralidade", label: "Centralidade de conexão", weight: 0.32, explanation: "Nós com centralidade alta aceleram propagação de risco." },
  { key: "volatilidade", label: "Volatilidade temporal", weight: 0.24, explanation: "Picos de atividade em janelas curtas elevam incerteza." },
  { key: "concentracao", label: "Concentração em blocos", weight: 0.19, explanation: "Clusters densos com baixa redundância criam efeito cascata." },
  { key: "historico", label: "Histórico de reincidência", weight: 0.15, explanation: "Recorrência de padrão aumenta probabilidade posterior." },
  { key: "latencia", label: "Latência de mitigação", weight: 0.10, explanation: "Respostas tardias ampliam o raio de influência." }
];
