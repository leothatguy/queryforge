"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Terminal, History, FileJson, ChevronRight } from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("intro");
  
  const navItems = [
    { id: "intro", label: "Introduction", icon: BookOpen },
    { id: "nodes", label: "Nodes & Groups", icon: Layers },
    { id: "operators", label: "Operators & Symbols", icon: Terminal },
    { id: "presets", label: "Presets & History", icon: History },
    { id: "export", label: "Import / Export", icon: FileJson },
  ];

  return (
    <div className="min-h-screen bg-black text-[#ededef] font-sans selection:bg-[#3b82f630] selection:text-[#3b82f6]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-6 max-w-7xl mx-auto border-b border-[#222]">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/logo.png" 
            alt="QueryForge Logo" 
            className="w-10 h-10 rounded-lg shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] object-cover border border-[#222]" 
          />
          <span className="font-bold text-xl tracking-tight">QueryForge Docs</span>
        </Link>
        <Link
          href="/explore"
          className="flex items-center gap-2 text-sm text-[#a0a0aa] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to App
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 px-4 md:px-8 py-12">
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                  isActive 
                    ? "bg-[#3b82f615] text-[#3b82f6] border border-[#3b82f630] translate-x-2" 
                    : "text-[#a0a0aa] hover:bg-[#1a1a1a] hover:text-white hover:translate-x-1"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 pb-24 min-h-[500px]">
          {activeSection === "intro" && <IntroSection />}
          {activeSection === "nodes" && <NodesSection />}
          {activeSection === "operators" && <OperatorsSection />}
          {activeSection === "presets" && <PresetsSection />}
          {activeSection === "export" && <ExportSection />}
        </main>
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <div className="space-y-6 animate-[panelFadeIn_0.4s_ease-out_both]">
      <h1 className="text-4xl font-bold tracking-tight mb-8">What is QueryForge?</h1>
      <p className="text-lg text-[#a0a0aa] leading-relaxed">
        QueryForge is a powerful, visual query builder that allows you to construct complex database queries 
        without writing a single line of raw code. It translates a visual tree of rules and groups into multiple 
        dialects in real-time, including <strong className="text-white">SQL</strong>, <strong className="text-white">MongoDB</strong>, 
        and <strong className="text-white">GraphQL</strong>.
      </p>
      
      <div className="bg-[#0a0a0f] border border-[#222] rounded-xl p-8 mt-8 hover:shadow-[4px_4px_0_0_#3b82f6] transition-shadow">
        <h3 className="text-xl font-bold text-white mb-4">Core Philosophy</h3>
        <p className="text-[#a0a0aa] leading-relaxed">
          The core philosophy behind QueryForge is that writing deeply nested logical conditions (like <code className="bg-[#111] px-1.5 py-0.5 rounded text-[#3b82f6]">AND</code> / <code className="bg-[#111] px-1.5 py-0.5 rounded text-[#3b82f6]">OR</code> statements) 
          is error-prone when done by hand. QueryForge provides a neo-brutalist, highly responsive graphical interface 
          to safely construct, validate, and test these conditions against your data schema instantly.
        </p>
      </div>
    </div>
  );
}

function NodesSection() {
  return (
    <div className="space-y-6 animate-[panelFadeIn_0.4s_ease-out_both]">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Managing Nodes & Groups</h1>
      <p className="text-lg text-[#a0a0aa] leading-relaxed mb-8">
        The query canvas is built entirely out of two concepts: <strong>Rules</strong> and <strong>Groups</strong>. 
        Together, they form a tree structure that can represent infinitely complex logic.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0f] border border-[#222] rounded-xl p-6 hover:shadow-[4px_4px_0_0_#3b82f6] hover:-translate-y-1 transition-all">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="bg-[#3b82f620] text-[#3b82f6] p-2 rounded-md font-mono text-sm">+</span> 
            Rules (Leaves)
          </h3>
          <p className="text-[#a0a0aa] text-sm leading-relaxed mt-4">
            A rule evaluates a single field against a value using an operator. For example: <br/><br/>
            <code className="text-white bg-[#111] px-2 py-1 rounded">Age &gt; 18</code><br/>
            <code className="text-white bg-[#111] px-2 py-1 rounded mt-2 inline-block">Status = "Active"</code><br/><br/>
            You can add rules by clicking the <strong>+</strong> (Add Rule) icon in the toolbar.
          </p>
        </div>
        <div className="bg-[#0a0a0f] border border-[#222] rounded-xl p-6 hover:shadow-[4px_4px_0_0_#23c55e] hover:-translate-y-1 transition-all">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="bg-[#23c55e20] text-[#23c55e] p-2 rounded-md font-mono text-sm">Folder +</span> 
            Groups (Branches)
          </h3>
          <p className="text-[#a0a0aa] text-sm leading-relaxed mt-4">
            A group contains multiple rules or other nested groups, wrapped in an <code className="text-white bg-[#111] px-1 rounded">AND</code> or <code className="text-white bg-[#111] px-1 rounded">OR</code> condition.<br/><br/>
            Use groups when you need to evaluate multiple conditions together. Groups are color-coded by depth so you never get lost in your own logic.
          </p>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mt-12 mb-4">Rearranging Nodes</h3>
      <p className="text-[#a0a0aa] leading-relaxed">
        QueryForge supports full drag-and-drop. Simply click and hold the textured handle icon on the far left of any rule or group, 
        and drag it into a different group to restructure your query on the fly!
      </p>
    </div>
  );
}

