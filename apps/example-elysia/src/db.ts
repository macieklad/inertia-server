import { Database } from "bun:sqlite";
import type { User } from "./inertia";

const db = new Database(":memory:");

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'User',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const seedUsers = [
  { name: "John Doe", email: "john@example.com", role: "Admin" },
  { name: "Jane Smith", email: "jane@example.com", role: "User" },
  { name: "Bob Johnson", email: "bob@example.com", role: "User" },
  { name: "Alice Brown", email: "alice@example.com", role: "Editor" },
  { name: "Charlie Wilson", email: "charlie@example.com", role: "User" },
  { name: "Diana Miller", email: "diana@example.com", role: "Admin" },
  { name: "Edward Davis", email: "edward@example.com", role: "User" },
  { name: "Fiona Garcia", email: "fiona@example.com", role: "Editor" },
];

const insertStmt = db.prepare(
  "INSERT INTO users (name, email, role) VALUES (?, ?, ?)"
);
for (const user of seedUsers) {
  insertStmt.run(user.name, user.email, user.role);
}

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export const users = {
  getAll(
    search?: string,
    page = 1,
    perPage = 5
  ): { users: User[]; total: number } {
    let query = "SELECT * FROM users";
    let countQuery = "SELECT COUNT(*) as count FROM users";
    const params: (string | number)[] = [];

    if (search) {
      query += " WHERE name LIKE ? OR email LIKE ?";
      countQuery += " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY id LIMIT ? OFFSET ?";

    const countResult = db.prepare(countQuery).get(...params) as {
      count: number;
    };
    const rows = db
      .prepare(query)
      .all(...params, perPage, (page - 1) * perPage) as UserRow[];

    return {
      users: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at.split(" ")[0],
      })),
      total: countResult.count,
    };
  },

  getById(id: number): User | null {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | UserRow
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at.split(" ")[0],
    };
  },

  create(name: string, email: string, role = "User"): User {
    const stmt = db.prepare(
      "INSERT INTO users (name, email, role) VALUES (?, ?, ?)"
    );
    stmt.run(name, email, role);

    const lastId = db.prepare("SELECT last_insert_rowid() as id").get() as {
      id: number;
    };
    return this.getById(lastId.id)!;
  },

  update(id: number, name: string, email: string): User | null {
    db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(
      name,
      email,
      id
    );
    return this.getById(id);
  },

  delete(id: number): boolean {
    const info = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return info.changes > 0;
  },

  emailExists(email: string, excludeId?: number): boolean {
    const query = excludeId
      ? "SELECT 1 FROM users WHERE email = ? AND id != ?"
      : "SELECT 1 FROM users WHERE email = ?";
    const params = excludeId ? [email, excludeId] : [email];
    return db.prepare(query).get(...params) !== null;
  },
};
