import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { discount, money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/paquete/$id")({
  head: () => ({
    meta: [
      { title: "Paquete sorpresa a mitad de precio | RescataFood Ecuador" },
      {
        name: "description",
        content:
          "Reserva y paga tu paquete sorpresa: lo mismo que comprarías hoy, por mucho menos precio. Comida en buen estado de negocios ecuatorianos.",
      },
      { property: "og:title", content: "Paquete sorpresa a mitad de precio | RescataFood Ecuador" },
      { property: "og:description", content: "Paga en la app y retira en el local. Lo mismo por menos precio." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaqueteDetalle,
});

function PaqueteDetalle() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const [qty, setQty] = useState(1);
  const [card, setCard] = useState("");
  const [holder, setHolder] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [paying, setPaying] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: pkg, isLoading, refetch } = useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, businesses(name, city, address, category, description, phone)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    const digits = card.replace(/\D/g, "");
    if (digits.length < 15) {
      toast.error("Revisa el número de tarjeta");
      return;
    }
    setPaying(true);
    const { data, error } = await supabase.rpc("place_order", {
      _package_id: id,
      _quantity: qty,
      _card_last4: digits.slice(-4),
    });
    setPaying(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    refetch();
    toast.success(`Pago aprobado. Tu código de retiro es ${(data as any)?.code ?? ""}`);
    navigate({ to: "/mis-pedidos" });
  }

  if (isLoading) return <main className="mx-auto max-w-5xl px-4 py-16">Cargando paquete…</main>;
  if (!pkg) return <main className="mx-auto max-w-5xl px-4 py-16">Este paquete ya no está disponible.</main>;

  const total = Number(pkg.price) * qty;
  const ahorro = (Number(pkg.original_price) - Number(pkg.price)) * qty;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="h-72 overflow-hidden rounded-3xl border bg-muted shadow-soft">
            {pkg.image_url ? (
              <img src={pkg.image_url} alt={`Paquete sorpresa ${pkg.title}`} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-ec-gradient" />
            )}
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-secondary">
            {pkg.businesses?.category} · {pkg.businesses?.name}
          </p>
          <h1 className="mt-1 text-3xl">{pkg.title}</h1>
          <p className="mt-3 text-muted-foreground">{pkg.description}</p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" /> {pkg.businesses?.address}, {pkg.businesses?.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" /> {pkg.available_date} · {String(pkg.pickup_start).slice(0, 5)}–
              {String(pkg.pickup_end).slice(0, 5)}
            </span>
          </div>

          <div className="mt-6 rounded-3xl border border-secondary/30 bg-secondary/5 p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold text-secondary">
              <ShieldCheck className="size-4" /> Garantía RescataFood
            </p>
            <p className="mt-2 text-muted-foreground">
              El negocio confirmó que este paquete contiene producto en buen estado, apto para el consumo y con
              buena presentación: nunca comida dañada, podrida ni sobras manipuladas por otras personas.
              Es exactamente lo mismo que comprarías en vitrina, pero por mucho menos precio.
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            -{discount(pkg.price, pkg.original_price)}% · lo mismo por menos precio
          </span>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-4xl">{money(pkg.price)}</span>
            <span className="text-lg text-muted-foreground line-through">{money(pkg.original_price)}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{pkg.quantity_left} paquetes disponibles hoy</p>

          <div className="mt-5 flex items-center gap-3">
            <Label htmlFor="qty">Cantidad</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              max={Math.max(1, pkg.quantity_left)}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(pkg.quantity_left, Number(e.target.value))))}
              className="w-24"
            />
          </div>

          <div className="mt-5 space-y-1 rounded-2xl bg-muted p-4 text-sm">
            <div className="flex justify-between"><span>Total a pagar</span><strong>{money(total)}</strong></div>
            <div className="flex justify-between text-secondary"><span>Ahorras</span><strong>{money(ahorro)}</strong></div>
          </div>

          {pkg.quantity_left < 1 ? (
            <Button disabled className="mt-5 w-full rounded-full">Agotado por hoy</Button>
          ) : !user ? (
            <Button asChild className="mt-5 w-full rounded-full">
              <Link to="/auth">Inicia sesión para pedirlo</Link>
            </Button>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="mt-5 w-full rounded-full">Pedir y pagar {money(total)}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pago seguro · {money(total)}</DialogTitle>
                </DialogHeader>
                <form onSubmit={pay} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="holder">Titular de la tarjeta</Label>
                    <Input id="holder" required value={holder} onChange={(e) => setHolder(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card">Número de tarjeta</Label>
                    <Input id="card" required inputMode="numeric" placeholder="4111 1111 1111 1111" value={card} onChange={(e) => setCard(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="exp">Vence</Label>
                      <Input id="exp" required placeholder="MM/AA" value={exp} onChange={(e) => setExp(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" required inputMode="numeric" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pago simulado en modo demostración: no se realiza ningún cobro real. El negocio recibe el
                    pedido al instante y RescataFood retiene el 10% de comisión ({money(total * 0.1)}).
                  </p>
                  <Button type="submit" disabled={paying} className="w-full rounded-full">
                    {paying ? "Procesando…" : `Pagar ${money(total)}`}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Si el local cancela el pedido, te devolvemos el valor pagado y queda constancia de la cancelación.
          </p>
        </aside>
      </div>
    </main>
  );
}