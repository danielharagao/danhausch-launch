# Status P0 — Placeholders de Conversão (LPs/Workshops)

Data: 2026-04-21  
Escopo: `launch-repo/docs` (LPs, páginas de apoio e materiais de workshop/copy)

## Resumo
- Placeholders de **WhatsApp/PDF** encontrados nas copies da ementa foram substituídos por links reais já existentes no repositório.
- Links de **formAction** e **WhatsApp** da LP de ementa já estavam válidos e foram mantidos.
- Para os links de **checkout Stripe dos 3 workshops** (não disponíveis no repo), foi mantido fallback seguro com sinalização visual **"pendente de confirmação"** em `docs/funnels-missing-info-form.html` e TODO centralizado abaixo.

## Tabela item → status → arquivo → ação

| Item | Status | Arquivo | Ação |
|---|---|---|---|
| Link WhatsApp da página de obrigado/copy (ementa) | ✅ Resolvido | `docs/ementa-lp/copy_pronto_colar.txt` | Substituído `[INSERIR_LINK_WHATSAPP_AQUI]` por `https://chat.whatsapp.com/G56Z6bR2hlKDVNKeNYMxgl` |
| Link PDF da ementa no e-mail/copy | ✅ Resolvido | `docs/ementa-lp/copy_pronto_colar.txt` | Substituído `[INSERIR_LINK_DA_EMENTA_AQUI]` por `https://danielharagao.github.io/danhausch-launch/ementa-lp/BA_PRO_EMENTA.pdf` |
| Placeholders duplicados na copy base | ✅ Resolvido | `docs/ementa-lp/copy.txt` | Atualizadas todas ocorrências de `[INSERIR_LINK_WHATSAPP_AQUI]` e `[INSERIR_LINK_DA_EMENTA_AQUI]` |
| Link WhatsApp em ativo de conversão | ✅ Resolvido | `docs/ativos.html` | `href="#"` trocado por link real do grupo WhatsApp |
| Configuração de `formAction` da LP de ementa | ✅ Já estava válido | `docs/ementa-lp/app.js` | Mantido `https://api.danhausch.cloud/api/capture` |
| Configuração de `ementaPdfUrl` | ✅ Já estava válido | `docs/ementa-lp/app.js` | Mantido `./BA_PRO_EMENTA.pdf` |
| Configuração de `whatsappGroupUrl` | ✅ Já estava válido | `docs/ementa-lp/app.js` | Mantido `https://chat.whatsapp.com/G56Z6bR2hlKDVNKeNYMxgl` |
| Instruções antigas de placeholder | ✅ Resolvido | `docs/ementa-lp/README.md` | README atualizado com links já validados e fallback operacional |
| Checkout Stripe Workshop 1 | ⚠️ Pendente de confirmação | `docs/funnels-missing-info-form.html` | Fallback seguro + banner visual "pendente de confirmação"; aguarda URL final |
| Checkout Stripe Workshop 2 | ⚠️ Pendente de confirmação | `docs/funnels-missing-info-form.html` | Fallback seguro + banner visual "pendente de confirmação"; aguarda URL final |
| Checkout Stripe Workshop 3 | ⚠️ Pendente de confirmação | `docs/funnels-missing-info-form.html` | Fallback seguro + banner visual "pendente de confirmação"; aguarda URL final |

## TODO centralizado (pendências externas ao repo)
- [ ] Confirmar e inserir URL final de checkout Stripe — Workshop 1
- [ ] Confirmar e inserir URL final de checkout Stripe — Workshop 2
- [ ] Confirmar e inserir URL final de checkout Stripe — Workshop 3

## Critério de pronto restante
- Fechar os 3 links Stripe pendentes e atualizar os pontos de publicação dos workshops assim que as URLs oficiais forem disponibilizadas.
