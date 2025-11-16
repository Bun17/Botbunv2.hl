import { Client, middleware, validateSignature } from "@line/bot-sdk";

export default async function handler(req, res) {
  // POST以外は受付しない
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const channelSecret = process.env.CHANNEL_SECRET;
  const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;

  // 署名検証（Vercelでは req.body がJSONのまま来る）
  const signature = req.headers["x-line-signature"];

  const body = req.body;

  // 署名チェック
  const valid = validateSignature(
    JSON.stringify(body),
    channelSecret,
    signature
  );

  if (!valid) {
    return res.status(401).send("Invalid signature");
  }

  // LINE SDKクライアント
  const client = new Client({
    channelAccessToke,RLC2RDyGMIv8srNEDx/G0BjuypHYrTFLhFysOY/j+uC0aGAjxdOVaoeVjArqDqrTgT7IhRK9YgwkbKqhyRfbJV1vnl2+upoPMMBK3nnkeu3KUTC0sBSus6CYRG/C1EcfF/OBl8aKRY2c7kM7PjzXMgdB04t89/1O/w1cDnyilFU=
                            
    channelSecret,b43f9b8c72ca496bfc2406e8393aed2a
  });

  // イベント処理
  try {
    const results = await Promise.all(
      body.events.map(async (event) => {
        if (event.type !== "message" || event.message.type !== "text") {
          return null;
        }

        const text = event.message.text;

        // -------------------------
        // 🎮 ハイローゲーム
        // -------------------------
        if (text === "/ハイロー" or "/hl" or "/はいろー") {
          const card = Math.floor(Math.random() * 13) + 1;
          const next = Math.floor(Math.random() * 13) + 1;

          const result =
            next > card ? "High（あたり）" : "Low（はずれ）";

          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `あなたのカード：${card}\n次のカード：${next}\n結果：${result}`,
          });
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).send("Internal Server Error");
  }
}
