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
  ChevronRight
} from 'lucide-react';

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
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Film className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base">CinePal</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</span>
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
          <Separator className="mx-2 mb-2 w-auto bg-sidebar-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 pb-2 group-data-[collapsible=icon]:justify-center">
                <UserButton 
                  afterSignOutUrl="/" 
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
