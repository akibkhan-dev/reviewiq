import React from 'react';
import {
  Menu,
  Database,
  Search,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenMobileSidebar: () => void;
  isAiConnected: boolean;
  onResetDemo: () => void;
  onSearchFocus: () => void;
  onOpenAskAi?: () => void;
  onOpenDemoVideo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileSidebar,
  isAiConnected,
  onResetDemo,
  onSearchFocus,
  onOpenAskAi,
  onOpenDemoVideo,
}) => {
  return (
    <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-6">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean ReviewIQ Logo */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-white">R</span>
            <span className="text-[#F97316]">IQ</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Review<span className="text-[#635BFF]">IQ</span>
            </span>
          </div>
        </button>

        {/* Clean Minimal Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('landing')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'landing' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'analyzer' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Analyzer
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'explorer' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'intelligence' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            AI Intelligence
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'comparison' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'actions' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'reports' ? 'text-slate-900 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search Trigger */}
        <button
          onClick={onSearchFocus}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Search...</span>
          <kbd className="font-mono text-[10px] bg-white text-slate-400 px-1 py-0.5 rounded border border-slate-200">
            ⌘K
          </kbd>
        </button>

        {/* Dedicated Ask ReviewIQ Button */}
        <button
          onClick={() => {
            if (onOpenAskAi) onOpenAskAi();
            else setActiveTab('ask-ai');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
          title="Ask ReviewIQ AI Copilot"
        >
          <Bot className="w-3.5 h-3.5 text-[#635BFF]" />
          <span>Ask ReviewIQ</span>
        </button>

        {/* Quick Demo Data Reload */}
        <button
          onClick={onResetDemo}
          className="hidden xl:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          title="Reload 52 verified NovaTech customer reviews"
        >
          <Database className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Reset</span>
        </button>

        {/* Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border ${
            isAiConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
          title={isAiConnected ? 'Gemini 3.8 Flash Online' : 'Local NLP Heuristic Active'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAiConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span>{isAiConnected ? 'Gemini' : 'NLP Heuristic'}</span>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => setActiveTab(activeTab === 'landing' ? 'dashboard' : 'analyzer')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <span>{activeTab === 'landing' ? 'Explore Platform' : 'Analyze'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </header>
  );
};
