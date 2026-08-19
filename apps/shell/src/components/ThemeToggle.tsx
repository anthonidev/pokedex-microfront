import type { MouseEvent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';

export default function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Circular "reveal" growing from the button itself — see the `.theme-transition` rule
    // in index.css for why the API's default cross-fade is turned off for this one.
    // Falls back to a plain instant toggle on browsers without View Transitions support.
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    const { clientX: x, clientY: y } = event;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.classList.add('theme-transition');
    const transition = document.startViewTransition(() => toggleTheme());

    void transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      );
    });

    void transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transition');
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onClick={handleClick}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
