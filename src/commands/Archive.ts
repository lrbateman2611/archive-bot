import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  TextBasedChannel,
} from "discord.js";
import { Command } from "../Command";
import { handlePostByType } from "../features/videoHandlers";

export const Archive: Command = {
  name: "archive",
  description: "archives a post with tags",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "post",
      description: "a link to the message to archive",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "tags",
      description: "a list of tags to help searchability",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    let response = "Processed! If there's an error DON'T tell ANYONE";

    const postParts = interaction.options
      .get("post")
      ?.value?.toString()
      .split("/");
    const tags = interaction.options.get("tags")?.value?.toString();
    if (!postParts || !tags) {
      return;
    }
    const channel = client.channels.cache.get(
      interaction.channelId
    ) as TextBasedChannel;

    const postId = postParts[postParts?.length - 1];

    try {
      let message = await channel?.messages.fetch(postId);
      if (!message) {
        console.log("fetch message failed... trying again");
        message = await channel?.messages.fetch(postId);
      }
      if (!message) {
        console.log("fetch message failed... trying again");
        message = await channel?.messages.fetch(postId);
      }
      if (!message) {
        console.log("fetch message failed... closing thread");
        response =
          "Unable to find message. Maybe try again or tell Lucas the bot is failing EPICALLY!";
        await interaction.editReply(response);
        return;
      }
      console.log(`Archiving message with content: ${message.content}`);
      console.log(`pulled id: ${postId}`);
      console.log(`from channel: ${channel}`);

      message.content = tags + message.content;

      await handlePostByType(message, client);

      await interaction.editReply(response);
    } catch (err) {
      console.log(`fetch failed due to error: ${err}`);
      response = "fetchAPI failed due to an error! Cringe!";
      await interaction.editReply(response);
      return;
    }
  },
};
