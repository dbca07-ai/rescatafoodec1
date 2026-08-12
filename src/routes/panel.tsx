import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { CATEGORIES, CITIES, money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel del negocio · publica paquetes | RescataFood Ecuador" },
      {
        name: "description",
        content:
          "Administra tu negocio en RescataFood Ecuador: publica hasta 100 paquetes diarios, recibe pedidos pagados y gestiona cancelaciones con constancia de comisión.",
      },
      { property: "og:title", content: "Panel del negocio | RescataFood Ecuador" },
      { property: "og:description", content: "Publica paquetes, recibe pedidos y controla tus comisiones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Panel,
});

function Panel() {
  const { user, loading } = useSession();
  const qc = useQueryClient();

  const { data: business, isLoading: loadingBiz } = useQuery({
    queryKey: ["my-business", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (loading || (user && loadingBiz)) return <main className="mx-auto max-w-4xl px-4 py-16">Cargando…</main>;

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">Registra tu negocio en RescataFood</h1>
        <p className="mt-3 text-muted-foreground">
          Crea tu cuenta gratis para publicar paquetes y recibir pedidos pagados.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/auth">Crear cuenta o entrar</Link>
        </Button>
      </main>
    );
  }

  if (!business) return <RegisterBusiness onDone={() => qc.invalidateQueries({ queryKey: ["my-business"] })} userId={user.id} />;

  return <Dashboard business={business} />;
}

function RegisterBusiness({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0]!,
    city: CITIES[0]!,
    address: "",
    phone: "",
    description: "",
  });
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) {
      toast.error("Debes aceptar las reglas de precio y calidad");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("businesses").insert({ ...form, owner_id: userId, accepted_terms: true });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Negocio registrado. Ya puedes publicar paquetes.");
    onDone();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl">Registra tu negocio</h1>
      <p className="mt-2 text-muted-foreground">
        Publica hasta 100 paquetes al día y cobra el 90% de cada venta.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="bname">Nombre comercial</Label>
          <Input id="bname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat">Categoría</Label>
            <select
              id="cat"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <select
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr">Dirección</Label>
          <Input id="addr" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Descripción del local</Label>
          <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <QualityNotice />
        <label className="flex items-start gap-3 text-sm">
          <Checkbox checked={terms} onCheckedChange={(v) => setTerms(v === true)} />
          <span>
            Acepto vender siempre a un precio menor al original, entregar producto en buen estado y pagar la
            comisión del 10% por paquete vendido, incluso si cancelo el pedido en el local.
          </span>
        </label>
        <Button type="submit" disabled={busy} className="w-full rounded-full">Registrar negocio</Button>
      </form>
    </main>
  );
}

function QualityNotice() {
  return (
    <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold text-accent">
        <AlertTriangle className="size-4" /> Obligatorio antes de publicar
      </p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        <li>· El precio del paquete <strong>debe ser menor</strong> al precio original del producto.</li>
        <li>· El producto debe estar <strong>en buen estado</strong>: no podrido, no en mala presentación y sin sobras tocadas por otras personas.</li>
        <li>· El cliente debe recibir <strong>lo mismo que compraría en vitrina, por menos precio</strong>.</li>
      </ul>
    </div>
  );
}

