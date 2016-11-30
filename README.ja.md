# downspout

[![npm version](https://badge.fury.io/js/downspout.svg)](https://badge.fury.io/js/downspout)
[![CircleCI](https://circleci.com/gh/kjirou/downspout.svg?style=svg)](https://circleci.com/gh/kjirou/downspout)

README: ( [English](/README.md) | [日本語](/README.ja.md) )

乱雑なイベントの発火をキューで管理し、ビジネスロジックを定型的に書くためのモジュール


## このモジュールの目的
- ビジネスロジック（例えば、Flux の ActionCreator のような）を定型的に書きたい
  - これは、多くのウェブ・フレームワークのように、ビジネスロジックを記述するための一定の書式を設けることで解決する
- そのために、複数のビジネスロジックが同時に実行されることを抑止するのも必要だと思った
  - 同じ変数に対し複数の処理が同時に参照・更新を行う可能性がある場合、データの整合性を担保するのが非常に難しい。
    この一点の担保でビジネスロジック部分を書く際の難易度が大きく下がる。
  - これは、イベントをキュー管理することによって解決する


## インストール方法
```bash
npm install --save downspout
```

ブラウザ環境での利用は、[browserify](https://github.com/substack/node-browserify)
  （または [webpack](https://github.com/webpack/webpack) など）を介して下さい。


## 使い方
### 概要
![](/doc/overview.png)

### 基本的な使い方を、CLI用サンプルカウンターアプリで解説
- [最もシンプルな例](/examples/counter-1.js)
  - Keywords:
    - Use-cases
    - constructor
    - "execution:resolved" event
    - execute
- [非同期処理の終了を待つユースケース](/examples/counter-2.js)
  - Keywords:
    - Promise
- [ユースケースへ引数を渡す](/examples/counter-3.js)
  - Keywords:
    - Use-case arguments
- [ユースケースが依存する変数を明示する](/examples/counter-4.js)
  - Keywords:
    - context
- [Fluxのような実装パターン](/examples/counter-5.js)
  - Keywords:
    - result
- [ランタイム・エラーのハンドリング](/examples/counter-6.js)
  - Keywords:
    - "execution:rejected" event
    - error
- [開発用エラーハンドリングのショートハンド](/examples/counter-7.js)
  - Keywords:
    - isNoisy
- [定数群](/examples/counter-8.js)
  - Keywords:
    - EVENT_NAMES.USE_CASE_EXECUTION_RESOLVED
    - EVENT_NAMES.USE_CASE_EXECUTION_REJECTED
- [別のユースケースを呼び出す](/examples/counter-9.js)
  - Keywords:
    - executor.fork
- [ユースケースとUIイベントを別レイヤーにしたい](/examples/counter-10.js)
  - Keywords:
    - routes
    - dispatch
- [外製のビューライブラリに渡すために、持ち回し用のイベント発火関数を生成する](/examples/counter-11.js)
  - Keywords:
    - generateExecutor
    - generateDispatcher
- [まとめ: 操作可能なカウンター](/examples/counter-conclusion-1.js)
  - Example of the Flux (like) format
- [まとめ: Fizz Buzz ゲーム](/examples/counter-conclusion-2.js)
  - Example of the MVC format

### React と連携する
（後で）

### Redux と連携する
`bindActionCreators` を使う限り、無理でした。
