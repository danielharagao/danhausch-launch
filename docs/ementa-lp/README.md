# BA Pro Pages (HTML + CSS + JS)

## Arquivos
- `ementa.html` → página de captura da ementa
- `obrigado.html` → página de agradecimento com CTA WhatsApp
- `email-ementa.html` → template de e-mail em HTML
- `styles.css` → estilos compartilhados
- `app.js` → comportamento do formulário/links

## Ajustes obrigatórios antes de publicar
Edite `app.js` e troque:
- `formAction`
- `ementaPdfUrl`
- `whatsappGroupUrl`

No `email-ementa.html`, troque:
- `[INSERIR_LINK_DA_EMENTA_AQUI]`

## Teste local rápido
Abra `ementa.html` no navegador.

> Dica: se não quiser enviar para backend agora, deixe `formAction` com placeholder e o formulário só redirecionará para `obrigado.html`.
