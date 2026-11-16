type Part = {
  mimeType?: string
  body?: { data?: string }
  parts?: Part[]
}

function findPart(part: Part, mimeType: string): string | null {
  if (part.mimeType === mimeType && part.body?.data) {
    return part.body.data
  }
  for (const child of part.parts ?? []) {
    const found = findPart(child, mimeType)
    if (found) return found
  }
  return null
}

function decode(data: string) {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

const START = 'ミーティング要約'
const END = 'Zoomで表示'

function extractSummary(text: string) {
  const start = text.indexOf(START)
  let result = start >= 0 ? text.slice(start) : text

  const end = result.indexOf(END)
  if (end >= 0) result = result.slice(0, end)

  return result.trim()
}

export async function GET() {
  // 1. リフレッシュトークンで、アクセストークンをもらう
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  if (!tokenRes.ok) {
    console.error(await tokenRes.text())
    return Response.json({ error: 'token error' }, { status: 500 })
  }
  const { access_token } = await tokenRes.json()

  const headers = { Authorization: `Bearer ${access_token}` }
  const base = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'

  // 2. 件名で検索して、一番新しい1通のIDを取る
  const q = encodeURIComponent('subject:ミーティングアセット')
  const listRes = await fetch(`${base}?q=${q}&maxResults=1`, { headers })
  if (!listRes.ok) {
    console.error(await listRes.text())
    return Response.json({ error: 'gmail list error' }, { status: 500 })
  }
  const list = await listRes.json()
  const id = list.messages?.[0]?.id
  if (!id) {
    return Response.json({ error: 'mail not found' }, { status: 404 })
  }

  // 3. そのメールの本文を取り出す
  const msgRes = await fetch(`${base}/${id}?format=full`, { headers })
  if (!msgRes.ok) {
    console.error(await msgRes.text())
    return Response.json({ error: 'gmail get error' }, { status: 500 })
  }
  const msg = await msgRes.json()

  const plain = findPart(msg.payload, 'text/plain')
  const html = findPart(msg.payload, 'text/html')

  let text = ''
  if (plain) {
    text = decode(plain)
  } else if (html) {
    text = decode(html)
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
  }

  return Response.json({ text: extractSummary(text) })
}