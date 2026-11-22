# katekyo-report

個人契約のオンライン家庭教師業務における、保護者向け授業報告の作成・LINE送信を半自動化するWebアプリケーションです。

## 背景・課題
毎回の授業後、Zoomの自動生成ミーティング要約を確認して定型フォーマットに書き直し、LINEで保護者へ送信する作業に手間がかかっていました。この一連のフローを効率化しつつ、誤送信や内容の誤りを防ぐために開発しました。

## 主な機能・処理フロー
誤送信やAIのハルシネーションを防ぐため、完全自動ではなく**人間が最終確認・微修正できる3ステップ構成（Human-in-the-loop）**にしています。

1. **議事録の取り込み (`/api/gmail`)**
   - OAuth 2.0のリフレッシュトークンを用いてアクセストークンを取得し、Gmail APIから最新のZoom議事録メールを検索・取得
   - マルチパート構造を再帰的に探索してBase64URLデコードし、本文から「ミーティング要約」部分のみを抽出
2. **報告書の自動整形 (`/api/format`)**
   - 抽出したテキストに日本時間（JST）の今日の日付・曜日を付与し、OpenAI Responses APIへ送信
   - 専用プロンプト（`prompt.ts`）に基づき、保護者向けの自然な文体・定型フォーマットへ整形
3. **確認・LINE配信 (`/api/send`)**
   - ブラウザ上のテキストエリアで内容を確認・必要に応じて手動編集したうえで、LINE Messaging API経由で公式アカウントから配信

```text
[Gmail API (Zoom議事録)] ──▶ [再帰パース・要約抽出] ──▶ [OpenAI API (定型整形)] ──▶ [画面で確認・編集] ──▶ [LINE Messaging API]
```

## 使用技術
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **External APIs**（外部SDKに依存せず標準 `fetch` で実装）:
  - Google OAuth 2.0 / Gmail API
  - OpenAI Responses API
  - LINE Messaging API

## 工夫した点
- **安全性を意識したUI設計**: AIの出力をそのまま送らず、画面上で確認・編集してから送信ボタンを押す設計を採用
- **プロンプトの分離と品質担保**: プロンプトを `app/api/format/prompt.ts` に分離し、Few-shotサンプルの定義、推測による創作の禁止、文字起こし内の指示文を無視するプロンプトインジェクション対策を実施
- **柔軟なメールパース**: `text/plain` だけでなく `text/html` のみのメールにも対応できるようフォールバック処理を実装

## 環境構築（ローカル実行）
```bash
npm install
npm run dev
```

実行には `.env.local` に以下の環境変数の設定が必要です。
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `OPENAI_API_KEY`
- `LINE_CHANNEL_ACCESS_TOKEN`
