"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/actions/user";
import { milestone_status_type, milestones } from "@prisma/client";

export async function fetchMilestonesAction() {
  const userId = await getAuthUserId();

  const list: milestones[] = await prisma.milestones.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  return list.map((m: milestones) => ({
    id: m.id,
    user_id: m.user_id,
    title: m.title,
    description: m.description,
    deadline: m.deadline ? m.deadline.toISOString() : null,
    status: m.status as milestone_status_type,
    created_at: m.created_at.toISOString(),
    updated_at: m.updated_at.toISOString(),
    completed_at: m.completed_at ? m.completed_at.toISOString() : null,
  }));
}

export async function addMilestoneAction(payload: {
  title: string;
  description?: string;
  deadline?: string;
}) {
  const userId = await getAuthUserId();

  const milestone = await prisma.milestones.create({
    data: {
      user_id: userId,
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
    },
  });

  return { id: milestone.id };
}

export async function updateMilestoneAction(
  id: string,
  payload: {
    title?: string;
    description?: string;
    deadline?: string;
  }
) {
  const userId = await getAuthUserId();

  // Verify ownership
  const existing = await prisma.milestones.findUnique({ where: { id } });
  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized or milestone not found");
  }

  await prisma.milestones.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
      updated_at: new Date(),
    },
  });

  return { status: "success" };
}

export async function deleteMilestoneAction(id: string) {
  const userId = await getAuthUserId();

  // Verify ownership
  const existing = await prisma.milestones.findUnique({ where: { id } });
  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized or milestone not found");
  }

  await prisma.milestones.delete({ where: { id } });

  return { status: "success" };
}

export async function toggleMilestoneAction(id: string) {
  const userId = await getAuthUserId();

  const existing = await prisma.milestones.findUnique({ where: { id } });
  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized or milestone not found");
  }

  const nextStatus = existing.status === "completed" ? "active" : "completed";
  const completedAt = nextStatus === "completed" ? new Date() : null;

  await prisma.milestones.update({
    where: { id },
    data: {
      status: nextStatus,
      completed_at: completedAt,
      updated_at: new Date(),
    },
  });

  return { status: "success" };
}
