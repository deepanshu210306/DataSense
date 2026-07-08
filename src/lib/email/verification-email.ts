import { APP_NAME } from "@/lib/copy";

type VerificationEmailArgs = {
  code: string;
  /** Minutes until the code expires — shown in the copy. */
  expiresInMinutes: number;
};

/**
 * Builds the subject + HTML + plaintext for the verification-code email.
 * Kept framework-agnostic (plain string templating) so it works in any
 * email client — inline styles only, no external CSS.
 */
export function buildVerificationEmail({
  code,
  expiresInMinutes,
}: VerificationEmailArgs): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `${code} is your ${APP_NAME} verification code`;

  const text = [
    `Your ${APP_NAME} verification code is: ${code}`,
    ``,
    `Enter this code to finish signing up. It expires in ${expiresInMinutes} minutes.`,
    ``,
    `If you didn't request this, you can safely ignore this email.`,
  ].join("\n");

  const spacedCode = code.split("").join("&nbsp;&nbsp;");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#101018;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <div style="font-size:18px;font-weight:600;color:#ececf1;letter-spacing:-0.01em;">
                  ${APP_NAME}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;">
                  Verify your email
                </h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#a1a1aa;">
                  Enter the code below to finish setting up your account.
                  It expires in ${expiresInMinutes} minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <div style="background-color:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:20px;text-align:center;">
                  <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#c7d2fe;font-family:'Courier New',monospace;">
                    ${spacedCode}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                  If you didn't try to sign up for ${APP_NAME}, you can safely
                  ignore this email — no account will be created without this code.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:#52525b;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
