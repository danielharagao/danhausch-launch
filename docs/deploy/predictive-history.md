# Deploy Predictive History (API + Postgres)

## 1) Pré-requisitos
- Docker + Docker Compose
- Domínio/subdomínio para API (ex.: `api.seudominio.com`)
- Nginx + Certbot (produção)

## 2) Subir stack local
```bash
cp .env.example .env
docker compose up -d --build
```

API: `http://localhost:8000/health`

## 3) Bootstrap do banco
```bash
# executa scripts SQL base + v2 + seed
docker compose exec api bash -lc './scripts/bootstrap_db.sh'
```

## 4) Reverse proxy (Nginx)
Exemplo de bloco de servidor:

```nginx
server {
  listen 80;
  server_name api.seudominio.com;

  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 5) TLS com Certbot
```bash
sudo certbot --nginx -d api.seudominio.com
```

## 6) Operação
```bash
docker compose ps
docker compose logs -f api
docker compose restart api
```

## 7) Frontend
No `ph-app`, configure **Base URL** para sua API pública HTTPS.
