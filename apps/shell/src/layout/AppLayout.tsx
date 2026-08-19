import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground',
  );

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold">Atlantic City · Pokédex</span>
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                Historial
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
