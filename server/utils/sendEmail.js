import logger from "./logger.js";

const parseBrevoBody = async (response) => {
  const raw = await response.text();
  if (!raw) {
    return {};
  }
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return { _raw: raw.slice(0, 500) };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { _raw: raw.slice(0, 500) };
  }
};

const sendEmail = async (options) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_FROM;
  const senderName =
    process.env.BREVO_SENDER_NAME || process.env.FROM_NAME || process.env.SMTP_FROM_NAME || "ChaiPoll";

  if (!BREVO_API_KEY || !senderEmail) {
    logger.error("Email not configured", {
      hasApiKey: Boolean(BREVO_API_KEY),
      hasSender: Boolean(senderEmail),
    });
    throw new Error(
      "Email is not configured: set BREVO_API_KEY and BREVO_SENDER_EMAIL on the server"
    );
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
  };
  if (options.text) {
    payload.textContent = options.text;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await parseBrevoBody(response);

    if (!response.ok) {
      const detail =
        data.message ||
        data.error?.message ||
        (typeof data._raw === "string" ? data._raw : null) ||
        `HTTP ${response.status}`;
      logger.error("Brevo transactional email rejected", {
        status: response.status,
        detail,
        code: data.code,
      });
      throw new Error(detail);
    }

    const messageId = data.messageId ?? data.message_id;
    const toDomain = options.email.includes("@") ? options.email.split("@")[1] : "unknown";
    if (messageId) {
      logger.info("Transactional email accepted by Brevo", { messageId, toDomain });
    } else {
      logger.info("Transactional email accepted by Brevo", { status: response.status, toDomain });
    }
    return data;
  } catch (err) {
    logger.error("Email send failed", { err: err.message, stack: err.stack });
    throw err;
  }
};

export default sendEmail;
