import { Client, ClientOptions } from "discord.js";
import { token } from "../config.json";

console.log("Bot is starting...");

const client = new Client({
  intents: [],
});
client.login(token);

console.log(client);
