"use client";
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  AlertCircle, CheckCircle2, Clock, Zap, Users, ShieldAlert, ChevronRight, Activity
} from 'lucide-react';

const kpiData = [
  { label: 'Open Incidents', value: '24', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Critical Incidents', value: '3', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
  { label: 'Resolved (7d)', value: '142', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'AI Assisted Fixes', value: '89%', icon: Zap, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
  { label: 'Expert Escalations', value: '12', icon: Users, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
  { label: 'Avg Resolution Time', value: '45m', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

const trendData = [
  { name: 'Mon', incidents: 12 },
  { name: 'Tue', incidents: 19 },
  { name: 'Wed', incidents: 15 },
  { name: 'Thu', incidents: 22 },
  { name: 'Fri', incidents: 30 },
  { name: 'Sat', incidents: 10 },
  { name: 'Sun', incidents: 8 },
];

const severityData = [
  { name: 'Critical', value: 3, color: '#ef4444' },
  { name: 'High', value: 12, color: '#f97316' },
  { name: 'Medium', value: 35, color: '#eab308' },
  { name: 'Low', value: 50, color: '#3b82f6' },
];

const recentIncidents = [
  { id: 'INC-8092', title: 'Payment API returns 502', service: 'Payment Gateway', severity: 'Critical', status: 'Investigating', time: '10m ago', similarity: '94%' },
  { id: 'INC-8091', title: 'High CPU on auth workers', service: 'Auth Service', severity: 'High', status: 'Assigned', time: '1h ago', similarity: '82%' },
  { id: 'INC-8090', title: 'Database connection pool maxed', service: 'Core DB', severity: 'Critical', status: 'Resolved', time: '3h ago', similarity: '99%' },
  { id: 'INC-8089', title: 'Cache eviction spike', service: 'Redis Cache', severity: 'Medium', status: 'Resolved', time: '5h ago', similarity: '76%' },
];

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col justify-between hover:border-dark-border/80 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-400 text-sm font-medium">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-dark-card border border-dark-border rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-neon-blue" />
            Incident Trend (7 Days)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} />
                <YAxis stroke="#6b7280" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#00f3ff' }}
                />
                <Line type="monotone" dataKey="incidents" stroke="#00f3ff" strokeWidth={3} dot={{ r: 4, fill: '#0b0f19', stroke: '#00f3ff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00f3ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-neon-purple" />
            Severity Distribution
          </h3>
          <div className="h-[300px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">100</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {severityData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-dark-border flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neon-blue" />
            Recent Incidents
          </h3>
          <button className="text-sm text-neon-blue hover:text-neon-blue/80 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 border-b border-dark-border text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Incident</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">AI Similarity</th>
                <th className="p-4 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {recentIncidents.map((incident, idx) => (
                <tr key={idx} className="hover:bg-dark-border/20 transition-colors">
                  <td className="p-4 font-mono text-sm text-neon-purple">{incident.id}</td>
                  <td className="p-4 font-medium text-white">{incident.title}</td>
                  <td className="p-4 text-sm text-gray-400">{incident.service}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      incident.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      incident.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 text-sm ${
                      incident.status === 'Resolved' ? 'text-emerald-400' : 'text-neon-blue'
                    }`}>
                      {incident.status === 'Resolved' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {incident.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-dark-bg rounded-full h-1.5 max-w-[60px]">
                        <div className="bg-neon-blue h-1.5 rounded-full" style={{ width: incident.similarity }}></div>
                      </div>
                      <span className="text-xs text-neon-blue font-mono">{incident.similarity}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 text-right">{incident.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
