"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, ShieldAlert, Activity, CheckCircle2, XCircle, Search,
  MessageSquare, Star, Award, TrendingUp, Filter, Plus, Loader2
} from 'lucide-react';

import { API_BASE } from '../../../lib/api';

export default function CollaborationHub() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');
  const [searchQuery, setSearchQuery] = useState('');

  // Real backend integration states
  const [projectsList, setProjectsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all projects (Groups)
  const fetchGroups = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/search?query=${searchQuery}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjectsList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending join requests for the active project
  const fetchJoinRequests = async () => {
    const token = localStorage.getItem("access_token");
    const activeProjId = localStorage.getItem("active_project_id");
    if (!token || !activeProjId) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${activeProjId}/join-requests`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === 'requests' && isAdmin) {
      fetchJoinRequests();
    }
  }, [activeTab, isAdmin]);

  // Request to join a project
  const handleJoinRequest = async (projectId) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/join-request`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(`Join request successfully sent!`);
        fetchGroups();
      } else {
        setFeedbackMsg(data.detail || "Failed to send request");
      }
    } catch (err) {
      setFeedbackMsg("Connection error");
    }

    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  // Approve or Reject Join Request
  const handleRespondToRequest = async (requestId, approved) => {
    const token = localStorage.getItem("access_token");
    const activeProjId = localStorage.getItem("active_project_id");
    if (!token || !activeProjId) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${activeProjId}/join-requests/${requestId}/respond`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: approved ? "approved" : "rejected" })
      });
      if (res.ok) {
        setFeedbackMsg(approved ? "Request approved successfully!" : "Request rejected.");
        fetchJoinRequests();
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  // Create Project Flow
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newProjectName })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("active_project_id", data.project_id);
        setNewProjectName("");
        setShowCreateModal(false);
        setFeedbackMsg("Project successfully created!");
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleGroupClick = (projectId, userStatus) => {
    if (userStatus === "member" || isAdmin) {
      localStorage.setItem("active_project_id", projectId);
      const proj = projectsList.find(p => p.project_id === projectId);
      if (proj) {
        localStorage.setItem("active_project_name", proj.name);
      }
      // Redirect to personal RAG Chat workspace!
      router.push("/chat");
    }
  };

  const TABS = [
    { id: 'groups', label: 'Workspaces', icon: Users },
    { id: 'requests', label: 'Join Requests', icon: UserPlus, adminOnly: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Admin Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-neon-blue" />
            Workspace Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">Search, join, or create workspaces to collaborate on incident response.</p>
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

      {feedbackMsg && (
        <div className="bg-neon-purple/10 border border-neon-purple/30 text-neon-purple p-4 rounded-xl text-sm">
          {feedbackMsg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-dark-card border border-dark-border p-1 rounded-xl overflow-x-auto">
        {TABS.filter(tab => !tab.adminOnly || isAdmin).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-neon-purple/20 text-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.15)] border border-neon-purple/30'
                : 'text-gray-400 hover:text-white hover:bg-dark-border/50'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'requests' && isAdmin && (
              <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded-full ml-1 border border-red-500/20">
                {pendingRequests.length}
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

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-neon-purple/20 text-neon-purple border border-neon-purple/50 px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neon-purple/30 transition-all shadow-[0_0_15px_rgba(176,38,255,0.15)]"
                >
                  <Plus className="w-4 h-4" /> Create Group
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectsList.map((project) => (
                    <div key={project.project_id} className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-neon-purple/50 transition-all group relative overflow-hidden flex flex-col h-full">
                      {project.user_status === "member" && (
                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-emerald-500/30">
                          JOINED
                        </div>
                      )}
                      {project.user_status.startsWith("requested") && (
                        <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-amber-500/30">
                          PENDING
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-dark-bg p-2.5 rounded-lg border border-dark-border group-hover:border-neon-purple/30 group-hover:bg-neon-purple/5 transition-colors">
                          <Users className="w-5 h-5 text-gray-400 group-hover:text-neon-purple" />
                        </div>
                        <span className="text-xs text-gray-500 bg-dark-bg px-2 py-1 rounded border border-dark-border">
                          {project.user_role === "admin" ? "Admin" : "Engineering"}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-400 mb-6 flex-1">
                        Active community workspace moderated by {project.owner_name}. Request entry to coordinate incident resolution paths.
                      </p>

                      <div className="flex items-center justify-between border-t border-dark-border pt-4 mt-auto">
                        <div className="flex gap-4">
                          <div className="text-xs text-gray-500">Owner: <span className="text-gray-300 font-medium">{project.owner_name}</span></div>
                        </div>

                        {project.user_status === "member" || isAdmin ? (
                          <button
                            onClick={() => handleGroupClick(project.project_id, project.user_status)}
                            className="text-neon-purple hover:text-white transition-colors text-sm font-medium"
                          >
                            Open Chat
                          </button>
                        ) : project.user_status.startsWith("requested") ? (
                          <span className="text-amber-500 text-xs font-semibold">Requested</span>
                        ) : (
                          <button
                            onClick={() => handleJoinRequest(project.project_id)}
                            className="text-neon-blue hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <UserPlus className="w-4 h-4" /> Join Request
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Requested Group</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {pendingRequests.map((req) => (
                      <tr key={req.request_id} className="hover:bg-dark-border/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple flex items-center justify-center text-neon-purple font-bold text-xs">
                              {req.user_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-white">{req.user_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">{req.user_email}</td>
                        <td className="p-4">
                          <span className="bg-dark-bg px-2 py-1 rounded border border-dark-border text-xs text-amber-500">
                            Pending
                          </span>
                        </td>
                        <td className="p-4 font-medium text-neon-purple">Current Project Workspace</td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRespondToRequest(req.request_id, true)}
                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors border border-transparent hover:border-emerald-400/30"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(req.request_id, false)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/30"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingRequests.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                          No pending join requests found for your active project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-white mb-4">Create New Project Group</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Infrastructure Team"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-purple transition-colors"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-dark-bg border border-dark-border text-white py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-neon-purple text-white py-2 rounded-lg font-bold text-sm hover:bg-purple-600 transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
