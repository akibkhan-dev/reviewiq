import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  MessageSquareText,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Home,
  CheckSquare,
  FileText,
  Scale,
  Bot,
} from 'lucide-react';

export type NavTab =
  | 'landing'
  | 'dashboard'
  | 'analyzer'
  | 'explorer'
  | 'intelligence'
  | 'comparison'
  | 'actions'
  | 'reports'
  | 'data-management'
  | 'settings'
  | 'ask-ai';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  reviewCount: number;
  onResetDemo: () => void;
  isAiConnected: boolean;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAskAi?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  reviewCount,
  onResetDemo,
  isAiConnected,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAskAi,
}) => {
  const navItems = [
    { id: 'landing' as NavTab, label: 'Home', icon: Home },
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer' as NavTab, label: 'Review Analyzer', icon: Sparkles, badge: 'AI' },
    { id: 'explorer' as NavTab, label: 'Reviews Explorer', icon: MessageSquareText, count: reviewCount },
    { id: 'intelligence' as NavTab, label: 'AI Intelligence', icon: Lightbulb, badge: 'Insights' },
    { id: 'comparison' as NavTab, label: 'Product Comparison', icon: Scale },
    { id: 'actions' as NavTab, label: 'Action Center', icon: CheckSquare, badge: 'Tasks' },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'data-management' as NavTab, label: 'Data Management', icon: Database },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-white">R</span>
              <span className="text-[#F97316]">IQ</span>
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                  Review<span className="text-[#635BFF]">IQ</span>
                </span>
                <span className="text-[10px] tracking-wider font-semibold text-slate-400 block -mt-0.5 uppercase">
                  Customer Intelligence
                </span>
              </div>
            )}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Ask ReviewIQ Assistant CTA Button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => {
              if (onOpenAskAi) onOpenAskAi();
              else handleNavClick('ask-ai');
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 transition-all cursor-pointer shadow-2xs ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title="Ask ReviewIQ AI Assistant"
          >
            <Bot className="w-4 h-4 text-[#635BFF] shrink-0" />
            {!collapsed && (
              <span className="flex-1 text-left truncate font-bold">
                Ask ReviewIQ
              </span>
            )}
            {!collapsed && (
              <span className="text-[9px] font-bold bg-[#635BFF] text-white px-1.5 py-0.5 rounded">
                AI
              </span>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-normal transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-[#635BFF]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {!collapsed && item.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Lower Info & Reset Demo */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <button
            onClick={onResetDemo}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer ${
              collapsed ? 'px-0' : ''
            }`}
            title="Reload 52 NovaTech demo customer reviews"
          >
            <Database className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
            {!collapsed && <span>Reload Demo Dataset</span>}
          </button>

          {/* User Organization */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              NT
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">NovaTech Enterprise</p>
                <p className="text-[11px] text-slate-400 truncate">Customer Insights</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
