import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiHome,
  FiGift,
  FiMail,
  FiImage,
  FiVideo,
  FiSend,
  FiChevronRight,
  FiMic,
  FiSquare,
  FiTrash2,
  FiPlay,
  FiPause,
  FiMessageCircle,
} from "react-icons/fi";
import { BsStars } from "react-icons/bs";
import "../styles/Home.css";


const openers = [
  "Every morning I wake up grateful",
  "In a universe full of galaxies",
  "If love had a shape",
  "Somewhere between yesterday and forever",
  "Out of every heart in this world",
  "When the world feels too loud",
  "Long before I knew your name",
  "On the quietest of nights",
  "Through every season that has passed",
  "In the smallest of moments",
  "Across every mile that could divide us",
  "Under the same soft sky",
  "In the middle of an ordinary day",
  "When I close my eyes",
  "No matter how far the day takes me",
  "Even on the hardest days",
  "Somewhere in this endless sky",
  "In every version of my life",
  "Before the sun even rises",
  "At the end of every long day",
];

const middles = [
  "you are the softest thought in my mind",
  "your smile is the only light I need",
  "my heart still chooses you",
  "I find my way back to you",
  "you are the calm I search for",
  "I think of the way you laugh",
  "there is no place I'd rather be than beside you",
  "you feel like home to me",
  "your name is the sweetest word I know",
  "I fall for you all over again",
  "you are my favorite kind of magic",
  "I carry you quietly with me",
  "you make ordinary things feel golden",
  "my whole world softens around you",
  "you are the reason my days make sense",
  "I am endlessly thankful for you",
  "you are proof that love can be gentle",
  "I remember exactly how it feels to love you",
];

const closers = [
  "and I would choose you in every lifetime.",
  "and that will never change.",
  "and I hope you always feel it.",
  "forever, without a single doubt.",
  "and I never want that to stop.",
  "and my heart means every word.",
  "today, tomorrow, and always.",
  "more than words could ever hold.",
  "and I am endlessly lucky for that.",
  "and I will keep choosing you.",
  "quietly, deeply, completely.",
  "and it feels like the easiest truth I know.",
];

function buildLines(a, b, c, count) {
  const seen = new Set();
  const result = [];
  let guard = 0;
  while (result.length < count && guard < count * 30) {
    guard++;
    const i = Math.floor(Math.random() * a.length);
    const j = Math.floor(Math.random() * b.length);
    const k = Math.floor(Math.random() * c.length);
    const key = `${i}-${j}-${k}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(`${a[i]}, ${b[j]} ${c[k]}`);
  }
  return result;
}

const QUOTES = buildLines(openers, middles, closers, 120);

const surpriseOpeners = [
  "Just so you know,",
  "A little secret:",
  "Quiet confession —",
  "Today's soft reminder:",
  "Something true:",
  "For my favorite person,",
  "A tiny truth:",
  "Between us,",
  "From my heart to yours,",
  "A gentle note:",
];

const surpriseMiddles = [
  "you make my life feel like a love story",
  "loving you is the easiest thing I've ever done",
  "you are my favorite notification of the day",
  "I smile every time your name pops into my head",
  "you are the softest part of every hard day",
  "you are my calm in every storm",
  "my heart still skips for you",
  "you are the best thing that has ever happened to me",
  "I never get tired of choosing you",
  "you are my safest, warmest place",
  "you turned an ordinary life into something beautiful",
  "you are proof that some wishes come true",
  "I am so proud to call you mine",
  "you make even silence feel comfortable",
  "you are my favorite person to share small joys with",
];

const surpriseClosers = [
  "— love you endlessly. ❤️",
  "— always yours. 💌",
  "— today, and every day. 🌸",
  "— forever, no doubts. ✨",
  "— just wanted you to know. 💕",
  "— thank you for being you. 🤍",
  "— that's it, that's the message. 💗",
  "— my favorite truth. 🌷",
];

const SURPRISES = buildLines(surpriseOpeners, surpriseMiddles, surpriseClosers, 170);

const reasonStarts = [
  "I love you because",
  "One reason is that",
  "Simply put,",
  "Here's one:",
  "Honestly,",
  "Among many reasons,",
];

const reasonBodies = [
  "you remember the little things that matter to me",
  "you make me laugh even on my worst days",
  "you believe in me more than I believe in myself",
  "you are patient with me even when I don't deserve it",
  "your hugs feel like the safest place on earth",
  "you never let me feel alone",
  "you love with your whole heart",
  "you make ordinary days feel special",
  "your kindness never runs out",
  "you always know exactly what to say",
  "you look at me like I'm the only person in the room",
  "you support every little dream I have",
  "you are the softest soul I know",
  "your smile fixes even my worst moods",
  "you make effort without ever being asked",
  "you are honest with me, always",
  "you never make me feel small",
  "you love me exactly as I am",
  "you are my favorite hello and hardest goodbye",
  "you make me want to be better every day",
];

function buildReasons(start, body, count) {
  const seen = new Set();
  const result = [];
  let guard = 0;
  while (result.length < count && guard < count * 30) {
    guard++;
    const i = Math.floor(Math.random() * start.length);
    const j = Math.floor(Math.random() * body.length);
    const key = `${i}-${j}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(`${start[i]} ${body[j]}.`);
  }
  return result;
}

