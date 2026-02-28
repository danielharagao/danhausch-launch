// Ajuste estes links antes de publicar
const CONFIG = {
  formAction: "https://api.danhausch.cloud/api/capture",
  redirectThankYou: "./obrigado.html",
  ementaPdfUrl: "./BA_PRO_EMENTA.pdf",
  whatsappGroupUrl: "https://chat.whatsapp.com/G56Z6bR2hlKDVNKeNYMxgl"
};

window.BA_PRO_CONFIG = CONFIG;

const form = document.getElementById('leadForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const status = document.getElementById('formStatus');
    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();

    if (!name || !email) {
      status.textContent = 'Preencha nome e e-mail para continuar.';
      status.style.color = '#ff9f9f';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    status.textContent = '';

    // Meta Pixel: track when user submits the form (submit-button intent)
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'BA Pro - Ementa LP',
        source: 'ba-pro-ementa'
      });
    }

    try {
      if (CONFIG.formAction && !CONFIG.formAction.includes('SEU_ENDPOINT')) {
        await fetch(CONFIG.formAction, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, source: 'ba-pro-ementa' })
        });
      }

      localStorage.setItem('ba_pro_lead_name', name);
      localStorage.setItem('ba_pro_lead_email', email);
      window.location.href = CONFIG.redirectThankYou;
    } catch (err) {
      status.textContent = 'Falha ao enviar. Tente novamente em instantes.';
      status.style.color = '#ff9f9f';
      btn.disabled = false;
      btn.textContent = 'Quero receber a ementa completa';
    }
  });
}

const waBtn = document.getElementById('waBtn');
if (waBtn) {
  waBtn.href = CONFIG.whatsappGroupUrl;
}

const pdfBtn = document.getElementById('pdfBtn');
if (pdfBtn) {
  pdfBtn.href = CONFIG.ementaPdfUrl;
}
