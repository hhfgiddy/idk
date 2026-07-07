import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/Registration.css';

function Registration () {
  const [name, setName] = useState ('');
  const [key, setKey] = useState ('');
  const navigate = useNavigate ();

  // Enter tugmasi bosilganda ishlaydi
  const handleRegister = () => {
    const userName = name.trim ().toLowerCase ();
    const userKey = key.trim ().toLowerCase ();

    if (
  userName.toLowerCase() === "sakina" &&
  userKey.toLowerCase() === "j212013s"
) {
  navigate("/home");
} else {
  setError("❌ Name yoki Key noto'g'ri!");
}
  };

  return (
    <div className="container">
      <h1 className="title">WELCOME TO MY SITE !</h1>

      <p className="text">
        THIS SITE CREATED ONLY FOR YOU ♥
      </p>

      <p className="test">
        I WANT TO KNOW IF IT'S REALLY YOU
      </p>

      <div className="reg__ota">
        <div className="name_ota">
          <label htmlFor="name">
            Enter your name
          </label>

          <br />

          <input
            id="name"
            className="name-inp"
            type="text"
            placeholder="Enter your name here..."
            value={name}
            onChange={e => setName (e.target.value)}
            autoComplete="off"
          />
        </div>

        <br />

        <div className="key_ota">
          <label htmlFor="key">
            Enter the key I told you
          </label>

          <br />

          <input
            id="key"
            className="key-inp"
            type="password"
            placeholder="Enter the key here..."
            value={key}
            onChange={e => setKey (e.target.value)}
          />
        </div>

        <br />

        <button onClick={handleRegister}>
          Enter
        </button>
      </div>
    </div>
  );
}

export default Registration;
