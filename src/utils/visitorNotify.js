const VISIT_SENT_KEY = "visit_notification_sent";

export const notifyVisit = async () => {
  if (typeof window === "undefined") return;

  const isLocalhost = ["localhost", "127.0.0.1"].includes(
    window.location.hostname
  );
  if (isLocalhost || sessionStorage.getItem(VISIT_SENT_KEY) === "true") return;

  sessionStorage.setItem(VISIT_SENT_KEY, "true");

  try {
    const response = await fetch("/.netlify/functions/visit-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || "Direct visit",
        userAgent: navigator.userAgent,
        language: navigator.language || "Unknown",
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
        screen: `${window.screen.width}x${window.screen.height}`,
        role: sessionStorage.getItem("sk_role") || "Not logged in",
      }),
    });

    if (!response.ok) {
      sessionStorage.removeItem(VISIT_SENT_KEY);
      console.error("Visit notification failed:", await response.text());
    }
  } catch (error) {
    sessionStorage.removeItem(VISIT_SENT_KEY);
    console.error("Visit notification failed:", error);
  }
};
