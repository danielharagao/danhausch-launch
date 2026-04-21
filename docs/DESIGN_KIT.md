# DanHausch Workshops — Design Kit (v1)

## Objetivo
Padronizar visual e estrutura em todas as páginas de workshops/checkout.

## Arquivo base
- CSS global: `docs/assets/design-kit.css`

## Tokens
- Cores: `--dk-bg`, `--dk-panel`, `--dk-line`, `--dk-text`, `--dk-muted`, `--dk-primary`, `--dk-success`
- Raio: `--dk-radius`

## Componentes padrão
- Container: `.dk-wrap`
- Card: `.dk-card`
- Botão primário: `.dk-btn`
- Botão secundário: `.dk-btn.ghost`
- Grid: `.dk-grid` (`.cols-2`, `.cols-3`)
- Slot de imagem: `.dk-slot`

## Convenção de slots de imagem
- Usar `data-slot="..."` nos placeholders
- Nome padrão: `hero-*`, `profile-*`, `proof-*`, `workshop-*`

## Processo de atualização
1. Dan envia links finais das imagens.
2. Alfred atualiza `docs/image-slots.json`.
3. Alfred sobe os assets e troca os placeholders nas páginas.
