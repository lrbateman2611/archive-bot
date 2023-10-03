# archive-bot

You will need a config.json in the rootdir with the following structure:

`{
"token": "your bot token",
"clientId": "your bot's client ID",
"guildId": "ID of the server you will use",
"archiveId": "ID of the archive channel in the server
}`

You will also need to have [yt-dlp](https://github.com/yt-dlp/yt-dlp "yt-dlp") installed on your machine
I use the following config to ensure the downloaded type can be displayed in Discord's video player:

`-f "bestvideo*+bestaudio/best"
-S "filesize:25M"
-S "codec:h264"
--restrict-filenames
--merge-output-format mp4
--sub-langs all
--convert-subs srt
--embed-subs
--compat-options no-live-chat
--embed-metadata
--no-mtime
--no-mark-watched
--concurrent-fragments 8
--embed-thumbnail
-o "attachment.%(ext)s"`

it's only necessary that there is only one output file and it's named 'attachment.mp4'
