export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { to, subject, html, jsonData, filename, resendApiKey } = body;

    const apiKey = resendApiKey || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No Resend API Key provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const attachments = jsonData
      ? [
          {
            filename: filename || 'report.json',
            content: Buffer.from(jsonData).toString('base64'),
          },
        ]
      : undefined;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VibeFinance <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
        attachments,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: resendRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

