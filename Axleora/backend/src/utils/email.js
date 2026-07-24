import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  EMAIL_FROM_NAME
} = process.env;

const hasEmailConfig = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && EMAIL_FROM);

let transporter;
if (hasEmailConfig) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

const formatBookingSummary = booking => {
  const lines = [
    `Reference: ${booking.referenceNo}`,
    `Name: ${booking.customerName}`,
    `Service: ${booking.serviceCategory?.name || "Unknown service"}`,
    `Vehicle: ${booking.vehicleType}${booking.vehicleModel ? ` (${booking.vehicleModel})` : ""}`,
    `Vehicle number: ${booking.vehicleNumber}`,
    `Preferred date: ${booking.preferredDate}`,
    `Preferred time: ${booking.preferredTime}`
  ];
  if (booking.notes) lines.push(`Notes: ${booking.notes}`);
  return lines.join("\n");
};

const getFromAddress = () => {
  if (!EMAIL_FROM) return "Axleora Service Centre <no-reply@axleora.example>";
  return EMAIL_FROM_NAME ? `${EMAIL_FROM_NAME} <${EMAIL_FROM}>` : EMAIL_FROM;
};

async function sendEmail({ to, subject, text, html }) {
  if (!hasEmailConfig) {
    console.warn("Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM in .env to enable email notifications.");
    return;
  }

  if (!to) throw new Error("Missing recipient email address");

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html
  });
}

export async function sendBookingConfirmation(booking) {
  if (!booking?.email) return;

  const subject = `Your Axleora booking is received (${booking.referenceNo})`;
  const text = [`Thank you for sending your booking request.`, "", formatBookingSummary(booking), "", "The workshop will review the requested time and get back to you if any changes are needed.", "", "You can check your booking status using your reference number.", "", "Thank you,", "Axleora Service Centre"].join("\n");
  const html = `<p>Thank you for sending your booking request.</p><p><strong>Reference:</strong> ${booking.referenceNo}</p><p>${booking.serviceCategory?.name || "Service"} on ${booking.preferredDate} at ${booking.preferredTime}</p><p>${booking.notes ? `Notes: ${booking.notes}` : ""}</p><p>The workshop will review the requested time and get back to you if any changes are needed.</p><p>You can check your booking status using your reference number.</p><p>Thank you,<br/>Axleora Service Centre</p>`;

  await sendEmail({ to: booking.email, subject, text, html });
}

export async function sendBookingStatusUpdate(booking, status, adminRemark) {
  if (!booking?.email) return;

  const subject = `Booking ${booking.referenceNo} is now ${status}`;
  const remarkText = adminRemark ? `Admin note: ${adminRemark}` : "";
  const text = [`Your booking status has changed.`, "", formatBookingSummary(booking), "", `Current status: ${status}`, remarkText, "", "If you have questions, reply to this email or contact the workshop directly.", "", "Thanks,", "Axleora Service Centre"].filter(Boolean).join("\n");
  const html = `<p>Your booking status has changed.</p><p><strong>Reference:</strong> ${booking.referenceNo}</p><p><strong>Current status:</strong> ${status}</p>${adminRemark ? `<p><strong>Admin note:</strong> ${adminRemark}</p>` : ""}<p>If you have questions, reply to this email or contact the workshop directly.</p><p>Thanks,<br/>Axleora Service Centre</p>`;

  await sendEmail({ to: booking.email, subject, text, html });
}
