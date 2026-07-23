import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { DeletionNoticeModal } from './components/DeletionNoticeModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { ProfileCompletionBanner } from './components/ProfileCompletionBanner';

import { Home } from './pages/Home';
import { MakerDashboard } from './pages/MakerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectForm } from './pages/ProjectForm';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
            {/* Top Navigation Bar */}
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isNavOpen={isNavOpen}
              onToggleNav={() => setIsNavOpen((prev) => !prev)}
            />

            {/* Profile Completion Alert Banner for Google login or incomplete profile */}
            <ProfileCompletionBanner />

            {/* Main Layout Body */}
            <main className="flex flex-1 overflow-hidden relative">
              <Sidebar
                isOpen={isNavOpen}
                onClose={() => setIsNavOpen(false)}
              />

              <section className="flex-1 flex flex-col overflow-hidden">
                <Routes>
                  <Route path="/" element={<Home searchQuery={searchQuery} />} />
                  <Route path="/dashboard" element={<MakerDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/project/new" element={<ProjectForm />} />
                  <Route path="/project/edit/:id" element={<ProjectForm />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </section>
            </main>

            {/* Status Footer */}
            <Footer />

            {/* Notification Modal for Admin Deletions */}
            <DeletionNoticeModal />

            {/* Profile Side Drawer */}
            <ProfileDrawer />
          </div>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}
