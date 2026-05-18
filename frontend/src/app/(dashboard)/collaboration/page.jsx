"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, ShieldAlert, Activity, CheckCircle2, XCircle, Search, 
  MessageSquare, Star, Award, TrendingUp, Filter, Plus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const MOCK_GROUPS = [
  { id: 'g1', name: 'Backend Team', description: 'Core API and microservices discussion', category: 'Engineering', members: 14, lastActivity: '2m ago', isJoined: true },
  { id: 'g2', name: 'AI Engineers', description: 'Model tuning and embedding strategies', category: 'Data Science', members: 8, lastActivity: '1h ago', isJoined: false },
  { id: 'g3', name: 'Auth Service Experts', description: 'Authentication and JWT token handling', category: 'Security', members: 5, lastActivity: '3h ago', isJoined: true },
  { id: 'g4', name: 'Database Support', description: 'Query optimization and connection pools', category: 'Infrastructure', members: 11, lastActivity: '5m ago', isJoined: false },
  { id: 'g5', name: 'Incident Response', description: 'P0 and P1 live incident coordination', category: 'DevOps', members: 22, lastActivity: 'Just now', isJoined: true },
];

const MOCK_REQUESTS = [
  { id: 'r1', user: 'Sarah Chen', dept: 'DevOps', skill: 'Kubernetes', group: 'Backend Team', time: '10m ago' },
  { id: 'r2', user: 'James Wilson', dept: 'Frontend', skill: 'React', group: 'Auth Service Experts', time: '1h ago' },
  { id: 'r3', user: 'Elena Rodriguez', dept: 'Data Science', skill: 'PyTorch', group: 'AI Engineers', time: '2h ago' },
];

const MOCK_EXPERTS = [
  { id: 'e1', name: 'Alex Rivera', role: 'Senior Staff Engineer', rating: 4.9, solved: 142, responseTime: '< 5m', badges: ['Top Solver', 'Backend Expert'], avatar: 'AR' },
  { id: 'e2', name: 'Sarah Chen', role: 'DevOps Lead', rating: 4.8, solved: 98, responseTime: '< 10m', badges: ['Infrastructure', 'Security Team'], avatar: 'SC' },
  { id: 'e3', name: 'Dr. Emily Wei', role: 'AI Researcher', rating: 5.0, solved: 45, responseTime: '< 15m', badges: ['AI Specialist'], avatar: 'EW' },
  { id: 'e4', name: 'Michael Chang', role: 'Database Admin', rating: 4.7, solved: 210, responseTime: '< 2m', badges: ['Database Expert', 'Top Solver'], avatar: 'MC' },
];

const ANALYTICS_DATA = [
  { name: 'Mon', messages: 120, resolved: 14 },
  { name: 'Tue', messages: 210, resolved: 22 },
  { name: 'Wed', messages: 180, resolved: 19 },
  { name: 'Thu', messages: 320, resolved: 35 },
  { name: 'Fri', messages: 280, resolved: 28 },
  { name: 'Sat', messages: 90, resolved: 8 },
  { name: 'Sun', messages: 70, resolved: 5 },
];

