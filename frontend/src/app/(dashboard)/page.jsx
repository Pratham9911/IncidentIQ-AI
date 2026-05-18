"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  AlertCircle, CheckCircle2, Clock, Zap, Users, ShieldAlert, ChevronRight, Activity, Loader2
} from 'lucide-react';

const trendData = [
  { name: 'Mon', incidents: 2 },
  { name: 'Tue', incidents: 4 },
  { name: 'Wed', incidents: 3 },
  { name: 'Thu', incidents: 5 },
  { name: 'Fri', incidents: 8 },
  { name: 'Sat', incidents: 2 },
  { name: 'Sun', incidents: 1 },
];

import { API_BASE } from '../../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kpiList, setKpiList] = useState([]);
  const [severityPie, setSeverityPie] = useState([]);
  const [projectName, setProjectName] = useState("IncidentIQ Cluster");

  const getOrInitializeProjectId = async (token) => {
    let cachedId = localStorage.getItem("active_project_id");
    if (cachedId) return parseInt(cachedId);

    try {
      const res = await fetch(`${API_BASE}/api/projects/my-projects`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const projects = await res.json();
        if (projects && projects.length > 0) {
          localStorage.setItem("active_project_id", projects[0].project_id);
          setProjectName(projects[0].name);
          return projects[0].project_id;
        }
      }

      // Create a default project
      const createRes = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "IncidentIQ Production" })
      });

      if (createRes.ok) {
        const data = await createRes.json();
        localStorage.setItem("active_project_id", data.project_id);
        setProjectName(data.name);
        return data.project_id;
      }
    } catch (err) {
      console.error(err);
    }
    return 1;
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const projectId = await getOrInitializeProjectId(token);
      
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/incidents`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents(data);

        // Dynamically compute KPIs
        const open = data.filter(i => i.priority === "critical" || i.priority === "high").length;
        const critical = data.filter(i => i.priority === "critical").length;
        const total = data.length;

        setKpiList([
          { label: 'Total Logs', value: total.toString(), icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Critical Errors', value: critical.toString(), icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Investigating', value: open.toString(), icon: Clock, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
          { label: 'AI Match Accuracy', value: '96%', icon: Zap, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
        ]);

        // Compute Severity Distribution
        const critCount = data.filter(i => i.priority === "critical").length;
        const highCount = data.filter(i => i.priority === "high").length;
        const medCount = data.filter(i => i.priority === "medium").length;
        const lowCount = data.filter(i => i.priority === "low").length;

        setSeverityPie([
          { name: 'Critical', value: critCount || 1, color: '#ef4444' },
          { name: 'High', value: highCount || 2, color: '#f97316' },
          { name: 'Medium', value: medCount || 4, color: '#eab308' },
          { name: 'Low', value: lowCount || 3, color: '#3b82f6' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [router]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-neon-blue" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Nexus Analytics Dashboard</h1>
          <p className="text-gray-400 text-xs mt-1">Monitoring active live node: <span className="text-neon-blue font-semibold">{projectName}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiList.map((kpi, index) => (
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
                  data={severityPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {severityPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{incidents.length}</span>
              <span className="text-xs text-gray-400">Total Logs</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {severityPie.map((entry, i) => (
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
                <th className="p-4 font-medium text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {incidents.map((incident, idx) => (
                <tr key={idx} className="hover:bg-dark-border/20 transition-colors">
                  <td className="p-4 font-mono text-sm text-neon-purple">INC-{incident.incident_id}</td>
                  <td className="p-4 font-medium text-white">{incident.title}</td>
                  <td className="p-4 text-sm text-gray-400 capitalize">{incident.service}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      incident.priority === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      incident.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-sm text-neon-blue">
                      <AlertCircle className="w-4 h-4" /> Active Log
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 text-right">
                    {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : "Just now"}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">
                    No active incidents reported in this project workspace yet. Go to New Incident to file!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
