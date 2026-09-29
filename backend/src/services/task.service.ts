import { db } from '../db/index';
import { generateId } from '../utils/crypto';

export interface TaskRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  icon_name: string;
  sub_services: string; // JSON parsed
  is_coming_soon: number;
  created_at: string;
}

export interface UserRequestRecord {
  id: string;
  user_id: string;
  category: string;
  service_title: string;
  sub_services: string;
  urgency: string;
  lifestyle_manager: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestInput {
  category: string;
  serviceTitle: string;
  subServices: string[];
  urgency: 'Standard' | 'Same day' | 'Express' | 'Scheduled';
  notes?: string;
}

export class TaskService {
  /**
   * Get all tasks in the catalogue, with optional category and search filters
   */
  getTasks(category?: string, query?: string): Array<Omit<TaskRecord, 'sub_services'> & { sub_services: string[] }> {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category.toLowerCase());
    }

    if (query) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR sub_services LIKE ?)';
      const q = `%${query}%`;
      params.push(q, q, q);
    }

    sql += ' ORDER BY is_coming_soon ASC, title ASC';

    const rows = db.prepare(sql).all(...params) as TaskRecord[];
    return rows.map((row) => ({
      ...row,
      sub_services: JSON.parse(row.sub_services),
    }));
  }

  /**
   * Get a single task by ID
   */
  getTaskById(id: string) {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRecord | undefined;
    if (!row) return null;
    return {
      ...row,
      sub_services: JSON.parse(row.sub_services),
    };
  }

  /**
   * Submit a task selection request for a user
   */
  createUserRequest(userId: string, input: CreateRequestInput): UserRequestRecord & { sub_services: string[] } {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO user_requests (
        id, user_id, category, service_title, sub_services,
        urgency, lifestyle_manager, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      input.category,
      input.serviceTitle,
      JSON.stringify(input.subServices),
      input.urgency,
      'Pilot LM',
      'In Progress',
      input.notes || null,
      now,
      now
    );

    const record = db.prepare('SELECT * FROM user_requests WHERE id = ?').get(id) as UserRequestRecord;
    return {
      ...record,
      sub_services: JSON.parse(record.sub_services),
    };
  }

  /**
   * Get all requests made by a user
   */
  getUserRequests(userId: string): Array<UserRequestRecord & { sub_services: string[] }> {
    const rows = db.prepare(`
      SELECT * FROM user_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId) as UserRequestRecord[];

    return rows.map((row) => ({
      ...row,
      sub_services: JSON.parse(row.sub_services),
    }));
  }
}

export const taskService = new TaskService();
