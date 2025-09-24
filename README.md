# Sistema de Gestão de Membros da Igreja

Sistema completo para gerenciamento de membros e controle de presença em cultos da igreja, desenvolvido com tecnologias modernas e interface intuitiva.

## 🚀 Funcionalidades

### 📋 Cadastro de Membros
- **Foto 3x4**: Upload de foto para cada membro
- **Dados Pessoais**: Nome, email, telefone, endereço, data de nascimento
- **Upload de Arquivos**: Suporte a PDF, JPG e PNG para documentos
- **Organização**: Sistema de pastas automático por membro

### 📅 Controle de Presença
- **Marcação por Data**: Sistema de calendário para marcar presenças
- **Tipos de Culto**: Diferentes tipos de reuniões (dominical, quarta, oração, etc.)
- **Interface Intuitiva**: Marcação rápida com clique
- **Presença em Lote**: Marcar múltiplos membros de uma vez

### 📊 Dashboard e Relatórios
- **Visão Geral**: Estatísticas em tempo real
- **Frequência Individual**: Dashboard personalizado para cada membro
- **Alertas de Ausência**: Identificação automática de membros ausentes (3+ cultos)
- **Relatórios Detalhados**: Análise por período, tipo de culto e membro

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Tema Moderno**: Interface limpa e profissional
- **Navegação Intuitiva**: Sidebar com navegação fácil
- **Feedback Visual**: Notificações e estados de loading

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite** - Banco de dados
- **Multer** - Upload de arquivos
- **Helmet** - Segurança
- **Morgan** - Logging

### Frontend
- **React 18** - Biblioteca de interface
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Query** - Gerenciamento de estado
- **React Router** - Roteamento
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
sistemaiigd/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── config/         # Configurações (DB, Upload)
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares (Logger, Error)
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   └── server.js       # Servidor principal
│   ├── uploads/            # Arquivos enviados
│   ├── logs/               # Logs do sistema
│   └── database.sqlite     # Banco de dados
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços da API
│   │   ├── utils/          # Utilitários
│   │   └── styles/         # Estilos CSS
│   └── public/             # Arquivos públicos
└── docs/                   # Documentação
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistemaiigd
```

### 2. Instalar dependências do Backend
```bash
cd backend
npm install
```

### 3. Instalar dependências do Frontend
```bash
cd ../frontend
npm install
```

### 4. Configurar variáveis de ambiente
```bash
# No diretório backend
cp env.example .env
```

### 5. Executar o sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Acessar o sistema
- **Frontend**: http://localhost:2027
- **Backend API**: http://localhost:2028
- **Health Check**: http://localhost:2028/api/health

## 📖 Como Usar

### 1. Cadastrar Membros
1. Acesse a página "Membros"
2. Clique em "Novo Membro"
3. Preencha os dados pessoais
4. Faça upload da foto 3x4
5. Adicione documentos se necessário

### 2. Marcar Presenças
1. Acesse a página "Presença"
2. Selecione a data do culto
3. Escolha o tipo de culto
4. Clique nos membros presentes
5. Sistema salva automaticamente

### 3. Visualizar Relatórios
1. Acesse a página "Relatórios"
2. Selecione o período desejado
3. Visualize estatísticas e gráficos
4. Identifique membros ausentes

### 4. Configurar Tipos de Culto
1. Acesse "Configurações"
2. Adicione novos tipos de culto
3. Edite ou remova tipos existentes

## 🔧 Configurações

### Variáveis de Ambiente (Backend)
```env
PORT=3001
NODE_ENV=development
DB_PATH=./database.sqlite
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf
JWT_SECRET=seu_jwt_secret_aqui
```

### Tipos de Arquivo Permitidos
- **Imagens**: JPG, JPEG, PNG (máx 5MB)
- **Documentos**: PDF (máx 10MB)
- **Total por membro**: 50MB

## 📊 Banco de Dados

### Tabelas Principais
- **members**: Dados dos membros
- **attendance**: Registro de presenças
- **service_types**: Tipos de culto

### Relacionamentos
- Um membro pode ter múltiplas presenças
- Uma presença pertence a um membro e um tipo de culto
- Tipos de culto podem ter múltiplas presenças

## 🔒 Segurança

- **Rate Limiting**: 100 requests/15min por IP
- **Validação de Arquivos**: Tipos e tamanhos controlados
- **Sanitização**: Dados validados antes do armazenamento
- **Headers de Segurança**: Helmet configurado
- **Logs de Auditoria**: Todas as ações são logadas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- **Desktop**: Interface completa com sidebar
- **Tablet**: Layout adaptado para touch
- **Mobile**: Interface otimizada para telas pequenas

## 🚀 Deploy

### Produção
1. Configure `NODE_ENV=production`
2. Use um banco de dados robusto (PostgreSQL/MySQL)
3. Configure proxy reverso (Nginx)
4. Use PM2 para gerenciar processos
5. Configure SSL/HTTPS

### Docker (Opcional)
```bash
# Build das imagens
docker-compose build

# Executar
docker-compose up -d
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte os logs em `backend/logs/app.log`
2. Verifique a documentação da API
3. Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de login e autenticação
- [ ] Relatórios em PDF
- [ ] Notificações por email
- [ ] App mobile (React Native)
- [ ] Integração com WhatsApp
- [ ] Sistema de grupos/famílias
- [ ] Backup automático
- [ ] Dashboard avançado com gráficos

---

**Desenvolvido com ❤️ para a gestão eficiente de membros da igreja**
