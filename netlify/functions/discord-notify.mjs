export default async (request, context) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return jsonResponse({ error: "DISCORD_WEBHOOK_URL is missing" }, 500);
  }

  try {
    const details = await request.json();
    const geo = context.geo || {};
    const ip = context.ip || "Unavailable";
    const location = [
      cleanText(geo.city, 80),
      cleanText(geo.subdivision?.name, 80),
      cleanText(geo.country?.name, 80),
    ]
      .filter(Boolean)
      .join(", ");

    const time = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Tashkent",
    });

    const payload = {
      username: "Site Visit Notification",
      content: [
        "🔔 **New site visit**",
        `🌐 Public IP: \`${cleanText(ip, 100)}\``,
        `📍 Approximate location: **${location || "Unknown"}**`,
        `🕓 Tashkent time: **${time}**`,
        `🧭 Page: \`${cleanText(details.path, 300) || "/"}\``,
        `👤 Account role: **${cleanText(details.role, 50) || "Unknown"}**`,
        `📱 Screen: **${cleanText(details.screen, 30) || "Unknown"}**`,
        `🌍 Language: **${cleanText(details.language, 30) || "Unknown"}**`,
        `⏱️ Device timezone: **${cleanText(details.timezone, 80) || "Unknown"}**`,
        `🔗 Referrer: ${cleanText(details.referrer, 300) || "Direct visit"}`,
        `🖥️ User agent: ${cleanText(details.userAgent, 500) || "Unknown"}`,
      ].join("\n"),
      allowed_mentions: { parse: [] },
    };

    const separator = webhookUrl.includes("?") ? "&" : "?";
    const discordResponse = await fetch(`${webhookUrl}${separator}wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordResponse.ok) {
      console.error("Discord rejected visit notification:", await discordResponse.text());
      return jsonResponse({ error: "Discord rejected the notification" }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("visit-notify failed:", error);
    return jsonResponse({ error: "Visit notification failed" }, 500);
  }
};

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
