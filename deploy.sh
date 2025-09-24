#!/bin/bash

echo "🚀 Iniciando deploy do Sistema Igreja..."

# Criar diretório de logs se não existir
mkdir -p logs

# Parar processos existentes
echo "⏹️ Parando processos existentes..."
pm2 stop all
pm2 delete all

# Instalar dependências
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

# Build do frontend para produção
echo "🔨 Fazendo build do frontend..."
cd frontend
npm run build
cd ..

# Iniciar com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save
pm2 startup

echo "✅ Deploy concluído!"
echo "🌐 Backend: http://SEU_IP:2028"
echo "🌐 Frontend: http://SEU_IP:2027"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs"
