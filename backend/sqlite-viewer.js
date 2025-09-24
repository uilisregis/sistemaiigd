const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3033;

// Conectar ao banco SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Página principal com design moderno
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SQLite Database Viewer - Sistema Igreja</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header h1 {
          color: #2d3748;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .header .subtitle {
          color: #718096;
          font-size: 1.1rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .stat-card .icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
          display: block;
        }
        
        .stat-card .number {
          font-size: 3rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 5px;
        }
        
        .stat-card .label {
          color: #718096;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .tables-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .tables-section h2 {
          color: #2d3748;
          font-size: 1.8rem;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .table-container {
          margin-bottom: 40px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .table-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .table-content {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        
        th {
          background: #f8fafc;
          color: #4a5568;
          font-weight: 600;
          padding: 15px 12px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #2d3748;
        }
        
        tr:hover {
          background: #f7fafc;
        }
        
        tr:nth-child(even) {
          background: #fafbfc;
        }
        
        tr:nth-child(even):hover {
          background: #f1f5f9;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #718096;
          font-size: 1.1rem;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #e2e8f0;
          border-radius: 50%;
          border-top-color: #667eea;
          animation: spin 1s ease-in-out infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #718096;
        }
        
        .empty-state .icon {
          font-size: 3rem;
          margin-bottom: 15px;
          opacity: 0.5;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 8px;
          background: #667eea;
          color: white;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-left: 10px;
        }
        
        .photo-preview {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }
        
        .status-active {
          color: #38a169;
          font-weight: 600;
        }
        
        .status-inactive {
          color: #e53e3e;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>
            🗄️ SQLite Database Viewer
            <span class="badge">Sistema Igreja</span>
          </h1>
          <p class="subtitle">Visualização moderna e interativa do banco de dados</p>
        </div>
        
        <div class="stats-grid" id="stats">
          <div class="loading">
            <span class="spinner"></span>
            Carregando estatísticas...
          </div>
        </div>
        
        <div class="tables-section">
          <h2>📊 Tabelas do Banco de Dados</h2>
          <div id="tables">
            <div class="loading">
              <span class="spinner"></span>
              Carregando tabelas...
            </div>
          </div>
        </div>
      </div>
      
      <script>
        async function loadData() {
          try {
            // Carregar estatísticas
            const statsResponse = await fetch('/api/stats');
            const stats = await statsResponse.json();
            
            const statsDiv = document.getElementById('stats');
            statsDiv.innerHTML = \`
              <div class="stat-card">
                <span class="icon">👥</span>
                <div class="number">\${stats.members}</div>
                <div class="label">Membros</div>
              </div>
              <div class="stat-card">
                <span class="icon">👨‍👩‍👧‍👦</span>
                <div class="number">\${stats.groups}</div>
                <div class="label">Grupos</div>
              </div>
              <div class="stat-card">
                <span class="icon">✅</span>
                <div class="number">\${stats.attendance}</div>
                <div class="label">Presenças</div>
              </div>
              <div class="stat-card">
                <span class="icon">⛪</span>
                <div class="number">\${stats.serviceTypes}</div>
                <div class="label">Tipos de Culto</div>
              </div>
            \`;
            
            // Carregar tabelas
            const tables = [
              { name: 'members', label: 'Membros', icon: '👥' },
              { name: 'groups', label: 'Grupos', icon: '👨‍👩‍👧‍👦' },
              { name: 'attendance', label: 'Presenças', icon: '✅' },
              { name: 'service_types', label: 'Tipos de Culto', icon: '⛪' }
            ];
            const tablesDiv = document.getElementById('tables');
            tablesDiv.innerHTML = '';
            
            for (const table of tables) {
              const response = await fetch(\`/api/table/\${table.name}\`);
              const data = await response.json();
              
              if (data.length > 0) {
                const columns = Object.keys(data[0]);
                const tableHtml = \`
                  <div class="table-container">
                    <div class="table-header">
                      \${table.icon} \${table.label} (\${data.length} registros)
                    </div>
                    <div class="table-content">
                      <table>
                        <thead>
                          <tr>\${columns.map(col => \`<th>\${formatColumnName(col)}</th>\`).join('')}</tr>
                        </thead>
                        <tbody>
                          \${data.slice(0, 20).map(row => 
                            \`<tr>\${columns.map(col => \`<td>\${formatCellValue(row[col], col)}</td>\`).join('')}</tr>\`
                          ).join('')}
                        </tbody>
                      </table>
                      \${data.length > 20 ? \`<div style="padding: 15px; text-align: center; color: #718096; background: #f8fafc;">Mostrando 20 de \${data.length} registros</div>\` : ''}
                    </div>
                  </div>
                \`;
                tablesDiv.innerHTML += tableHtml;
              } else {
                const emptyHtml = \`
                  <div class="table-container">
                    <div class="table-header">
                      \${table.icon} \${table.label} (0 registros)
                    </div>
                    <div class="empty-state">
                      <div class="icon">📭</div>
                      <div>Nenhum registro encontrado</div>
                    </div>
                  </div>
                \`;
                tablesDiv.innerHTML += emptyHtml;
              }
            }
          } catch (error) {
            console.error('Erro ao carregar dados:', error);
            document.getElementById('stats').innerHTML = '<div class="empty-state">❌ Erro ao carregar dados</div>';
            document.getElementById('tables').innerHTML = '<div class="empty-state">❌ Erro ao carregar tabelas</div>';
          }
        }
        
        function formatColumnName(column) {
          const names = {
            'id': 'ID',
            'name': 'Nome',
            'email': 'E-mail',
            'phone': 'Telefone',
            'address': 'Endereço',
            'birth_date': 'Data de Nascimento',
            'photo_path': 'Foto',
            'files_path': 'Arquivos',
            'created_at': 'Criado em',
            'updated_at': 'Atualizado em',
            'is_active': 'Ativo',
            'deleted_at': 'Excluído em',
            'delete_reason': 'Motivo da Exclusão',
            'group_name': 'Nome do Grupo',
            'description': 'Descrição',
            'color': 'Cor',
            'member_id': 'ID do Membro',
            'service_type_id': 'ID do Tipo de Culto',
            'date': 'Data',
            'type': 'Tipo',
            'name': 'Nome'
          };
          return names[column] || column;
        }
        
        function formatCellValue(value, column) {
          if (value === null || value === undefined) return '-';
          
          if (column === 'photo_path' && value) {
            return \`<img src="/uploads/\${value}" class="photo-preview" alt="Foto" onerror="this.style.display='none'">\`;
          }
          
          if (column === 'is_active') {
            return value ? '<span class="status-active">Ativo</span>' : '<span class="status-inactive">Inativo</span>';
          }
          
          if (column === 'created_at' || column === 'updated_at' || column === 'deleted_at' || column === 'date') {
            return new Date(value).toLocaleString('pt-BR');
          }
          
          if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 50) + '...';
          }
          
          return value;
        }
        
        loadData();
      </script>
    </body>
    </html>
  `);
});

// API para estatísticas
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.members = row.count;
    
    db.get('SELECT COUNT(*) as count FROM groups', (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.groups = row.count;
      
      db.get('SELECT COUNT(*) as count FROM attendance', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.attendance = row.count;
        
        db.get('SELECT COUNT(*) as count FROM service_types', (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.serviceTypes = row.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// API para tabelas
app.get('/api/table/:tableName', (req, res) => {
  const { tableName } = req.params;
  const sql = `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 50`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🗄️  SQLite Viewer moderno rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}`);
  console.log(`✨ Design moderno como Prisma Studio!`);
});