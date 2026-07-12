import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Registration.css';

// Bu "sakina:j212013s" ning SHA-256 hashi.
// Asl parol kodning hech qayerida ochiq matn holida yo'q.
const CORRECT_HASH = "f55adb6e984321eecaf48ae614b1cfcbc65573a7c8367d53a3ebf95ef38c60ef";

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function Registration() {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // Oddiy qiziquvchilarni chalg'itish uchun: right-click va DevTools tugmalarini bloklaydi.
  // Eslatma: bu haqiqiy himoya emas, faqat tasodifiy urinishlarni qiyinlashtiradi.
  useEffect(() => {
    const blockContextMenu = (e) => e.preventDefault();

    const blockKeys = (e) => {
      const key = e.key;
      const isF12 = key === "F12";
      const isInspect =
        (e.ctrlKey && e.shiftKey && (key === "I" || key === "i")) ||
        (e.ctrlKey && e.shiftKey && (key === "J" || key === "j")) ||
        (e.ctrlKey && e.shiftKey && (key === "C" || key === "c")) ||
        (e.ctrlKey && (key === "U" || key === "u")) ||
        (e.metaKey && e.altKey && (key === "I" || key === "i")); // Mac Cmd+Opt+I

      if (isF12 || isInspect) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  const handleRegister = async () => {
    const userName = name.trim().toLowerCase();
    const userKey = key.trim().toLowerCase();

    if (!userName || !userKey) {
      setError("❌ Ism va key ni to'ldiring!");
      return;
    }

    setChecking(true);
    const inputHash = await sha256(`${userName}:${userKey}`);
    setChecking(false);

    if (inputHash === CORRECT_HASH) {
      setError('');
      sessionStorage.setItem("sk_auth", "true");
      navigate("/home");
    } else {
      setError("❌ Name yoki Key noto'g'ri!");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };
return (
  <div className="registration-page">
  <div className="ambient-layer">
    {[...Array(20)].map((_, i) => (
      <span
        key={i}
        className={Math.random() > 0.5 ? "floating-heart" : "floating-petal"}
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${12 + Math.random() * 8}s`,
          animationDelay: `${Math.random() * 8}s`,
          fontSize: `${14 + Math.random() * 12}px`
        }}
      >
        {Math.random() > 0.5 ? "🤍" : "🌸"}
      </span>
    ))}

  </div>

    <div className="container">
      <h1 className="title">WELCOME TO MY SITE !</h1>

      <p className="text">THIS SITE CREATED ONLY FOR YOU ♥</p>

      <p className="test">I WANT TO KNOW IF IT'S REALLY YOU</p>

      <div className="reg__ota">

        <div className="name_ota">
          <label htmlFor="name">Enter your name</label>

          <input
            id="name"
            className="name-inp"
            type="password"
            placeholder="Enter your name here..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>

        <div className="key_ota">
          <label htmlFor="key">Enter the key I told you</label>

          <input
            id="key"
            className="key-inp"
            type="password"
            placeholder="Enter the key here..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>

        {error && <p className="reg-error">{error}</p>}

        <button onClick={handleRegister} disabled={checking}>
          {checking ? "Checking..." : "Enter"}
        </button>

      </div>
    </div>

  </div>
);
 
}

export default Registration;