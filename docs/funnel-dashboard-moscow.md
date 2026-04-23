# Funnel Dashboard — Moscow (Scaffold)

_Gerado em: 2026-04-23T13:56:33.651040+00:00_

## KPIs principais

- Registros de funil analisados (QA): **12**
- LP success rate: **100.00%**
- Checkout success rate: **100.00%**
- Pagamento (Asaas link reach) success rate: **100.00%**
- Total leads CRM: **1**
- Leads ganhos (won): **N/D**
- Taxa de conversão CRM (won/total): **N/D%**

## Breakdown por ambiente

| Ambiente | Amostras | LP % | Checkout % | Asaas % | LP mediana (ms) | Checkout mediana (ms) | Asaas mediana (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gh | 6 | 100.00% | 100.00% | 100.00% | 94.00 | 94.50 | 984.50 |
| prod | 6 | 100.00% | 100.00% | 100.00% | 18.50 | 19.00 | 1025.50 |

## Gaps explícitos de dados

- ⚠️ crm_lead_status.json sem campo 'status' padronizado em parte dos registros
- ⚠️ Sem dados comportamentais reais do pixel/GA4 no repositório

## Observações

- Este painel está em modo **scaffold estático** com base nos arquivos hoje disponíveis no workspace.
- Métricas de tráfego real (visitas, sessões, eventos de conversão por canal) dependem da ingestão de GA4/Meta/API de CRM.
