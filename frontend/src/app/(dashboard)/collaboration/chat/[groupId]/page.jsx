"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, Paperclip, Hash, Users, ShieldAlert, Sparkles, 
  Terminal, CheckCircle2, AlertTriangle, ArrowLeft, MoreVertical, Search
} from 'lucide-react';

// Mock Data
const GROUPS = [
  { id: 'g1', name: 'Backend Team', members: 14, unread: 0 },
  { id: 'g3', name: 'Auth Service Experts', members: 5, unread: 2 },
  { id: 'g5', name: 'Incident Response', members: 22, unread: 5 },
];

const MOCK_MESSAGES = [
  { id: 'm1', sender: 'System', avatar: 'S', type: 'incident', content: 'INC-1023: Payment API failing after deployment', severity: 'Critical', time: '10:05 AM', isSystem: true },
  { id: 'm2', sender: 'Sarah Chen', avatar: 'SC', role: 'DevOps Lead', type: 'text', content: 'Has anyone checked the new environment variables for the payment gateway worker?', time: '10:07 AM', isSystem: false },
  { id: 'm3', sender: 'Alex Rivera', avatar: 'AR', role: 'Backend Expert', type: 'text', content: 'Checking now. The deployment logs show a warning about missing STRIPE_WEBHOOK_SECRET.', time: '10:08 AM', isSystem: false },
  { id: 'm4', sender: 'Alex Rivera', avatar: 'AR', role: 'Backend Expert', type: 'code', content: 'Error: Webhook signature verification failed. Missing secret in production.env', language: 'bash', time: '10:10 AM', isSystem: false },
  { id: 'm5', sender: 'IncidentIQ AI', avatar: 'AI', role: 'AI Assistant', type: 'ai', content: 'Based on similar incident INC-0892, this is likely caused by the latest Terraform script dropping legacy secrets. I suggest rotating the secret and explicitly re-injecting it into the ECS task definition.', time: '10:11 AM', isSystem: false, isAI: true },
  { id: 'm6', sender: 'Sarah Chen', avatar: 'SC', role: 'DevOps Lead', type: 'solution', content: 'I have injected the new secret and restarted the workers. Payments are processing again. Monitoring error rates.', time: '10:15 AM', isSystem: false },
];

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId;
  
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const messagesEndRef = useRef(null);

  const activeGroup = GROUPS.find(g => g.id === groupId) || GROUPS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: `m${Date.now()}`,
      sender: 'You',
      avatar: 'Y',
      role: 'Engineer',
      type: 'text',
      content: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const convertToResolution = () => {
    alert("Knowledge Graph Conversion: Resolution Path for INC-1023 has been stored successfully!");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -mt-8 -mx-8 bg-dark-bg overflow-hidden border-t border-dark-border">
      
      {/* LEFT PANEL: Group List */}
      <div className="w-72 bg-dark-card/50 border-r border-dark-border flex flex-col">
        <div className="p-4 border-b border-dark-border flex items-center gap-3">
          <button onClick={() => router.push('/collaboration')} className="p-2 hover:bg-dark-border rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="font-semibold text-white">Your Groups</h2>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Filter..." 
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-white focus:border-neon-purple outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {GROUPS.map(group => (
            <button 
              key={group.id}
              onClick={() => router.push(`/collaboration/chat/${group.id}`)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                group.id === groupId ? 'bg-neon-purple/10 border border-neon-purple/30' : 'hover:bg-dark-border/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${group.id === groupId ? 'bg-neon-purple/20 text-neon-purple' : 'bg-dark-bg text-gray-400'}`}>
                  <Hash className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className={`text-sm font-medium truncate ${group.id === groupId ? 'text-white' : 'text-gray-300'}`}>{group.name}</div>
                  <div className="text-xs text-gray-500">{group.members} members</div>
                </div>
              </div>
              {group.unread > 0 && (
                <div className="bg-neon-blue text-dark-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {group.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER PANEL: Chat Interface */}
      <div className="flex-1 flex flex-col relative bg-[#0b0f19] bg-[url('/grid-pattern.svg')] bg-opacity-5">
        {/* Chat Header */}
        <div className="h-16 border-b border-dark-border bg-dark-card/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-neon-purple" />
            <div>
              <h2 className="font-bold text-white leading-tight">{activeGroup.name}</h2>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Incident Coordination
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={convertToResolution} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neon-blue border border-neon-blue/30 bg-neon-blue/10 rounded-lg hover:bg-neon-blue/20 transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> Convert to Knowledge
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-border rounded-lg"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.sender === 'You' ? 'ml-auto flex-row-reverse' : ''}`}>
              
              {!msg.isSystem && (
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm border ${
                  msg.isAI ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(176,38,255,0.2)]' : 
                  msg.sender === 'You' ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'bg-dark-card border-dark-border text-gray-300'
                }`}>
                  {msg.isAI ? <Sparkles className="w-5 h-5" /> : msg.avatar}
                </div>
              )}

              <div className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'} ${msg.isSystem ? 'w-full items-center' : ''}`}>
                
                {!msg.isSystem && (
                  <div className={`flex items-baseline gap-2 mb-1 ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium text-gray-200">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                    {msg.role && <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      msg.isAI ? 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple' : 'bg-dark-border/50 border-dark-border text-gray-400'
                    }`}>{msg.role}</span>}
                  </div>
                )}

                {/* Message Content Bubble */}
                <div className={`
                  ${msg.isSystem ? 'w-full max-w-md' : 'px-4 py-3 rounded-2xl'}
                  ${msg.sender === 'You' ? 'bg-neon-blue/10 border-neon-blue/20 text-blue-50 rounded-tr-sm' : 
                    msg.isSystem ? '' :
                    msg.isAI ? 'bg-neon-purple/10 border-neon-purple/30 text-purple-50 rounded-tl-sm shadow-[0_0_15px_rgba(176,38,255,0.05)]' :
                    'bg-dark-card border-dark-border text-gray-100 rounded-tl-sm'
                  }
                  border
                `}>
                  
                  {/* Render based on message type */}
                  {msg.type === 'text' && <p className="text-[15px] leading-relaxed">{msg.content}</p>}
                  {msg.type === 'ai' && <p className="text-[15px] leading-relaxed">{msg.content}</p>}
                  
                  {msg.type === 'incident' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 w-full">
                      <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Incident Alert</div>
                        <div className="text-sm font-medium text-white">{msg.content}</div>
                      </div>
                    </div>
                  )}

                  {msg.type === 'code' && (
                    <div className="bg-[#050816] border border-dark-border rounded-lg overflow-hidden mt-1">
                      <div className="bg-dark-card px-3 py-1.5 text-xs text-gray-400 flex items-center gap-2 border-b border-dark-border">
                        <Terminal className="w-3 h-3" /> {msg.language}
                      </div>
                      <pre className="p-3 text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                        {msg.content}
                      </pre>
                    </div>
                  )}

                  {msg.type === 'solution' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex gap-3 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <p className="text-sm text-emerald-50">{msg.content}</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-dark-card/80 backdrop-blur-md border-t border-dark-border z-10">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-dark-bg border border-dark-border rounded-xl p-2 focus-within:border-neon-purple focus-within:shadow-[0_0_15px_rgba(176,38,255,0.1)] transition-all">
            
            <button type="button" onClick={() => setShowIncidentModal(true)} className="p-2 text-gray-400 hover:text-neon-blue transition-colors rounded-lg hover:bg-neon-blue/10 flex-shrink-0" title="Attach Incident">
              <AlertTriangle className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-dark-border flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder={`Message #${activeGroup.name}...`}
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none max-h-32 outline-none py-2 px-2 min-h-[40px] text-[15px]"
              rows={1}
            />

            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="p-2.5 bg-neon-purple text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:bg-dark-border disabled:text-gray-500 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-gray-500">
            <strong>Pro tip:</strong> Type <span className="bg-dark-border px-1 py-0.5 rounded">/incident</span> to link an issue or <span className="bg-dark-border px-1 py-0.5 rounded">@ai</span> to ask IncidentIQ AI.
          </div>
        </div>

        {/* Attach Incident Modal Mock */}
        <AnimatePresence>
          {showIncidentModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-4">Attach Incident</h3>
                <input type="text" placeholder="Search by ID (e.g., INC-1023)" className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white mb-4" />
                <div className="space-y-2 max-h-40 overflow-y-auto mb-6">
                  <div className="p-3 border border-neon-blue/30 bg-neon-blue/10 rounded-lg cursor-pointer flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-neon-blue">INC-1023</div>
                      <div className="text-xs text-gray-300">Payment API failing</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-neon-blue" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowIncidentModal(false)} className="flex-1 bg-dark-bg border border-dark-border text-white py-2 rounded-lg">Cancel</button>
                  <button onClick={() => setShowIncidentModal(false)} className="flex-1 bg-neon-blue text-dark-bg font-bold py-2 rounded-lg">Attach</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* RIGHT PANEL: Details */}
      <div className="hidden xl:flex w-80 bg-dark-card/50 border-l border-dark-border flex-col p-6 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Group Info</h3>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Hash className="w-10 h-10 text-neon-purple" />
          </div>
          <h2 className="text-xl font-bold text-white">{activeGroup.name}</h2>
          <p className="text-sm text-gray-400 mt-1">DevOps • {activeGroup.members} members</p>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Linked Incident</h4>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-red-500">CRITICAL</span>
                <span className="text-xs font-mono text-gray-400">INC-1023</span>
              </div>
              <p className="text-sm text-white font-medium mb-3">Payment API failing after deployment</p>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-neon-blue text-dark-bg flex items-center justify-center text-xs font-bold border-2 border-dark-card z-20">SC</div>
                <div className="w-7 h-7 rounded-full bg-neon-purple text-white flex items-center justify-center text-xs font-bold border-2 border-dark-card z-10">AR</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Experts in Room</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-xs font-bold border border-neon-blue">SC</div>
                <div>
                  <div className="text-sm font-medium text-white">Sarah Chen</div>
                  <div className="text-xs text-gray-500">DevOps Lead</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center text-xs font-bold border border-neon-purple">AR</div>
                <div>
                  <div className="text-sm font-medium text-white">Alex Rivera</div>
                  <div className="text-xs text-gray-500">Backend Expert</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
