import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Separator } from '@/components/ui/separator';
import { ScreenSizeNotice } from '@/components/ScreenSizeNotice';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScreenSizeNotice />
      <div className="hidden lg:block h-full w-full">
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex-1">
                <h2 className="text-sm font-medium text-muted-foreground">Dashboard</h2>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
}
