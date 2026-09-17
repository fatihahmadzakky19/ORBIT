"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Cast to any to prevent stale IDE type-checking warnings
const db = prisma as any;

async function getDefaultUser() {
  let user = await db.user.findFirst({
    where: { email: "alex@orbit.local" },
  });
  if (!user) {
    user = await db.user.create({
      data: {
        email: "alex@orbit.local",
        name: "Fatih Ahmad Zakky",
      },
    });
  }
  return user;
}

// -------------------------------------------------------------
// Folder Actions
// -------------------------------------------------------------
export async function createFolderAction(data: { name: string; parentId?: string | null }) {
  try {
    const user = await getDefaultUser();
    const folder = await db.learningFolder.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        parentId: data.parentId || null,
      },
    });
    revalidatePath("/learning");
    return { success: true, folder };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create folder";
    return { success: false, error: message };
  }
}

export async function renameFolderAction(data: { id: string; name: string }) {
  try {
    const folder = await db.learningFolder.update({
      where: { id: data.id },
      data: { name: data.name.trim() },
    });
    revalidatePath("/learning");
    return { success: true, folder };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to rename folder";
    return { success: false, error: message };
  }
}

export async function moveFolderAction(data: { id: string; targetParentId: string | null }) {
  try {
    const folder = await db.learningFolder.update({
      where: { id: data.id },
      data: { parentId: data.targetParentId },
    });
    revalidatePath("/learning");
    return { success: true, folder };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to move folder";
    return { success: false, error: message };
  }
}

export async function deleteFolderAction(id: string) {
  try {
    await db.learningFolder.delete({
      where: { id },
    });
    revalidatePath("/learning");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete folder";
    return { success: false, error: message };
  }
}

// -------------------------------------------------------------
// Document Actions
// -------------------------------------------------------------
export async function createDocumentAction(data: {
  name: string;
  content?: string;
  fileType?: string;
  fileSize?: string;
  folderId?: string | null;
  learningId?: string | null;
}) {
  try {
    const user = await getDefaultUser();
    const docName = data.name.trim();
    const ext = docName.includes(".") ? docName.split(".").pop() || "txt" : data.fileType || "txt";

    const document = await db.learningDocument.create({
      data: {
        userId: user.id,
        name: docName,
        content: data.content || null,
        fileType: ext.toLowerCase(),
        fileSize: data.fileSize ? parseInt(data.fileSize.replace(/\D/g, ""), 10) || null : null,
        folderId: data.folderId || null,
        learningId: data.learningId || null,
      },
    });
    revalidatePath("/learning");
    return { success: true, document };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create document";
    return { success: false, error: message };
  }
}

export async function renameDocumentAction(data: { id: string; name: string }) {
  try {
    const document = await db.learningDocument.update({
      where: { id: data.id },
      data: { name: data.name.trim() },
    });
    revalidatePath("/learning");
    return { success: true, document };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to rename document";
    return { success: false, error: message };
  }
}

export async function moveDocumentAction(data: { id: string; targetFolderId: string | null }) {
  try {
    const document = await db.learningDocument.update({
      where: { id: data.id },
      data: { folderId: data.targetFolderId },
    });
    revalidatePath("/learning");
    return { success: true, document };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to move document";
    return { success: false, error: message };
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    await db.learningDocument.delete({
      where: { id },
    });
    revalidatePath("/learning");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete document";
    return { success: false, error: message };
  }
}

// -------------------------------------------------------------
// Learning (Notes) Actions
// -------------------------------------------------------------
export async function createLearningAction(data: {
  topic: string;
  understood?: string;
  source?: string;
  date?: string;
  folderId?: string | null;
  goalId?: string | null;
}) {
  try {
    const user = await getDefaultUser();

    const learning = await db.learning.create({
      data: {
        userId: user.id,
        topic: data.topic.trim(),
        takeaways: data.understood || null,
        source: data.source || null,
        date: data.date ? new Date(data.date) : new Date(),
        folderId: data.folderId || null,
        goalId: data.goalId || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/learning");
    revalidatePath("/goals");

    return { success: true, learning };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save learning";
    return { success: false, error: message };
  }
}

export async function renameLearningAction(data: { id: string; topic: string; understood?: string }) {
  try {
    const learning = await db.learning.update({
      where: { id: data.id },
      data: {
        topic: data.topic.trim(),
        ...(data.understood !== undefined ? { takeaways: data.understood } : {}),
      },
    });
    revalidatePath("/learning");
    return { success: true, learning };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update learning note";
    return { success: false, error: message };
  }
}

export async function moveLearningAction(data: { id: string; targetFolderId: string | null }) {
  try {
    const learning = await db.learning.update({
      where: { id: data.id },
      data: { folderId: data.targetFolderId },
    });
    revalidatePath("/learning");
    return { success: true, learning };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to move learning note";
    return { success: false, error: message };
  }
}

export async function deleteLearningAction(id: string) {
  try {
    await db.learning.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/learning");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete learning note";
    return { success: false, error: message };
  }
}
