#!/bin/bash

echo "🚀 Iniciando deploy do Sistema Igreja na VPS..."

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Instalar PM2
echo "📦 Instalando PM2..."
npm install -g pm2

# 4. Clonar repositório
echo "📦 Clonando repositório..."
git clone https://github.com/uilisregis/sistemaiigd.git
cd sistemaiigd

# 5. Instalar dependências
echo "📦 Instalando dependências do backend..."
cd backend && npm install
cd ..

echo "📦 Instalando dependências do frontend..."
cd frontend && npm install
cd ..

# 6. Executar deploy
echo "🚀 Executando deploy..."
chmod +x deploy.sh
./deploy.sh

# 7. Configurar firewall
echo "🔒 Configurando firewall..."
ufw allow 2027
ufw allow 2028
ufw allow 3033
ufw --force enable

# 8. Verificar status
echo "📊 Verificando status..."
pm2 status

echo "✅ Deploy concluído!"
echo "🌐 Frontend: http://164.68.112.91:2027"
echo "🌐 Backend: http://164.68.112.91:2028"
echo "🌐 Prisma: http://164.68.112.91:3033"
