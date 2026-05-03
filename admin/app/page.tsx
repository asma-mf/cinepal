import Link from 'next/link';
import { SignInButton, Show, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Ticket, Film, CreditCard, Users, PlayCircle, Star, ArrowRight, Phone } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Image src="/cinepal-high-res.png" alt="CinePal Logo" height={50} width={100} className="rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button>Get Started</Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/admin/movies">
                <Button variant="outline" className="mr-2">Dashboard</Button>
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
          {/* Background Decorations */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background">
            <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
          </div>

          <div className="container relative mx-auto max-w-7xl px-4 text-center md:px-8">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
              <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-muted/80">
                <Star className="mr-2 size-3.5 text-yellow-500" />
                <span>The premier destination for movie bookings</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Book your next cinematic experience with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">elegance</span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl leading-relaxed">
                CinePal provides real-time seat availability, effortless showtime browsing, and seamless ticket management all in one beautiful platform.
              </p>
              
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Show when="signed-out">
                  <SignInButton mode="modal" forceRedirectUrl="/admin/movies">
                    <Button size="lg" className="h-12 px-8 text-base shadow-lg cursor-pointer transition-transform hover:scale-105">
                      Download The App
                      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><title>Android</title><path d="M18.4395 5.5586c-.675 1.1664-1.352 2.3318-2.0274 3.498-.0366-.0155-.0742-.0286-.1113-.043-1.8249-.6957-3.484-.8-4.42-.787-1.8551.0185-3.3544.4643-4.2597.8203-.084-.1494-1.7526-3.021-2.0215-3.4864a1.1451 1.1451 0 0 0-.1406-.1914c-.3312-.364-.9054-.4859-1.379-.203-.475.282-.7136.9361-.3886 1.5019 1.9466 3.3696-.0966-.2158 1.9473 3.3593.0172.031-.4946.2642-1.3926 1.0177C2.8987 12.176.452 14.772 0 18.9902h24c-.119-1.1108-.3686-2.099-.7461-3.0683-.7438-1.9118-1.8435-3.2928-2.7402-4.1836a12.1048 12.1048 0 0 0-2.1309-1.6875c.6594-1.122 1.312-2.2559 1.9649-3.3848.2077-.3615.1886-.7956-.0079-1.1191a1.1001 1.1001 0 0 0-.8515-.5332c-.5225-.0536-.9392.3128-1.0488.5449zm-.0391 8.461c.3944.5926.324 1.3306-.1563 1.6503-.4799.3197-1.188.0985-1.582-.4941-.3944-.5927-.324-1.3307.1563-1.6504.4727-.315 1.1812-.1086 1.582.4941zM7.207 13.5273c.4803.3197.5506 1.0577.1563 1.6504-.394.5926-1.1038.8138-1.584.4941-.48-.3197-.5503-1.0577-.1563-1.6504.4008-.6021 1.1087-.8106 1.584-.4941z"/></svg>
                    </Button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <Link href="/admin/movies">
                    <Button size="lg" className="h-12 px-8 text-base shadow-lg transition-transform hover:scale-105">
                      View Movies
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </Show>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base backdrop-blur-sm">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30 py-24 md:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need for the perfect movie night</h2>
              <p className="mt-4 text-lg text-muted-foreground">Powerful features designed to make your movie booking experience seamless.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Film className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Extensive Catalog</h3>
                <p className="text-muted-foreground">Browse our extensive movie catalog, view high-quality posters, and discover trending films seamlessly.</p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <PlayCircle className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Flexible Showtimes</h3>
                <p className="text-muted-foreground">Easily find movies playing at your preferred times and locations with real-time availability.</p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                  <Ticket className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Instant Booking</h3>
                <p className="text-muted-foreground">View live seat availability, secure your reservations instantly, and manage your tickets effortlessly.</p>
              </div>
              
              {/* Feature 4 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <CreditCard className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Secure Payments</h3>
                <p className="text-muted-foreground">Experience fast, secure, and reliable payment processing powered by robust integrations.</p>
              </div>
              
              {/* Feature 5 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <Users className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Personalized Accounts</h3>
                <p className="text-muted-foreground">Securely manage your bookings, history, and preferences with Clerk-powered user accounts.</p>
              </div>
              
              {/* Feature 6 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                  <Star className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Premium Experience</h3>
                <p className="text-muted-foreground">A buttery smooth, dark-mode optimized interface built for modern moviegoers.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row md:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Film className="size-4" />
            <span>© {new Date().getFullYear()} CinePal. All rights reserved.</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
