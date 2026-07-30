import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/api/greeting")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data", err));
  }, []);

  return (
    <div>
      <h1>My Fullstack app</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
