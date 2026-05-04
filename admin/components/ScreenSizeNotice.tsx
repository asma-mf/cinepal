"use client";

import React from 'react';
import { MonitorOff, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScreenSizeNotice() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-6 lg:hidden">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card border shadow-2xl">
              <MonitorOff className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Screen Too Small
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The CinePal Admin Dashboard is optimized for large displays to ensure accurate management of seat maps and analytics.
          </p>
        </div>

        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border text-sm font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Recommended resolution: 1280px or higher
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>

        <div className="text-xs text-muted-foreground/50 font-mono pt-8">
          ERROR_CODE: VIEWPORT_RESTRICTED_MIN_1024
        </div>
      </div>
    </div>
  );
}
