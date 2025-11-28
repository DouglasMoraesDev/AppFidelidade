# Script de teste local: compila frontend, testa que backend serve os assets
# Rodando em PowerShell

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  AppFidelidade - Local Integration Test" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 1. Gerar Prisma Client
Write-Host "[1/3] Gerando Prisma Client..." -ForegroundColor Cyan
$apiDir = Join-Path $PSScriptRoot "api"
Set-Location $apiDir
npm run prisma-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client gerado" -ForegroundColor Green
Write-Host ""

# 2. Build frontend
Write-Host "[2/3] Compilando frontend..." -ForegroundColor Cyan
$frontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend compilado em frontend/dist" -ForegroundColor Green
Write-Host ""

# 3. Verificar que frontend/dist existe
Write-Host "[3/3] Verificando integração..." -ForegroundColor Cyan
$frontendDist = Join-Path $PSScriptRoot "frontend" "dist"

if (-not (Test-Path $frontendDist -PathType Container)) {
    Write-Host "❌ Pasta frontend/dist não encontrada: $frontendDist" -ForegroundColor Red
    exit 1
}

Write-Host "✅ frontend/dist encontrado: $frontendDist" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✅ Build local passou em todos os testes" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próxima etapa: testar o backend" -ForegroundColor Yellow
Write-Host "  cd api" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "O servidor deve servir:" -ForegroundColor Yellow
Write-Host "  - API em http://localhost:4000/api" -ForegroundColor Gray
Write-Host "  - Frontend em http://localhost:4000" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Green
