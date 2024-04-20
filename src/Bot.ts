import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";
import { token } from "../config.json";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import pinUpdate from "./listeners/pinUpdate";

console.log("Bot is starting...");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

ready(client);
interactionCreate(client);
pinUpdate(client);

client.login(token);
