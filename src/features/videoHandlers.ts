import { Client, Message, TextBasedChannel, messageLink } from "discord.js";
import { ExecException, exec } from "node:child_process";
import { archiveId } from "../../config.json";

export const handlePostByType = async (
  pin: Message<boolean>,
  client: Client
) => {
  const pinLink = messageLink(pin.channelId, pin.id, pin.guildId ?? "");
  let message = `${pinLink}\n`;

  const archiveChannel = (await client.channels.fetch(
    archiveId
  )) as TextBasedChannel;

  const urlWhitelist = [
    "tiktok",
    "youtube",
    "youtu.be",
    "v.redd.it",
    "clips.twitch.tv",
  ];

  const containsWhitelistedURL = (content: string) => {
    console.log(content);
    return urlWhitelist.some((whitelistedURL) =>
      content.includes(whitelistedURL)
    );
  };

  if (!archiveChannel) {
    console.log("archive channel not found");
    return;
  }

  if (pin.content.includes("http") && containsWhitelistedURL(pin.content)) {
    // handle ytdl content
    console.log("found: linked content");
    await handleContentLink(pin, message, archiveChannel);
  } else if (pin.attachments.size > 0) {
    // handle attached video/image
    console.log("found: attachment content");
    await handleAttachment(pin, message, "", archiveChannel);
  } else {
    // handle text only
    console.log("found: text only content");
    message += pin.content;
    archiveChannel.send(message);
    pin.unpin("archived");
  }
};

export const handleContentLink = async (
  pin: Message<boolean>,
  message: string,
  archiveChannel: TextBasedChannel
) => {
  console.log("Processing: linked content");
  const pinCopy = pin;
  const filePath = "yt-dlp/attachment.mp4";

  const urlRegex = /(https?:\/\/[^ ]*)/;

  let url = "";
  const urlMatch = pin.content.match(urlRegex);
  if (urlMatch) {
    url = urlMatch[1] ?? "";
    pinCopy.content = pinCopy.content.replace(url, "");
    if (pinCopy.content.length === 0) {
      console.log("Linked content skipped due to no tags");
      return;
    }
  }

  const handleExecOutput = async (error: ExecException | null) => {
    if (!error) {
      await handleAttachment(pinCopy, message, url, archiveChannel, filePath);
      exec(`cd yt-dlp && del * /Q`);
      console.log("Linked content no yt-dlp error");
    } else {
      console.log(`Linked content yt-dlp error: ${error}`);
    }
  };
  // exec yt-dlp
  exec(`cd yt-dlp && yt-dlp ${url}`, handleExecOutput);
};

export const handleAttachment = async (
  pin: Message<boolean>,
  message: string,
  attachmentLink: string,
  archiveChannel: TextBasedChannel,
  attachmentFile?: string
) => {
  console.log("Processing: attachment content");
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
      console.log(`Error uploading attachment: ${e}`);
    }
    pin.unpin("archived");
  } else {
    console.log(`Error processing attachment: ${pin}`);
    console.log("Attachment file:");
    console.log(attachmentFile);
    console.log("Attachment link:");
    console.log(attachmentLink);
  }
};
