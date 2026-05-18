"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, AlertTriangle, SearchCode, Users, Network, Activity, ShieldAlert, LogOut, MessageSquare, ChevronDown
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create-incident', label: 'New Incident', icon: AlertTriangle },
  { path: '/chat', label: 'RAG Chat', icon: MessageSquare },
  { path: '/collaboration', label: 'Workspaces', icon: Users },
];

import { API_BASE } from '../../lib/api';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userNameInitials, setUserNameInitials] = useState("U");

  // Fetch projects on load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Set initials from cached name
    const cachedName = localStorage.getItem("user_name") || "User";
    setUserNameInitials(cachedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());

    const loadProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/projects/my-projects`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          
          const cachedProjId = localStorage.getItem("active_project_id");
          if (data.length > 0) {
            const currentProj = data.find(p => p.project_id.toString() === cachedProjId) || data[0];
            setActiveProject(currentProj);
            localStorage.setItem("active_project_id", currentProj.project_id);
            localStorage.setItem("active_project_name", currentProj.name);
          }
        }
      } catch (err) {
        console.error("Error loading workspace projects", err);
      }
    };

    loadProjects();
  }, [pathname, router]);

  const handleSelectProject = (project) => {
    localStorage.setItem("active_project_id", project.project_id);
    localStorage.setItem("active_project_name", project.name);
    setActiveProject(project);
    setShowDropdown(false);
    
    // Broadcast change and reload page context
    window.location.reload();
  };

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("active_project_id");
    localStorage.removeItem("active_project_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-border bg-dark-card/50 backdrop-blur-xl flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-dark-border">
          <ShieldAlert className="w-8 h-8 text-neon-blue mr-3" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">INCIDENTIQ</h1>
            <span className="text-neon-blue text-xs font-semibold tracking-widest">NEXUS</span>
          </div>
        </div>

        {/* Workspace Switcher Selector directly under logo */}
        {activeProject && (
          <div className="px-4 pt-4 relative">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-2">
              Active Workspace
            </div>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between gap-2 bg-dark-bg/60 border border-dark-border px-3 py-2.5 rounded-xl text-sm font-medium hover:border-neon-blue transition-colors text-white"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></span>
                <span className="truncate">{activeProject.name}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-dark-border text-[9px] text-gray-500 font-semibold uppercase tracking-wider">
                  Switch Workspace
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {projects.map((proj) => (
                    <button
                      key={proj.project_id}
                      onClick={() => handleSelectProject(proj)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-dark-border/50 transition-colors flex items-center gap-2 text-white"
                    >
                      <span className="w-1.5 h-1.5 bg-neon-blue rounded-full"></span>
                      <span className="truncate">{proj.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30 shadow-[0_0_15px_rgba(0,243,255,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-border/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-neon-blue' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-border/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen">
        {/* Topbar */}
        <header className="h-20 border-b border-dark-border bg-dark-card/30 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold capitalize">
              {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]?.replace('-', ' ')}
            </h2>
            
            {activeProject && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-dark-bg border border-dark-border px-3 py-1.5 rounded-full text-gray-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Active Context: <strong className="text-white">{activeProject.name}</strong></span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-neon-blue/20 border border-neon-blue flex items-center justify-center text-neon-blue font-bold text-sm">
              {userNameInitials}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8 relative z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
