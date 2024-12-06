import twilio from "twilio";
import { Payment, Stakeholder } from "@/types";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER; // e.g. '+14155238886'

// Basic validation
if (!accountSid || !authToken || !fromNumber) {
  throw new Error("Twilio environment variables are not set properly");
}

const client = twilio(accountSid, authToken);

/**
 * Send a WhatsApp message with payment details to a stakeholder.
 * @param stakeholder The stakeholder object containing at least a `contact` field with a phone number.
 * @param payment The payment data including amount, description, category, date, and screenshotUrl.
 * @returns The message SID if successful.
 */
export async function sendPaymentNotification(stakeholder: Stakeholder, payment: Payment): Promise<string> {
  if (!stakeholder.contact) {
    throw new Error("Stakeholder has no contact number");
  }

  // Construct the message body or use a template
  const messageBody = `A new payment has been recorded:
  
Project ID: ${payment.projectId}
Amount: PKR ${payment.amount}
Category: ${payment.category}
Description: ${payment.description || "N/A"}
Date: ${payment.date || "N/A"}

${payment.screenshotUrl ? "Receipt: " + payment.screenshotUrl : ""}`;

  const toNumber = stakeholder.contact; // Ensure this is in E.164 format (e.g., +923451234567)
  
  // If using Twilio templates (Content API), set contentSid and contentVariables.
  // For a simple message, we just use `body`.
  const message = await client.messages.create({
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:${toNumber}`,
    body: messageBody,
  });

  return message.sid;
}