const REASONS = buildReasons(reasonStarts, reasonBodies, 110);

/* =========================================================
   DATE HELPERS — real, live JS calculations, no hardcoding
========================================================= */

function getNextOccurrence(month, day) {
  const now = new Date();
  let target = new Date(now.getFullYear(), month, day, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target = new Date(now.getFullYear() + 1, month, day, 0, 0, 0);
  }
  return target;
}

function getCountdownParts(target) {
  const now = new Date();
  let diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * 1000 * 60;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds };
}

function getElapsedParts(startDate) {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  let hours = now.getHours() - startDate.getHours();
  let minutes = now.getMinutes() - startDate.getMinutes();
  let seconds = now.getSeconds() - startDate.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days, hours, minutes, seconds };
}

/* =========================================================
   SMALL PRESENTATIONAL HELPERS
========================================================= */

function TimeUnit({ value, label }) {
  return (
    <div className="time-unit">
      <span className="time-value">{String(value).padStart(2, "0")}</span>
      <span className="time-label">{label}</span>
    </div>
  );
}

function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* =========================================================
   WEBM -> WAV CONVERSION (Discord webm audio'ni to'g'ri
   pleyer bilan ko'rsatmasligi mumkin, shuning uchun WAV'ga
   o'giramiz — bu Discord'da har doim to'liq audio pleyer bilan ochiladi)
========================================================= */

function writeWavString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function interleaveChannels(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;

  const samples =
    numChannels === 2
      ? interleaveChannels(buffer.getChannelData(0), buffer.getChannelData(1))
      : buffer.getChannelData(0);

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(arrayBuffer);

  writeWavString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeWavString(view, 8, "WAVE");
  writeWavString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeWavString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  floatTo16BitPCM(view, 44, samples);

  return arrayBuffer;
}

async function convertBlobToWav(sourceBlob) {
  const arrayBuffer = await sourceBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  const wavArrayBuffer = audioBufferToWav(decoded);
  audioCtx.close();
  return new Blob([wavArrayBuffer], { type: "audio/wav" });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Home() {
  const navigate = useNavigate();

  /* ---------- greeting ---------- */
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const computeGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };
    setGreeting(computeGreeting());
    const interval = setInterval(() => setGreeting(computeGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- quote of the visit ---------- */
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  /* ---------- surprise box ---------- */
  const [surpriseState, setSurpriseState] = useState("idle"); // idle | shaking | open
  const [surpriseMessage, setSurpriseMessage] = useState("");
  const [confettiPieces, setConfettiPieces] = useState([]);
  const lastSurpriseIndex = useRef(-1);

  const openSurprise = useCallback(() => {
    if (surpriseState !== "idle") return;
    setSurpriseState("shaking");
    setTimeout(() => {
      let idx = Math.floor(Math.random() * SURPRISES.length);
      if (SURPRISES.length > 1) {
        while (idx === lastSurpriseIndex.current) {
          idx = Math.floor(Math.random() * SURPRISES.length);
        }
      }
      lastSurpriseIndex.current = idx;
      setSurpriseMessage(SURPRISES[idx]);
      setSurpriseState("open");

      const pieces = Array.from({ length: 26 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        rotate: Math.random() * 360,
        color: ["#ff9fb2", "#ffd6b5", "#ffe6ee", "#ffb6c8", "#fff1e6"][
          Math.floor(Math.random() * 5)
        ],
      }));
      setConfettiPieces(pieces);
      setTimeout(() => setConfettiPieces([]), 2200);
    }, 650);
  }, [surpriseState]);

  const closeSurprise = () => setSurpriseState("idle");

  /* ---------- special days ---------- */
  const [birthdayParts, setBirthdayParts] = useState(() =>
    getCountdownParts(getNextOccurrence(0, 21))
  );
  const [togetherParts, setTogetherParts] = useState(() =>
    getElapsedParts(new Date(new Date().getFullYear(), 3, 9, 21, 0, 0))
  );

  useEffect(() => {
    const tick = () => {
      setBirthdayParts(getCountdownParts(getNextOccurrence(0, 21)));

      const now = new Date();
      const firstMeetingDate = new Date(now.getFullYear(), 3, 9, 21, 0, 0);
      if (firstMeetingDate.getTime() > now.getTime()) {
        firstMeetingDate.setFullYear(firstMeetingDate.getFullYear() - 1);
      }
      setTogetherParts(getElapsedParts(firstMeetingDate));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- reasons ---------- */
  const [reasonIndex, setReasonIndex] = useState(() =>
    Math.floor(Math.random() * REASONS.length)
  );
  const [reasonFade, setReasonFade] = useState(true);

  const nextReason = () => {
    setReasonFade(false);
    setTimeout(() => {
      setReasonIndex((prev) => (prev + 1) % REASONS.length);
      setReasonFade(true);
    }, 220);
  };

  /* ---------- contact form ---------- */
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [sending, setSending] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoName(file.name);
  };

  /* ---------- voice message recording ---------- */
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        try {
          const wavBlob = await convertBlobToWav(webmBlob);
          setAudioBlob(wavBlob);
          setAudioURL(URL.createObjectURL(wavBlob));
        } catch (err) {
          console.log("WAV conversion failed, falling back to webm:", err);
          setAudioBlob(webmBlob);
          setAudioURL(URL.createObjectURL(webmBlob));
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert("🎙️ Mikrofonga ruxsat berilmadi: " + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setIsPlaying(false);
    setRecordSeconds(0);
  };

  const togglePlay = () => {
    const player = audioPlayerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  /* ---------- send to Discord with files ---------- */
  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() && !imageFile && !videoFile && !audioBlob) {
      alert("❌ Kamida birorta narsani yuboring!");
      return;
    }

    setSending(true);

    try {
      const WEBHOOK_URL = "https://discord.com/api/webhooks/1524277265079472218/d09r2L5NYHfZk01AIm62u1zNTZXBLoiz4qqkAF89BkxzK0LuLTSbQmyHx9biIrA2KZ6b";

      const embed = {
        title: "💌 Yangi Message Kelib Tushdi!",
        description: message.trim() || "Fayl jo'natildi",
        fields: [
          {
            name: "📸 Rasm",
            value: imageFile ? `✅ ${imageFile.name}` : "❌ Rasm yo'q",
            inline: true
          },
          {
            name: "🎥 Video",
            value: videoFile ? `✅ ${videoFile.name}` : "❌ Video yo'q",
            inline: true
          },
          {
            name: "🎙️ Voice",
            value: audioBlob ? `✅ ${formatTime(recordSeconds)}` : "❌ Voice yo'q",
            inline: true
          }
        ],
        color: 16711680,
        timestamp: new Date().toISOString()
      };

      const formData = new FormData();

      formData.append("payload_json", JSON.stringify({
        username: "Portfolio Bot 💕",
        avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
        embeds: [embed]
      }));

      let fileIndex = 0;
      if (imageFile) {
        formData.append(`files[${fileIndex}]`, imageFile, imageFile.name);
        fileIndex++;
      }
      if (videoFile) {
        formData.append(`files[${fileIndex}]`, videoFile, videoFile.name);
        fileIndex++;
      }
      if (audioBlob) {
        formData.append(`files[${fileIndex}]`, audioBlob, `voice-${Date.now()}.wav`);
        fileIndex++;
      }

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData
      });

      if (response.ok || response.status === 204) {
        alert("✅ Xabar jo'natildi!");
        setMessage("");
        setImageFile(null);
        setImagePreview(null);
        setVideoFile(null);
        setVideoName("");
        deleteRecording();
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
      } else {
        const errorData = await response.text();
        alert("❌ Xato: " + (errorData || response.statusText));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Jo'natishda xato: " + error.message);
    } finally {
      setSending(false);
    }
  };

  /* ---------- bottom nav / scroll ---------- */
  const homeRef = useRef(null);
  const surpriseRef = useRef(null);
  const loveRef = useRef(null);
  const contactRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---------- ambient background particles ---------- */
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 12 + Math.random() * 20,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 10,
      })),
    []
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 14 + Math.random() * 8,
        delay: Math.random() * 12,
      })),
    []
  );

  /* ---------- reveal hooks for feature cards ---------- */
  const [heroRef, heroVisible] = useRevealOnScroll();
  const [cardsRef, cardsVisible] = useRevealOnScroll();
  const [specialRef, specialVisible] = useRevealOnScroll();
  const [reasonsRef, reasonsVisible] = useRevealOnScroll();
  const [contactVisRef, contactVisible] = useRevealOnScroll();

  return (
    <div className="home-page">
      {/* ambient background layer */}
      <div className="ambient-layer" aria-hidden="true">
        <div className="glow-orb glow-orb-a" />
        <div className="glow-orb glow-orb-b" />
        <div className="glow-orb glow-orb-c" />
        {hearts.map((h) => (
          <span
            key={`heart-${h.id}`}
            className="floating-heart"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
            }}
          >
            ❤
          </span>
        ))}
        {petals.map((p) => (
          <span
            key={`petal-${p.id}`}
            className="floating-petal"
            style={{
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            🌸
          </span>
        ))}
      </div>

      {/* ================= HERO ================= */}
      <section className="hero-section" id="home" ref={homeRef}>
        <div
          className={`hero-inner ${heroVisible ? "reveal-in" : "reveal-pending"}`}
          ref={heroRef}
        >
          <span className="eyebrow">
            <BsStars /> {greeting}
          </span>
          <h1 className="hero-title">
            My Princess <FiHeart className="title-heart" />
          </h1>
          <p className="hero-quote">{quote}</p>

          <div className="hero-image-card">
            <div className="hero-image-glow" />
            <img
              src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=500&fit=crop"
              alt="A romantic illustration made just for you"
              className="hero-image"
            />
            <div className="hero-seal">
              <FiHeart />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURE CARDS ================= */}
      <section className="cards-section" ref={cardsRef}>
        <div className={`cards-grid ${cardsVisible ? "reveal-in" : "reveal-pending"}`}>
          <button
            className="feature-card"
            style={{ animationDelay: "0.05s" }}
            onClick={() => scrollTo(surpriseRef)}
          >
            <div className="card-content">
              <span className="card-icon">💌</span>
              <span className="card-title">Surprise Box</span>
              <span className="card-sub">A little something for you</span>
            </div>
            <div className="card-footer">
              <span className="card-label">Tap here</span>
              <FiChevronRight className="card-arrow" />
            </div>
          </button>

          <button
            className="feature-card"
            style={{ animationDelay: "0.15s" }}
            onClick={() => scrollTo(surpriseRef)}
          >
            <div className="card-content">
              <span className="card-icon">🎂</span>
              <span className="card-title">Special Days</span>
              <span className="card-sub">Counting every moment</span>
            </div>
            <div className="card-footer">
              <span className="card-label">Upcoming</span>
              <FiChevronRight className="card-arrow" />
            </div>
          </button>

          <button
            className="feature-card"
            style={{ animationDelay: "0.25s" }}
            onClick={() => scrollTo(loveRef)}
          >
            <div className="card-content">
              <span className="card-icon">❤️</span>
              <span className="card-title">Reasons I Love You</span>
              <span className="card-sub">One hundred and counting</span>
            </div>
            <div className="card-footer">
              <span className="card-label">Discover</span>
              <FiChevronRight className="card-arrow" />
            </div>
          </button>

          <button
            className="feature-card"
            style={{ animationDelay: "0.35s" }}
            onClick={() => scrollTo(contactRef)}
          >
            <div className="card-content">
              <span className="card-icon">📩</span>
              <span className="card-title">Contact Me Anytime</span>
              <span className="card-sub">I'm always listening</span>
            </div>
            <div className="card-footer">
              <span className="card-label">Message</span>
              <FiChevronRight className="card-arrow" />
            </div>
          </button>


          <button
            className="feature-card chat-feature-card"
            style={{ animationDelay: "0.45s" }}
            onClick={() => navigate("/chat")}
          >
            <div className="card-content">
              <span className="card-icon">
                <FiMessageCircle />
              </span>
              <span className="card-title">Private Chat</span>
              <span className="card-sub">A private place only for us</span>
            </div>
            <div className="card-footer">
              <span className="card-label">Open Chat</span>
              <FiChevronRight className="card-arrow" />
            </div>
          </button>
        </div>
      </section>

      {/* ================= SURPRISE BOX ================= */}
      <section className="surprise-section" id="surprise" ref={surpriseRef}>
        <h2 className="section-title">💌 Surprise Box</h2>
        <p className="section-sub">Tap the box for a little surprise</p>

        <div className="surprise-stage">
          {confettiPieces.map((c) => (
            <span
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                background: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                transform: `rotate(${c.rotate}deg)`,
              }}
            />
          ))}

          <button
            className={`gift-box ${surpriseState === "shaking" ? "shake" : ""} ${
              surpriseState === "open" ? "opened" : ""
            }`}
            onClick={openSurprise}
            disabled={surpriseState !== "idle"}
            aria-label="Open surprise box"
          >
            <FiGift />
          </button>

          {surpriseState === "open" && (
            <div className="surprise-message-card fade-in-up">
              <p>{surpriseMessage}</p>
              <button className="ghost-btn" onClick={closeSurprise}>
                Close
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= SPECIAL DAYS ================= */}
      <section className="special-section" ref={specialRef}>
        <div className={`special-grid ${specialVisible ? "reveal-in" : "reveal-pending"}`}>
          <div className="glass-card special-card">
            <h3>🎂 Her Birthday</h3>
            <p className="special-caption">Counting down to January 21</p>
            <div className="time-row">
              <TimeUnit value={birthdayParts.days} label="Days" />
              <TimeUnit value={birthdayParts.hours} label="Hours" />
              <TimeUnit value={birthdayParts.minutes} label="Minutes" />
              <TimeUnit value={birthdayParts.seconds} label="Seconds" />
            </div>
          </div>

          <div className="glass-card special-card">
            <h3>💕 Together Since</h3>
            <p className="special-caption">April 9, 9:00 PM</p>
            <div className="time-row time-row-wide">
              <TimeUnit value={togetherParts.years} label="Years" />
              <TimeUnit value={togetherParts.months} label="Months" />
              <TimeUnit value={togetherParts.days} label="Days" />
              <TimeUnit value={togetherParts.hours} label="Hours" />
              <TimeUnit value={togetherParts.minutes} label="Minutes" />
              <TimeUnit value={togetherParts.seconds} label="Seconds" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= REASONS I LOVE YOU ================= */}
      <section className="reasons-section" id="love" ref={loveRef}>
        <h2 className="section-title">❤️ Reasons I Love You</h2>
        <div className={`glass-card reason-card ${reasonsVisible ? "reveal-in" : "reveal-pending"}`} ref={reasonsRef}>
          <p className={`reason-text ${reasonFade ? "fade-in-up" : "fade-out-down"}`}>
            {REASONS[reasonIndex]}
          </p>
          <span className="reason-count">
            {reasonIndex + 1} / {REASONS.length}
          </span>
          <button className="primary-btn" onClick={nextReason}>
            Next Reason <FiChevronRight />
          </button>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section className="contact-section" id="contact" ref={contactRef}>
        <h2 className="section-title">📩 Contact Me Anytime</h2>
        <div className={`glass-card contact-card ${contactVisible ? "reveal-in" : "reveal-pending"}`} ref={contactVisRef}>
          <textarea
            className="contact-textarea"
            placeholder="Write anything you want..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />

          <div className="upload-grid">
            <button
              className="upload-card"
              onClick={() => imageInputRef.current?.click()}
              type="button"
            >
              <FiImage />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImage}
                hidden
              />
            </button>

            <button
              className="upload-card"
              onClick={() => videoInputRef.current?.click()}
              type="button"
            >
              <FiVideo />
              <span>Upload Video</span>
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={handleVideo}
                hidden
              />
            </button>

            <div className="voice-recorder">
              {!audioURL && !isRecording && (
                <button className="upload-card" onClick={startRecording} type="button">
                  <FiMic />
                  <span>Record Voice</span>
                </button>
              )}

              {isRecording && (
                <button className="upload-card recording" onClick={stopRecording} type="button">
                  <FiSquare />
                  <span>Stop • {formatTime(recordSeconds)}</span>
                </button>
              )}

              {audioURL && !isRecording && (
                <div className="voice-preview">
                  <audio
                    ref={audioPlayerRef}
                    src={audioURL}
                    onEnded={() => setIsPlaying(false)}
                    hidden
                  />
                  <button className="voice-play-btn" onClick={togglePlay} type="button">
                    {isPlaying ? <FiPause /> : <FiPlay />}
                  </button>
                  <span className="voice-duration">{formatTime(recordSeconds)}</span>
                  <button className="voice-delete-btn" onClick={deleteRecording} type="button">
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
          </div>

          {(imagePreview || videoName) && (
            <div className="preview-row fade-in-up">
              {imagePreview && (
                <div className="preview-chip">
                  <img src={imagePreview} alt="Selected preview" />
                </div>
              )}
              {videoName && (
                <div className="preview-chip preview-chip-text">
                  <FiVideo /> {videoName}
                </div>
              )}
            </div>
          )}

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={sending}
          >
            <FiHeart /> {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </section>

      {/* ================= BOTTOM NAVIGATION ================= */}
      <nav className="bottom-nav">
        <button onClick={() => scrollTo(homeRef)} aria-label="Home">
          <FiHome />
          <span>Home</span>
        </button>
        <button onClick={() => scrollTo(surpriseRef)} aria-label="Surprise">
          <FiGift />
          <span>Surprise</span>
        </button>
        <button onClick={() => scrollTo(loveRef)} aria-label="Love">
          <FiHeart />
          <span>Love</span>
        </button>
        <button onClick={() => scrollTo(contactRef)} aria-label="Contact">
          <FiMail />
          <span>Contact</span>
        </button>
        <button onClick={() => navigate("/chat")} aria-label="Chat">
          <FiMessageCircle />
          <span>Chat</span>
        </button>
      </nav>
    </div>
  );
}