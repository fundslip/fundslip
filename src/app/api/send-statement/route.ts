import { NextResponse } from "next/server";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 254 && !email.includes("\n") && !email.includes("\r");
}

// In-memory rate limiter with TTL eviction.
// NOTE: On serverless (Vercel), each cold start gets a fresh Map, so this is
// best-effort protection — not a substitute for a persistent store like Redis.
// It still protects against burst abuse within a single warm instance.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;
const MAX_TRACKED_IPS = 10_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Evict expired entries periodically to prevent unbounded growth
  if (rateLimitMap.size > MAX_TRACKED_IPS) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// 10 MB max body size — enough for a PDF base64 + metadata, blocks abuse
const MAX_BODY_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // Reject oversized payloads before parsing (ISSUE-009)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { email, pdfBase64, statementId, walletAddress, verificationHash, senderName, message } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    // Validate pdfBase64 size if present (defense-in-depth beyond Content-Length)
    if (pdfBase64 && typeof pdfBase64 === "string" && pdfBase64.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "PDF attachment too large" }, { status: 413 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    // Sanitize all user-provided strings
    const safeStatementId = escapeHtml(String(statementId || "").slice(0, 50));
    const safeWallet = escapeHtml(String(walletAddress || "").slice(0, 42));
    const safeHash = escapeHtml(String(verificationHash || "").slice(0, 200));
    const safeSenderName = escapeHtml(String(senderName || "").slice(0, 100));
    const safeMessage = escapeHtml(String(message || "").slice(0, 500));

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "Fundslip <statements@fundslip.xyz>",
      to: email,
      subject: `Fundslip Statement ${safeStatementId}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1d1d1f;">
          <div style="margin-bottom: 32px;">
            <h1 style="font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin: 0;">Fundslip</h1>
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #86868b; margin-top: 4px;">Asset Verification Report</p>
          </div>

          ${safeSenderName ? `<p style="font-size: 14px; color: #86868b; margin-bottom: 16px;">From: ${safeSenderName}</p>` : ""}
          ${safeMessage ? `<p style="font-size: 14px; line-height: 1.6; color: #1d1d1f; margin-bottom: 24px;">${safeMessage}</p>` : ""}

          <p style="font-size: 14px; line-height: 1.6; color: #86868b;">
            A verifiable financial statement has been shared with you.
          </p>

          <div style="background: #f5f5f7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #86868b; margin: 0 0 6px;">Statement</p>
            <p style="font-size: 14px; font-weight: 500; margin: 0;">${safeStatementId}</p>
          </div>

          ${safeHash ? `
          <div style="background: #f5f5f7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #86868b; margin: 0 0 6px;">Fingerprint</p>
            <p style="font-family: monospace; font-size: 10px; color: #86868b; word-break: break-all; margin: 0;">${safeHash}</p>
          </div>
          ` : ""}

          <p style="font-size: 12px; color: #86868b; margin-top: 28px;">
            To verify this statement, visit <a href="https://fundslip.xyz/verify" style="color: #003499; text-decoration: none;">fundslip.xyz/verify</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5ea; margin: 28px 0;" />

          <p style="font-size: 10px; color: #86868b;">
            Fundslip &mdash; fundslip.xyz<br/>
            Wallet: ${safeWallet}
          </p>
        </div>
      `,
      ...(pdfBase64 ? {
        attachments: [{
          filename: `fundslip-statement-${safeStatementId}.pdf`,
          content: pdfBase64,
        }],
      } : {}),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
