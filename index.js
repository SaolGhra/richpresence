// index.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors package
const { clientId } = require("./config.json");
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({ transport: "ipc" });

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Use the cors middleware

let songInfo = {}; // Initialize an empty object

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

  rpc.setActivity({
    details: songInfo.title || "No Song Playing",
    state: `${songInfo.artist || ""} - ${songInfo.album || ""}`,
    largeImageKey: "youtube_music_logo",
    largeImageText: "YouTube Music",
    smallImageKey: songInfo.thumbnail || "",
    smallImageText: `Elapsed: ${elapsedFormatted} / ${totalFormatted}`,
    instance: false,
    timestamps: {
      start: Math.floor(Date.now() / 1000) - elapsedSeconds,
      end: Math.floor(Date.now() / 1000) + (totalSeconds - elapsedSeconds),
    },
  });
}

rpc.login({ clientId }).catch(console.error); // Use the clientId to authenticate with Discord

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
