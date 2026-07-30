"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, ShieldAlert, PhoneOff, PhoneCall, CheckCheck } from "lucide-react";

export default function ChatPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [jobTitle, setJobTitle] = useState("AC Repair Task");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [counterpartyName, setCounterpartyName] = useState("Worker Rohan");
  
  useEffect(() => {
    // Seed default messages
    setMessages([
      { id: 1, sender: 'them', text: "Hi, I have applied for the AC technician job. I have 3 years of experience.", time: "10:15 AM" },
      { id: 2, sender: 'me', text: "Great! Are you available to start immediately near MG Road?", time: "10:16 AM" },
      { id: 3, sender: 'them', text: "Yes, I am close by. Call me at 9876543210 to align on the gate code.", time: "10:17 AM" },
    ]);

    // Check query or simulate if booking is confirmed
    // If we are worker or employer, if app status is accepted -> booking is confirmed
    const hash = window.location.search;
    if (hash.includes("confirmed=true")) {
      setBookingConfirmed(true);
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputText("");

    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'them',
          text: "Understood. Let me know when you approve the hire.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Regular expression to identify and hide phone numbers in messages
  const filterPhoneNumbers = (text: string) => {
    if (bookingConfirmed) return text;
    // Replace 10-digit indian mobile numbers
    const phoneRegex = /(\+91[\-\s]?)?[0-9]{10}/g;
    return text.replace(phoneRegex, "[CONTACT NUMBER HIDDEN - Confirm hiring to unlock phone numbers]");
  };

  return (
    <div className="min-h-screen text-slate-200 bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <header className="glass-panel border-b border-white/5 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-white text-sm">{counterpartyName}</h1>
            <p className="text-[10px] text-slate-400">Gig: {jobTitle}</p>
          </div>
        </div>

        {bookingConfirmed ? (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
            <PhoneCall className="w-3.5 h-3.5" /> Contact unlocked
          </div>
        ) : (
          <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
            <PhoneOff className="w-3.5 h-3.5" /> Numbers Gated
          </div>
        )}
      </header>

      {/* Safety Notice */}
      {!bookingConfirmed && (
        <div className="bg-violet-950/20 border-b border-violet-500/10 p-3 text-center text-[10px] text-violet-400 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-violet-400" />
          Safety Protocol: Exchange of phone numbers and email is restricted until hiring is finalized and escrow is locked.
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-md p-4 rounded-2xl text-xs space-y-1.5 shadow ${
                  isMe 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'glass-panel text-slate-200 border border-white/5 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{filterPhoneNumbers(msg.text)}</p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-violet-300" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer message composer input */}
      <footer className="glass-panel border-t border-white/5 p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-4">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 glass-input text-xs"
          />
          <button 
            type="submit"
            className="bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-violet-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}
