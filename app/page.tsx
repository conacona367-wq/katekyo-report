'use client'
import { useState } from 'react'

export default function Page() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')

  async function load() {
    setStatus('取り込み中…')
    const res = await fetch('/api/gmail')
    if (!res.ok) {
      setStatus('取り込みに失敗しました')
      return
    }
    const data = await res.json()
    setText(data.text)
    setStatus('取り込みました。「AIで整える」を押してください')
  }

  async function format() {
    setStatus('整形中…')
    const res = await fetch('/api/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      setStatus('整形に失敗しました')
      return
    }
    const data = await res.json()
    setText(data.formatted)
    setStatus('内容を確認してから送信してください')
  }

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
        onClick={load}
        style={{ marginBottom: 8, padding: '8px 16px', border: '1px solid #999' }}
      >
        最新の要約を取り込む
      </button>
      <button
        onClick={format}
        disabled={!text}
        style={{ marginTop: 8, marginRight: 8, padding: '8px 16px', border: '1px solid #999' }}
      >
        AIで整える
      </button>
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