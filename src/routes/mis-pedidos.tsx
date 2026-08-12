import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mis-pedidos")({
  head: () => ({
    meta: [
      { title: "Mis pedidos y códigos de retiro | RescataFood Ecuador" },
      {
        name: "description",
        content:
          "Consulta tus paquetes rescatados, el código de retiro y el estado de cada pedido en RescataFood Ecuador.",
      },
      { property: "og:title", content: "Mis pedidos | RescataFood Ecuador" },
      { property: "og:description", content: "Códigos de retiro y estado de tus paquetes sorpresa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MisPedidos,
});

const STATUS: Record<string, { label: string; className: string }> = {
  paid: { label: "Pagado · listo para retirar", className: "bg-primary text-primary-foreground" },
  collected: { label: "Retirado", className: "bg-secondary text-secondary-foreground" },
  cancelled_by_store: { label: "Cancelado por el local", className: "bg-accent text-accent-foreground" },
};

function MisPedidos() {
  const { user, loading } = useSession();

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, packages(title, pickup_start, pickup_end, available_date), businesses(name, address, city)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-16">Cargando…</main>;

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl">Inicia sesión para ver tus pedidos</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/auth">Entrar</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl">Mis pedidos</h1>
      <p className="mt-2 text-muted-foreground">
        Muestra tu código en el local dentro del horario de retiro. Lo mismo por menos precio, sin trámites.
      </p>

      <div className="mt-8 space-y-4">
        {(orders ?? []).length === 0 && (
          <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
            Aún no rescatas ningún paquete. <Link to="/explorar" className="font-semibold text-secondary">Explora los disponibles</Link>.
          </p>
        )}
        {(orders ?? []).map((o: any) => (
          <article key={o.id} className="rounded-3xl border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[o.status]?.className}`}>
                {STATUS[o.status]?.label}
              </span>
              <span className="ml-auto font-display text-xl">{money(o.total)}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{o.packages?.title}</h2>
            <p className="text-sm text-muted-foreground">
              {o.businesses?.name} · {o.businesses?.address}, {o.businesses?.city}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Retiro {o.packages?.available_date} de {String(o.packages?.pickup_start).slice(0, 5)} a{" "}
              {String(o.packages?.pickup_end).slice(0, 5)} · {o.quantity} paquete(s)
            </p>
            <p className="mt-3 inline-block rounded-xl bg-muted px-4 py-2 font-display text-lg tracking-widest">
              {o.code}
            </p>
            {o.status === "cancelled_by_store" && (
              <p className="mt-3 rounded-xl bg-accent/10 p-3 text-sm">
                El local canceló este pedido{o.cancel_reason ? `: “${o.cancel_reason}”` : ""}. Se te devuelve el
                valor pagado y queda constancia de la cancelación; la comisión del 10% ({money(o.commission)}) se
                le factura igualmente al negocio.
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
