import { Database } from "bun:sqlite";

export type User = {
	id: number;
	name: string;
	email: string;
	password: string;
};

type UserRow = {
	id: number;
	name: string;
	email: string;
	password: string;
};

const db = new Database(":memory:");

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE login_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const seedUser = {
	name: "Demo User",
	email: "demo@example.com",
	password: "password123",
};

db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(
	seedUser.name,
	seedUser.email,
	seedUser.password,
);

function mapUser(row: UserRow | undefined): User | null {
	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
		email: row.email,
		password: row.password,
	};
}

export const users = {
	getById(id: number): User | null {
		const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
			| UserRow
			| undefined;
		return mapUser(row);
	},

	getByEmail(email: string): User | null {
		const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
			| UserRow
			| undefined;
		return mapUser(row);
	},

	verifyCredentials(email: string, password: string): User | null {
		const user = this.getByEmail(email);
		if (!user) {
			return null;
		}

		return user.password === password ? user : null;
	},

	recordLogin(userId: number): void {
		db.prepare("INSERT INTO login_events (user_id) VALUES (?)").run(userId);
	},

	countLogins(userId: number): number {
		const row = db
			.prepare("SELECT COUNT(*) as count FROM login_events WHERE user_id = ?")
			.get(userId) as { count: number };
		return row.count;
	},

	getDemoCredentials() {
		return {
			email: seedUser.email,
			password: seedUser.password,
		};
	},
};
