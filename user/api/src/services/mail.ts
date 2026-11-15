import nodemailer, { type Transporter } from "nodemailer";
import { SMTP } from "../config/env.ts";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | null = null;

export const mailEnabled = () => Boolean(SMTP.host && SMTP.from);

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.secure,
    auth: SMTP.user ? { user: SMTP.user, pass: SMTP.pass } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true
  });
  return transporter;
}

export async function sendMail(mail: Mail): Promise<void> {
  if (!mail.to) return;
  if (!mailEnabled()) {
    console.log(`[mail disabled] ${mail.subject} → ${mail.to}`);
    return;
  }
  await getTransporter().sendMail({ from: SMTP.from, ...mail });
}

export function sendLater(mail: Mail | null): void {
  if (!mail) return;
  sendMail(mail).catch((error: unknown) => console.error(`Mail "${mail.subject}" failed:`, error instanceof Error ? error.message : error));
}

export async function verifyMail(): Promise<void> {
  if (!mailEnabled()) {
    console.log("  Email is off: set SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM in user/api/.env to send emails.");
    return;
  }
  try {
    await getTransporter().verify();
    console.log(`  Email ready via ${SMTP.host}`);
  } catch (error) {
    console.error("  Email settings don't work:", error instanceof Error ? error.message : error);
  }
}
