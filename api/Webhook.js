import { Client, validateSignature } from "@line/bot-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

const channelSecret = process.env.CHANNEL_SECRET;
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

  const signature = req.headers["x-line-signature"];
  const body = req.body;

  // 署名チェック
  const valid = validateSignature(JSON.stringify(body), channelSecret, signature);
  if (!valid) return res.status(401).send("Invalid signature");

  const client = new Client({
    channelAccessToken,
    channelSecret,
  });

  try {
    const results = await Promise.all(
      body.events.map(async (event) => {
        // ================================
        // 1. ボタン押した時 (postback)
        // ================================
        if (event.type === "postback") {
          const data = event.postback.data; // 例: "hl?card=5&guess=high"

          // パラメータを分解
          const params = new URLSearchParams(data.replace("hl?", ""));
          const card = Number(params.get("card"));
          const guess = params.get("guess");

          const next = Math.floor(Math.random() * 13) + 1;

          let result = "";
          if (next > card) {
            result = "High（あたり）";
          } else {
            result = "Low（はずれ）";
          }

          const win =
            (next > card && guess === "high") ||
            (next < card && guess === "low");

          return client.replyMessage(event.replyToken, {
            type: "text",
            text:
              `🎮 ハイロー 結果\n\n` +
              `あなたのカード：${card}\n次のカード：${next}\n\n` +
              `あなたの予想：${guess === "high" ? "High" : "Low"}\n` +
              `結果：${result}\n\n` +
              (win ? "正解！" : "残念…"),
          });
        }

        // ================================
        // 2. メッセージ受信
        // ================================
        if (
          event.type === "message" &&
          event.message.type === "text"
        ) {
          const text = event.message.text;

          // コマンドチェック
          if (text === "/ハイロー" || text === "/hl" || text === "/はいろー") {
            const card = Math.floor(Math.random() * 13) + 1;

            // ボタンテンプレート
            const templateMessage = {
              type: "template",
              altText: "ハイローゲーム",
              template: {
                type: "buttons",
                title: "ハイローゲーム",
                text: `あなたのカードは『${card}』です。\n次のカードは High？Low？`,
                actions: [
                  {
                    type: "postback",
                    label: "High（高い）",
                    data: `hl?card=${card}&guess=high`,
                  },
                  {
                    type: "postback",
                    label: "Low（低い）",
                    data: `hl?card=${card}&guess=low`,
                  },
                ],
              },
            };

            return client.replyMessage(event.replyToken, templateMessage);
          }
        }

        return null;
      })
    );

    return res.status(200).json(results);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error");
  }
}
