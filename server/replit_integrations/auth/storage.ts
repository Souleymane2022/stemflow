import { oauthUsers, type OAuthUser, type UpsertOAuthUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<OAuthUser | undefined>;
  upsertUser(user: UpsertOAuthUser): Promise<OAuthUser>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<OAuthUser | undefined> {
    const [user] = await db.select().from(oauthUsers).where(eq(oauthUsers.id, id));
    return user;
  }

  async upsertUser(userData: UpsertOAuthUser): Promise<OAuthUser> {
    const [user] = await db
      .insert(oauthUsers)
      .values(userData)
      .onConflictDoUpdate({
        target: oauthUsers.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
