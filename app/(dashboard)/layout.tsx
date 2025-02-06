
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './_components/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider className="w-full">
      <AppSidebar />
      <main
        className="bg-white h-full"
        style={{ width: 'inherit', height: '100vh' }}
      >
        <SidebarTrigger />
        <div className="p-6 bg-white h-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
