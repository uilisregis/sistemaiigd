const db = require('../config/database');

class Report {
  // Estatísticas do dashboard
  static async getDashboardStats(groupId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          COUNT(DISTINCT m.id) as total_members,
          COUNT(DISTINCT a.id) as total_attendance,
          COUNT(DISTINCT DATE(a.created_at)) as service_days
        FROM members m
        LEFT JOIN attendance a ON m.id = a.member_id
        WHERE a.created_at >= datetime('now', '-30 days')
      `;
      
      const params = [];
      if (groupId) {
        sql += ` AND m.id IN (SELECT member_id FROM group_members WHERE group_id = ?)`;
        params.push(groupId);
      }
      
      db.get(sql, params, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          // Buscar estatísticas por grupo
          const groupStatsSql = `
            SELECT 
              g.name as group_name,
              COUNT(DISTINCT m.id) as total_members,
              COUNT(DISTINCT a.id) as present_members,
              CASE 
                WHEN COUNT(DISTINCT m.id) > 0 
                THEN ROUND((COUNT(DISTINCT a.id) * 100.0 / COUNT(DISTINCT m.id)), 2)
                ELSE 0 
              END as score
            FROM groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            LEFT JOIN members m ON gm.member_id = m.id
            LEFT JOIN attendance a ON m.id = a.member_id 
              AND a.created_at >= datetime('now', '-30 days')
            GROUP BY g.id, g.name
            ORDER BY score DESC
          `;
          
          db.all(groupStatsSql, [], (err, groupStats) => {
            if (err) {
              reject(err);
            } else {
              const group_stats = {};
              groupStats.forEach(group => {
                group_stats[group.group_name] = {
                  total: group.total_members,
                  present: group.present_members,
                  score: group.score
                };
              });
              
              resolve({
                total_members: stats.total_members || 0,
                total_attendance: stats.total_attendance || 0,
                service_days: stats.service_days || 0,
                group_stats
              });
            }
          });
        }
      });
    });
  }

  // Relatório mensal
  static async getMonthlyReport(year, month, groupId = null) {
    return new Promise((resolve, reject) => {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      let sql = `
        SELECT 
          COUNT(DISTINCT m.id) as total_members,
          COUNT(DISTINCT a.id) as total_attendance,
          COUNT(DISTINCT DATE(a.created_at)) as service_days
        FROM members m
        LEFT JOIN attendance a ON m.id = a.member_id
        WHERE DATE(a.created_at) BETWEEN ? AND ?
      `;
      
      const params = [startDate, endDate];
      if (groupId) {
        sql += ` AND m.id IN (SELECT member_id FROM group_members WHERE group_id = ?)`;
        params.push(groupId);
      }
      
      db.get(sql, params, (err, summary) => {
        if (err) {
          reject(err);
        } else {
          // Buscar presença por grupo
          const groupSql = `
            SELECT 
              g.name as group_name,
              COUNT(DISTINCT a.id) as total_attendance,
              COUNT(DISTINCT m.id) as member_count
            FROM groups g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            LEFT JOIN members m ON gm.member_id = m.id
            LEFT JOIN attendance a ON m.id = a.member_id 
              AND DATE(a.created_at) BETWEEN ? AND ?
            GROUP BY g.id, g.name
            ORDER BY total_attendance DESC
          `;
          
          db.all(groupSql, [startDate, endDate], (err, attendanceByGroup) => {
            if (err) {
              reject(err);
            } else {
              // Buscar top membros
              const topMembersSql = `
                SELECT 
                  m.name,
                  COUNT(a.id) as total_attendance
                FROM members m
                INNER JOIN attendance a ON m.id = a.member_id
                WHERE DATE(a.created_at) BETWEEN ? AND ?
                GROUP BY m.id, m.name
                ORDER BY total_attendance DESC
                LIMIT 10
              `;
              
              db.all(topMembersSql, [startDate, endDate], (err, topMembers) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    month: parseInt(month),
                    year: parseInt(year),
                    totalMembers: summary.total_members || 0,
                    totalAttendance: summary.total_attendance || 0,
                    attendanceByGroup: attendanceByGroup || [],
                    topMembers: topMembers || [],
                    summary: {
                      averageFrequency: summary.total_members > 0 
                        ? Math.round((summary.total_attendance / summary.total_members) * 100) 
                        : 0,
                      serviceDays: summary.service_days || 0
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  // Estatísticas de presença
  static async getAttendanceStats(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(DISTINCT a.id) as total_attendance,
          COUNT(DISTINCT a.member_id) as unique_members,
          COUNT(DISTINCT DATE(a.created_at)) as service_days
        FROM attendance a
        WHERE DATE(a.created_at) BETWEEN ? AND ?
      `;
      
      db.get(sql, [startDate, endDate], (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalAttendance: stats.total_attendance || 0,
            uniqueMembers: stats.unique_members || 0,
            serviceDays: stats.service_days || 0
          });
        }
      });
    });
  }

  // Relatório de frequência
  static async getFrequencyReport(startDate, endDate, groupId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          m.name,
          COUNT(a.id) as total_attendance,
          COUNT(DISTINCT DATE(a.created_at)) as days_attended
        FROM members m
        LEFT JOIN attendance a ON m.id = a.member_id
        WHERE DATE(a.created_at) BETWEEN ? AND ?
      `;
      
      const params = [startDate, endDate];
      if (groupId) {
        sql += ` AND m.id IN (SELECT member_id FROM group_members WHERE group_id = ?)`;
        params.push(groupId);
      }
      
      sql += ` GROUP BY m.id, m.name ORDER BY total_attendance DESC`;
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Exportar relatório
  static async exportReport(type, params) {
    // Implementação básica - em produção seria gerado PDF/Excel
    return {
      type,
      params,
      generated_at: new Date().toISOString(),
      message: 'Relatório exportado com sucesso'
    };
  }
}

module.exports = Report;
