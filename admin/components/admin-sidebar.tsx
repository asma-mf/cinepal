'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { 
  Film, 
  MapPin, 
  Clock, 
  LayoutDashboard,
  ChevronRight,
  Ticket,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    title: 'Movies',
    url: '/admin/movies',
    icon: Film,
  },
  {
    title: 'Theatres',
    url: '/admin/theatres',
    icon: MapPin,
  },
  {
    title: 'Showtimes',
    url: '/admin/showtimes',
    icon: Clock,
  },
  {
    title: 'Bookings',
    url: '/admin/bookings',
    icon: Ticket,
  },
  {
    title: 'Payments',
    url: '/admin/payments',
    icon: CreditCard,
  },
];

import Image from 'next/image';

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Image
              src="/cinepal.png"
              alt="CinePal"
              width={100}
              height={30}
              className="object-contain"
              style={{ height: 'auto' }}
            />
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Film className="size-4" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url || pathname.startsWith(item.url)}
                      tooltip={item.title}
                    >

                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between rounded-lg border bg-sidebar-accent p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-background border">
                {(!mounted || theme === 'dark') ? (
                  <Moon className="size-3.5 text-primary" />
                ) : (
                  <Sun className="size-3.5 text-amber-500" />
                )}
              </div>
              <Label className="text-xs font-medium cursor-pointer" htmlFor="theme-toggle">
                {(!mounted || theme === 'dark') ? 'Dark Mode' : 'Light Mode'}
              </Label>
            </div>
            <Switch 
              id="theme-toggle"
              checked={!mounted || theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center py-2">
           <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {(!mounted || theme === 'dark') ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
        </div>
        <Separator className="mx-2 mb-2 w-auto bg-sidebar-border" />
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 pb-2 group-data-[collapsible=icon]:justify-center">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarWrapper: "size-8",
                  }
                }}
              />
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">{user?.fullName || 'Admin User'}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
