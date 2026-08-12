// ============ IMPORTACIONES Y SETUP ============
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

// ============ ESTADO DEL COMPONENTE ============
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
  const [paymentMethod, setPaymentMethod] = useState<"online" | "in_store">("online"); // ← NUEVO

  // ============ FUNCIÓN PARA PAGAR EN LÍNEA ============
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
      _payment_method: paymentMethod, // ← NUEVO PARÁMETRO
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

  // ============ FUNCIÓN PARA RESERVAR (SIN PAGO) - NUEVA ============
  async function reserve(e: React.FormEvent) {
    e.preventDefault();
    setPaying(true);
    const { data, error } = await supabase.rpc("place_order", {
      _package_id: id,
      _quantity: qty,
      _card_last4: null,
      _payment_method: "in_store", // ← MÉTODO DE PAGO EN LOCAL
    });
    setPaying(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    refetch();
    toast.success(`Reserva confirmada. Tu código es ${(data as any)?.code ?? ""}. Paga en el local al retirar.`);
    navigate({ to: "/mis-pedidos" });
  }

  // ============ DIÁLOGO CON DOS OPCIONES DE PAGO ============
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-5 w-full rounded-full">Pedir {money(total)}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{money(total)} · ¿Cómo deseas pagar?</DialogTitle>
        </DialogHeader>
        
        {/* ============ SELECTOR DE MÉTODO DE PAGO ============ */}
        <div className="space-y-3">
          {/* OPCIÓN 1: Pagar en línea */}
          <div className="relative">
            <input
              type="radio"
              id="online"
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={(e) => setPaymentMethod(e.target.value as "online" | "in_store")}
              className="peer sr-only"
            />
            <label htmlFor="online" className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-muted p-4 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
              <div className="mt-1 flex size-5 items-center justify-center rounded-full border-2 border-muted peer-checked:border-primary peer-checked:bg-primary">
                {paymentMethod === "online" && <div className="size-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">Pagar en línea</p>
                <p className="text-sm text-muted-foreground">
                  Paga ahora con tarjeta y retira inmediatamente en el local con tu código
                </p>
              </div>
            </label>
          </div>

          {/* OPCIÓN 2: Reservar y pagar en el local */}
          <div className="relative">
            <input
              type="radio"
              id="in_store"
              name="payment"
              value="in_store"
              checked={paymentMethod === "in_store"}
              onChange={(e) => setPaymentMethod(e.target.value as "online" | "in_store")}
              className="peer sr-only"
            />
            <label htmlFor="in_store" className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-muted p-4 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
              <div className="mt-1 flex size-5 items-center justify-center rounded-full border-2 border-muted peer-checked:border-primary peer-checked:bg-primary">
                {paymentMethod === "in_store" && <div className="size-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">Reservar y pagar en el local</p>
                <p className="text-sm text-muted-foreground">
                  Reserva tu paquete ahora y paga cuando lo retires en el local
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ============ FORMULARIO CONDICIONAL ============ */}
        {paymentMethod === "online" ? (
          // FORMULARIO DE TARJETA (pago en línea)
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
              Pago simulado en modo demostración: no se realiza ningún cobro real.
            </p>
            <Button type="submit" disabled={paying} className="w-full rounded-full">
              {paying ? "Procesando…" : `Pagar ${money(total)}`}
            </Button>
          </form>
        ) : (
          // FORMULARIO DE RESERVA (sin tarjeta)
          <form onSubmit={reserve} className="space-y-3">
            <div className="rounded-2xl bg-secondary/10 p-4">
              <p className="text-sm font-semibold text-secondary">📍 Retira en: {pkg.businesses?.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{pkg.businesses?.address}, {pkg.businesses?.city}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                📅 {pkg.available_date} · {String(pkg.pickup_start).slice(0, 5)}–{String(pkg.pickup_end).slice(0, 5)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu reserva se confirmará al instante. Lleva tu código cuando vayas a pagar y retirar el paquete.
            </p>
            <Button type="submit" disabled={paying} className="w-full rounded-full">
              {paying ? "Reservando…" : "Confirmar reserva"}
            </Button>
          </form>
        )}

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Si el local cancela el pedido, te devolvemos el valor pagado.
        </p>
      </DialogContent>
    </Dialog>
  );
}
