import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';

interface UserMenuProps {
  /** Used in the mobile bottom nav — just the icon, no email, matches the other pill items. */
  iconOnly?: boolean;
}

export default function UserMenu({ iconOnly = false }: UserMenuProps) {
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  if (!session) return null;

  return (
    // modal={false}: Radix's default (modal) locks body scroll while open, which removes
    // the scrollbar and reflows the page — jarring for a lightweight menu, especially
    // triggered from the fixed mobile bottom nav. This is a small dropdown, not a modal
    // takeover, so it doesn't need the scroll lock/focus trap that implies.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={iconOnly ? 'ghost' : 'outline'}
          size={iconOnly ? 'icon' : 'sm'}
          aria-label={iconOnly ? 'Cuenta' : undefined}
          className={cn(!iconOnly && 'gap-2', iconOnly && 'size-11 rounded-full')}
        >
          <User className="size-4" />
          {!iconOnly && session.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Sesión activa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
