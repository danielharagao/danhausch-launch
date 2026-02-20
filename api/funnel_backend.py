import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)

# Persistência em JSON local para garantir que nenhum lead se perca se o SendGrid falhar
LEADS_FILE = "/home/vpsuser/.openclaw/workspace/launch-repo/data/leads.jsonl"
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

if not SENDGRID_API_KEY:
    raise ValueError("SENDGRID_API_KEY not found in environment variables. Check .env file.")

def save_lead_locally(data):
    os.makedirs(os.path.dirname(LEADS_FILE), exist_ok=True)
    with open(LEADS_FILE, "a") as f:
        f.write(json.dumps(data) + "\n")

def send_to_sendgrid(email, name="BA Pro Candidate"):
    url = "https://api.sendgrid.com/v3/mail/send"
    # URL pública do PDF hospedado no GitHub Pages
    pdf_url = "https://danielharagao.github.io/danhausch-launch/EMENTA_BA_PRO.pdf"
    
    payload = {
        "personalizations": [{
            "to": [{"email": email}],
            "subject": "Ementa BA Pro: Seu Guia de Carreira Internacional"
        }],
        "from": {"email": "daniel@danhausch.com", "name": "Daniel Hausch | BA Pro"},
        "content": [{
            "type": "text/html",
            "value": f"""
            <html>
            <body style="font-family: sans-serif; color: #333;">
                <h2 style="color: #007AFF;">Olá! Aqui está o seu passaporte para a elite da Análise de Negócios.</h2>
                <p>Obrigado pelo seu interesse no <b>BA Pro</b>. Como prometido, aqui está o link para baixar a ementa completa em PDF:</p>
                <p style="margin: 30px 0;">
                    <a href="{pdf_url}" style="background-color: #D4AF37; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">BAIXAR EMENTA EM PDF</a>
                </p>
                <p>Neste documento, você encontrará o detalhamento dos 6 módulos que vão profissionalizar sua carreira para o mercado global.</p>
                <p>Sucesso,<br><b>Daniel Hausch</b></p>
            </body>
            </html>
            """
        }]
    }
    headers = {
        "Authorization": f"Bearer {SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        with open("sendgrid.log", "a") as log:
            log.write(f"Status: {response.status_code}, Body: {response.text}\n")
        return response.status_code == 202
    except Exception as e:
        with open("sendgrid.log", "a") as log:
            log.write(f"Error: {str(e)}\n")
        return False

@app.route('/capture-lead', methods=['POST'])
def capture_lead():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    # 1. Persistência de Dados (Segurança em Primeiro Lugar)
    save_lead_locally(data)
    
    # 2. Automação de E-mail
    email_sent = send_to_sendgrid(email)
    
    return jsonify({
        "status": "success",
        "email_automation": "triggered" if email_sent else "failed_but_saved_locally"
    }), 200

if __name__ == "__main__":
    app.run(port=5000)
