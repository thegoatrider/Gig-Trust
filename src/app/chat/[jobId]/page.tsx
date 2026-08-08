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
    <div className="min-h-screen bg-[#E5E7EB] sm:py-6 flex justify-center text-gray-900">
      {/* Phone Emulator wrapper */}
      <div className="w-full max-w-md bg-[#F6F7F9] min-h-screen sm:min-h-[850px] sm:max-h-[900px] sm:rounded-[40px] shadow-2xl border border-gray-200/80 flex flex-col relative overflow-hidden">
        
        {/* Top Notch simulation */}
        <div className="hidden sm:block absolute top-0 inset-x-0 h-7 bg-black z-50 rounded-t-[40px] flex items-center justify-between px-6 text-white text-[10px] font-semibold">
          <span>9:41</span>
          <div className="w-20 h-4 bg-[#111111] rounded-full mx-auto -mt-0.5" />
          <div className="flex gap-1">
            <span>5G</span>
            <span className="w-3 h-2 border border-white rounded-sm" />
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 sm:top-7 z-40 bg-[#F6F7F9] border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-extrabold text-gray-900 text-xs">{counterpartyName}</h1>
              <p className="text-[9px] text-gray-450 font-semibold">Gig: {jobTitle}</p>
            </div>
          </div>

          {bookingConfirmed ? (
            <div className="text-[9px] text-emerald-705 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <PhoneCall className="w-3 h-3 text-emerald-600" /> Unlocked
            </div>
          ) : (
            <div className="text-[9px] text-amber-705 bg-amber-50 border border-amber-205 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <PhoneOff className="w-3 h-3 text-amber-600" /> Gated
            </div>
          )}
        </header>

        {/* Safety Notice */}
        {!bookingConfirmed && (
          <div className="bg-violet-50 border-b border-violet-100 p-2.5 text-center text-[9px] text-violet-750 flex items-center justify-center gap-1.5 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            Exchange of phone numbers is restricted until hiring is confirmed.
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F6F7F9]">
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                    isMe 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed font-semibold">{filterPhoneNumbers(msg.text)}</p>
                  <div className="flex items-center justify-end gap-1 text-[8px] text-gray-400">
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-violet-200" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer message composer input */}
        <footer className="bg-white border-t border-gray-100 p-3.5 sticky bottom-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 glass-input text-xs rounded-full py-2 px-4 bg-gray-50 border-gray-205"
            />
            <button 
              type="submit"
              className="bg-violet-600 hover:bg-violet-755 text-white p-2.5 rounded-full transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
