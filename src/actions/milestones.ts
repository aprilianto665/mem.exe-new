"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/actions/user";
import { milestone_status_type } from "@prisma/client";

export async function fetchMilestonesAction() {
  const userId = await getAuthUserId();

  const list = await prisma.milestones.findMany({
    where: { user_id: userId },
    include: {
      subtasks: {
        orderBy: { order_index: "asc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return list.map((m) => ({
    id: m.id,
    user_id: m.user_id,
    title: m.title,
    description: m.description,
    deadline: m.deadline ? m.deadline.toISOString() : null,
    status: m.status as milestone_status_type,
    created_at: m.created_at.toISOString(),
    updated_at: m.updated_at.toISOString(),
    completed_at: m.completed_at ? m.completed_at.toISOString() : null,
    subtasks: (m.subtasks || []).map((s) => ({
      id: s.id,
      milestone_id: s.milestone_id,
      title: s.title,
      is_completed: s.is_completed,
      order_index: s.order_index,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
      completed_at: s.completed_at ? s.completed_at.toISOString() : null,
    })),
  }));
}

export async function addMilestoneAction(payload: {
  title: string;
  description?: string;
  deadline?: string;
  subtasks?: string[];
}) {
  const userId = await getAuthUserId();

  const subtasksData = (payload.subtasks || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((title, index) => ({
      title,
      order_index: index,
    }));

  const milestone = await prisma.milestones.create({
    data: {
      user_id: userId,
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
      subtasks:
        subtasksData.length > 0
          ? {
              create: subtasksData,
            }
          : undefined,
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

export async function addSubtaskAction(milestoneId: string, title: string) {
  const userId = await getAuthUserId();
  const existingMilestone = await prisma.milestones.findUnique({
    where: { id: milestoneId },
    include: { subtasks: true },
  });

  if (!existingMilestone || existingMilestone.user_id !== userId) {
    throw new Error("Unauthorized or milestone not found");
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("Subtask title is required");
  }

  const nextOrderIndex = existingMilestone.subtasks.length;

  const subtask = await prisma.milestone_subtasks.create({
    data: {
      milestone_id: milestoneId,
      title: trimmedTitle,
      order_index: nextOrderIndex,
    },
  });

  return {
    id: subtask.id,
    milestone_id: subtask.milestone_id,
    title: subtask.title,
    is_completed: subtask.is_completed,
    order_index: subtask.order_index,
    created_at: subtask.created_at.toISOString(),
    updated_at: subtask.updated_at.toISOString(),
    completed_at: subtask.completed_at ? subtask.completed_at.toISOString() : null,
  };
}

export async function toggleSubtaskAction(subtaskId: string) {
  const userId = await getAuthUserId();
  const subtask = await prisma.milestone_subtasks.findUnique({
    where: { id: subtaskId },
    include: { milestones: true },
  });

  if (!subtask || subtask.milestones.user_id !== userId) {
    throw new Error("Unauthorized or subtask not found");
  }

  const nextCompleted = !subtask.is_completed;
  const completedAt = nextCompleted ? new Date() : null;

  const updated = await prisma.milestone_subtasks.update({
    where: { id: subtaskId },
    data: {
      is_completed: nextCompleted,
      completed_at: completedAt,
      updated_at: new Date(),
    },
  });

  return {
    id: updated.id,
    milestone_id: updated.milestone_id,
    is_completed: updated.is_completed,
    completed_at: updated.completed_at ? updated.completed_at.toISOString() : null,
  };
}

export async function deleteSubtaskAction(subtaskId: string) {
  const userId = await getAuthUserId();
  const subtask = await prisma.milestone_subtasks.findUnique({
    where: { id: subtaskId },
    include: { milestones: true },
  });

  if (!subtask || subtask.milestones.user_id !== userId) {
    throw new Error("Unauthorized or subtask not found");
  }

  await prisma.milestone_subtasks.delete({
    where: { id: subtaskId },
  });

  return { status: "success" };
}

export async function updateSubtaskAction(subtaskId: string, title: string) {
  const userId = await getAuthUserId();
  const subtask = await prisma.milestone_subtasks.findUnique({
    where: { id: subtaskId },
    include: { milestones: true },
  });

  if (!subtask || subtask.milestones.user_id !== userId) {
    throw new Error("Unauthorized or subtask not found");
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("Subtask title is required");
  }

  await prisma.milestone_subtasks.update({
    where: { id: subtaskId },
    data: {
      title: trimmedTitle,
      updated_at: new Date(),
    },
  });

  return { status: "success" };
}

