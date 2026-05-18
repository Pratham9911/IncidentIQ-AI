"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Database, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { API_BASE } from '../../../lib/api';

function formatMarkdownText(text) {
  if (!text) return null;
  const tokenRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      tokens.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      tokens.push(<em key={`em-${match.index}`}>{match[3]}</em>);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.flatMap((token, tokenIndex) => {
    if (typeof token !== 'string') return token;
    return token.split('\n').flatMap((line, lineIndex, arr) => {
      if (lineIndex === arr.length - 1) return line;
      return [line, <br key={`br-${tokenIndex}-${lineIndex}`} />];
    });
  });
}

export default function RagChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "IncidentIQ AI",
      avatar: "AI",
      role: "SRE Expert",
      content: "Hello! I am your personal SRE RAG Copilot. Ask me any diagnostic question, and I will search your active project's pgvector incident log database to give you exact resolution plans based on historical matches.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAI: true
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeProjectName, setActiveProjectName] = useState(() => {
    if (typeof window === 'undefined') return 'IncidentIQ Cluster';
    return localStorage.getItem('active_project_name') || 'IncidentIQ Cluster';
  });
  const [topKChunks, setTopKChunks] = useState([]); // Visual display of chunks fed to LLM

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message
    const userMsg = {
      id: `m_user_${Date.now()}`,
      sender: "You",
      avatar: "Y",
      role: "Engineer",
      content: query,
      time: timestamp,
      isAI: false
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsAiLoading(true);
    setTopKChunks([]);

    const token = localStorage.getItem("access_token");
    const projectId = localStorage.getItem("active_project_id") || "1";

    try {
      // 2. Execute Semantic RAG query
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/incidents/search?query=${encodeURIComponent(query)}&limit=3`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Connection or lookup error");

      const data = await res.json();

      // 3. Extract top-k matching database chunks
      const chunks = data.results || [];
      setTopKChunks(chunks);

      // 4. Append AI response with correlation insights
      const aiMsg = {
        id: `m_ai_${Date.now()}`,
        sender: "IncidentIQ AI",
        avatar: "AI",
        role: "SRE Expert",
        content: data.ai_recommendation,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: true,
        similarCount: chunks.length
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `m_err_${Date.now()}`,
        sender: "IncidentIQ AI",
        avatar: "AI",
        role: "SRE Expert",
        content: "I searched your pgvector store but failed to connect. Please check that your FastAPI backend is running and that you have logged at least one incident using the 'New Incident' form first!",
        time: timestamp,
        isAI: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] relative overflow-hidden">
      
      {/* LEFT AREA: Chat Panel */}
      <div className="flex-1 bg-dark-card/40 border border-dark-border rounded-2xl flex flex-col overflow-hidden backdrop-blur-md shadow-2xl">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-dark-border bg-dark-card/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-neon-purple animate-pulse" />
            <div>
              <h2 className="font-bold text-white text-sm">Personal RAG Copilot</h2>
              <span className="text-[10px] text-neon-blue font-semibold tracking-wider uppercase">Active Context: {activeProjectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Database className="w-3.5 h-3.5" /> Supabase Vector DB Connected
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-3xl ${!msg.isAI ? 'ml-auto flex-row-reverse' : ''}`}>
              
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm border ${
                msg.isAI ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(176,38,255,0.2)]' : 
                'bg-neon-blue/20 border-neon-blue text-neon-blue'
              }`}>
                {msg.isAI ? <Sparkles className="w-5 h-5" /> : msg.avatar}
              </div>

              <div className={`flex flex-col ${!msg.isAI ? 'items-end' : 'items-start'}`}>
                
                <div className={`flex items-baseline gap-2 mb-1 ${!msg.isAI ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium text-gray-200">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    msg.isAI ? 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple' : 'bg-dark-border/50 border-dark-border text-gray-400'
                  }`}>{msg.role}</span>
                </div>

                <div className={`
                  px-4 py-3 rounded-2xl border text-[14.5px] leading-relaxed
                  ${!msg.isAI ? 'bg-neon-blue/10 border-neon-blue/20 text-blue-50 rounded-tr-sm' : 
                    'bg-[#0d1326]/90 border-neon-purple/30 text-purple-50 rounded-tl-sm whitespace-pre-wrap font-sans shadow-[0_0_15px_rgba(176,38,255,0.03)]'
                  }
                `}>
                  {msg.isAI ? formatMarkdownText(msg.content) : msg.content}
                </div>
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple text-neon-purple flex items-center justify-center font-bold text-sm">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-200">IncidentIQ AI</span>
                  <span className="text-xs text-gray-500">Searching database...</span>
                </div>
                <div className="px-4 py-3 bg-[#0d1326] border border-neon-purple/30 text-purple-50 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neon-purple" />
                  <span>Scanning pgvector embeddings & generating senior SRE fix...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-dark-card/50 border-t border-dark-border">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl p-2 focus-within:border-neon-purple transition-all">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder="Ask AI (e.g., 'How do we fix stripe api failures or connection pool timeouts?')..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none max-h-32 outline-none py-2 px-3 text-[14.5px] min-h-[40px]"
              rows={1}
            />

            <button 
              type="submit" 
              disabled={!inputText.trim() || isAiLoading}
              className="p-3 bg-neon-purple text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:bg-dark-border disabled:text-gray-500 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT AREA: RAG DB Chunks fed to AI Prompt Context */}
      <div className="w-96 bg-dark-card/30 border border-dark-border rounded-2xl p-6 flex flex-col overflow-hidden backdrop-blur-md">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-neon-blue" />
          RAG Context Chunks (Top-K)
        </h3>

        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          These historical incident snippets were retrieved by calculating cosine similarities against your Gemini query embeddings and injected into the Groq Llama-3.3 prompt template.
        </p>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {topKChunks.map((chunk, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0c1020] border border-dark-border hover:border-neon-blue/40 rounded-xl p-4 transition-colors space-y-3"
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-mono text-neon-purple font-semibold">INCIDENT INDEX #{chunk.incident_id || i+1}</span>
                <span className="bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded font-bold">
                  {Math.round((1 - chunk.distance) * 100)}% Similarity
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white leading-tight">{chunk.title}</h4>
              <p className="text-xs text-gray-400 line-clamp-3 bg-dark-bg p-2 rounded border border-dark-border/40 font-mono">
                {chunk.description}
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                <span className="bg-dark-border/50 text-gray-300 px-2 py-1 rounded-full uppercase tracking-[0.1em]">{chunk.service}</span>
                <span className="bg-dark-border/50 text-gray-300 px-2 py-1 rounded-full uppercase tracking-[0.1em]">{chunk.environment}</span>
                <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded-full uppercase tracking-[0.1em]">{chunk.priority}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 gap-2">
                <span>Created by <strong className="text-white">{chunk.creator_name || 'Unknown'}</strong></span>
                <span>{chunk.created_at ? new Date(chunk.created_at).toLocaleString() : 'Unknown time'}</span>
              </div>
            </motion.div>
          ))}

          {topKChunks.length === 0 && !isAiLoading && (
            <div className="h-full border border-dashed border-dark-border rounded-xl flex flex-col items-center justify-center p-6 text-center bg-dark-card/10">
              <Layout className="w-8 h-8 text-gray-600 mb-2" />
              <h4 className="text-xs font-semibold text-gray-400">Context Window Empty</h4>
              <p className="text-[10px] text-gray-600 mt-1 max-w-[200px]">
                Type a query in the copilot chat box to retrieve semantic database correlations.
              </p>
            </div>
          )}

          {isAiLoading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="bg-dark-card/25 border border-dark-border rounded-xl p-4 space-y-3">
                  <div className="h-3 w-1/3 bg-dark-border rounded"></div>
                  <div className="h-4 w-3/4 bg-dark-border rounded"></div>
                  <div className="h-12 w-full bg-dark-border rounded"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
