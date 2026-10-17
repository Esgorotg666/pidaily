export async function POST(req) {
  const { paymentId, txid } = await req.json();
  const apiKey = process.env.PI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'Missing PI_API_KEY' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
