type SessionData = {
  flash: Record<string, unknown>;
};

const sessions = new Map<string, SessionData>();

function generateSessionId(): string {
  return crypto.randomUUID();
}

function getSession(sessionId: string | undefined): SessionData {
  if (!sessionId || !sessions.has(sessionId)) {
    return { flash: {} };
  }
  return sessions.get(sessionId)!;
}

function setSession(sessionId: string, data: SessionData): void {
  sessions.set(sessionId, data);
}

export function createSessionMiddleware() {
  return {
    getSessionId(request: Request): string | undefined {
      const cookie = request.headers.get("cookie");
      if (!cookie) return undefined;
      const match = cookie.match(/session_id=([^;]+)/);
      return match?.[1];
    },

    getOrCreateSessionId(existingId: string | undefined): string {
      if (existingId && sessions.has(existingId)) {
        return existingId;
      }
      const newId = generateSessionId();
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
      session.flash = data;
      setSession(sessionId, session);
    },

    createCookieHeader(sessionId: string): string {
      return `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
    },
  };
}

export const sessionStore = createSessionMiddleware();
