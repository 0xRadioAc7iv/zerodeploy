import { db } from "@/lib/db";
import { projectsTable, usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function saveUserToDB(user: any) {
  const { name, image, email } = user;

  try {
    const [data] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (data) return { error: false, userId: data.id };

    const [newUser] = await db
      .insert(usersTable)
      .values({ email, fullName: name, userAvatarUrl: image })
      .returning({ id: usersTable.id });

    return { error: false, userId: newUser.id };
  } catch (error) {
    console.error("Error saving user to DB: ", error);
    return {
      error: true,
      userId: undefined,
    };
  }
}

export async function deleteUserAccount(email: string) {
  try {
    const [data] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!data.email) return { error: true, msg: "User not found", status: 404 };

    await db.delete(usersTable).where(eq(usersTable.email, email));

    return { error: false, msg: "Successfully deleted!", status: 201 };
  } catch (error) {
    console.error("Error deleting user: ", error);
    return { error: true, msg: "Error deleting user", status: 500 };
  }
}

export async function createNewProject(
  userId: string,
  name: string,
  repository: string
): Promise<{ error: boolean; msg?: unknown }> {
  try {
    await db.insert(projectsTable).values({ userId, name, repository });
    return { error: false };
  } catch (error) {
    console.error("Error creating project: ", error);
    return { error: true, msg: error };
  }
}
