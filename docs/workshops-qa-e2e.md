# QA E2E — Workshops (BA / Gestão / IA)

**Data:** 2026-04-21 (UTC)  
**Escopo:** LP workshop → checkout → Asaas, desktop + mobile, smoke de carregamento, links quebrados, consistência de CTA.  
**Ambientes validados:**
- Produção: `https://danhausch.cloud/predictive-history/`
- GitHub Pages: `https://danielharagao.github.io/danhausch-launch/`

---

## 1) Checklist de QA

| Item | Status | Evidência |
|---|---|---|
| LP BA abre (desktop/mobile) | ✅ | `tmp/qa-e2e-artifacts/*-ba-lp.png` + `results.json` |
| LP Gestão abre (desktop/mobile) | ✅ | `tmp/qa-e2e-artifacts/*-gestao-lp.png` + `results.json` |
| LP IA abre (desktop/mobile) | ✅ | `tmp/qa-e2e-artifacts/*-ia-lp.png` + `results.json` |
| LP → checkout correto (3 fluxos) | ✅ | `lpCtaHref` em `results.json` |
| Checkout BA abre (desktop/mobile) | ✅ | `tmp/qa-e2e-artifacts/*-ba-checkout.png` |
| Checkout Gestão abre (desktop/mobile) | ✅ | `tmp/qa-e2e-artifacts/*-gestao-checkout.png` |
| Checkout IA abre (desktop/mobile) | ✅ | `tmp/qa-e2e-artifacts/*-ia-checkout.png` |
| Checkout → Asaas correto (3 fluxos) | ✅ | `ckAsaasHref`, `asaasFinalUrl`, status 200 |
| Links quebrados internos (workshop/checkout) | ✅ (0) | Crawl HTTP em produção + GH Pages |
| Smoke de carregamento | ✅ | Todos os HTML com status 200; tempos registrados |
| Consistência de CTA entre os 3 fluxos | ✅ | Mesmo padrão textual por etapa em cada ambiente |

---

## 2) Matriz de fluxos (resultado final)

### Produção (`danhausch.cloud/predictive-history`)

- **BA**: LP 200 → Checkout 200 → Asaas `zm0ell5ax9gjb3zc` (200)
- **Gestão**: LP 200 → Checkout 200 → Asaas `rqc26fu9w0gddpab` (200)
- **IA**: LP 200 → Checkout 200 → Asaas `eu0di2a6lu5wjguz` (200)

### GitHub Pages (`danielharagao.github.io/danhausch-launch`)

- **BA**: LP 200 → Checkout 200 → Asaas `zm0ell5ax9gjb3zc` (200)
- **Gestão**: LP 200 → Checkout 200 → Asaas `rqc26fu9w0gddpab` (200)
- **IA**: LP 200 → Checkout 200 → Asaas `eu0di2a6lu5wjguz` (200)

---

## 3) Evidências técnicas

Arquivos gerados:
- `tmp/qa-e2e-artifacts/results.json` (12 execuções: 2 ambientes × 2 viewports × 3 fluxos)
- Screenshots por etapa:
  - `tmp/qa-e2e-artifacts/{env}-{viewport}-{flow}-lp.png`
  - `tmp/qa-e2e-artifacts/{env}-{viewport}-{flow}-checkout.png`
  - `tmp/qa-e2e-artifacts/{env}-{viewport}-{flow}-asaas.png`

Validações HTTP adicionais:
- `https://danhausch.cloud/predictive-history` -> 200
- `https://danhausch.cloud/workshop-ba-pro.html` (sem `/predictive-history`) -> 404 (esperado fora do subpath publicado)

---

## 4) Bugs encontrados e correções

### Críticos
- **Nenhum bug crítico encontrado** no escopo validado (fluxos de compra funcionais fim a fim em mobile+desktop).

### Observações não-críticas
- Há **diferença de copy de CTA na LP** entre ambientes:
  - Produção (`/predictive-history`): "Ir para pagamento"
  - GitHub Pages: "Garantir minha vaga"
- Impacto: baixo (funcionalidade e destino corretos), mas pode gerar inconsistência de comunicação entre ambientes.

---

## 5) Conclusão

QA E2E dos 3 workshops concluído com sucesso no escopo solicitado:
- Fluxos BA/Gestão/IA íntegros
- Asaas correto para cada workshop
- Zero links quebrados no funil validado
- Smoke de carregamento aprovado em desktop e mobile
