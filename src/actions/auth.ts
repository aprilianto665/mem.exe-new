"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";

// Helper to generate a 6-character alphanumeric code
function generateRandomCode(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export async function registerAction(payload: {
  username: string;
  email: string;
  password: string;
}) {
  const { username, email, password } = payload;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if username is already taken
  const usernameExists = await prisma.users.findUnique({
    where: { username },
  });
  if (usernameExists) {
    throw new Error("Username already taken");
  }

  // Check if email is already registered
  const emailExists = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });
  if (emailExists) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user, auth provider, settings, and pomodoro settings
  // The Go backend initialized settings dynamically on fetch, but doing it in a transaction
  // during register or dynamically works fine. Let's do it in a transaction to be safe and clean!
  await prisma.$transaction(async (tx: any) => {
    const user = await tx.users.create({
      data: {
        username,
        email: normalizedEmail,
        full_name: username,
        user_auth_providers: {
          create: {
            provider: "local",
            password: hashedPassword,
          },
        },
        user_settings: {
          create: {
            timezone: "UTC",
            execution_mode: "default",
          },
        },
        pomodoro_settings: {
          create: {
            focus_minutes: 25,
            rest_minutes: 5,
          },
        },
      },
    });

    // Generate initial verification code
    const code = generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await tx.email_verification_codes.create({
      data: {
        user_id: user.id,
        code,
        expires_at: expiresAt,
      },
    });

    // Send the email
    await sendVerificationEmail(normalizedEmail, code);
  });

  return {
    status: "success",
    message: "Verification code has been sent to your email",
  };
}

export async function generateVerificationCodeAction(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Check if active code exists
  const existingCode = await prisma.email_verification_codes.findFirst({
    where: {
      user_id: user.id,
      expires_at: { gt: new Date() },
    },
  });

  if (existingCode) {
    // If it exists and is not expired, just return success (don't spam email)
    return {
      status: "success",
      message: "Verification code has been sent to your email",
    };
  }

  // Delete any expired codes for the user
  await prisma.email_verification_codes.deleteMany({
    where: {
      user_id: user.id,
      expires_at: { lte: new Date() },
    },
  });

  const code = generateRandomCode(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.email_verification_codes.create({
    data: {
      user_id: user.id,
      code,
      expires_at: expiresAt,
    },
  });

  await sendVerificationEmail(normalizedEmail, code);

  return {
    status: "success",
    message: "Verification code has been sent to your email",
  };
}

export async function resendVerificationCodeAction(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.email_verified_at) {
    throw new Error("Email is already verified");
  }

  // Delete all existing codes
  await prisma.email_verification_codes.deleteMany({
    where: { user_id: user.id },
  });

  const code = generateRandomCode(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.email_verification_codes.create({
    data: {
      user_id: user.id,
      code,
      expires_at: expiresAt,
    },
  });

  await sendVerificationEmail(normalizedEmail, code);

  return {
    status: "success",
    message: "Verification code has been sent to your email",
  };
}

export async function verifyEmailAction(payload: {
  email: string;
  code: string;
}) {
  const { email, code } = payload;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.email_verified_at) {
    return {
      status: "success",
      message: "Email verified successfully",
    };
  }

  const verificationRecord = await prisma.email_verification_codes.findFirst({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
  });

  if (!verificationRecord) {
    throw new Error("Invalid verification code");
  }

  // Check expiration
  if (verificationRecord.expires_at < new Date()) {
    await prisma.email_verification_codes.delete({
      where: { id: verificationRecord.id },
    });
    throw new Error("Verification code has expired");
  }

  // Check max attempts
  if (verificationRecord.attempts >= 3) {
    await prisma.email_verification_codes.delete({
      where: { id: verificationRecord.id },
    });
    throw new Error("Maximum verification attempts exceeded. Please request a new code");
  }

  if (verificationRecord.code !== code.toUpperCase()) {
    // Increment attempts
    await prisma.email_verification_codes.update({
      where: { id: verificationRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Invalid verification code");
  }

  // Success: verify email and delete code
  await prisma.$transaction([
    prisma.users.update({
      where: { id: user.id },
      data: { email_verified_at: new Date() },
    }),
    prisma.email_verification_codes.delete({
      where: { id: verificationRecord.id },
    }),
  ]);

  return {
    status: "success",
    message: "Email verified successfully",
  };
}
