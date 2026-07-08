import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getResend } from "@/lib/email/resend";
import { buildVerificationEmail } from "@/lib/email/verification-email";
import { getServerEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { User } from "@/models/User";

export const CODE_LENGTH = 6;
export const CODE_TTL_MINUTES = 10;
export const MAX_VERIFICATION_ATTEMPTS = 5;
/** Minimum seconds between "resend code" requests for the same account. */
export const RESEND_COOLDOWN_SECONDS = 30;

const BCRYPT_ROUNDS = 10;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Cryptographically-random, zero-padded numeric code (e.g. "042917"). */
function generateCode(): string {
  const max = 10 ** CODE_LENGTH;
  return String(randomInt(0, max)).padStart(CODE_LENGTH, "0");
}

/**
 * Generates a fresh code, stores its hash on the user, and emails it.
 * Used by both registration and "resend code". Throws if the account is
 * missing or already verified, and enforces a resend cooldown.
 */
export async function issueVerificationCode(email: string): Promise<void> {
  await dbConnect();
  const normalized = normalizeEmail(email);

  const user = await User.findOne({ email: normalized })
    .select("+verificationCodeExpires emailVerified")
    .exec();

  if (!user) {
    throw new AppError("No account found for this email.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }
  if (user.emailVerified) {
    throw new AppError("This email is already verified. Please sign in.", {
      status: 409,
      code: "ALREADY_VERIFIED",
    });
  }

  // Enforce resend cooldown based on the freshness of the last code.
  const now = Date.now();
  const lastIssued =
    user.verificationCodeExpires &&
    user.verificationCodeExpires.getTime() -
      CODE_TTL_MINUTES * 60 * 1000;
  if (lastIssued && now - lastIssued < RESEND_COOLDOWN_SECONDS * 1000) {
    throw new AppError(
      `Please wait a few seconds before requesting another code.`,
      { status: 429, code: "RATE_LIMITED" },
    );
  }

  const code = generateCode();
  const hash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  user.verificationCode = hash;
  user.verificationCodeExpires = new Date(now + CODE_TTL_MINUTES * 60 * 1000);
  user.verificationAttempts = 0;
  await user.save();

  const { EMAIL_FROM } = getServerEnv();
  const { subject, html, text } = buildVerificationEmail({
    code,
    expiresInMinutes: CODE_TTL_MINUTES,
  });

  const { error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: normalized,
    subject,
    html,
    text,
  });

  if (error) {
    throw new AppError(
      "Could not send the verification email. Please try again.",
      { status: 502, code: "EMAIL_SEND_FAILED" },
    );
  }
}

/**
 * Checks a submitted code. On success marks the email verified and clears the
 * code. On failure increments the attempt counter and (past the limit)
 * invalidates the code so a new one must be requested.
 */
export async function verifyCode(email: string, code: string): Promise<void> {
  await dbConnect();
  const normalized = normalizeEmail(email);

  const user = await User.findOne({ email: normalized })
    .select(
      "+verificationCode +verificationCodeExpires +verificationAttempts emailVerified",
    )
    .exec();

  if (!user) {
    throw new AppError("No account found for this email.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }
  if (user.emailVerified) return; // Idempotent — already verified.

  if (!user.verificationCode || !user.verificationCodeExpires) {
    throw new AppError("Request a new verification code.", {
      status: 400,
      code: "NO_CODE",
    });
  }
  if (user.verificationCodeExpires.getTime() < Date.now()) {
    throw new AppError("This code has expired. Request a new one.", {
      status: 400,
      code: "CODE_EXPIRED",
    });
  }
  if ((user.verificationAttempts ?? 0) >= MAX_VERIFICATION_ATTEMPTS) {
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();
    throw new AppError("Too many attempts. Request a new code.", {
      status: 429,
      code: "TOO_MANY_ATTEMPTS",
    });
  }

  const valid = await bcrypt.compare(code, user.verificationCode);
  if (!valid) {
    user.verificationAttempts = (user.verificationAttempts ?? 0) + 1;
    await user.save();
    throw new AppError("Incorrect code. Please try again.", {
      status: 400,
      code: "INVALID_CODE",
    });
  }

  user.emailVerified = new Date();
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  user.verificationAttempts = 0;
  await user.save();
}
