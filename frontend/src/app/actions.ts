import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function saveUserToDB(user: any) {
  const { name, image, email } = user;

  try {
    const data = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (data.length > 0) return { error: false };

    await db
      .insert(usersTable)
      .values({ email, fullName: name, userAvatarUrl: image });

    return { error: false };
  } catch (error) {
    console.error("Error saving user to DB: ", error);
    return { error: true };
  }
}
