import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase.js";
import "../styles/Registration.css";

// Existing Sakina login hash.
const SAKINA_HASH =
  "f55adb6e984321eecaf48ae614b1cfcbc65573a7c8367d53a3ebf95ef38c60ef";

// Generate this value locally and add it to .env as VITE_OWNER_LOGIN_HASH.
const OWNER_HASH = (import.meta.env.VITE_OWNER_LOGIN_HASH || "")
  .trim()
  .toLowerCase();

async function sha256(text) {
  const encodedText = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedText);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function Registration() {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const ambientItems = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => {
        const isHeart = Math.random() > 0.5;

        return {
          id: index,
          className: isHeart ? "floating-heart" : "floating-petal",
          symbol: isHeart ? "🤍" : "🌸",
          left: `${Math.random() * 100}%`,
          duration: `${12 + Math.random() * 8}s`,
          delay: `${Math.random() * 8}s`,
          size: `${14 + Math.random() * 12}px`,
        };
      }),
    []
  );

  useEffect(() => {
    const blockContextMenu = (event) => event.preventDefault();

    const blockKeys = (event) => {
      const pressedKey = event.key;
      const isF12 = pressedKey === "F12";
      const isInspect =
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(pressedKey.toLowerCase())) ||
        (event.ctrlKey && pressedKey.toLowerCase() === "u") ||
        (event.metaKey &&
          event.altKey &&
          pressedKey.toLowerCase() === "i");

      if (isF12 || isInspect) {
        event.preventDefault();
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
    if (checking) return;

    const userName = name.trim().toLowerCase();
    const firebasePassword = key.trim();
    const userKey = firebasePassword.toLowerCase();

    if (!userName || !userKey) {
      setError("❌ Ism va key ni to'ldiring!");
      return;
    }

    setChecking(true);
    setError("");

    try {
      const inputHash = await sha256(`${userName}:${userKey}`);

      let account = null;

      if (inputHash === SAKINA_HASH) {
        account = {
          role: "sakina",
          displayName: "Sakina",
          email: "sakina@privatechat.app",
          destination: "/home",
        };
      } else if (OWNER_HASH && inputHash === OWNER_HASH) {
        account = {
          role: "me",
          displayName: "Abdulloh",
          email: "abdulloh@privatechat.app",
          destination: "/chat",
        };
      }

      if (!account) {
        setError("❌ Name yoki Key noto'g'ri!");
        return;
      }

      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(
        auth,
        account.email,
        firebasePassword
      );

      sessionStorage.setItem("sk_auth", "true");
      sessionStorage.setItem("sk_role", account.role);
      sessionStorage.setItem("sk_name", account.displayName);

      navigate(account.destination, { replace: true });
    } catch (loginError) {
      console.error("Login tekshiruvida xatolik:", loginError);
      setError(
        loginError?.code === "auth/invalid-credential"
          ? "❌ Firebase password mos kelmadi!"
          : "❌ Login tekshirilmadi. Internetni tekshiring."
      );
    } finally {
      setChecking(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRegister();
    }
  };

  return (
    <div className="registration-page">
      <div className="ambient-layer" aria-hidden="true">
        {ambientItems.map((item) => (
          <span
            key={item.id}
            className={item.className}
            style={{
              left: item.left,
              animationDuration: item.duration,
              animationDelay: item.delay,
              fontSize: item.size,
            }}
          >
            {item.symbol}
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
              onChange={(event) => setName(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              disabled={checking}
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
              onChange={(event) => setKey(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              disabled={checking}
            />
          </div>

          {error && <p className="reg-error">{error}</p>}

          <button type="button" onClick={handleRegister} disabled={checking}>
            {checking ? "Checking..." : "Enter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registration;
