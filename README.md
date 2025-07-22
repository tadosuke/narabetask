# ナラベタスク (NarabeTask)

効率的なタスク実行順序を調整する Web アプリケーションです。

## 機能概要

- **タスク管理**: タスクの作成、編集、削除
- **タイムライン配置**: ドラッグ&ドロップでタスクをタイムラインに配置
- **リソース管理**: 自己・他者・機械・ネットワークのリソース種別に対応
- **営業時間対応**: 営業時間と昼休み時間を考慮したスケジューリング
- **レスポンシブデザイン**: モバイル、タブレット、デスクトップに対応

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite
- **スタイリング**: CSS Modules
- **テスト**: Vitest + Testing Library
- **リンター**: ESLint + TypeScript ESLint

## 開発環境セットアップ

### 前提条件

- Node.js 18 以上
- npm または yarn

### インストールと起動

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# リンター実行
npm run lint
```

## コーディング規約

このプロジェクトでは [GitHub Copilot カスタム指示](./.copilot-instructions.md) に従って開発を行っています。

### 主な規約

- **日本語対応**: UI テキスト、コメント、テストの説明は日本語を使用
- **単一責任の原則**: 各コンポーネント・関数は明確な単一の責務を持つ
- **レスポンシブデザイン**: モバイルファーストで全デバイスに対応
- **TypeScript**: 厳格な型定義でコードの安全性を確保

詳細は [.copilot-instructions.md](./.copilot-instructions.md) をご覧ください。

## プロジェクト構成

```
src/
├── components/       # React コンポーネント
│   ├── TaskCard/     # タスクカードコンポーネント
│   ├── TaskSidebar/  # タスク詳細サイドバー
│   ├── TaskStaging/  # タスクステージングエリア
│   └── Timeline/     # タイムラインコンポーネント
├── utils/           # ユーティリティ関数
├── test/           # テストファイル
├── types.ts        # TypeScript型定義
└── App.tsx         # メインアプリケーション
```
