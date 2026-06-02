import Link from "next/link";
import { ArrowRight, Database, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-[#ededef] font-sans selection:bg-[#3b82f630] selection:text-[#3b82f6]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-6 max-w-7xl mx-auto flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="QueryForge Logo" 
            className="w-10 h-10 rounded-lg shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] object-cover border border-[#222]" 
          />
          <span className="font-bold text-xl tracking-tight">QueryForge</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-sm font-medium">
          <Link href="/docs" className="hidden sm:block text-[#a0a0aa] hover:text-white transition-colors">
            Documentation
          </Link>
          <Link href="#how-it-works" className="hidden sm:block text-[#a0a0aa] hover:text-white transition-colors">
            How it Works
          </Link>
          <Link
            href="/explore"
            className="bg-[#3b82f615] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-black px-4 py-2 rounded-md transition-all font-semibold whitespace-nowrap"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#222] text-xs font-mono text-[#3b82f6] mb-8 shadow-[2px_2px_0_0_rgba(59,130,246,0.3)]">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
          v1.0.0 is live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight animate-[slideUp_0.8s_ease-out_both]">
          Query anything. <br />
          <span className="text-[#3b82f6]">
            Visually.
          </span>
        </h1>
        <p 
          className="text-[#a0a0aa] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-[slideUp_0.8s_ease-out_both]"
          style={{ animationDelay: '100ms' }}
        >
          A premium, developer-grade visual query builder. Construct complex, nested database filters
          without writing a single line of raw query syntax.
        </p>
        <div 
          className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-4 animate-[slideUp_0.8s_ease-out_both]"
          style={{ animationDelay: '200ms' }}
        >
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 bg-[#3b82f6] text-black hover:bg-[#60a5fa] px-6 py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#222] hover:border-[#3b82f6] hover:text-[#3b82f6] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-[4px_4px_0_0_rgba(59,130,246,0.5)]"
          >
            View Documentation
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#050505] border-y border-[#111]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Senior Engineers</h2>
            <p className="text-[#a0a0aa] max-w-2xl mx-auto">
              Every design decision was made to ensure power and clarity. Experience density without clutter.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              className="bg-[#000000] p-8 rounded-xl border border-[#222] hover:border-[#3b82f6] transition-all duration-200 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#3b82f6] animate-[slideUp_0.8s_ease-out_both]"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-12 h-12 rounded-lg bg-[#3b82f615] border border-[#3b82f630] text-[#3b82f6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Live Query Preview</h3>
              <p className="text-[#a0a0aa] leading-relaxed text-sm">
                See the SQL, MongoDB, or GraphQL output update in real-time as you add conditions. Sharp, fast, zero lag.
              </p>
            </div>
            <div 
              className="bg-[#000000] p-8 rounded-xl border border-[#222] hover:border-[#3b82f6] transition-all duration-200 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#3b82f6] animate-[slideUp_0.8s_ease-out_both]"
              style={{ animationDelay: '250ms' }}
            >
              <div className="w-12 h-12 rounded-lg bg-[#3b82f615] border border-[#3b82f630] text-[#3b82f6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Spatial Nesting</h3>
              <p className="text-[#a0a0aa] leading-relaxed text-sm">
                Understand query depth at a glance. Depth is communicated through color, elevation, and sharp structural indentation.
              </p>
            </div>
            <div 
              className="bg-[#000000] p-8 rounded-xl border border-[#222] hover:border-[#3b82f6] transition-all duration-200 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#3b82f6] animate-[slideUp_0.8s_ease-out_both]"
              style={{ animationDelay: '400ms' }}
            >
              <div className="w-12 h-12 rounded-lg bg-[#3b82f615] border border-[#3b82f630] text-[#3b82f6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Schema-Driven</h3>
              <p className="text-[#a0a0aa] leading-relaxed text-sm">
                Connect your mock or real schemas, and QueryForge adapts its inputs and strict operators seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-[#555] text-sm border-t border-[#111] bg-black">
        <p>© 2026 QueryForge. All rights reserved.</p>
      </footer>
    </div>
  );
}
