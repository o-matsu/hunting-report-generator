This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## LIFF (LINE Front-end Framework) 設定

このアプリケーションはLIFF APIを使用してLINEユーザー情報を取得し、コンソールに出力する機能を含んでいます。

### 設定手順

1. **LINE Developers Console でLIFFアプリを作成**
   - [LINE Developers Console](https://developers.line.biz/) にアクセス
   - 新しいプロバイダーまたは既存のプロバイダーを選択
   - 新しいチャンネルを作成（Messaging API）
   - LIFFタブから新しいLIFFアプリを作成
   - LIFF IDを取得

2. **環境変数の設定**
   ```bash
   # .env.local ファイルを作成
   echo "NEXT_PUBLIC_LIFF_ID=your-liff-id-here" > .env.local
   ```

   実際のLIFF IDに置き換えてください。

3. **LIFFアプリの設定**
   - Endpoint URL: `https://your-domain.com` (本番環境)
   - Endpoint URL: `https://your-ngrok-url.ngrok.io` (開発環境でのテスト)
   - Scope: `profile`, `openid`

### 機能

- LIFF初期化時にユーザー情報を自動取得
- コンソールにユーザープロフィール情報を出力
- ログイン/ログアウト機能
- ユーザー情報の表示（表示名、プロフィール画像、ステータスメッセージ）
- コンテキスト情報の取得（チャット、グループ、ルーム情報）

### 開発環境でのテスト

ngrokを使用してローカルサーバーを公開し、LINEアプリでテストできます：

```bash
# ngrokをインストール（未インストールの場合）
npm install -g ngrok

# ローカルサーバーを公開
ngrok http 3000
```

生成されたHTTPS URLをLIFFアプリのEndpoint URLに設定してください。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
