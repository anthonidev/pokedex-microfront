import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
            // Sonner's toast state lives outside AppLayout (the Toaster sits at the app
            // root so it survives route changes) — VisitToastListener unmounting on logout
            // doesn't dismiss whatever it already showed, so the "último visitado" toast
            // was still sitting there on the login screen after signing out.
            toast.dismiss();
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
