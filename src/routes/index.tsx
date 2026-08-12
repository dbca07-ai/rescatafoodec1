import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, PiggyBank, Store, Timer } from "lucide-react";
import heroImg from "@/assets/hero-paquete.jpg";
import { supabase } from "@/integrations/supabase/client";
import { PackageCard, type PackageRow } from "@/components/PackageCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RescataFood Ecuador | Comida rescatada: lo mismo por menos precio" },
      {
        name: "description",
        content:
          "Paquetes sorpresa de comida en buen estado en Quito, Guayaquil y Cuenca. Compra lo mismo por menos precio y reduce el desperdicio alimentario en Ecuador.",
      },
      {
        property: "og:title",
        content: "RescataFood Ecuador | Comida rescatada: lo mismo por menos precio",
      },
      {
        property: "og:description",
        content:
          "Rescata paquetes de panaderías, restaurantes y supermercados ecuatorianos hasta 70% más baratos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: packages } = useQuery({
    queryKey: ["home-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, businesses(name, city, category)")
        .eq("active", true)
        .gt("quantity_left", 0)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as unknown as PackageRow[];
    },
  });

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-ec-gradient opacity-15" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
              <Leaf className="size-3.5" /> Hecho para Ecuador
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] sm:text-6xl">
              Lo mismo, <span className="text-secondary">por menos precio</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Rescata paquetes sorpresa de panaderías, restaurantes y supermercados de tu ciudad. La misma
              comida en buen estado que comprarías hoy en vitrina, pero pagando mucho menos.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/explorar">Ver paquetes </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/negocios">Soy un negocio</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm font-semibold text-accent">
             !Es exactamente lo mismo pero por menos precio¡
            </p>
          </div>
          <img
            src={heroImg}
            alt="Paquete sorpresa de comida ecuatoriana rescatada con pan, empanadas y fruta"
            width={1280}
            height={960}
            className="rounded-[2rem] border shadow-soft"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: PiggyBank, t: "Lo mismo por menos precio", d: "Paquetes de $10 en producto por $3 o $4. El mismo pan, la misma comida." },
            { icon: Timer, d: "Reservas y pagas en la app; retiras en el local dentro de su horario.", t: "Pide en 30 segundos" },
            { icon: Store, t: "Negocios ecuatorianos", d: "Cada compra ayuda a un local de tu barrio a no perder lo que ya produjo." },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl border bg-card p-6 shadow-soft">
              <c.icon className="size-6 text-secondary" />
              <h2 className="mt-3 text-lg font-semibold">{c.t}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl">Paquetes disponibles hoy</h2>
            <p className="mt-1 text-muted-foreground">
              Comida en buen estado, lista para retirar. Lo mismo por menos precio, mientras dure el stock.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/explorar">Ver todos</Link>
          </Button>
        </div>

        {packages && packages.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
            Aún no hay paquetes publicados. Si tienes un negocio,{" "}
            <Link to="/negocios" className="font-semibold text-secondary">publica el primero</Link> y vende hoy
            lo que ibas a botar.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-[2rem] bg-ec-gradient p-8 text-secondary sm:p-12">
          <h2 className="max-w-2xl text-3xl sm:text-4xl">
            ¿Tienes un local? Convierte tu excedente en ingresos, con solo 10% de comisión
          </h2>
          <p className="mt-4 max-w-2xl font-medium">
            Publica hasta 100 paquetes al día, recibe pedidos ya pagados y entrega con un código. Si algo pasa,
            puedes cancelar en el local y queda constancia del cobro de la comisión.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full">
            <Link to="/negocios">Registrar mi negocio</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12">
        <h2 className="text-3xl">Preguntas frecuentes</h2>
        <dl className="mt-6 space-y-5">
          {[
            ["¿Qué es un paquete sorpresa?", "Una selección de productos que el negocio no alcanzó a vender ese día. Es lo mismo que comprarías en vitrina, por bastante menos precio."],
            ["¿La comida está en buen estado?", "Sí. Cada negocio confirma obligatoriamente que el producto está apto para el consumo, con buena presentación y sin sobras manipuladas por otras personas."],
            ["¿Cómo pago?", "Con tarjeta dentro de la app. Recibes un código de retiro y solo lo muestras en el local."],
            ["¿Y si el local cancela?", "Se te devuelve el valor pagado, queda constancia de la cancelación y el negocio igual paga la comisión del 10%."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-3xl border bg-card p-5 shadow-soft">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
