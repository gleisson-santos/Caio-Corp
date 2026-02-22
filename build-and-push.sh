#!/bin/bash
## ========================================================
## 🐱 Caio Corp — Build & Push das Imagens Docker
## ========================================================
## Execute este script na VPS (ou local) antes de fazer
## o deploy no Portainer.
##
## Uso:
##   chmod +x build-and-push.sh
##   ./build-and-push.sh
## ========================================================

set -e

DOCKER_USER="gleissonsantos"
DASHBOARD_IMAGE="${DOCKER_USER}/caio-dashboard:latest"
AGENT_IMAGE="${DOCKER_USER}/caio-agent:latest"

echo ""
echo "🐱 ============================================="
echo "   Caio Corp — Build & Push"
echo "   ============================================="
echo ""

## 1. Build do Dashboard (React → Nginx)
echo "📦 [1/4] Construindo imagem do Dashboard..."
docker build -t "$DASHBOARD_IMAGE" ./dashboard/
echo "✅ Dashboard OK!"

## 2. Build do Agente (Python + Node.js)
echo ""
echo "🧠 [2/4] Construindo imagem do Agente..."
docker build -t "$AGENT_IMAGE" .
echo "✅ Agente OK!"

## 3. Push para Docker Hub
echo ""
echo "🚀 [3/4] Enviando imagens para Docker Hub..."
echo "   (Certifique-se de ter feito: docker login)"
echo ""
docker push "$DASHBOARD_IMAGE"
docker push "$AGENT_IMAGE"
echo "✅ Push concluído!"

## 4. Cria volume se não existir
echo ""
echo "📂 [4/4] Verificando volume..."
docker volume create caio_workspace 2>/dev/null || true
echo "✅ Volume caio_workspace pronto!"

echo ""
echo "🎉 ============================================="
echo "   Tudo pronto! Agora vá no Portainer:"
echo "   Stacks → Add Stack → Cole o docker-compose.yml"
echo "   ============================================="
echo ""
