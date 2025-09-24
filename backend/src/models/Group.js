const { db } = require('../config/database');

class Group {
  // Buscar todos os grupos
  static async getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT g.*, 
               COUNT(gm.member_id) as member_count
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        GROUP BY g.id
        ORDER BY g.name
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Buscar grupo por ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT g.*, 
               COUNT(gm.member_id) as member_count
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        WHERE g.id = ?
        GROUP BY g.id
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Criar grupo
  static async create(data) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO groups (name, description, color, created_at)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        data.name,
        data.description,
        data.color,
        data.created_at
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...data
          });
        }
      });
    });
  }

  // Atualizar grupo
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      });
      
      if (fields.length === 0) {
        return this.getById(id).then(resolve).catch(reject);
      }
      
      values.push(id);
      const sql = `UPDATE groups SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          this.getById(id).then(resolve).catch(reject);
        }
      }.bind(this));
    });
  }

  // Deletar grupo
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM groups WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  // Buscar membros do grupo
  static async getMembers(groupId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT m.*, gm.joined_at
        FROM members m
        INNER JOIN group_members gm ON m.id = gm.member_id
        WHERE gm.group_id = ?
        ORDER BY m.name
      `;
      
      db.all(sql, [groupId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Adicionar membro ao grupo
  static async addMember(groupId, memberId) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO group_members (group_id, member_id, joined_at)
        VALUES (?, ?, ?)
      `;
      
      const params = [groupId, memberId, new Date().toISOString()];
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  // Remover membro do grupo
  static async removeMember(groupId, memberId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM group_members WHERE group_id = ? AND member_id = ?';
      
      db.run(sql, [groupId, memberId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ removed: this.changes > 0 });
        }
      });
    });
  }

  // Remover todos os membros de um grupo
  static removeAllMembers(groupId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM group_members WHERE group_id = ?';
      db.run(sql, [groupId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ removed: this.changes });
        }
      });
    });
  }
}

module.exports = Group;