function Dashboard({ business }: { business: any }) {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: packages } = useQuery({
    queryKey: ["biz-packages", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["biz-orders", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, packages(title)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const publishedToday = (packages ?? [])
    .filter((p: any) => p.available_date === today)
    .reduce((sum: number, p: any) => sum + p.quantity_total, 0);

  const commissionOwed = (orders ?? []).reduce((s: number, o: any) => s + Number(o.commission), 0);
  const netRevenue = (orders ?? [])
    .filter((o: any) => o.status !== "cancelled_by_store")
    .reduce((s: number, o: any) => s + Number(o.total) * 0.9, 0);

  async function updateOrder(
    id: string,
    patch: {
      status?: string;
      cancelled_at?: string;
      cancel_reason?: string;
      commission_charged?: boolean;
    },
  ) {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["biz-orders", business.id] });
  }

  async function cancelOrder(order: any) {
    const reason = window.prompt(
      "Motivo de la cancelación en el local (queda constancia y la comisión del 10% se factura igual):",
    );
    if (reason === null) return;
    await updateOrder(order.id, {
      status: "cancelled_by_store",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
      commission_charged: true,
    });
    toast.success(`Cancelación registrada. Comisión facturada: ${money(order.commission)}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl">{business.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {business.category} · {business.address}, {business.city}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Paquetes publicados hoy" value={`${publishedToday} / 100`} />
        <Stat label="Ingreso neto (90%)" value={money(netRevenue)} />
        <Stat label="Comisión acumulada (10%)" value={money(commissionOwed)} />
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="rounded-full">
          <TabsTrigger value="orders" className="rounded-full">Pedidos recibidos</TabsTrigger>
          <TabsTrigger value="new" className="rounded-full">Publicar paquete</TabsTrigger>
          <TabsTrigger value="list" className="rounded-full">Mis paquetes</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6 space-y-3">
          {(orders ?? []).length === 0 && (
            <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
              Todavía no recibes pedidos. Publica un paquete para empezar a vender.
            </p>
          )}
          {(orders ?? []).map((o: any) => (
            <article key={o.id} className="flex flex-wrap items-center gap-3 rounded-3xl border bg-card p-5 shadow-soft">
              <div className="min-w-52">
                <p className="font-semibold">{o.packages?.title}</p>
                <p className="text-sm text-muted-foreground">
                  Código <strong className="tracking-widest">{o.code}</strong> · {o.quantity} paquete(s) ·{" "}
                  {money(o.total)} · comisión {money(o.commission)}
                </p>
                {o.status === "cancelled_by_store" && (
                  <p className="mt-1 text-sm text-accent">
                    Cancelado en el local{o.cancel_reason ? `: “${o.cancel_reason}”` : ""} · comisión facturada
                  </p>
                )}
              </div>
              <div className="ml-auto flex gap-2">
                {o.status === "paid" && (
                  <>
                    <Button size="sm" className="rounded-full" onClick={() => updateOrder(o.id, { status: "collected" })}>
                      Marcar retirado
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => cancelOrder(o)}>
                      Cancelar en el local
                    </Button>
                  </>
                )}
                {o.status === "collected" && <span className="text-sm font-semibold text-secondary">Retirado</span>}
              </div>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <NewPackageForm business={business} publishedToday={publishedToday} />
        </TabsContent>

        <TabsContent value="list" className="mt-6 grid gap-3">
          {(packages ?? []).map((p: any) => (
            <article key={p.id} className="flex flex-wrap items-center gap-4 rounded-3xl border bg-card p-4 shadow-soft">
              {p.image_url && (
                <img src={p.image_url} alt={p.title} loading="lazy" className="size-16 rounded-2xl object-cover" />
              )}
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-muted-foreground">
                  {money(p.price)} <span className="line-through">{money(p.original_price)}</span> ·{" "}
                  {p.quantity_left}/{p.quantity_total} disponibles · {p.available_date}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto rounded-full"
                onClick={async () => {
                  await supabase.from("packages").update({ active: !p.active }).eq("id", p.id);
                  qc.invalidateQueries({ queryKey: ["biz-packages", business.id] });
                }}
              >
                {p.active ? "Pausar" : "Reactivar"}
              </Button>
            </article>
          ))}
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

function NewPackageForm({ business, publishedToday }: { business: any; publishedToday: number }) {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: "",
    description: "",
    original_price: "",
    price: "",
    quantity_total: "5",
    available_date: today,
    pickup_start: "18:00",
    pickup_end: "20:00",
  });
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(false);
  const [busy, setBusy] = useState(false);

  const price = Number(form.price);
  const original = Number(form.original_price);
  const priceInvalid = !!form.price && !!form.original_price && price >= original;
  const remaining = 100 - (form.available_date === today ? publishedToday : 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (priceInvalid) {
      toast.error("El precio del paquete debe ser MENOR al precio original del producto.");
      return;
    }
    if (!quality) {
      toast.error("Debes confirmar que el producto está en buen estado.");
      return;
    }
    setBusy(true);
    let image_url: string | null = null;
    if (file) {
      const path = `${business.id}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: upErr } = await supabase.storage.from("paquetes").upload(path, file);
      if (upErr) {
        setBusy(false);
        toast.error(`No se pudo subir la foto: ${upErr.message}`);
        return;
      }
      const { data: signed } = await supabase.storage.from("paquetes").createSignedUrl(path, 60 * 60 * 24 * 365);
      image_url = signed?.signedUrl ?? null;
    }

    const quantity = Number(form.quantity_total);
    const { error } = await supabase.from("packages").insert({
      business_id: business.id,
      title: form.title,
      description: form.description,
      image_url,
      original_price: original,
      price,
      quantity_total: quantity,
      quantity_left: quantity,
      available_date: form.available_date,
      pickup_start: form.pickup_start,
      pickup_end: form.pickup_end,
      quality_confirmed: true,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Paquete publicado. Ya es visible para miles de personas.");
    setForm({ ...form, title: "", description: "", original_price: "", price: "" });
    setFile(null);
    setQuality(false);
    qc.invalidateQueries({ queryKey: ["biz-packages", business.id] });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
      <QualityNotice />
      <p className="text-sm text-muted-foreground">
        Te quedan <strong>{Math.max(0, remaining)}</strong> paquetes publicables para el {form.available_date}{" "}
        (máximo 100 por día).
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="title">Título del paquete</Label>
        <Input id="title" required placeholder="Paquete sorpresa de panadería" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pdesc">Qué incluye</Label>
        <Textarea id="pdesc" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="orig">Precio original del producto (USD)</Label>
          <Input id="orig" type="number" step="0.01" min="0.5" required value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio del paquete (USD)</Label>
          <Input id="price" type="number" step="0.01" min="0.5" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
      </div>
      {priceInvalid && (
        <p className="rounded-2xl bg-accent/10 p-3 text-sm font-semibold text-accent">
          El precio del paquete debe ser MENOR al precio original: el cliente tiene que llevarse lo mismo por
          menos precio.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="qty2">Cantidad</Label>
          <Input id="qty2" type="number" min="1" max="100" required value={form.quantity_total} onChange={(e) => setForm({ ...form, quantity_total: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" required value={form.available_date} onChange={(e) => setForm({ ...form, available_date: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">Retiro desde</Label>
          <Input id="from" type="time" required value={form.pickup_start} onChange={(e) => setForm({ ...form, pickup_start: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" type="time" required value={form.pickup_end} onChange={(e) => setForm({ ...form, pickup_end: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="photo" className="flex items-center gap-2"><Upload className="size-4" /> Foto del paquete</Label>
        <Input id="photo" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <Checkbox checked={quality} onCheckedChange={(v) => setQuality(v === true)} />
        <span>
          Confirmo que el producto está en buen estado, apto para consumo, con buena presentación y sin sobras
          manipuladas por otras personas.
        </span>
      </label>

      <Button type="submit" disabled={busy} className="w-full rounded-full">
        {busy ? "Publicando…" : "Publicar paquete"}
      </Button>
    </form>
  );
}