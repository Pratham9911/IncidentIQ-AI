"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, XCircle, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { API_BASE } from '../../../lib/api';

export default function CreateIncident() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service: 'payment-gateway',
    priority: 'high',
    environment: 'production'
  });

  // Check login on load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    let projectId = localStorage.getItem("active_project_id");
    
    // Resilient Project ID backup resolution
    if (!projectId) {
      try {
        const res = await fetch(`${API_BASE}/api/projects/my-projects`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const projects = await res.json();
          if (projects && projects.length > 0) {
            projectId = projects[0].project_id.toString();
            localStorage.setItem("active_project_id", projectId);
          } else {
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
              projectId = data.project_id.toString();
              localStorage.setItem("active_project_id", projectId);
            }
          }
        }
      } catch (err) {
        console.error("Resilient project recovery failed", err);
      }
    }

    if (!projectId) {
      setErrorMsg("Please select or switch to a project workspace first.");
      setIsSaving(false);
      return;
    }

    try {
      // Map service values to backend constraints
      let backendService = "frontend";
      if (formData.service === "payment-gateway") backendService = "payment gateway";
      else if (formData.service === "auth-service") backendService = "auth";
      else if (formData.service === "core-db") backendService = "core db";

      // Map env values
      let backendEnv = "development";
      if (formData.environment === "production") backendEnv = "Production";
      else if (formData.environment === "staging") backendEnv = "staging";

      // Perform POST call
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/incidents`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          service: backendService,
          environment: backendEnv,
          priority: formData.priority
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to save incident");
      }

      setSuccessMsg(`Incident successfully logged and indexed into vector DB! (ID: INC-${data.logged_incident.incident_id})`);
      setFormData({
        title: '',
        description: '',
        service: 'payment-gateway',
        priority: 'high',
        environment: 'production'
      });
      
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during incident creation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Log New Incident</h1>
          <p className="text-gray-400 text-sm">Save a new system issue. Its embeddings will be automatically indexed for RAG vector search.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {successMsg}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors" 
              placeholder="e.g., Payment API returns 502 after deployment" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Service</label>
              <select 
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors appearance-none"
              >
                <option value="payment-gateway">Payment Gateway</option>
                <option value="auth-service">Auth Service</option>
                <option value="core-db">Core DB</option>
                <option value="frontend-web">Frontend Web</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Environment</label>
              <select 
                value={formData.environment}
                onChange={(e) => setFormData({...formData, environment: e.target.value})}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors appearance-none"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
            <div className="flex gap-4">
              {['Critical', 'High', 'Medium', 'Low'].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="priority" 
                    value={level.toLowerCase()}
                    checked={formData.priority === level.toLowerCase()}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="text-neon-blue bg-dark-bg border-dark-border focus:ring-neon-blue" 
                  />
                  <span className="text-sm text-gray-300">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description / Logs</label>
            <textarea 
              rows={6}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-colors font-mono text-sm resize-none" 
              placeholder="Paste error logs or describe the issue in detail..." 
            ></textarea>
          </div>

          <div className="pt-4 border-t border-dark-border flex gap-4">
            <button 
              type="button" 
              onClick={() => router.push("/")}
              className="flex-1 bg-dark-bg border border-dark-border text-white font-medium rounded-lg px-4 py-2.5 hover:bg-dark-border/50 transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving || !formData.description || !formData.title}
              className="flex-1 bg-neon-blue text-dark-bg font-bold rounded-lg px-4 py-2.5 hover:bg-neon-blue/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Incident
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
