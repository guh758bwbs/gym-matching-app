# 🏋️ GymMatch

ジムで筋トレを教えたい人と教わりたい人をマッチングするアプリ

## 📱 機能

### 認証機能
- メール/パスワードでの新規登録・ログイン
- ログアウト機能

### プロフィール機能
- 役割選択（教える側/教わる側）
- 基本情報登録（名前、年齢、利用ジム）
- 詳細設定（得意種目、目標、鍛えたい部位）
- スケジュール設定（空き曜日・時間）
- プロフィール編集機能

### マッチング機能
- 相性スコア自動計算（最大100点）
  - 鍛えたい部位の一致度
  - 同じジムかどうか
  - 空き曜日の一致度
  - 空き時間の一致度
  - 指導経験ボーナス
- スコア順の一覧表示
- プロフィール詳細表示
- 相性の理由表示

### コミュニケーション機能
- リアルタイムチャット
  - 吹き出し形式のUI
  - 送信時刻表示
- スケジュール調整
  - カレンダーで日付選択
  - 時間帯選択
  - トレーニングリクエスト送信

### その他の機能
- 通知機能（未読チャット・リクエスト数表示）
- レビュー/評価機能（星5段階評価）

## 🛠️ 使用技術

### フロントエンド
- React Native
- Expo
- React Navigation

### バックエンド
- Firebase Authentication（認証）
- Firebase Firestore（データベース）
- Firebase Hosting（Web公開）

### 開発ツール
- Node.js
- npm
- Git/GitHub
- EAS Build

## 📂 プロジェクト構成
```
gym-matching-expo/
├── src/
│   ├── screens/          # 画面コンポーネント
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProfileSetupScreen.js
│   │   ├── ProfileEditScreen.js
│   │   ├── ProfileDetailScreen.js
│   │   ├── ChatScreen.js
│   │   ├── ScheduleScreen.js
│   │   └── ReviewScreen.js
│   ├── components/       # 再利用可能なコンポーネント
│   │   └── NotificationBadge.js
│   ├── utils/           # ユーティリティ関数
│   │   └── matchScore.js
│   └── config/          # 設定ファイル
│       └── firebase.js
├── App.js               # エントリーポイント
└── package.json         # 依存関係
```

## 🚀 セットアップ

### 1. リポジトリをクローン
```bash
git clone https://github.com/あなたのユーザー名/gym-matching-app.git
cd gym-matching-app
```

### 2. 依存関係をインストール
```bash
npm install
```

### 3. Firebaseの設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. `src/config/firebase.js`に自分のFirebase設定を入力

### 4. 起動
```bash
npx expo start
```

Expo Goアプリで表示されるQRコードを読み取る

## 📝 今後の改善案

- [ ] プロフィール画像アップロード機能
- [ ] プッシュ通知機能
- [ ] 位置情報を使った近くのジム検索
- [ ] トレーニングメニュー共有機能
- [ ] グループトレーニング機能

## 📄 ライセンス

MIT License

## 👤 作成者

開発者：[GymDev](https://github.com/GymDev)