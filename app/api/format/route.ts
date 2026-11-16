import { instructions } from './prompt'
export async function POST(request: Request) {
  const { text } = await request.json()

  const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-6-luna',
      instructions,
      input: `今日の日付：${today}\n\n${text}`,
    }),
  })

  if (!res.ok) {
    console.error(await res.text())
    return Response.json({ error: 'OpenAI API error' }, { status: 500 })
  }

  const data = await res.json()
  const message = data.output.find(
    (o: { type: string }) => o.type === 'message'
  )
  const formatted = message?.content?.[0]?.text ?? ''

  return Response.json({ formatted })
}