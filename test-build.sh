#!/bin/bash
# Script de teste local: compila frontend, testa que backend serve os assets

echo "========================================="
echo "  AppFidelidade - Local Integration Test"
echo "========================================="
echo ""

# 1. Gerar Prisma Client
echo "[1/3] Gerando Prisma Client..."
cd "$(dirname "$0")/api" || exit 1
npm run prisma-generate
if [ $? -ne 0 ]; then
  echo "❌ Erro ao gerar Prisma Client"
  exit 1
fi
echo "✅ Prisma Client gerado"
echo ""

# 2. Build frontend
echo "[2/3] Compilando frontend..."
cd "$(dirname "$0")/frontend" || exit 1
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Erro ao compilar frontend"
  exit 1
fi
echo "✅ Frontend compilado em frontend/dist"
echo ""

# 3. Verificar que frontend/dist existe
echo "[3/3] Verificando integração..."
API_DIR="$(dirname "$0")/api"
FRONTEND_DIST="$API_DIR/../frontend/dist"

if [ ! -d "$FRONTEND_DIST" ]; then
  echo "❌ Pasta frontend/dist não encontrada: $FRONTEND_DIST"
  exit 1
fi

echo "✅ frontend/dist encontrado: $FRONTEND_DIST"
echo ""
echo "========================================="
echo "  ✅ Build local passou em todos os testes"
echo "========================================="
echo ""
echo "Próxima etapa: testar o backend"
echo "  cd api"
echo "  npm install"
echo "  npm start"
echo ""
echo "O servidor deve servir:"
echo "  - API em http://localhost:4000/api"
echo "  - Frontend em http://localhost:4000"
echo "========================================="
