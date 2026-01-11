type SessionData = {
	flash: Record<string, unknown>;
	demoUser?: string;
};

const sessions = new Map<string, SessionData>();

function getSession(sessionId: string | undefined): SessionData {
	if (!sessionId || !sessions.has(sessionId)) {
		return { flash: {} };
	}
	return sessions.get(sessionId) ?? { flash: {} };
}

function setSession(sessionId: string, data: SessionData): void {
	sessions.set(sessionId, data);
}

export function createSessionMiddleware() {
	return {
		getSessionId(request: Request) {
			const cookie = request.headers.get("cookie");
			const id = cookie?.match(/session_id=([^;]+)/)?.[1];

			if (id) {
				if (!sessions.has(id)) {
					sessions.set(id, { flash: {} });
				}
				return id;
			}

			const newId = crypto.randomUUID();
			sessions.set(newId, { flash: {} });
			return newId;
		},

		getFlash(sessionId: string | undefined): Record<string, unknown> {
			const session = getSession(sessionId);
			const flash = { ...session.flash };
			if (sessionId) {
				session.flash = {};
				setSession(sessionId, session);
			}
			return flash;
		},

		setFlash(sessionId: string, data: Record<string, unknown>): void {
			const session = getSession(sessionId);
			session.flash = {
				...session.flash,
				...data,
			};
			setSession(sessionId, session);
		},

		createCookieHeader(sessionId: string): string {
			return `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
		},

		getDemoUser(sessionId: string | undefined): string | undefined {
			return getSession(sessionId).demoUser;
		},

		setDemoUser(sessionId: string, name: string | undefined): void {
			const session = getSession(sessionId);
			session.demoUser = name;
			setSession(sessionId, session);
		},
	};
}

export const sessionStore = createSessionMiddleware();
