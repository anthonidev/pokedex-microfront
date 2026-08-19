import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useThemeStore } from "@/store/theme-store"

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeStore((state) => state.theme)
  // Sonner forces the toast container to full width below 600px, anchored to whichever edge
  // `position` points at. Anchoring bottom there would sit right on top of the floating mobile
  // bottom nav and swallow its clicks, so mobile anchors top instead. Desktop has no bottom nav
  // to collide with, so it gets the more conventional bottom-right corner. Not a spec
  // requirement either way — purely to dodge that collision on small screens.
  const isDesktop = useMediaQuery("(min-width: 640px)")

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={isDesktop ? "bottom-right" : "top-center"}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
