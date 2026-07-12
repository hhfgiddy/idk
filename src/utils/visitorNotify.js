
const WEBHOOK_URL = "https://discord.com/api/webhooks/1524277265079472218/d09r2L5NYHfZk01AIm62u1zNTZXBLoiz4qqkAF89BkxzK0LuLTSbQmyHx9biIrA2KZ6b"

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "📱 Tablet";
  if (/mobile|android|iphone/i.test(ua)) return "📱 Mobile";
  return "💻 Desktop";
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Noma'lum";
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  return "Noma'lum";
}

async function getLocation() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (data && data.success !== false) {
      return `${data.city || "?"}, ${data.region || "?"}, ${data.country || "?"} (IP: ${data.ip})`;
    }
  } catch (e) {
    // jim ignore qilamiz
  }
  return "Aniqlanmadi";
}

export async function notifyVisit() {
  if (sessionStorage.getItem("visit_notified")) return;
  sessionStorage.setItem("visit_notified", "1");

  const time = new Date().toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const location = await getLocation();

  const embed = {
    title: "👀 Saytga yangi tashrif",
    fields: [
      { name: "🕒 Vaqt", value: time, inline: false },
      { name: "📱 Qurilma", value: getDeviceType(), inline: true },
      { name: "💻 OS", value: getOS(), inline: true },
      { name: "🌐 Brauzer", value: getBrowser(), inline: true },
      { name: "📍 Joylashuv", value: location, inline: false },
    ],
    color: 3447003,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Visitor Tracker 👀",
        avatar_url: "https://cdn.discordapp.com/embed/avatars/1.png",
        embeds: [embed],
      }),
    });
  } catch (e) {
    console.log("Visitor notify failed:", e);
  }
}