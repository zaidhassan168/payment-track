// src/lib/twilio.ts
import twilio from "twilio";

/**
 * Sends a WhatsApp message via Twilio.
 * @param fromNumber The Twilio WhatsApp enabled "from" number (without the 'whatsapp:' prefix)
 * @param toNumber The recipient's WhatsApp number (without the 'whatsapp:' prefix)
 * @param contentSid A Twilio Content SID for a template message (optional if using templates)
 * @param contentVariables JSON string of variables matching the template placeholders (optional)
 * @returns The message SID if successful
 */
export async function sendWhatsAppMessage({
  fromNumber,
  toNumber,
  contentSid,
  contentVariables,
}: {
  fromNumber: string;
  toNumber: string;
  contentSid?: string;
  contentVariables?: string;
}): Promise<string> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing Twilio environment variables");
  }

  const client = twilio(accountSid, authToken);

  // Construct the message create options
  const messageOptions: any = {
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:${toNumber}`,
  };

  // If using Content API templates:
  if (contentSid) {
    messageOptions.contentSid = contentSid;
  }
  if (contentVariables) {
    messageOptions.contentVariables = contentVariables;
  } else {
    // If not using template, you can also set body:
    messageOptions.body = "Hello from Next.js via Twilio!";
  }

  const message = await client.messages.create(messageOptions);
  return message.sid;
}
