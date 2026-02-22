type SessionData = {
	flash: Record<string, unknown>;
	userId: number | null;
};

const sessions = new Map<string, SessionData>();

function getSession(sessionId: string): SessionData {
	const existing = sessions.get(sessionId);
	if (existing) {
		return existing;
	}

	const created: SessionData = {
		flash: {},
		userId: null,
	};
	sessions.set(sessionId, created);
	return created;
}

export const sessionStore = {
	getSessionId(request: Request): string {
		const cookie = request.headers.get("cookie");
		const existingId = cookie?.match(/session_id=([^;]+)/)?.[1];

		if (existingId) {
			getSession(existingId);
			return existingId;
		}

		const sessionId = crypto.randomUUID();
		getSession(sessionId);
		return sessionId;
	},

	getFlash(sessionId: string): Record<string, unknown> {
		const session = getSession(sessionId);
		const flash = { ...session.flash };
		session.flash = {};
		return flash;
	},

	setFlash(sessionId: string, data: Record<string, unknown>): void {
		const session = getSession(sessionId);
		session.flash = {
			...session.flash,
			...data,
		};
	},

	getUserId(sessionId: string): number | null {
		return getSession(sessionId).userId;
	},

	setUserId(sessionId: string, userId: number): void {
		const session = getSession(sessionId);
		session.userId = userId;
	},

	clearUser(sessionId: string): void {
		const session = getSession(sessionId);
		session.userId = null;
	},

	createCookieHeader(sessionId: string): string {
		return `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
	},
};
