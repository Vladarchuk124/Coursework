import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD
	}
});

const APP_NAME = 'MovieRack';

export const mailer = {
	sendActivationMail: async (to, link) => {
		const subject = `Confirm your email for ${APP_NAME}`;

		const text = `
Hi there,

Thank you for signing up for ${APP_NAME}.
To activate your account, please click the link below:

${link}

If you did not create an account on our service, please ignore this email.
		`.trim();

		const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:20px 28px; background:linear-gradient(135deg,#2563eb,#4f46e5); color:#ffffff;">
                <h1 style="margin:0; font-size:20px; font-weight:600;">
                  ${APP_NAME}
                </h1>
                <p style="margin:4px 0 0; font-size:14px; opacity:0.9;">
                  Email confirmation
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 8px; color:#0f172a;">
                <h2 style="margin:0 0 12px; font-size:18px;">Welcome 👋</h2>
                <p style="margin:0 0 8px; font-size:14px; line-height:1.6; color:#4b5563;">
                  Thank you for signing up to <strong>${APP_NAME}</strong>.
                </p>
                <p style="margin:0 0 16px; font-size:14px; line-height:1.6; color:#4b5563;">
                  To complete your registration and activate your account, please click the button below:
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:8px 28px 24px;">
                <a href="${link}"
                   style="
                     display:inline-block;
                     padding:12px 24px;
                     border-radius:999px;
                     background:linear-gradient(135deg,#2563eb,#4f46e5);
                     color:#ffffff;
                     text-decoration:none;
                     font-size:14px;
                     font-weight:600;
                     letter-spacing:0.02em;
                   ">
                  Activate account
                </a>

                <p style="margin:16px 0 0; font-size:12px; color:#6b7280; line-height:1.5;">
                  If the button does not work, copy and paste this link into your browser:
                </p>
                <p style="margin:8px 0 0; font-size:12px; color:#2563eb; word-break:break-all;">
                  <a href="${link}" style="color:#2563eb; text-decoration:underline;">${link}</a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 20px; border-top:1px solid #e5e7eb; background-color:#f9fafb;">
                <p style="margin:0; font-size:11px; color:#9ca3af; line-height:1.5;">
                  If you did not request an account on <strong>${APP_NAME}</strong>,
                  you can safely ignore this email — your account will not be activated without confirmation.
                </p>
              </td>
            </tr>

          </table>

          <p style="margin:16px 0 0; font-size:11px; color:#9ca3af;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
		`.trim();

		await transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject,
			text,
			html
		});
	}
};
