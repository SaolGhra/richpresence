// index.js

const express = require("express");
const bodyParser = require("body-parser");
const { clientId } = require("./config.json");
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({ transport: "ipc" });

const app = express();
app.use(bodyParser.json());

app.post("/updateRichPresence", (req, res) => {
  const songInfo = req.body;
  updateRichPresence(songInfo);
  res.sendStatus(200);
});

rpc.on("ready", () => {
  console.log("Discord RPC connected");
});

rpc.login({ clientId }).catch(console.error);

function updateRichPresence(songInfo) {
  rpc.setActivity({
    details: songInfo.title,
    state: `by ${songInfo.artist}`,
    largeImageKey: "youtube_music_logo",
    largeImageText: "YouTube Music",
    instance: false,
  });
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
