// index.js

const express = require("express");
const bodyParser = require("body-parser");
const { clientId } = require("./config.json");
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({ transport: "ipc" });

const app = express();
app.use(bodyParser.json());

let songInfo = {
  title: "Song Title",
  artist: "Song Artist",
  // Add more properties as needed...
};

app.post("/updateRichPresence", (req, res) => {
  const receivedSongInfo = req.body;
  console.log("Received song info:", receivedSongInfo);
  // Update the songInfo object with the received data
  songInfo = receivedSongInfo;
  updateRichPresence(songInfo);
  res.sendStatus(200);
});

app.get("/updateRichPresence", (req, res) => {
  // Return the current songInfo object
  res.json(songInfo);
});

rpc.on("ready", () => {
  console.log("Discord RPC connected");
});

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
