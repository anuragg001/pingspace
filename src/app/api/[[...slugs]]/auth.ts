//authenticationn middleware

import { redis } from "@/lib/redis";
import Elysia from "elysia";

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";

    }
}

const parseConnected = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.filter((item): item is string => typeof item === "string");
            }
        } catch {
            return [];
        }
    }

    return [];
}

export const authMiddleware = new Elysia({
    name: "auth"
})
    .error({ AuthError })
    .onError(({ code, set }) => {
        if (code === "AuthError") {
            set.status = 401
            return { error: "unauthorized" }
        }
    })
    .derive({ as: "scoped" }, async ({ query, cookie }) => {
        const roomId = query.roomId;
        const token = cookie["x-auth-token"]?.value as string | undefined;

        if (!roomId || !token) {
            throw new AuthError("Missing roomId or token");
        }

        const connectedRaw = await redis.hget<unknown>(`meta:${roomId}`, "connected")
        const connected = parseConnected(connectedRaw)

        if (!connected?.includes(token)) {
            throw new AuthError("Invalid token for room");
        }

        return { auth: { roomId, token, connected } };
    })