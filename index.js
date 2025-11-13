import express from "express";
import line from "@line/bot-sdk";

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: "ここにあなたのアクセストークン",
  channelSecret: "ここにあなたのチャンネルシークレット",
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

  // メッセージが「ハイロー」なら応答
  if (event.message.text === "ハイロー") {
    const result = Math.random() < 0.5 ? "High（あたり！）" : "Low（はずれ…）";
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `結果は… ${result}`,
    });
  }

  // それ以外のメッセージは普通に返す
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `「${event.message.text}」って言ったね！`,
  });
}

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
