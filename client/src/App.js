import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState("strategy"); // ✅ NEW

  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat", { // 🔁 Change URL to your backend if local
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,                // ✅ Message (clean version)
          advisor: selectedAdvisor       // ✅ Send selected advisor
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, data.reply]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "vab", content: "⚠️ Error fetching response." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const clearChat = () => setMessages([]);

  const downloadChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.role === "user" ? "You" : "VAB"}: ${msg.content}`)
      .join("\n\n");
    const blob = new Blob([chatContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat.txt";
    link.click();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <header className="header">
        💼 Virtual Advisory Board
        <div className="header-controls">
          <select
            value={selectedAdvisor}
            onChange={(e) => setSelectedAdvisor(e.target.value)}
            className="advisor-select" // 💄 Optional: style in CSS
          >
            <option value="strategy">🧠 Strategy</option>
            <option value="marketing">📣 Marketing</option>
            <option value="operations">⚙️ Operations</option>
            <option value="finance">💰 Finance</option>
          </select>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button onClick={clearChat}>🗑️ Clear</button>
          <button onClick={downloadChat}>💾 Export</button>
        </div>
      </header>

      <div className="chat-window">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-bubble ${msg.role === "user" ? "user" : "vab"}`}
          >
            <span className="sender">{msg.role === "user" ? "You" : "VAB"}</span>
            <div className="message-text">{msg.content}</div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            VAB is typing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder={`Ask your ${selectedAdvisor} advisor...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default App;
