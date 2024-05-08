# Discord Rich Presence for YouTube Music

This project is a JavaScript-based Discord Rich Presence integration for YouTube Music. It also includes a custom-made Google Extension.

## Features

- Displays your current YouTube Music activity on Discord
- Shows the song title, artist, and album cover as your Discord status
- Updates in real-time as you listen to different songs on YouTube Music

## Prerequisites

Before you can use this integration, make sure you have the following:

- [Node.js](https://nodejs.org) installed on your machine
- A Discord account and a registered application with a client ID
- A YouTube Music account

## Installation

1. Clone this repository to your local machine.
2. Open a terminal and navigate to the project directory.
3. Run the following command to install the required dependencies:

   ```bash
   npm install
   ```

4. Configure the Discord application:

   - Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
   - Copy the client ID of your application.
   - Rename the `config-example.json` file to `config.json` and replace the `YOUR_CLIENT_ID` placeholder with your actual client ID.

5. Configure the YouTube Music extension:

   - Open Google Chrome and navigate to `chrome://extensions` in the address bar.
   - Enable the "Developer mode" toggle switch located in the top right corner of the page.
   - Click on the "Load unpacked" button.
   - Select the folder containing the YouTube Music extension files.
   - The extension should now appear in the list of installed extensions.
   - Enable the extension by toggling the switch next to it.

6. Start the integration:

   ```bash
   node .
   ```

7. Open Discord and start playing music on YouTube Music. Your Discord status should now update with the currently playing song.
