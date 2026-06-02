import Link from "next/link";
import { ArrowRight, Database, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#ededef] font-sans selection:bg-[#00d2ff20] selection:text-[#00d2ff]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00d2ff] flex items-center justify-center font-bold text-[#0a0a0f]">
            QF
          </div>
          <span className="font-bold text-xl tracking-tight">QueryForge</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="#features" className="text-[#a0a0aa] hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-[#a0a0aa] hover:text-white transition-colors">
            How it Works
          </Link>
          <Link
            href="/explore"
            className="bg-[#00d2ff15] text-[#00d2ff] hover:bg-[#00d2ff25] px-4 py-2 rounded-md transition-all font-semibold"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111118] border border-[#1e1e2c] text-xs font-mono text-[#00d2ff] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
          v1.0.0 is live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Query anything. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-[#6e56cf]">
            Visually.
          </span>
        </h1>
        <p className="text-[#a0a0aa] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          A premium, developer-grade visual query builder. Construct complex, nested database filters
          without writing a single line of raw query syntax.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="flex items-center gap-2 bg-[#00d2ff] text-[#0a0a0f] hover:bg-[#33dbff] px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02]"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="flex items-center gap-2 bg-[#111118] border border-[#2a2a38] hover:border-[#3a3a4a] text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            View Documentation
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#111118] border-y border-[#1e1e2c]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Senior Engineers</h2>
            <p className="text-[#a0a0aa] max-w-2xl mx-auto">
              Every design decision was made to ensure power and clarity. Experience density without clutter.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0f] p-8 rounded-2xl border border-[#1e1e2c] hover:border-[#6e56cf] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#6e56cf14] text-[#6e56cf] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Query Preview</h3>
              <p className="text-[#a0a0aa] leading-relaxed">
                See the SQL, MongoDB, or GraphQL output update in real-time as you add conditions.
              </p>
            </div>
            <div className="bg-[#0a0a0f] p-8 rounded-2xl border border-[#1e1e2c] hover:border-[#00d2ff] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#00d2ff14] text-[#00d2ff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Spatial Nesting</h3>
              <p className="text-[#a0a0aa] leading-relaxed">
                Understand query depth at a glance. Depth is communicated through color, elevation, and indentation.
              </p>
            </div>
            <div className="bg-[#0a0a0f] p-8 rounded-2xl border border-[#1e1e2c] hover:border-[#23c55e] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[#23c55e1a] text-[#23c55e] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Schema-Driven</h3>
              <p className="text-[#a0a0aa] leading-relaxed">
                Connect your mock or real schemas, and QueryForge adapts its inputs and operators seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-[#70707a] text-sm border-t border-[#1e1e2c] bg-[#0a0a0f]">
        <p>© 2026 QueryForge. All rights reserved.</p>
      </footer>
    </div>
  );
}
