import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER; // e.g. +14155238886
  const toNumber = process.env.TEST_WHATSAPP_NUMBER; // e.g. +923450198292
  const contentSid = process.env.TWILIO_CONTENT_SID; // e.g. HXb5b62575e6e4ff6129ad7c8efe1f983e
  const contentVars = '{"1":"12/1","2":"3pm"}';

  if (!accountSid || !authToken || !fromNumber || !toNumber || !contentSid) {
    return NextResponse.json({ error: "Missing environment variables" }, { status: 400 });
  }

  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      contentSid: contentSid,
      contentVariables: contentVars,
    });

    return NextResponse.json({ messageSid: message.sid }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
