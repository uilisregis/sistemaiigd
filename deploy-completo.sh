#!/bin/bash

echo "🚀 Iniciando deploy completo do Sistema Igreja..."

# 1. Limpar tudo
echo "🧹 Limpando sistema anterior..."
cd ~
rm -rf sistemaiigd
pm2 delete all

# 2. Clonar repositório
echo "📦 Clonando repositório..."
git clone https://github.com/uilisregis/sistemaiigd.git
cd sistemaiigd

# 3. Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

# 4. Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

# 5. Executar deploy
echo "🚀 Executando deploy..."
chmod +x deploy.sh
./deploy.sh

# 6. Configurar firewall
echo "🔒 Configurando firewall..."
ufw allow 2027
ufw allow 2028
ufw allow 3033
ufw --force enable

# 7. Verificar status
echo "📊 Verificando status..."
pm2 status

echo "✅ Deploy concluído!"
echo "🌐 Frontend: http://164.68.112.91:2027"
echo "🌐 Backend: http://164.68.112.91:2028"
echo "🌐 Prisma: http://164.68.112.91:3033"
