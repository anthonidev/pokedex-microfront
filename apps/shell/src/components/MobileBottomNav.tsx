import { History, House, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import UserMenu from './UserMenu';

interface MobileBottomNavProps {
  onSearchClick: () => void;
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex size-11 items-center justify-center rounded-full transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground',
  );

/**
 * Floating pill nav shown only below `sm` — the header drops its nav links, search box
 * and user menu on mobile (too cramped otherwise) and they live here instead.
 */
export default function MobileBottomNav({ onSearchClick }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-lg sm:hidden"
    >
      <NavLink to="/" end className={navItemClass} aria-label="Inicio">
        <House className="size-5" />
      </NavLink>
      <NavLink to="/history" className={navItemClass} aria-label="Historial">
        <History className="size-5" />
      </NavLink>
      <button
        type="button"
        onClick={onSearchClick}
        aria-label="Buscar Pokémon"
        className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="size-5" />
      </button>
      <UserMenu iconOnly />
    </nav>
  );
}
