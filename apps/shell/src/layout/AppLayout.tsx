import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SearchModal from '@/components/SearchModal';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import VisitToastListener from '@/components/VisitToastListener';
import { useSearchShortcut } from '@/hooks/use-search-shortcut';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground',
  );

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useSearchShortcut(useCallback(() => setSearchOpen(true), []));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="font-heading text-lg font-bold tracking-tight">
              Atlantic City · Pokédex
            </span>
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
            <Button
              variant="outline"
              size="sm"
              aria-label="Buscar Pokémon"
              onClick={() => setSearchOpen(true)}
              className="gap-2 text-muted-foreground"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium sm:flex">
                {isMac ? '⌘' : 'Ctrl'}K
              </kbd>
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <VisitToastListener />
    </div>
  );
}
