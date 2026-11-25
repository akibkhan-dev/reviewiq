import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SearchModal } from './components/SearchModal';
import { ReviewDetailsModal } from './components/ReviewDetailsModal';
import { DemoTourModal } from './components/DemoTourModal';
import { AskReviewIQModal } from './components/AskReviewIQModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewAnalyzerPage } from './pages/ReviewAnalyzerPage';
import { ReviewsExplorerPage } from './pages/ReviewsExplorerPage';
import { AIIntelligencePage } from './pages/AIIntelligencePage';
import { ProductComparisonPage } from './pages/ProductComparisonPage';
import { ActionCenterPage } from './pages/ActionCenterPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import { Review } from './types';
import { Bot, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);
  const [isAiConnected, setIsAiConnected] = useState<boolean>(false);
  const [reviewCount, setReviewCount] = useState<number>(52);
  const [allReviewsCache, setAllReviewsCache] = useState<Review[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check health and load reviews on mount
  const checkHealthAndLoadCount = async () => {
    try {
      const health = await api.getHealth();
      setIsAiConnected(health.hasGeminiApiKey);
      const data = await api.getReviews({ limit: 100 });
      setReviewCount(data.total);
      setAllReviewsCache(data.reviews);
    } catch (e) {
      console.warn('Initial load error:', e);
    }
  };

  useEffect(() => {
    checkHealthAndLoadCount();
  }, [refreshTrigger]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleResetDemo = async () => {
    const list = await api.resetDemoData();
    setReviewCount(list.length);
    setRefreshTrigger((prev) => prev + 1);
    showToast('52 Verified NovaTech customer reviews loaded.');
  };

  const handleReviewAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    showToast('Customer review analyzed & added to database.');
  };

  const handleDeleteReview = async (id: string) => {
    await api.deleteReview(id);
    setRefreshTrigger((prev) => prev + 1);
    showToast('Review removed from database.');
  };

  const handleTabNavigate = (tab: NavTab) => {
    if (tab === 'ask-ai') {
      setIsAskAiOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-white text-slate-800 text-xs font-semibold shadow-lg border border-slate-200 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        reviews={allReviewsCache}
        onSelectReview={(r) => setSelectedReview(r)}
        onNavigate={handleTabNavigate}
      />

      {/* Review Details Modal */}
      <ReviewDetailsModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onDelete={handleDeleteReview}
      />

      {/* Interactive Platform Tour / Demo Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigate={handleTabNavigate}
      />

      {/* Ask ReviewIQ Grounded AI Assistant Modal */}
      <AskReviewIQModal
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        onSelectReview={(r) => setSelectedReview(r)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabNavigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        reviewCount={reviewCount}
        onResetDemo={handleResetDemo}
        isAiConnected={isAiConnected}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        onOpenAskAi={() => setIsAskAiOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isAiConnected={isAiConnected}
          onResetDemo={handleResetDemo}
          onSearchFocus={() => setIsSearchOpen(true)}
          onOpenAskAi={() => setIsAskAiOpen(true)}
          onOpenDemoVideo={() => setIsDemoTourOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'landing' && (
            <LandingPage
              onNavigate={handleTabNavigate}
              onResetDemo={handleResetDemo}
              onOpenDemoVideo={() => setIsDemoTourOpen(true)}
              reviewCount={reviewCount}
              onSelectReview={(r) => setSelectedReview(r)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleTabNavigate}
              onSelectReview={(r) => setSelectedReview(r)}
            />
          )}

          {activeTab === 'analyzer' && (
            <ReviewAnalyzerPage
              onReviewAdded={handleReviewAdded}
              onNavigate={handleTabNavigate}
            />
          )}

          {activeTab === 'explorer' && (
            <ReviewsExplorerPage
              onSelectReview={(r) => setSelectedReview(r)}
              onDeleteReview={handleDeleteReview}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'intelligence' && (
            <AIIntelligencePage
              onSelectReview={(r) => setSelectedReview(r)}
              onNavigate={handleTabNavigate}
            />
          )}

          {activeTab === 'comparison' && (
            <ProductComparisonPage
              onSelectReview={(r) => setSelectedReview(r)}
            />
          )}

          {activeTab === 'actions' && (
            <ActionCenterPage />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}

          {activeTab === 'data-management' && (
            <DataManagementPage
              onResetDemo={handleResetDemo}
              reviewCount={reviewCount}
              onReviewsUpdated={() => setRefreshTrigger((prev) => prev + 1)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              onResetDemo={handleResetDemo}
              reviewCount={reviewCount}
              isAiConnected={isAiConnected}
            />
          )}
        </main>

        {/* Floating Ask ReviewIQ Quick Launcher Button (visible on all screens except landing) */}
        {activeTab !== 'landing' && (
          <button
            onClick={() => setIsAskAiOpen(true)}
            className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-slate-700/60"
            title="Ask ReviewIQ AI Assistant"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-indigo-300" />
            </div>
            <span>Ask ReviewIQ</span>
            <Sparkles className="w-3 h-3 text-[#F97316]" />
          </button>
        )}
      </div>
    </div>
  );
}
