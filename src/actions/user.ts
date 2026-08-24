"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { generateUserApiKey } from "@/lib/apiKey";
import { resolveHangingTimers } from "@/actions/missions";

export async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getCurrentUserAction() {
  const userId = await getAuthUserId();
  await resolveHangingTimers(userId);

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { user_auth_providers: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    username: user.username || "",
    full_name: user.full_name || "",
    email: user.email,
    member_since: user.created_at.toISOString(),
    has_password: user.user_auth_providers.some((p: any) => p.provider === "local"),
  };
}

export async function getUserSettingsAction() {
  const userId = await getAuthUserId();

  // Try to find existing settings
  let userSettings = await prisma.user_settings.findUnique({
    where: { user_id: userId },
  });

  let pomodoroSettings = await prisma.pomodoro_settings.findUnique({
    where: { user_id: userId },
  });

  // Create default user settings if not found
  if (!userSettings) {
    userSettings = await prisma.user_settings.create({
      data: {
        user_id: userId,
        timezone: "UTC",
        execution_mode: "default",
      },
    });
  }

  // Create default pomodoro settings if not found
  if (!pomodoroSettings) {
    pomodoroSettings = await prisma.pomodoro_settings.create({
      data: {
        user_id: userId,
        focus_minutes: 25,
        rest_minutes: 5,
      },
    });
  }

  return {
    timezone: userSettings.timezone,
    execution_mode: (userSettings.execution_mode as "default" | "pomodoro") || "default",
    pomodoro: {
      focus_minutes: pomodoroSettings.focus_minutes,
      rest_minutes: pomodoroSettings.rest_minutes,
    },
  };
}

export async function updateUserSettingsAction(payload: {
  timezone?: string;
  execution_mode?: "default" | "pomodoro";
  pomodoro?: {
    focus_minutes?: number;
    rest_minutes?: number;
  };
}) {
  const userId = await getAuthUserId();

  if (payload.execution_mode !== undefined) {
    const activePomodoro = await prisma.active_pomodoro_sessions.findUnique({
      where: { user_id: userId },
    });
    if (activePomodoro) {
      throw new Error("Please complete or stop your active timer first");
    }
  }

  return await prisma.$transaction(async (tx: any) => {
    // 1. Update user settings if timezone or execution_mode is provided
    if (payload.timezone !== undefined || payload.execution_mode !== undefined) {
      await tx.user_settings.upsert({
        where: { user_id: userId },
        update: {
          timezone: payload.timezone,
          execution_mode: payload.execution_mode,
        },
        create: {
          user_id: userId,
          timezone: payload.timezone ?? "UTC",
          execution_mode: payload.execution_mode ?? "default",
        },
      });
    }

    // 2. Update pomodoro settings if focus_minutes or rest_minutes is provided
    if (payload.pomodoro) {
      await tx.pomodoro_settings.upsert({
        where: { user_id: userId },
        update: {
          focus_minutes: payload.pomodoro.focus_minutes,
          rest_minutes: payload.pomodoro.rest_minutes,
        },
        create: {
          user_id: userId,
          focus_minutes: payload.pomodoro.focus_minutes ?? 25,
          rest_minutes: payload.pomodoro.rest_minutes ?? 5,
        },
      });
    }

    // 3. Return the fully updated settings
    const userSettings = await tx.user_settings.findUnique({
      where: { user_id: userId },
    });
    const pomodoroSettings = await tx.pomodoro_settings.findUnique({
      where: { user_id: userId },
    });

    return {
      timezone: userSettings?.timezone ?? "UTC",
      execution_mode: (userSettings?.execution_mode as "default" | "pomodoro") ?? "default",
      pomodoro: {
        focus_minutes: pomodoroSettings?.focus_minutes ?? 25,
        rest_minutes: pomodoroSettings?.rest_minutes ?? 5,
      },
    };
  });
}

export async function updatePasswordAction(payload: {
  old_password?: string;
  new_password: string;
  verification_code?: string;
}) {
  const userId = await getAuthUserId();

  if (payload.new_password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { user_auth_providers: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const localProvider = user.user_auth_providers.find(
    (p: any) => p.provider === "local"
  );

  if (localProvider) {
    // Change password flow
    if (!payload.old_password) {
      throw new Error("Old password is required");
    }

    const isValid = await bcrypt.compare(
      payload.old_password,
      localProvider.password || ""
    );
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const hashedPassword = await bcrypt.hash(payload.new_password, 10);
    await prisma.user_auth_providers.update({
      where: { id: localProvider.id },
      data: { password: hashedPassword },
    });
  } else {
    // Set password flow (Google user)
    if (!payload.verification_code) {
      throw new Error("Verification code is required");
    }

    const verificationRecord = await prisma.email_verification_codes.findFirst({
      where: { code: payload.verification_code.toUpperCase() },
    });

    if (!verificationRecord) {
      throw new Error("Invalid verification code");
    }

    if (verificationRecord.expires_at < new Date()) {
      await prisma.email_verification_codes.delete({
        where: { id: verificationRecord.id },
      });
      throw new Error("Verification code has expired");
    }

    if (verificationRecord.user_id !== userId) {
      throw new Error("Invalid verification code");
    }

    // Success - delete code and create local provider
    const hashedPassword = await bcrypt.hash(payload.new_password, 10);
    await prisma.$transaction([
      prisma.user_auth_providers.create({
        data: {
          user_id: userId,
          provider: "local",
          password: hashedPassword,
        },
      }),
      prisma.email_verification_codes.delete({
        where: { id: verificationRecord.id },
      }),
    ]);
  }

  return { status: "success", message: "Password updated successfully" };
}

export async function updateUsernameAction(username: string) {
  const userId = await getAuthUserId();

  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters long");
  }

  const existing = await prisma.users.findUnique({
    where: { username },
  });
  if (existing && existing.id !== userId) {
    throw new Error("Username already taken");
  }

  await prisma.users.update({
    where: { id: userId },
    data: { username },
  });

  return { status: "success", message: "Username updated successfully" };
}

export async function updateFullNameAction(fullName: string) {
  const userId = await getAuthUserId();

  await prisma.users.update({
    where: { id: userId },
    data: { full_name: fullName },
  });

  return { status: "success", message: "Full name updated successfully" };
}

export async function getUserApiKeyAction(): Promise<string> {
  const userId = await getAuthUserId();
  return generateUserApiKey(userId);
}

