const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// When bot is ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// API endpoint (Roblox will call this)
app.post("/upload", async (req, res) => {
  try {
    const { content, filename } = req.body;

    const filePath = `./${filename || "script.lua"}`;
    fs.writeFileSync(filePath, content);

    const channel = await client.channels.fetch(CHANNEL_ID);

    const file = new AttachmentBuilder(filePath);

    await channel.send({
      content: "📄 New Lua file received:",
      files: [file]
    });

    fs.unlinkSync(filePath); // delete after sending

    res.send("File sent to Discord!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// Web server (Railway requires a port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

client.login(TOKEN);
