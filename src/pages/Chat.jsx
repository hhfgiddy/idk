import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  limitToLast,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import {
  FiArrowLeft,
  FiBell,
  FiCornerUpLeft,
  FiDownload,
  FiLogOut,
  FiMic,
  FiPause,
  FiPlay,
  FiPlus,
  FiSend,
  FiSquare,
  FiX,
} from "react-icons/fi";
import { auth, database } from "../firebase.js";
import "../styles/Chat.css";

const CHAT_ROOT = "privateChat";
const MAX_FILE_SIZE = 6 * 1024 * 1024;

const Chat = () => {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("sk_role");
  const myName = role === "sakina" ? "Sakina" : "Abdulloh";
  const otherRole = role === "sakina" ? "me" : "sakina";
  const otherName = role === "sakina" ? "Abdulloh" : "Sakina";

  const [firebaseReady, setFirebaseReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [swipe, setSwipe] = useState({ id: null, offset: 0 });
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const swipeStartRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const knownMessageIdsRef = useRef(new Set());
  const firstMessagesLoadRef = useRef(true);

  useEffect(() => {
    const stopAuthListener = onAuthStateChanged(auth, (user) => {
      if (!user) {
        sessionStorage.removeItem("sk_auth");
        sessionStorage.removeItem("sk_role");
        sessionStorage.removeItem("sk_name");
        navigate("/", { replace: true });
        return;
      }

      setFirebaseReady(true);
    });

    return stopAuthListener;
  }, [navigate]);

  useEffect(() => {
    if (!firebaseReady || !role) return undefined;

    const messagesRef = ref(database, `${CHAT_ROOT}/messages`);
    const recentMessages = query(
      messagesRef,
      orderByChild("createdAt"),
      limitToLast(30)
    );

    return onValue(
      recentMessages,
      (snapshot) => {
        const nextMessages = [];
        const nextIds = new Set();

        snapshot.forEach((childSnapshot) => {
          const item = { id: childSnapshot.key, ...childSnapshot.val() };
          nextMessages.push(item);
          nextIds.add(item.id);

          const isNew = !knownMessageIdsRef.current.has(item.id);
          const isIncoming = item.senderRole !== role;

          if (
            !firstMessagesLoadRef.current &&
            isNew &&
            isIncoming &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            const body = item.text || mediaLabel(item.type);
            new Notification(`${item.senderName || otherName} sent a message`, {
              body,
            });
          }
        });

        knownMessageIdsRef.current = nextIds;
        firstMessagesLoadRef.current = false;
        setMessages(nextMessages);
      },
      (error) => {
        console.error("Messages listener failed:", error);
      }
    );
  }, [firebaseReady, otherName, role]);

  useEffect(() => {
    if (!firebaseReady || !role) return undefined;

    const myPresenceRef = ref(database, `${CHAT_ROOT}/presence/${role}`);
    const otherPresenceRef = ref(
      database,
      `${CHAT_ROOT}/presence/${otherRole}`
    );
    const connectionRef = ref(database, ".info/connected");

    const stopConnectionListener = onValue(connectionRef, (snapshot) => {
      if (snapshot.val() === true) {
        onDisconnect(myPresenceRef).set(false);
        set(myPresenceRef, true).catch(console.error);
      }
    });

    const stopOtherPresenceListener = onValue(otherPresenceRef, (snapshot) => {
      setOtherOnline(snapshot.val() === true);
    });

    return () => {
      stopConnectionListener();
      stopOtherPresenceListener();
      set(myPresenceRef, false).catch(() => {});
    };
  }, [firebaseReady, otherRole, role]);

  useEffect(() => {
    if (!firebaseReady || !role) return undefined;

    const myTypingRef = ref(database, `${CHAT_ROOT}/typing/${role}`);
    const otherTypingRef = ref(database, `${CHAT_ROOT}/typing/${otherRole}`);

    onDisconnect(myTypingRef).set(false);
    const stopTypingListener = onValue(otherTypingRef, (snapshot) => {
      setOtherTyping(snapshot.val() === true);
    });

    return () => {
      stopTypingListener();
      clearTimeout(typingTimerRef.current);
      set(myTypingRef, false).catch(() => {});
    };
  }, [firebaseReady, otherRole, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      clearInterval(recordingTimerRef.current);
      clearTimeout(typingTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const updateTyping = (value) => {
    setMessage(value);
    if (!firebaseReady || !role) return;

    const myTypingRef = ref(database, `${CHAT_ROOT}/typing/${role}`);
    clearTimeout(typingTimerRef.current);

    if (!value.trim()) {
      set(myTypingRef, false).catch(() => {});
      return;
    }

    set(myTypingRef, true).catch(() => {});
    typingTimerRef.current = setTimeout(() => {
      set(myTypingRef, false).catch(() => {});
    }, 1200);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Faqat rasm yoki video tanlash mumkin.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Fayl 6 MB dan kichik bo'lishi kerak.");
      return;
    }

    replaceAttachment(file, isImage ? "image" : "video");
  };

  const replaceAttachment = (file, type) => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== attachment.previewUrl
      );
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);
    setAttachment({ file, previewUrl, type });
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== attachment.previewUrl
      );
    }
    setAttachment(null);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      alert("Bu brauzer voice message yozishni qo'llamaydi.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        try {
          const recordedBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType,
          });
          const wavBlob = await convertToWav(recordedBlob);

          if (wavBlob.size > MAX_FILE_SIZE) {
            alert("Voice message juda uzun. 6 MB dan kichik yozing.");
            return;
          }

          const wavFile = new File(
            [wavBlob],
            `voice-message-${Date.now()}.wav`,
            { type: "audio/wav" }
          );
          replaceAttachment(wavFile, "audio");
        } catch (error) {
          console.error("WAV conversion failed:", error);
          alert("Voice message WAV formatiga aylantirilmadi.");
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          clearInterval(recordingTimerRef.current);
          setIsRecording(false);
          setRecordingTime(0);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(
        () => setRecordingTime((time) => time + 1),
        1000
      );
    } catch (error) {
      console.error("Microphone permission failed:", error);
      alert("Mikrofondan foydalanishga ruxsat berilmadi.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
  };

  const sendMessage = async () => {
    const cleanMessage = message.trim();
    if ((!cleanMessage && !attachment) || isSending || !firebaseReady) return;

    setIsSending(true);

    try {
      const mediaData = attachment
        ? await fileToDataUrl(attachment.file)
        : "";

      const sentMessageRef = await push(ref(database, `${CHAT_ROOT}/messages`), {
        senderRole: role,
        senderName: myName,
        text: cleanMessage,
        type: attachment?.type || "text",
        mediaData,
        fileName: attachment?.file?.name || "",
        mimeType: attachment?.file?.type || "",
        ...(replyingTo
          ? {
              replyTo: {
                id: replyingTo.id,
                senderName: replyingTo.senderName,
                text: replyingTo.text || "",
                type: replyingTo.type || "text",
              },
            }
          : {}),
        createdAt: serverTimestamp(),
      });

      setMessage("");
      setReplyingTo(null);
      removeAttachment();
      clearTimeout(typingTimerRef.current);
      await set(ref(database, `${CHAT_ROOT}/typing/${role}`), false);

      if (role === "sakina" && auth.currentUser && sentMessageRef.key) {
        sendDiscordNotification(sentMessageRef.key).catch((error) => {
          console.error("Discord notification failed:", error);
        });
      }
    } catch (error) {
      console.error("Message send failed:", error);
      alert("Xabar yuborilmadi. Internet va Firebase Rules'ni tekshiring.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") {
      alert("Bu brauzer notification'ni qo'llamaydi.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const selectReply = (item) => {
    setReplyingTo(item);
    setSwipe({ id: null, offset: 0 });
    window.setTimeout(() => messageInputRef.current?.focus(), 0);
  };

  const startReplySwipe = (event, item) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest("button, a, input, video, audio")) return;

    swipeStartRef.current = {
      id: item.id,
      item,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
    };
    setSwipe({ id: item.id, offset: 0 });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveReplySwipe = (event, item) => {
    const start = swipeStartRef.current;
    if (!start || start.id !== item.id) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (!start.horizontal) {
      if (Math.abs(deltaX) < 7 && Math.abs(deltaY) < 7) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        swipeStartRef.current = null;
        setSwipe({ id: null, offset: 0 });
        return;
      }
      start.horizontal = true;
    }

    if (deltaX < 0) {
      event.preventDefault();
      setSwipe({ id: item.id, offset: Math.max(-74, deltaX) });
    } else {
      setSwipe({ id: item.id, offset: 0 });
    }
  };

  const finishReplySwipe = (item) => {
    const shouldReply = swipe.id === item.id && swipe.offset <= -48;
    swipeStartRef.current = null;

    if (shouldReply) selectReply(item);
    else setSwipe({ id: null, offset: 0 });
  };

  const logout = async () => {
    await Promise.allSettled([
      set(ref(database, `${CHAT_ROOT}/presence/${role}`), false),
      set(ref(database, `${CHAT_ROOT}/typing/${role}`), false),
      signOut(auth),
    ]);

    sessionStorage.removeItem("sk_auth");
    sessionStorage.removeItem("sk_role");
    sessionStorage.removeItem("sk_name");
    navigate("/", { replace: true });
  };

  const recordingLabel = `${String(Math.floor(recordingTime / 60)).padStart(
    2,
    "0"
  )}:${String(recordingTime % 60).padStart(2, "0")}`;

  return (
    <main className="chat-page">
      <div className="chat-background" aria-hidden="true">
        <span>♡</span><span>✿</span><span>♡</span>
        <span>✿</span><span>♡</span><span>✿</span>
      </div>

      <section className="chat-container">
        <header className="chat-header">
          {role === "sakina" ? (
            <button
              className="chat-icon-button chat-back-button"
              onClick={() => navigate("/home")}
              aria-label="Home sahifasiga qaytish"
              type="button"
            >
              <FiArrowLeft />
            </button>
          ) : (
            <div className="chat-header-spacer" aria-hidden="true" />
          )}

          <div className="chat-user">
            <div className="chat-avatar">{otherName.charAt(0)}</div>
            <div>
              <h1>{otherName}</h1>
              <div
                className={`chat-online-status ${
                  otherOnline ? "is-online" : "is-offline"
                }`}
              >
                <span /> {otherOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          <button
            className={`chat-icon-button chat-notification-button ${
              notificationPermission === "granted" ? "is-enabled" : ""
            }`}
            onClick={enableNotifications}
            aria-label="Enable notifications"
            type="button"
          >
            <FiBell />
          </button>

          <button
            className="chat-icon-button chat-logout-button"
            onClick={logout}
            aria-label="Logout"
            type="button"
          >
            <FiLogOut />
          </button>
        </header>

        <div className="chat-messages">
          {messages.length === 0 && !otherTyping && (
            <div className="chat-empty">
              <div className="chat-empty-icon">♡</div>
              <h2>{otherName} bilan private chat</h2>
              <p>Write the first message...</p>
            </div>
          )}

          {messages.map((item) => (
            <div
              className={`message-row ${
                item.senderRole === role ? "message-me" : "message-her"
              }`}
              key={item.id}
              onPointerDown={(event) => startReplySwipe(event, item)}
              onPointerMove={(event) => moveReplySwipe(event, item)}
              onPointerUp={() => finishReplySwipe(item)}
              onPointerCancel={() => {
                swipeStartRef.current = null;
                setSwipe({ id: null, offset: 0 });
              }}
            >
              <span
                className={`reply-swipe-indicator ${
                  swipe.id === item.id && swipe.offset <= -28 ? "is-visible" : ""
                }`}
                aria-hidden="true"
              >
                <FiCornerUpLeft />
              </span>

              <div
                className="message-swipe-content"
                style={{
                  transform: `translateX(${swipe.id === item.id ? swipe.offset : 0}px)`,
                }}
              >
                <div
                  className={`message-bubble ${
                    item.type === "audio" ? "audio-message-bubble" : ""
                  }`}
                >
                  {item.replyTo && (
                    <div className="message-reply-quote">
                      <strong>{item.replyTo.senderName || "Message"}</strong>
                      <span>{replyPreview(item.replyTo)}</span>
                    </div>
                  )}
                  {item.type === "image" && item.mediaData && (
                    <div className="message-image-wrapper">
                      <img className="message-image" src={item.mediaData} alt="Sent" />
                      <button
                        className="message-download-button"
                        onClick={() =>
                          downloadMedia(
                            item.mediaData,
                            item.fileName || `image-${item.id}.jpg`
                          )
                        }
                        type="button"
                        aria-label="Download image"
                      >
                        <FiDownload />
                      </button>
                    </div>
                  )}
                  {item.type === "video" && item.mediaData && (
                    <video className="message-video" src={item.mediaData} controls />
                  )}
                  {item.type === "audio" && item.mediaData && (
                    <VoicePlayer src={item.mediaData} />
                  )}
                  {item.text && <p className="message-text">{item.text}</p>}
                  <div className="message-info">
                    <span>{formatMessageTime(item.createdAt)}</span>
                    {item.senderRole === role && <span>✓</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {otherTyping && (
            <div className="message-row message-her">
              <div className="message-bubble typing-bubble" aria-label="Typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {replyingTo && (
          <div className="reply-compose-preview">
            <FiCornerUpLeft className="reply-compose-icon" />
            <div>
              <strong>Reply to {replyingTo.senderName}</strong>
              <span>{replyPreview(replyingTo)}</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              type="button"
              aria-label="Cancel reply"
            >
              <FiX />
            </button>
          </div>
        )}

        {attachment && (
          <div className="chat-attachment-preview">
            <button
              className="remove-attachment"
              onClick={removeAttachment}
              aria-label="Remove attachment"
              type="button"
            >
              <FiX />
            </button>
            {attachment.type === "image" && (
              <img src={attachment.previewUrl} alt="Preview" />
            )}
            {attachment.type === "video" && (
              <video src={attachment.previewUrl} controls />
            )}
            {attachment.type === "audio" && (
              <div className="audio-preview">
                <span>Voice message • WAV</span>
                <audio src={attachment.previewUrl} controls />
              </div>
            )}
            <p>{attachment.file.name}</p>
          </div>
        )}

        <footer className="chat-footer">
          <input
            ref={fileInputRef}
            className="chat-file-input"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <button
            className="chat-action-button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add image or video"
            type="button"
            disabled={isSending}
          >
            <FiPlus />
          </button>

          {isRecording ? (
            <div className="recording-status">
              <span className="recording-dot" />
              <span>{recordingLabel}</span>
            </div>
          ) : (
            <textarea
              ref={messageInputRef}
              className="chat-input"
              value={message}
              onChange={(event) => updateTyping(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              rows="1"
              disabled={isSending}
            />
          )}

          {isRecording ? (
            <button
              className="chat-action-button stop-record-button"
              onClick={stopRecording}
              aria-label="Stop recording"
              type="button"
            >
              <FiSquare />
            </button>
          ) : message.trim() || attachment ? (
            <button
              className={`chat-action-button send-message-button ${
                isSending ? "is-sending" : ""
              }`}
              onClick={sendMessage}
              aria-label="Send message"
              type="button"
              disabled={isSending}
            >
              <FiSend />
            </button>
          ) : (
            <button
              className="chat-action-button"
              onClick={startRecording}
              aria-label="Record voice message"
              type="button"
              disabled={isSending}
            >
              <FiMic />
            </button>
          )}
        </footer>
      </section>
    </main>
  );
};

async function sendDiscordNotification(messageId) {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Firebase ID token is missing");

  const response = await fetch("/.netlify/functions/discord-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, idToken }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Discord function ${response.status}: ${details}`);
  }
}

function VoicePlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const updateDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const stopPlaying = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", stopPlaying);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", stopPlaying);
    };
  }, [src]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Voice playback failed:", error);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seek = (event) => {
    const nextTime = Number(event.target.value);
    if (audioRef.current) audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="voice-player">
      <button
        className="voice-play-button"
        onClick={togglePlayback}
        type="button"
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? <FiPause /> : <FiPlay />}
      </button>

      <input
        className="voice-progress"
        type="range"
        min="0"
        max={duration || 0}
        step="0.01"
        value={Math.min(currentTime, duration || 0)}
        onChange={seek}
        aria-label="Voice message progress"
      />

      <span className="voice-time">
        {formatAudioTime(currentTime || duration)}
      </span>

      <audio ref={audioRef} className="voice-audio-element" src={src} preload="metadata" />
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function mediaLabel(type) {
  if (type === "image") return "Sent an image";
  if (type === "video") return "Sent a video";
  if (type === "audio") return "Sent a voice message";
  return "New message";
}

function replyPreview(item) {
  if (item.text) return String(item.text).slice(0, 90);
  if (item.type === "image") return "📷 Image";
  if (item.type === "video") return "🎥 Video";
  if (item.type === "audio") return "🎤 Voice message";
  return "Message";
}

async function downloadMedia(dataUrl, fileName) {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    console.error("Image download failed:", error);
    alert("Rasmni yuklab bo'lmadi.");
  }
}

function formatMessageTime(timestamp) {
  if (typeof timestamp !== "number") return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAudioTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(
    2,
    "0"
  )}`;
}

async function convertToWav(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return new Blob([audioBufferToWav(audioBuffer)], { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}

function audioBufferToWav(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const dataLength = audioBuffer.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeWavString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeWavString(view, 8, "WAVE");
  writeWavString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeWavString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  const channels = Array.from({ length: channelCount }, (_, index) =>
    audioBuffer.getChannelData(index)
  );

  let offset = 44;
  for (let sampleIndex = 0; sampleIndex < audioBuffer.length; sampleIndex += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][sampleIndex]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return buffer;
}

function writeWavString(view, offset, value) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export default Chat;
