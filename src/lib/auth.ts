import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq, desc } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        },
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user"
            }
        }
    },
    emailAndPassword: {
        enabled: true,
    },
    databaseHooks: {
        session: {
            create: {
                after: async (newSession) => {
                    // Ambil semua session milik user ini, urutkan dari yang paling baru
                    const userSessions = await db.select()
                        .from(schema.sessions)
                        .where(eq(schema.sessions.userId, newSession.userId))
                        .orderBy(desc(schema.sessions.createdAt));

                    // Jika lebih dari 3, hapus sisanya (session terlama)
                    if (userSessions.length > 3) {
                        const sessionsToDelete = userSessions.slice(3);
                        for (const session of sessionsToDelete) {
                            await db.delete(schema.sessions).where(eq(schema.sessions.id, session.id));
                        }
                    }
                }
            }
        }
    }
});
