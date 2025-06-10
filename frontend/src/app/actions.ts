import { db } from "@/lib/db";
import { projectsTable, usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

const GH_CLID = process.env.GITHUB_CLIENT_ID as string;
const GH_CLSC = process.env.GITHUB_CLIENT_SECRET as string;

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

export async function deleteUserAccount(email: string, accessToken: string) {
  try {
    const [data] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!data.email) return { error: true, msg: "User not found", status: 404 };

    await fetch(`https://api.github.com/applications/${GH_CLID}/grant`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${GH_CLID}:${GH_CLSC}`).toString(
          "base64"
        )}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

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

export async function getUserProjects(userId: string) {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId));

    if (projects.length > 0) {
      return { error: true, msg: "Reached Max Projects Limits", status: 400 };
    }

    return { error: false };
  } catch (error) {
    console.error("Error fetching user projects: ", error);
    return { error: true, msg: error, status: 500 };
  }
}
