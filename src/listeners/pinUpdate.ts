import { Client, Events, TextBasedChannel } from "discord.js";
import { handlePostByType } from "../features/videoHandlers";
import { archiveId } from "../../config.json";

export default (client: Client): void => {
  client.on(Events.ChannelPinsUpdate, async (updatedChannel) => {
    console.log("Pins Updated!");
    if (updatedChannel.id === archiveId) {
      return;
    }
    await handleArchivePin(client, updatedChannel);
  });
};

const handleArchivePin = async (
  client: Client,
  channel: TextBasedChannel
): Promise<void> => {
  const toArchive = await channel.messages.fetchPinned();

  toArchive.forEach(async (pin) => {
    if (pin.content.length === 0) {
      return;
    }

    await handlePostByType(pin, client);
  });
};
