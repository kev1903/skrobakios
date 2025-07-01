
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface AppLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const AppLayout = ({ currentPage, onNavigate, children }: AppLayoutProps) => {
  // Hide main sidebar for auth page, project-specific pages and user edit page
  const showMainSidebar = !["auth", "project-detail", "project-tasks", "project-files", "project-settings", "project-schedule", "project-team", "project-bim", "gantt-chart", "user-edit"].includes(currentPage);

  if (currentPage === "auth") {
    return (
      <main className="flex-1 overflow-hidden w-full">
        {children}
      </main>
    );
  }

  return (
    <ProtectedRoute 
      onNavigate={onNavigate}
      requireSuperAdmin={currentPage === "admin"}
    >
      {showMainSidebar ? (
        <AppSidebar currentPage={currentPage} onNavigate={onNavigate}>
          <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 rounded-l-2xl ml-2 my-2 mr-2">
            {children}
          </main>
        </AppSidebar>
      ) : (
        <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 w-full">
          {children}
        </main>
      )}
    </ProtectedRoute>
  );
};
