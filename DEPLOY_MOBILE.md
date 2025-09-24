# 🚀 Deploy Mobile - Sistema Igreja

## 📱 Configuração para Mobile e VPS

### 1. 🌐 Acesso Mobile via VPS

**Configuração já aplicada:**
- ✅ Backend configurado para aceitar conexões externas (`0.0.0.0`)
- ✅ Frontend responsivo para mobile
- ✅ PWA configurado

**Para acessar no celular:**
```
http://SEU_IP_VPS:2027
```

### 2. 🔄 PM2 - Sistema Sempre Ativo

**Instalar PM2:**
```bash
npm install -g pm2
```

**Deploy automático:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Comandos úteis:**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart all

# Parar
pm2 stop all

# Deletar
pm2 delete all
```

### 3. 📱 PWA - App Nativo

**Funcionalidades PWA:**
- ✅ **Instalar como app** - ícone na tela inicial
- ✅ **Funciona offline** - cache inteligente
- ✅ **Notificações** - push notifications
- ✅ **Tela cheia** - sem barra do navegador
- ✅ **Responsivo** - adaptado para mobile

**Como instalar no celular:**
1. Acesse `http://SEU_IP_VPS:2027`
2. No Chrome: Menu → "Adicionar à tela inicial"
3. No Safari: Compartilhar → "Adicionar à tela inicial"

### 4. 🛠️ Configuração da VPS

**Firewall (se necessário):**
```bash
# Ubuntu/Debian
sudo ufw allow 2027
sudo ufw allow 2028

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=2027/tcp
sudo firewall-cmd --permanent --add-port=2028/tcp
sudo firewall-cmd --reload
```

**Nginx (opcional - para domínio):**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:2027;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:2028;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. 📊 Monitoramento

**Verificar se está funcionando:**
```bash
# Status dos processos
pm2 status

# Logs em tempo real
pm2 logs

# Monitoramento de recursos
pm2 monit
```

**URLs de teste:**
- Frontend: `http://SEU_IP:2027`
- Backend: `http://SEU_IP:2028/api/health`
- PWA: `http://SEU_IP:2027` (no celular)

### 6. 🔧 Troubleshooting

**Se o sistema parar:**
```bash
pm2 restart all
```

**Se não acessar externamente:**
```bash
# Verificar se está rodando
pm2 status

# Verificar portas
netstat -tulpn | grep :2027
netstat -tulpn | grep :2028
```

**Logs de erro:**
```bash
pm2 logs --err
```

## ✅ Checklist de Deploy

- [ ] VPS configurada com Node.js
- [ ] PM2 instalado globalmente
- [ ] Firewall configurado (portas 2027, 2028)
- [ ] Deploy executado com sucesso
- [ ] Teste no celular funcionando
- [ ] PWA instalável
- [ ] Sistema responsivo

## 🎯 Resultado Final

**No celular você terá:**
- 📱 App nativo instalado
- 🚀 Acesso rápido via ícone
- 📊 Interface responsiva
- 🔄 Funciona offline
- 📱 Comportamento de app nativo

**URLs finais:**
- **Frontend:** `http://SEU_IP:2027`
- **Backend:** `http://SEU_IP:2028`
- **PWA:** Instalável via navegador
