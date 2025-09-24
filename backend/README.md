# Sistema de Gestão de Membros da Igreja - Backend

Sistema completo para gerenciamento de membros e controle de presença em cultos da igreja.

## 🚀 Funcionalidades

- **Cadastro de Membros**: Foto 3x4, dados pessoais e upload de arquivos (PDF, JPG, PNG)
- **Controle de Presença**: Marcação de presença por data e tipo de culto
- **Dashboard de Frequência**: Visualização de estatísticas de cada membro
- **Sistema de Alertas**: Identificação automática de membros ausentes (3+ cultos seguidos)
- **Tipos de Culto**: Gerenciamento de diferentes tipos de reuniões
- **Upload de Arquivos**: Sistema completo de upload e organização de documentos

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
```

3. **Iniciar o servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (banco, upload)
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares (logger, error handler)
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   └── server.js        # Servidor principal
├── uploads/             # Arquivos enviados
├── logs/                # Logs do sistema
└── database.sqlite      # Banco de dados SQLite
```

## 🔌 API Endpoints

### Membros
- `GET /api/members` - Listar membros
- `GET /api/members/:id` - Buscar membro por ID
- `GET /api/members/:id/stats` - Estatísticas do membro
- `GET /api/members/absent` - Membros ausentes
- `POST /api/members` - Criar membro
- `PUT /api/members/:id` - Atualizar membro
- `DELETE /api/members/:id` - Deletar membro
- `POST /api/members/:id/photo` - Upload de foto
- `POST /api/members/:id/files` - Upload de arquivos

### Presenças
- `GET /api/attendance` - Listar presenças
- `GET /api/attendance/stats` - Estatísticas de presença
- `GET /api/attendance/absent` - Membros ausentes
- `POST /api/attendance` - Marcar presença
- `POST /api/attendance/bulk` - Marcar presença em lote
- `PUT /api/attendance/:id` - Atualizar presença
- `DELETE /api/attendance/:id` - Deletar presença

### Tipos de Culto
- `GET /api/service-types` - Listar tipos de culto
- `POST /api/service-types` - Criar tipo de culto
- `PUT /api/service-types/:id` - Atualizar tipo de culto
- `DELETE /api/service-types/:id` - Deletar tipo de culto

## 🗄️ Banco de Dados

O sistema usa SQLite com as seguintes tabelas:

- **members**: Dados dos membros
- **attendance**: Registro de presenças
- **service_types**: Tipos de culto disponíveis

## 📊 Logs

O sistema gera logs automáticos em:
- Console (desenvolvimento)
- Arquivo `logs/app.log` (produção)

## 🔒 Segurança

- Rate limiting (100 req/15min por IP)
- Validação de tipos de arquivo
- Sanitização de dados
- Headers de segurança (Helmet)

## 📝 Exemplos de Uso

### Criar um membro:
```bash
curl -X POST http://localhost:3001/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "address": "Rua das Flores, 123"
  }'
```

### Marcar presença:
```bash
curl -X POST http://localhost:3001/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "date": "2024-01-15",
    "serviceType": "Culto Dominical",
    "notes": "Chegou atrasado"
  }'
```

## 🚀 Deploy

Para produção, configure as variáveis de ambiente:
- `NODE_ENV=production`
- `PORT=3001`
- `JWT_SECRET=seu_secret_seguro`

## 📞 Suporte

Para dúvidas ou problemas, consulte os logs em `logs/app.log` ou entre em contato com a equipe de desenvolvimento.