export default function CollaborationHub() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');
  const [searchQuery, setSearchQuery] = useState('');

  const TABS = [
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'requests', label: 'Join Requests', icon: UserPlus, adminOnly: true },
    { id: 'experts', label: 'Experts Directory', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: Activity },
  ];

  const handleGroupClick = (groupId, isJoined) => {
    if (isJoined || isAdmin) {
      router.push(`/collaboration/chat/${groupId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Admin Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-neon-purple" />
            Collaboration Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">Connect with experts and resolve incidents in real-time.</p>
        </div>

        <div className="flex items-center gap-4 bg-dark-card border border-dark-border px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-gray-300">Admin Mode</span>
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isAdmin ? 'bg-neon-purple' : 'bg-dark-bg border border-dark-border'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isAdmin ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-dark-card border border-dark-border p-1 rounded-xl overflow-x-auto">
        {TABS.filter(tab => !tab.adminOnly || isAdmin).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-neon-purple/20 text-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.15)] border border-neon-purple/30' 
                : 'text-gray-400 hover:text-white hover:bg-dark-border/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'requests' && isAdmin && (
              <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded-full ml-1 border border-red-500/20">
                {MOCK_REQUESTS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* GROUPS TAB */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search groups..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-neon-purple outline-none transition-colors"
                  />
                </div>
                {isAdmin && (
                  <button className="bg-neon-purple/20 text-neon-purple border border-neon-purple/50 px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neon-purple/30 transition-all shadow-[0_0_15px_rgba(176,38,255,0.15)]">
                    <Plus className="w-4 h-4" /> Create Group
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map((group) => (
                  <div key={group.id} className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-neon-purple/50 transition-all group relative overflow-hidden flex flex-col h-full">
                    {group.isJoined && !isAdmin && (
                      <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-emerald-500/30">
                        JOINED
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-dark-bg p-2.5 rounded-lg border border-dark-border group-hover:border-neon-purple/30 group-hover:bg-neon-purple/5 transition-colors">
                        <Users className="w-5 h-5 text-gray-400 group-hover:text-neon-purple" />
                      </div>
                      <span className="text-xs text-gray-500 bg-dark-bg px-2 py-1 rounded border border-dark-border">{group.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-400 mb-6 flex-1">{group.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-dark-border pt-4 mt-auto">
                      <div className="flex gap-4">
                        <div className="text-xs text-gray-500"><span className="text-gray-300 font-medium">{group.members}</span> members</div>
                        <div className="text-xs text-gray-500">{group.lastActivity}</div>
                      </div>
                      
                      {group.isJoined || isAdmin ? (
                        <button 
                          onClick={() => handleGroupClick(group.id, group.isJoined)}
                          className="text-neon-purple hover:text-white transition-colors text-sm font-medium"
                        >
                          Open Chat
                        </button>
                      ) : (
                        <button className="text-neon-blue hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                          <UserPlus className="w-4 h-4" /> Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REQUESTS TAB (ADMIN ONLY) */}
          {activeTab === 'requests' && isAdmin && (
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-dark-border">
                <h3 className="text-lg font-semibold text-white">Pending Join Requests</h3>
                <p className="text-sm text-gray-400">Review and approve access to specialized incident groups.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-bg/50 border-b border-dark-border text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Department</th>
                      <th className="p-4 font-medium">Top Skill</th>
                      <th className="p-4 font-medium">Requested Group</th>
                      <th className="p-4 font-medium">Time</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {MOCK_REQUESTS.map((req) => (
                      <tr key={req.id} className="hover:bg-dark-border/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple flex items-center justify-center text-neon-purple font-bold text-xs">
                              {req.user.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-white">{req.user}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{req.dept}</td>
                        <td className="p-4">
                          <span className="bg-dark-bg px-2 py-1 rounded border border-dark-border text-xs text-gray-300">
                            {req.skill}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-neon-purple">{req.group}</td>
                        <td className="p-4 text-sm text-gray-500">{req.time}</td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <button className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors border border-transparent hover:border-emerald-400/30">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/30">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXPERTS TAB */}
          {activeTab === 'experts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Subject Matter Experts</h3>
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-dark-card border border-dark-border px-3 py-1.5 rounded-lg">
                  <Filter className="w-4 h-4" /> Filter by Skill
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_EXPERTS.map((expert) => (
                  <div key={expert.id} className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-start hover:border-neon-blue/40 transition-colors group">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-dark-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                      <span className="text-xl font-bold text-white">{expert.avatar}</span>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-lg font-bold text-white">{expert.name}</h4>
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-sm font-bold border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {expert.rating}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">{expert.role}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {expert.badges.map(badge => (
                          <span key={badge} className="bg-dark-bg border border-neon-blue/30 text-neon-blue text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                            <ShieldAlert className="w-3 h-3" /> {badge}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-dark-border pt-4">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Incidents Solved</div>
                          <div className="text-lg font-semibold text-white">{expert.solved}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Response</div>
                          <div className="text-lg font-semibold text-emerald-400">{expert.responseTime}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-neon-purple"/> Total Messages (7d)</div>
                  <div className="text-3xl font-bold text-white">1,190</div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% from last week</div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Issues Resolved via Chat</div>
                  <div className="text-3xl font-bold text-white">131</div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> 84% Success Rate</div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <div className="text-sm text-gray-400 mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-neon-blue"/> Active Participants</div>
                  <div className="text-3xl font-bold text-white">42</div>
                  <div className="text-xs text-gray-500 mt-2">Across 12 departments</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-white mb-6">Group Activity Heatmap</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ANALYTICS_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} />
                        <YAxis stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }} cursor={{fill: '#1f2937'}} />
                        <Bar dataKey="messages" fill="#b026ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-white mb-6">Resolutions Over Time</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ANALYTICS_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} />
                        <YAxis stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0b0f19', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