function OperatorsSection() {
  const operators = [
    { label: "Equals", sym: "=", desc: "Strict equality check. Applies to strings, numbers, booleans, dates." },
    { label: "Not equals", sym: "!=", desc: "Inverse equality. Evaluates true if values differ." },
    { label: "Contains", sym: "⊃", desc: "Checks if a string exists within the target string. (SQL LIKE)" },
    { label: "Starts with", sym: "^", desc: "Checks if a string begins with the given sequence." },
    { label: "Greater/Less than", sym: "> / <", desc: "Numeric and date comparisons." },
    { label: "In array", sym: "[]", desc: "Evaluates true if the field matches ANY value in the provided list." },
    { label: "Between", sym: "↔", desc: "Checks if a number or date falls between two inclusive bounds." },
    { label: "Regex", sym: ".*", desc: "Evaluates the field against a complex Regular Expression." },
    { label: "Is null / Not null", sym: "∅ / !∅", desc: "Checks for the absolute presence or absence of data." },
  ];

  return (
    <div className="space-y-6 animate-[panelFadeIn_0.4s_ease-out_both]">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Operators & Symbols</h1>
      <p className="text-lg text-[#a0a0aa] leading-relaxed mb-8">
        QueryForge uses mathematical symbols to keep the visual canvas clean and compact. 
        Here is a breakdown of what each symbol means when building a rule.
      </p>

      <div className="bg-[#0a0a0f] border border-[#222] rounded-xl overflow-hidden hover:shadow-[4px_4px_0_0_#3b82f6] transition-shadow duration-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111] border-b border-[#222]">
              <th className="p-4 font-semibold text-white">Symbol</th>
              <th className="p-4 font-semibold text-white">Name</th>
              <th className="p-4 font-semibold text-[#a0a0aa] hidden sm:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op, i) => (
              <tr key={i} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors group">
                <td className="p-4">
                  <span className="text-[#3b82f6] font-bold text-lg group-hover:scale-110 transition-transform inline-block">{op.sym}</span>
                </td>
                <td className="p-4 font-medium text-white">
                  {op.label}
                  <div className="sm:hidden text-xs text-[#a0a0aa] mt-1 font-normal">{op.desc}</div>
                </td>
                <td className="p-4 text-sm text-[#a0a0aa] leading-relaxed hidden sm:table-cell">{op.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PresetsSection() {
  return (
    <div className="space-y-6 animate-[panelFadeIn_0.4s_ease-out_both]">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Presets & History</h1>
      <p className="text-lg text-[#a0a0aa] leading-relaxed mb-8">
        Don't lose your complex queries. QueryForge includes powerful tools to persist and restore your work instantly.
      </p>

      <div className="space-y-8">
        <div className="p-6 border border-[#222] bg-[#0a0a0f] rounded-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#3b82f6] transition-all">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <History className="w-32 h-32 text-[#3b82f6]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <History className="w-6 h-6 text-[#3b82f6]" /> Auto-Saving History
          </h3>
          <p className="text-[#a0a0aa] leading-relaxed max-w-2xl relative z-10">
            Every time you click the <strong>Execute</strong> button, QueryForge saves a snapshot of your entire query state 
            into the History panel in the sidebar. It tracks your progression! You can confidently experiment knowing 
            you can click the <strong>Restore</strong> icon on any past run to instantly revert the canvas back to that state.
          </p>
        </div>

        <div className="p-6 border border-[#222] bg-[#0a0a0f] rounded-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#23c55e] transition-all">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-32 h-32 text-[#23c55e]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#23c55e]" /> Saved Presets
          </h3>
          <p className="text-[#a0a0aa] leading-relaxed max-w-2xl relative z-10">
            If you build a query you know you'll need again later (like "Active Users in USA" or "Pending Orders &gt; $500"), 
            you can click the <strong>Save Preset</strong> icon in the sidebar. This persists the query structure permanently 
            so you can restore it anytime you visit the app.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExportSection() {
  return (
    <div className="space-y-6 animate-[panelFadeIn_0.4s_ease-out_both]">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Import & Export</h1>
      <p className="text-lg text-[#a0a0aa] leading-relaxed mb-8">
        Need to share a query with a teammate, or save it to your own database? QueryForge makes state serialization incredibly simple.
      </p>

      <div className="bg-[#0a0a0f] border border-[#222] rounded-xl p-8 hover:shadow-[4px_4px_0_0_#eab308] hover:-translate-y-1 transition-all">
        <h3 className="text-xl font-bold text-white mb-4">Exporting JSON</h3>
        <p className="text-[#a0a0aa] leading-relaxed mb-6">
          The sidebar contains a live updating <strong>Export (JSON)</strong> text box. This represents the entire AST (Abstract Syntax Tree) 
          of your visual query. Click the copy icon to copy it to your clipboard.
        </p>
        <div className="bg-[#111] p-4 rounded-lg font-mono text-sm text-[#eab308] overflow-x-auto border border-[#222]">
          {`{
  "rootId": "group-1",
  "sourceId": "users",
  "nodes": { ... }
}`}
        </div>
      </div>

      <div className="bg-[#0a0a0f] border border-[#222] rounded-xl p-8 hover:shadow-[4px_4px_0_0_#8b5cf6] hover:-translate-y-1 transition-all mt-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           Importing JSON <ChevronRight className="w-5 h-5 text-[#8b5cf6]"/>
        </h3>
        <p className="text-[#a0a0aa] leading-relaxed">
          If someone sends you a QueryForge JSON string, you can simply paste it into the <strong>Import</strong> box 
          in the sidebar and hit the upload icon. The visual canvas will immediately rebuild their exact query structure for you!
        </p>
      </div>
    </div>
  );
}
