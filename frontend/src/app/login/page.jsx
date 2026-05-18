"use client";
import React, { useState } from "react";
import { EyeOff, Eye } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

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
                                {/* Central stylized figure */}
                                <circle cx="50" cy="40" r="12" className="fill-[#3b82f6]" />
                                <path d="M28 72 C28 50, 72 50, 72 72" className="stroke-[#3b82f6]" strokeWidth="8" strokeLinecap="round" />

                                {/* 8 surrounding dots */}
                                {/* Top */}
                                <circle cx="50" cy="8" r="6" className="fill-[#60a5fa]" />
                                {/* Bottom */}
                                <circle cx="50" cy="92" r="6" className="fill-[#60a5fa]" />
                                {/* Left */}
                                <circle cx="8" cy="50" r="6" className="fill-[#60a5fa]" />
                                {/* Right */}
                                <circle cx="92" cy="50" r="6" className="fill-[#60a5fa]" />

                                {/* Top Left */}
                                <circle cx="20" cy="20" r="4.5" className="fill-[#2563eb]" />
                                {/* Top Right */}
                                <circle cx="80" cy="20" r="4.5" className="fill-[#2563eb]" />
                                {/* Bottom Left */}
                                <circle cx="20" cy="80" r="4.5" className="fill-[#2563eb]" />
                                {/* Bottom Right */}
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

                {/* Welcome */}
                <div className="text-center mt-8">
                    <h2 className="text-2xl font-semibold text-white tracking-wide">
                        Welcome Back!
                    </h2>
                    <p className="text-[#94a3b8] text-[15px] mt-2">
                        Login to continue
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-5" onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = "/";
                }}>
                    {/* User Name */}
                    <div className="space-y-2">
                        <label className="text-[#cbd5e1] text-[15px] block">
                            User Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Atharv Thorat"
                            className="w-full bg-[#0d1326] border border-[#1e293b] rounded-xl px-4 py-3.5 text-white placeholder-[#64748b] text-[15px] outline-none focus:border-[#3b82f6] transition-colors"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[#cbd5e1] text-[15px] block">
                            Email
                        </label>
                        <input
                            type="email"
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
                        {/* Forgot Password */}
                        <div className="flex justify-end pt-1">
                            <button
                                type="button"
                                className="text-[#3b82f6] hover:text-[#60a5fa] text-[14px] transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-[16px] font-medium py-3.5 rounded-xl transition-colors"
                        >
                            Login
                        </button>
                    </div>

                    {/* Signup */}
                    <div className="text-center text-[#94a3b8] text-[14.5px] pt-4">
                        Don't have an account?{" "}
                        <button type="button" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors">
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
