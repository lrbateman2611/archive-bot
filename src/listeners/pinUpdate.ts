import {
  Client,
  Events,
  Message,
  TextBasedChannel,
  messageLink,
} from "discord.js";
import { archiveId } from "../../config.json";
import { ExecException, exec } from "child_process";

export default (client: Client): void => {
  client.on(Events.ChannelPinsUpdate, async (updatedChannel) => {
    console.log("Pins Updated!");
    handleArchivePin(client, updatedChannel);
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
    const pinLink = messageLink(pin.channelId, pin.id, pin.guildId ?? "");
    let message = `${pinLink}\n`;
    const archiveChannel = (await client.channels.fetch(
      archiveId
    )) as TextBasedChannel;
    if (!archiveChannel) {
      console.log("archive channel not found");
      return;
    }
    if (
      pin.content.includes("http") &&
      (pin.content.includes("tiktok") || pin.content.includes("youtube"))
    ) {
      // handle ytdl content
      console.log("linked content");
      await handleContentLink(pin, message, archiveChannel);
    } else if (pin.attachments.size > 0) {
      // handle attached video/image
      console.log("attachment content");
      message += pin.content;
      const attachmentLink = pin.attachments.first()?.url;
      if (attachmentLink) {
        await handleAttachment(pin, message, attachmentLink, archiveChannel);
      }
    } else {
      // handle text only
      console.log("text only content");
      message += pin.content;
      archiveChannel.send(message);
      pin.unpin("archived");
    }
  });
};

const handleContentLink = async (
  pin: Message<boolean>,
  message: string,
  archiveChannel: TextBasedChannel
) => {
  const pinCopy = pin;
  const filePath = "yt-dlp/attachment.mp4";

  const urlRegex = /(https?:\/\/[^ ]*)/;

  let url = "";
  const urlMatch = pin.content.match(urlRegex);
  if (urlMatch) {
    url = urlMatch[1] ?? "";
    pinCopy.content = pinCopy.content.replace(url, "");
    if (pinCopy.content.length === 0) {
      return;
    }
  }

  const handleExecOutput = async (error: ExecException | null) => {
    if (!error) {
      await handleAttachment(pinCopy, message, url, archiveChannel, filePath);
      exec(`cd yt-dlp && del * /Q`);
    } else {
      console.log(`yt-dlp error: ${error}`);
    }
  };
  // exec yt-dlp
  // exec(
  //   `cd yt-dlp && yt-dlp -f 'bv*+ba*' --merge-output-format mp4/webm ${url} && ren *.mp4 attachment.mp4`,
  //   handleExecOutput
  // );
  // this yt-dlp command sucks
};

const handleAttachment = async (
  pin: Message<boolean>,
  message: string,
  attachmentLink: string,
  archiveChannel: TextBasedChannel,
  attachmentFile?: string
) => {
  console.log("attachment content");
  message += pin.content;
  if (!attachmentFile) {
    attachmentFile = attachmentLink;
  }
  if (attachmentFile) {
    try {
      await archiveChannel.send({
        files: [
          {
            attachment: attachmentFile,
          },
        ],
        content: message,
      });
    } catch (e) {
      // Attachment is too large - send a link to it instead
      message += ` ${attachmentLink}`;
      archiveChannel.send(message);
      console.log(`Error uploading copy: ${e}`);
    }
    pin.unpin("archived");
  } else {
    console.log(`Error processing: ${pin}`);
  }
};
