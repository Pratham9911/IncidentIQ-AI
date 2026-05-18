"use client";

import React, { useState, useEffect } from "react";

export default function AIResultsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from Supabase
    // e.g. const { data, error } = await supabase.from('analysis_results').select('*').single();
    const fetchSupabaseData = async () => {
      // Simulating a quick network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data that mimics the expected Supabase schema
      const mockSupabaseResponse = {
        confidenceScore: "92%",
        summary: "The issue seems to be related to a timeout in the payment service after deployment. This is usually caused by misconfiguration in environment variables or dependency service unavailability.",
        rootCause: "Payment service is unable to connect to upstream service (Payment Gateway) causing 502 Bad Gateway.",
        recommendedFixes: [
          "Restart payment service pods",
          "Verify environment variables",
          "Check Payment Gateway health"
        ],
        similarIncidents: [
          {
            id: "INC-1142",
            title: "Payment API 502 after deployment",
            service: "Payment Service",
            similarity: "96%",
            date: "02 May 2024",
            fix: "Restarted payment service and updated timeout configuration."
          },
          {
            id: "INC-1087",
            title: "502 error due to gateway timeout",
            service: "Payment Service",
            similarity: "91%",
            date: "18 Apr 2024",
            fix: "Increased upstream timeout and restarted service."
          },
          {
            id: "INC-0954",
            title: "Payment failures - 502 bad gateway",
            service: "Payment Service",
            similarity: "88%",
            date: "05 Apr 2024",
            fix: "Fixed connection pool exhaustion and restarted pods."
          }
        ]
      };

      setData(mockSupabaseResponse);
      setIsLoading(false);
    };

    fetchSupabaseData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090c] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="text-[#6ee7b7] text-xl font-medium animate-pulse">Loading analysis data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090c] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-[1100px] rounded-[24px] border border-[#064e3b]/50 bg-[#0a0d14]/90 backdrop-blur-xl shadow-2xl p-6 md:p-8">
        
        {/* Left and Right decorative connectors */}
        <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-4 h-[2px] bg-pink-500/80 hidden md:block" />
        <div className="absolute right-[-24px] top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center text-orange-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>

        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-[#6ee7b7] font-bold text-xl tracking-wide uppercase">
            AI Results – Similar Incidents & Suggestions
          </h1>
        </div>

        {/* Inner Card Layout */}
        <div className="rounded-[20px] border border-[#1f2937]/80 bg-[#07090c] p-6 md:p-8 shadow-inner">
          
          {/* Inner Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-white font-semibold text-lg">
              AI Analysis Results
            </h2>
            <div className="bg-[#064e3b]/30 border border-[#059669]/40 text-[#34d399] px-4 py-1.5 rounded-md text-sm font-medium tracking-wide">
              Confidence Score: {data.confidenceScore}
            </div>
          </div>

          {/* Grid Layout for Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              
              {/* AI Summary Card */}
              <div className="bg-[#0f131c] border border-gray-800/60 rounded-xl p-5">
                <h3 className="text-white font-medium text-base mb-3">
                  AI Summary
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Probable Root Cause Card */}
              <div className="bg-[#0f131c] border border-gray-800/60 rounded-xl p-5">
                <h3 className="text-white font-medium text-base mb-3">
                  Probable Root Cause
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">
                  {data.rootCause}
                </p>
              </div>

              {/* Recommended Fix Card */}
              <div className="bg-[#0f131c] border border-gray-800/60 rounded-xl p-5">
                <h3 className="text-white font-medium text-base mb-4">
                  Recommended Fix
                </h3>
                <div className="space-y-2.5 text-[#94a3b8] text-sm mb-6">
                  {data.recommendedFixes.map((fix, idx) => (
                    <p key={idx}>{idx + 1}. {fix}</p>
                  ))}
                </div>
                <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                  Apply This Fix
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="bg-[#0f131c] border border-gray-800/60 rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-white font-medium text-base mb-5">
                Similar Past Incidents
              </h3>

              {/* Incidents List */}
              <div className="space-y-4 flex-1">
                {data.similarIncidents.map((incident, index) => (
                  <div key={index} className="bg-[#07090c] border border-gray-800/50 hover:border-gray-700/80 transition-colors rounded-xl p-5 flex flex-col gap-4">
                    
                    {/* Incident Top Info */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[#94a3b8] font-medium text-sm">
                          {incident.id}
                        </div>
                        <div className="text-gray-100 font-medium text-base mt-1.5">
                          {incident.title}
                        </div>
                        <div className="text-[#3b82f6] text-sm mt-1.5">
                          {incident.service}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 text-right">
                        <div className="text-[#34d399] font-medium text-sm tracking-wide">
                          Similarity: {incident.similarity}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Resolved on {incident.date}
                        </div>
                      </div>
                    </div>

                    {/* Incident Bottom Info */}
                    <div className="flex justify-between items-end mt-1">
                      <div className="text-[#94a3b8] text-sm max-w-[75%] leading-relaxed">
                        <span className="text-gray-500">Fix:</span> {incident.fix}
                      </div>
                      <button className="border border-[#2563eb]/50 text-[#3b82f6] hover:bg-[#2563eb]/10 px-6 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        View
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
