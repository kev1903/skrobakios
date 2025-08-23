
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ProjectsPage from '@/pages/ProjectsPage';
import TasksPage from '@/pages/TasksPage';
import SchedulePage from '@/pages/SchedulePage';
import TimeSheetPage from '@/pages/TimeSheetPage';
import LeadsPage from '@/pages/LeadsPage';
import ProfilePage from '@/pages/ProfilePage';
import CompanySettingsPage from '@/pages/CompanySettingsPage';
import FloatingVoiceButton from '@/components/FloatingVoiceButton';
import { AuthProvider } from '@/contexts/AuthContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { VoiceProvider } from '@/contexts/VoiceContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <CompanyProvider>
              <VoiceProvider>
                <Router>
                  <div className="min-h-screen bg-gradient-main">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/*" element={<Layout />}>
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route path="home" element={<Home />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="timesheet" element={<TimeSheetPage />} />
                        <Route path="leads" element={<LeadsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="company-settings" element={<CompanySettingsPage />} />
                      </Route>
                    </Routes>
                    <FloatingVoiceButton />
                    <Toaster />
                    <Sonner />
                  </div>
                </Router>
              </VoiceProvider>
            </CompanyProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
