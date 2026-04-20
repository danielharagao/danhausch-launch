# V5 G20 AUDIT — Cobertura País a País

Data: 2026-04-20  
Arquivos auditados: `seed.v4.json`, `seed.v5.json`

## Escopo da revisão

Objetivo da missão:
1. Garantir presença de todos os membros do G20 com **nó de estado + liderança principal + instituições críticas**.
2. Normalizar **nomes/ids/tipos** para consistência.
3. Revisar relações entre países do G20 (cooperação, rivalidade, dependência, governança, influência), removendo inconsistências.
4. Registrar gaps e resolução.

---

## Resultado consolidado

- ✅ **20/20 países/blocos do G20 cobertos** no dataset (`19 países + EU member bloc`).
- ✅ **20/20 com liderança principal conectada** por relação `leader -> country` do tipo `governanca`.
- ✅ **20/20 com 2 instituições críticas mínimas** (fazenda/tesouro + banco central equivalente), com relação `institution -> country` do tipo `dependencia` e contrapartida `country -> institution` tipo `governanca`.
- ✅ Relações inter-países G20 **expandidas e balanceadas com reciprocidade** nos pares estratégicos.
- ✅ Normalização aplicada em nomenclatura e metadados (`pairType` em 100% das relações).

---

## Gaps encontrados e resolvidos

1. **Metadado de tipagem ausente em relações**
   - Gap: relações sem classificação estrutural do par.
   - Resolução: adicionado `pairType` em todas as relações (`country-country`, `leader-country`, `institution-country`, `country-institution`, `institution-institution`).

2. **Cobertura inter-country G20 subdimensionada e assimétrica**
   - Gap: poucos vínculos país-país e várias relações unidirecionais sem contraparte.
   - Resolução: ampliadas relações bilaterais G20 com reciprocidade e coerência temática (alianças, rivalidades, dependências comerciais/energéticas e influência regional).

3. **Inconsistências de nomenclatura**
   - Gap: variações de escrita para nomes críticos.
   - Resolução: normalizados:
     - `Luiz Inácio Lula da Silva`
     - `Lee Jae-myung`
     - `Türkiye` / `Türkiye Treasury and Finance`
     - `European Union (G20 Member Bloc)` (nó de país/bloco do G20)

4. **Ausência de seed.v5**
   - Gap: versão V5 não materializada no diretório.
   - Resolução: criado `seed.v5.json` a partir da V4 revisada, com bump de metadata e descrição de cobertura normalizada.

---

## Checklist país a país

Legenda: Estado | Líder | Instituições críticas | Relações G20 país-país

- ✅ **Argentina** — `argentina` | `milei` | `arg_treasury`, `arg_bcra` | OK
- ✅ **Australia** — `australia` | `albanese` | `aus_treasury`, `aus_rba` | OK
- ✅ **Brazil** — `brazil` | `lula` | `br_fazenda`, `br_bcb` | OK
- ✅ **Canada** — `canada` | `carney` | `ca_finance`, `ca_boc` | OK
- ✅ **China** — `china` | `xi` | `cn_ndrc`, `cn_pbc` | OK
- ✅ **France** — `france` | `macron` | `fr_finance`, `fr_bdf` | OK
- ✅ **Germany** — `germany` | `merz` | `de_finance`, `de_buba` | OK
- ✅ **India** — `india` | `modi` | `in_finance`, `in_rbi` | OK
- ✅ **Indonesia** — `indonesia` | `prabowo` | `id_finance`, `id_bi` | OK
- ✅ **Italy** — `italy` | `meloni` | `it_mef`, `it_bdi` | OK
- ✅ **Japan** — `japan` | `ishiba` | `jp_mof`, `jp_boj` | OK
- ✅ **Mexico** — `mexico` | `sheinbaum` | `mx_hacienda`, `mx_banxico` | OK
- ✅ **Russia** — `russia` | `putin` | `ru_finance`, `ru_cbr` | OK
- ✅ **Saudi Arabia** — `saudi` | `mbs` | `sa_mof`, `sa_sama` | OK
- ✅ **South Africa** — `southafrica` | `ramaphosa` | `za_treasury`, `za_sarb` | OK
- ✅ **South Korea** — `southkorea` | `leejm` | `kr_mof`, `kr_bok` | OK
- ✅ **Türkiye** — `turkiye` | `erdogan` | `tr_treasury`, `tr_cbrt` | OK
- ✅ **United Kingdom** — `uk` | `starmer` | `uk_hmt`, `uk_boe` | OK
- ✅ **United States** — `us` | `trump` | `us_treasury`, `us_fed` | OK
- ✅ **European Union (G20 Member Bloc)** — `eu-country` | `vonderleyen` | `ec`, `ecb` | OK

---

## Mudanças de arquivo

- Atualizado: `docs/ph-app/assets/sim/seed.v4.json`
  - normalização de nomes
  - inclusão de `pairType` em todas as relações
  - expansão e consistência da malha `country-country` do G20

- Criado: `docs/ph-app/assets/sim/seed.v5.json`
  - clone da V4 revisada com metadata V5 (`version: 5.0.0`)

- Criado: `docs/ph-app/assets/sim/V5_G20_AUDIT.md`
  - relatório de auditoria + checklist completo

---

## Nota de consistência

Não foram encontrados vínculos órfãos (`source/target` inexistentes) após a revisão. Todas as relações permanecem compatíveis com o motor (`engine.js`) e com o contrato estrutural atual do dataset.
