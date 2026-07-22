葛西記念財団 公式ホームページ（クロスブラウザー対応版）
==========================================================

■ 開き方
index.html を開くと閲覧できます。
公開時は、フォルダー内のファイル構成を変えずにサーバーへアップロードしてください。
GitHub Pagesでは .nojekyll を含め、フォルダー内の全ファイルをそのまま公開してください。

■ 対応方針
・Google Chrome / Microsoft Edge / Mozilla Firefox / Safari の現行版
・iPhone / iPad Safari、Android Chrome、Samsung Internet
・一世代以上前の主要ブラウザーでも、装飾を簡略化して本文・メニュー・フォームを表示
・Internet Explorer 11では、CSS変数やGridを使わない縦並びの簡易表示へ自動切替
・JavaScript無効時も本文とリンクを閲覧可能

古すぎるブラウザー、メーカーのサポートが終了したブラウザー、独自仕様の組み込みブラウザーまで
完全に同一表示にすることはできません。その場合も、本文と主要リンクが読めるよう段階的に機能を
縮小する設計です。

■ クロスブラウザー対策
1. CSSを固定値へコンパイルし、CSS変数非対応環境でも配色を維持
2. CSS Grid、clamp、min、aspect-ratio、inset、backdrop-filter等の代替レイアウト
3. Flexboxのベンダープレフィックスとflex-gap非対応時の余白補正
4. ES5形式のJavaScriptと、closest・requestAnimationFrame等の軽量ポリフィル
5. Clipboard API非対応時のコピー代替処理
6. IE / 旧Edge向けTXT保存処理（msSaveOrOpenBlob）
7. JavaScript無効時にアニメーション対象が消えないnoscript対策
8. UTF-8、favicon.ico、Apple/Android/Windows用アイコン、正しいMIMEタイプ設定
9. Service Workerが使えない環境でも通常閲覧できる完全な非依存設計
10. 高コントラスト表示、キーボード操作、印刷表示への対応

■ 主なページ
index.html          トップページ
zaidan.html         財団について
kasaishi.html       葛西氏とは
teikan.html         簡易定款
hyousyou.html       表彰・出展
youtube.html        公式YouTube
member.html         メンバー加入フォーム
news.html           お知らせ
contact.html        お問い合わせ作成フォーム
disclosure.html     情報公開
privacy.html        個人情報保護方針
sitepolicy.html     サイト利用案内
english.html        English overview
404.html            404ページ

■ フォームについて
静的サイトのため、加入フォームとお問い合わせフォームは入力内容をブラウザー内で整形し、
メールアプリを開く方式です。サーバーへ自動保存されません。
加入フォームには下書き保存、入力確認、コピー、TXT保存機能があります。

■ サーバー別補助ファイル
.nojekyll            GitHub Pages用
.htaccess            Apache用の文字コード・MIME設定
web.config           Microsoft IIS用のMIME設定
browserconfig.xml    Windowsタイル用
manifest.webmanifest PWA対応ブラウザー用

■ 公開後の確認
・https:// でアクセスできること
・CSS、JavaScript、PNG、SVGが404になっていないこと
・スマートフォンのプライベートブラウズでも表示できること
・以前の版が残る場合は、ブラウザーのキャッシュを削除するか再読み込みすること

■ 注意
「財団」は活動団体名として使用し、公益財団法人・一般財団法人等の法人格は表示していません。
法人登記、寄附募集、税務、契約等へ正式利用する前に、実態に合わせて専門家へ確認してください。
