const DATABASE_URL = "https://chat-with-s-default-rtdb.firebaseio.com";

export default async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return jsonResponse({ error: "DISCORD_WEBHOOK_URL is missing" }, 500);
  }

  try {
    const { messageId, idToken } = await request.json();

    if (!isSafeFirebaseKey(messageId) || typeof idToken !== "string") {
      return jsonResponse({ error: "Invalid request" }, 400);
    }

    const messageUrl = firebaseUrl(
      `privateChat/messages/${messageId}`,
      idToken
    );
    const messageResponse = await fetch(messageUrl);

    if (!messageResponse.ok) {
      return jsonResponse({ error: "Firebase authorization failed" }, 401);
    }

    const message = await messageResponse.json();

    if (!message || message.senderRole !== "sakina") {
      return jsonResponse({ error: "Message not found" }, 404);
    }

    if (message.discordSentAt) {
      return jsonResponse({ ok: true, alreadySent: true });
    }

    const presenceResponse = await fetch(
      firebaseUrl("privateChat/presence/me", idToken)
    );
    const ownerOnline = presenceResponse.ok
      ? (await presenceResponse.json()) === true
      : false;

    const formData = new FormData();
    const payload = {
      username: "Private Chat Notification",
      content: buildDiscordContent(message, ownerOnline),
      allowed_mentions: { parse: [] },
    };

    formData.append("payload_json", JSON.stringify(payload));

    if (message.mediaData) {
      const media = dataUrlToBlob(message.mediaData, message.mimeType);
      formData.append(
        "files[0]",
        media.blob,
        safeFileName(message.fileName, media.extension)
      );
    }

    const separator = webhookUrl.includes("?") ? "&" : "?";
    const discordResponse = await fetch(`${webhookUrl}${separator}wait=true`, {
      method: "POST",
      body: formData,
    });

    if (!discordResponse.ok) {
      const discordError = await discordResponse.text();
      console.error("Discord rejected webhook:", discordError);
      return jsonResponse({ error: "Discord rejected the message" }, 502);
    }

    await fetch(messageUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordSentAt: { ".sv": "timestamp" } }),
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("discord-notify failed:", error);
    return jsonResponse({ error: "Notification failed" }, 500);
  }
};

function firebaseUrl(path, idToken) {
  return `${DATABASE_URL}/${path}.json?auth=${encodeURIComponent(idToken)}`;
}

function buildDiscordContent(message, ownerOnline) {
  const typeLabels = {
    text: "Text",
    image: "Image",
    video: "Video",
    audio: "Voice message (WAV)",
  };
  const text = String(message.text || "").slice(0, 1500);
  const repliedText = message.replyTo
    ? String(
        message.replyTo.text ||
          typeLabels[message.replyTo.type] ||
          "Message"
      ).slice(0, 300)
    : "";
  const time = new Date(message.createdAt || Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Tashkent",
  });

  return [
    "📩 **New message from Sakina**",
    `👤 Abdulloh: **${ownerOnline ? "Online" : "Offline"}**`,
    `📎 Type: **${typeLabels[message.type] || "Message"}**`,
    message.replyTo
      ? `↩️ Reply to **${String(message.replyTo.senderName || "message").slice(
          0,
          80
        )}**: ${repliedText}`
      : null,
    text ? `💬 ${text}` : null,
    `🕒 ${time}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function dataUrlToBlob(dataUrl, fallbackType) {
  const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid media data URL");

  const mimeType = match[1] || fallbackType || "application/octet-stream";
  const bytes = Buffer.from(match[2], "base64");
  const extension = extensionFromMime(mimeType);

  return {
    blob: new Blob([bytes], { type: mimeType }),
    extension,
  };
}

function extensionFromMime(mimeType) {
  const known = {
    "audio/wav": "wav",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return known[mimeType] || "bin";
}

function safeFileName(fileName, fallbackExtension) {
  const cleanName = String(fileName || "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
  return cleanName || `attachment.${fallbackExtension}`;
}

function isSafeFirebaseKey(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length < 200 &&
    !/[.#$\[\]/]/.test(value)
  );
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
