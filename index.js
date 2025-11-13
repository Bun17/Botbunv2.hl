import express from "express";
import line from "@line/bot-sdk";

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: "ここにあなたのアクセストークン",
  channelSecret: "ここにあなたのチャンネルシークレット"
};

const client = new line.Client(config);

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) => res.json(result));
});

function getRandomCard() {
  return Math.floor(Math.random() * 13) + 1; // 1〜13
}

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") return;

  const msg = event.message.text.trim();

  // スタート
  if (msg === "スタート") {
    const current = getRandomCard();
    event.source.userId; // ユーザー識別にも使える
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `🎰 ハイ＆ローゲーム開始！\nカードは「${current}」！\n次は高い？低い？`
    });
  }

  // 高い・低い
  if (msg === "高い" || msg === "低い") {
    const current = getRandomCard();
    const next = getRandomCard();

    const isCorrect =
      (msg === "高い" && next > current) || (msg === "低い" && next < current);

    const result = isCorrect ? "🎉 あたり！" : "💦 ハズレ！";

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `今のカード：${current}\n次のカード：${next}\n${result}\nゲーム終了！🎮`
    });
  }

  // その他
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "「スタート」でゲームを始めよう！"
  });
}

app.listen(PORT, () => console.log(`Hi-Lo Bot running on ${PORT}`));

import express from "express";
import line from "@line/bot-sdk";

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: "ここにあなたのアクセストークン",
  channelSecret: "ここにあなたのチャンネルシークレット"
};

const client = new line.Client(config);

// 受け取るデータをJSONとして扱う
app.use(express.json());

// webhookエンドポイント
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

// 🎲 ハイローゲームのロジック
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text.trim();

  if (userMessage === "ハイロー") {
    const card = Math.floor(Math.random() * 13) + 1; // 1〜13
    const nextCard = Math.floor(Math.random() * 13) + 1;
    const result = nextCard > card ? "HIGH!" : nextCard < card ? "LOW!" : "DRAW!";
    const text = `🎰 あなたのカードは ${card}！\n次のカードは… ${nextCard}！\n結果は ${result}`;
    return client.replyMessage(event.replyToken, { type: "text", text });
  }

  // 「ハイロー」以外のメッセージには説明を返す
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "「ハイロー」と送ると1回だけ運試しできます🎲"
  });
}

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
