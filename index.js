// index.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { clientId } = require("./config.json");
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({ transport: "ipc" });
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = 3000;

let songInfo = {};
let wsClients = [];

app.post("/updateRichPresence", (req, res) => {
  const receivedSongInfo = req.body;
  // console.log("Received song info:", receivedSongInfo);
  songInfo = receivedSongInfo;
  updateRichPresence(songInfo);
  wsClients.forEach((client) => {
    client.send(JSON.stringify(songInfo));
  });
  res.sendStatus(200);
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: PORT + 1 });

wss.on("connection", function connection(ws) {
  wsClients.push(ws);
  ws.send(JSON.stringify(songInfo));
  ws.on("close", function close() {
    wsClients = wsClients.filter((client) => client !== ws);
  });
});

rpc.on("ready", () => {
  console.log("Discord RPC connected");
});

function updateRichPresence(songInfo) {
  const elapsedSeconds = songInfo.elapsed || 0;
  const totalSeconds = songInfo.total || 0;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecondsRemainder = elapsedSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalSecondsRemainder = totalSeconds % 60;

  const elapsedFormatted = `${elapsedMinutes}:${elapsedSecondsRemainder
    .toString()
    .padStart(2, "0")}`;

  const totalFormatted = `${totalMinutes}:${totalSecondsRemainder
    .toString()
    .padStart(2, "0")}`;

  const progressBarLength = 5;
  const elapsedPercentage = (elapsedSeconds / totalSeconds) * 100;
  const elapsedProgressBarLength = Math.floor(
    (elapsedPercentage / 100) * progressBarLength
  );

  const remainingProgressBarLength =
    progressBarLength - elapsedProgressBarLength;

  const progressBar =
    "•".repeat(elapsedProgressBarLength) +
    "—".repeat(remainingProgressBarLength);

  const currentTime = new Date().getTime();

  const startTime = currentTime - elapsedSeconds * 1000;
  const endTime = startTime + totalSeconds * 1000;

  const progressBarAndTimeline = `${progressBar} | ${elapsedFormatted} / ${totalFormatted}`;

  if (songInfo.isPlaying == true) {
    var tinyImage = "./assets/play.png";
  } else {
    var tinyImage = "./assets/pause.png";
  }

  // Set Rich Presence
  rpc.setActivity({
    ActivityType: "Listening to YouTube Music",
    details: `${songInfo.title || ""}\n-\n${songInfo.album || ""}`,
    state: `${songInfo.artist || ""}\n${progressBarAndTimeline}`,
    largeImageKey: songInfo.thumbnail,
    largeImageText: songInfo.title || "",
    smallImageKey: tinyImage,
    smallImageText: `${songInfo.isPlaying ? "Playing" : "Paused"}`,
    buttons: [{ label: "YouTube Music", url: songInfo.url }],
    instance: false,
    party: { id: "party_id" },
    startTimestamp: startTime,
    endTimestamp: endTime,
    assets: {
      largeImage: songInfo.thumbnail,
      largeText: songInfo.title || "",
      smallImage: tinyImage,
      smallText: songInfo.isPlaying ? "Playing" : "Paused",
    },
    secrets: {
      match: "match_secret",
      join: "join_secret",
      spectate: "spectate_secret",
    },
    buttons: [{ label: "Listen on YouTube Music", url: songInfo.url }],
  });
}

rpc.login({ clientId }).catch(console.error);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// — •
