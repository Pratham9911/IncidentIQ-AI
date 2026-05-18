"use client";
import React, { useState, useEffect } from "react";
import { API_BASE } from "../../lib/api";
import { EyeOff, Eye, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Status states
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Auto-clear messages when switching modes
    useEffect(() => {
        setErrorMsg("");
        setSuccessMsg("");
    }, [isSignUp]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            if (isSignUp) {
                // Register User Flow
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.detail || "Registration failed");
                }

                setSuccessMsg("Registration successful! Please log in below.");
                setIsSignUp(false); // Switch to login mode
                setPassword("");    // Reset password
            } else {
                // Login User Flow
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.detail || "Invalid email or password");
                }

                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("user_email", email);
                
                // Fetch profile to cache user name
                try {
                    const profileRes = await fetch(`${API_BASE}/api/me`, {
                        headers: { "Authorization": `Bearer ${data.access_token}` }
                    });
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        localStorage.setItem("user_name", profileData.name || "User");
                    }
                } catch (_) {}

                window.location.href = "/";
            }
        } catch (err) {
            setErrorMsg(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4 font-sans relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Main Card */}
            <div className="relative w-full max-w-[440px] rounded-[24px] border border-[#1e293b]/60 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-2xl p-10 pt-12 pb-12">
                {/* Logo Section */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center gap-4">
                        {/* SVG Logo */}
                        <div className="w-16 h-16 relative flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="40" r="12" className="fill-[#3b82f6]" />
                                <path d="M28 72 C28 50, 72 50, 72 72" className="stroke-[#3b82f6]" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="50" cy="8" r="6" className="fill-[#60a5fa]" />
                                <circle cx="50" cy="92" r="6" className="fill-[#60a5fa]" />
                                <circle cx="8" cy="50" r="6" className="fill-[#60a5fa]" />
                                <circle cx="92" cy="50" r="6" className="fill-[#60a5fa]" />
                                <circle cx="20" cy="20" r="4.5" className="fill-[#2563eb]" />
                                <circle cx="80" cy="20" r="4.5" className="fill-[#2563eb]" />
                                <circle cx="20" cy="80" r="4.5" className="fill-[#2563eb]" />
                                <circle cx="80" cy="80" r="4.5" className="fill-[#2563eb]" />
                            </svg>
                        </div>

                        {/* Title */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-3xl font-semibold text-white flex items-center gap-1.5 tracking-wide">
                                IncidentIQ <span className="text-[#3b82f6] font-bold">AI</span>
                            </h1>
                            <p className="text-[#94a3b8] text-[13px] tracking-wide mt-0.5">
                                AI-Powered Incident Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full max-w-[280px] h-px bg-gradient-to-r from-transparent via-[#1e293b] to-transparent mt-8"></div>
                </div>

                {/* Welcome Heading */}
                <div className="text-center mt-8">
                    <h2 className="text-2xl font-semibold text-white tracking-wide">
                        {isSignUp ? "Create Account" : "Welcome Back!"}
                    </h2>
                    <p className="text-[#94a3b8] text-[15px] mt-2">
                        {isSignUp ? "Sign up to start tracking incidents" : "Login to continue"}
                    </p>
                </div>

                {/* Notification banners */}
                {errorMsg && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl">
                        {successMsg}
                    </div>
                )}

                {/* Form */}
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    
                    {/* User Name (Only in Registration Mode) */}
                    {isSignUp && (
                        <div className="space-y-2">
                            <label className="text-[#cbd5e1] text-[15px] block">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Atharv Thorat"
                                className="w-full bg-[#0d1326] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-[#64748b] text-[15px] outline-none focus:border-[#3b82f6] transition-colors"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[#cbd5e1] text-[15px] block">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-[#0d1326] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-[#64748b] text-[15px] outline-none focus:border-[#3b82f6] transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-[#cbd5e1] text-[15px] block">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#0d1326] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-[#64748b] text-[15px] outline-none focus:border-[#3b82f6] transition-colors tracking-widest"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-[16px] font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isSignUp ? "Sign Up" : "Login"
                            )}
                        </button>
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className="text-center text-[#94a3b8] text-[14.5px] pt-4">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors"
                        >
                            {isSignUp ? "Login" : "Sign up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
