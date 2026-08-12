import { Link } from "@tanstack/react-router";
import { Leaf, LogOut, Store, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-ec-gradient text-secondary">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg leading-none">
            Rescata<span className="text-secondary">Food</span>
            <span className="ml-1 align-middle text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
              Ecuador
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
          <Link
            to="/explorar"
            className="rounded-full px-3 py-2 transition-colors hover:bg-muted"
            activeProps={{ className: "bg-muted" }}
          >
            Explorar
          </Link>
          <Link
            to="/negocios"
            className="hidden rounded-full px-3 py-2 transition-colors hover:bg-muted sm:block"
            activeProps={{ className: "bg-muted" }}
          >
            Para negocios
          </Link>
          {user ? (
            <>
              <Link to="/mis-pedidos" className="rounded-full px-3 py-2 transition-colors hover:bg-muted">
                <ShoppingBag className="inline size-4" /> <span className="hidden sm:inline">Mis pedidos</span>
              </Link>
              <Link to="/panel" className="rounded-full px-3 py-2 transition-colors hover:bg-muted">
                <Store className="inline size-4" /> <span className="hidden sm:inline">Mi negocio</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cerrar sesión"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}