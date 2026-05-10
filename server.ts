import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending Email alerts
  app.post("/api/alert", async (req, res) => {
    const { message, riskLevel } = req.body;

    if (riskLevel !== "high" && riskLevel !== "critical") {
      return res.status(400).json({ error: "Alerts only triggered for high/critical risk." });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = process.env.ALERT_EMAIL_TO || "rakibarmy89@gmail.com";

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error("Email configuration missing. Alert email not sent.");
      return res.status(500).json({ 
        error: "Email service not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.",
        details: "Developer: Please add these to your Secrets panel."
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465", // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"MindGuard AI" <${smtpUser}>`,
        to: toEmail,
        subject: `[MindGuard AI ALERT] ${riskLevel.toUpperCase()} Risk Warning`,
        text: `High Risk Detected:\n\n${message}`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">MindGuard AI Alert</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Critical Assessment Flagged</p>
              <h2 style="margin: 0 0 16px 0; color: #ef4444;">High Risk Pattern Detected</h2>
              <p style="line-height: 1.6; font-size: 16px;">${message}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">This is an automated system alert. Immediate neurological review is recommended.</p>
            </div>
          </div>
        `,
      });

      console.log(`Email Alert sent to ${toEmail}: ${info.messageId}`);
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error("Nodemailer error:", error);
      res.status(500).json({ error: "Failed to send email alert." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
