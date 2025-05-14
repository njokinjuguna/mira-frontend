import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import ImageWithLoader from "../components/ImageWithLoader";

interface Message {
  type: "user" | "mira";
  text: string;
  intent?: string;
  data?: Array<{ image_url?: string; message?: string }>;
}

export default function MiraAssistant() {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [supportsSpeech, setSupportsSpeech] = useState<boolean>(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [micError, setMicError] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (!sessionId) {
      setSessionId(uuidv4());
    }
  }, [sessionId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupportsSpeech("speechSynthesis" in window);

      const SpeechRecognition =  window.SpeechRecognition || window.webkitSpeechRecognition;
  

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          console.log("🎤 Listening...");
          setMessages((prev) => [
            ...prev,
            { type: "mira", text: "🎤 Listening... Please speak now." },
          ]);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let spokenText = event.results[0][0].transcript;
          console.log("🗣️ Detected speech before correction:", spokenText);

          // 🔵 Smart replace common mistakes
          spokenText = spokenText.replace(/\bmirror\b/gi, "Mira");

          console.log("🛠️ Corrected speech:", spokenText);
          setQuery(spokenText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("🎤 Microphone error:", event.error);
          setMessages((prev) => [
            ...prev,
            { type: "mira", text: "❌ Microphone error. Please try again." },
          ]);
        };

        recognition.onend = () => {
          console.log("🎤 Microphone stopped listening.");
        };

        recognitionRef.current = recognition;
      }
    }

    // Initial Mira greeting
    setMessages([
      {
        type: "mira",
        text:
          "👋 Hello! I'm Mira, your personal interior design expert.\n\n" +
          "I can help you explore exclusive hand-drawn designs by Giancarlo Cundo.\n\n" +
          "🖼️ You can search for beautiful sketches/images like:\n" +
          "- Kitchen\n" +
          "- Table & Chairs\n" +
          "- Sitting Area\n" +
          "- Chimney\n" +
          "- Library\n" +
          "- Garden\n" +
          "- Shop Interiors\n" +
          "- Staircase\n" +
          "- Beds\n" +
          "Type or say something like: *'Show me kitchen sketches'* or *'I want a modern garden design'* — and I'll show you!",
      },
    ]);
  }, []);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    // Scroll to bottom automatically when messages are updated
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function speak(text: string) {
    if (!supportsSpeech) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 250));
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function askMira(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setLoading(true);

  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mira`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, session_id: sessionId }), // Include session ID
      });
      const data = await res.json();
      const intent = data.type;
      const results = data.results || [];

      let text =
        data.answer || data.message || "Here's what I found!";
      if (!data.answer && results.length === 1 && results[0].message) {
        text = results[0].message;
      }

      if (supportsSpeech) speak(text);

      setMessages((prev) => [
        ...prev,
        { type: "mira", text, intent, data: results },
      ]);
    } catch {
      const text = "⚠️ Failed to connect to Mira.";
      if (supportsSpeech) speak(text);
      setMessages((prev) => [...prev, { type: "mira", text }]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  }

  function handleMicClick() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setMicError(false); // Reset mic error if it starts successfully
      } catch (error) {
        console.error("🎤 Microphone error:", error);
        setMicError(true); // If error, show mic error message
      }
    }
  }

  function handleEditClick(text: string) {
    setQuery(text);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative">
        <h1 className="text-xl font-bold text-center text-gray-700 mb-2">
          Mira The Interior Design Expert
        </h1>

        <div
          ref={chatContainerRef}
          className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mb-4 relative"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              } gap-2 items-start`}
            >
              {msg.type === "mira" && (
                <Image
                  src="/mira-avatar.png"
                  alt="Mira"
                  width={150}
                  height={150}
                  className="shadow-lg hover:scale-105 hover:opacity-90 transition-transform duration-300 ease-in-out rounded-3xl"
                />
              )}
              <div
                className={`rounded-xl px-4 py-2 text-sm max-w-md whitespace-pre-wrap ${
                  msg.type === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.intent === "search" && Array.isArray(msg.data) ? (
                  msg.data[0]?.image_url ? (
                    <div className="grid grid-cols-1 gap-4">

{msg.data
  ?.filter((img): img is { image_url: string; caption: string } => 
    img.image_url !== undefined && 'caption' in img
  )
  .map((img, i) => (
    <ImageWithLoader key={i} img={img} />
  ))}
                    </div>
                  ) : (
                    <p>{msg.data[0]?.message || msg.text}</p>
                  )
                ) : (
                  <span
                    onClick={() =>
                      msg.type === "user" && handleEditClick(msg.text)
                    }
                    className="cursor-pointer hover:underline"
                  >
                    {msg.text}
                  </span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-sm text-gray-400 italic">
              <Image
                src="/mira-avatar.png"
                alt="Mira"
                width={24}
                height={24}
                className="rounded-full"
              />
              Mira is thinking...
            </div>
          )}
        </div>

        <form onSubmit={askMira} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-white text-gray-800 placeholder-gray-500 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Ask Mira something..."
          />
          <button
            type="button"
            onClick={handleMicClick}
            className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 text-black"
          >
            🎤
          </button>
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800"
            disabled={loading}
          >
                    {loading ? "..." : "Send"}
          </button>
        </form>
        {micError && (
  <p className="text-center text-sm text-red-500 mt-2">
    ⚠️ Please allow microphone access to use voice input.
  </p>
)}

      </div>
    </div>
  )
}
