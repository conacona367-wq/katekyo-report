export async function POST(request: Request) {
  const { text } = await request.json()

  if (!text) {
    return Response.json({ error: 'text is empty' }, { status: 400 })
  }

  const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text }],
    }),
  })

  if (!res.ok) {
    console.error(await res.text())
    return Response.json({ error: 'LINE API error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}