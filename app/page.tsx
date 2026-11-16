'use client'
import { useState } from 'react'

export default function Page() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')

  async function send() {
    setStatus('送信中…')
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    setStatus(res.ok ? '送信しました' : '失敗しました')
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 16 }}>
      <h1>授業報告</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: '100%', border: '1px solid #999', padding: 8 }}
      />
      <button
        onClick={send}
        disabled={!text}
        style={{ marginTop: 8, padding: '8px 16px', border: '1px solid #999' }}
      >
        送信
      </button>
      <p>{status}</p>
    </main>
  )
}