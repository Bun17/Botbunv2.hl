import express from "express";
import line from "@line/bot-sdk";

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: "aBVmnFAYYAOXkHhlO+U+pFiOKiD+52yjgmiDr0J27ADr9v2YLsDthuaWo1V1tX2cgT7IhRK9YgwkbKqhyRfbJV1vnl2+upoPMMBK3nnkeu2PpCwR7JW9aZhdICzSkXP9qjf/woE+ig1t0c8DauduzQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "4b27463ad60277f733c894fb0a16491d",
};

const client = new line.Client(config);

// POST /webhook
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  // メッセージイベント以外は無視
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  // メッセージが「/ハイロー」なら応答
  if (event.message.text === "/ハイロー"or"/はいろー") {
    const result = Math.random() < 0.5 ? "High（あたり！）" : "Low（はずれ…）";
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `結果は… ${result}`,
    });
  }

  // それ以外のメッセージが入る場合
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: ``,
  });
}

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
