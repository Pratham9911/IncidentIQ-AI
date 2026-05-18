"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, AlertTriangle, SearchCode, Users, Network, Activity, ShieldAlert, LogOut, MessageSquare
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create-incident', label: 'New Incident', icon: AlertTriangle },
  { path: '/repo-intelligence', label: 'Repo Intelligence', icon: SearchCode },
  { path: '/expert-routing', label: 'Expert Routing', icon: Users },
  { path: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { path: '/collaboration', label: 'Collaboration Hub', icon: MessageSquare },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

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
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-border/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen">
        {/* Topbar */}
        <header className="h-20 border-b border-dark-border bg-dark-card/30 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold capitalize">
            {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]?.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-neon-blue/20 border border-neon-blue flex items-center justify-center text-neon-blue font-bold text-sm">
              JD
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
