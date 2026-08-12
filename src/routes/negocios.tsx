import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeDollarSign, CalendarClock, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/negocios")({
  head: () => ({
    meta: [
      { title: "Vende tu excedente de comida en Ecuador | RescataFood para negocios" },
      {
        name: "description",
        content:
          "Registra tu panadería, restaurante o supermercado en RescataFood Ecuador: publica hasta 100 paquetes al día, recupera ingresos y paga solo 10% de comisión por paquete vendido.",
      },
      { property: "og:title", content: "RescataFood para negocios en Ecuador" },
      {
        property: "og:description",
        content: "Hasta 100 paquetes diarios, cobro automático y solo 10% de comisión por paquete vendido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Negocios,
});

const BENEFITS = [
  {
    icon: BadgeDollarSign,
    title: "Solo 10% de comisión",
    body: "Cobras el 90% de cada paquete vendido. Sin mensualidad, sin permanencia y sin costo por publicar.",
  },
  {
    icon: CalendarClock,
    title: "Hasta 100 paquetes al día",
    body: "Publica cada mañana lo que sabes que no vas a vender y conviértelo en ingresos antes del cierre.",
  },
  {
    icon: TrendingUp,
    title: "Clientes nuevos cada día",
    body: "Quien viene por un paquete descubre tu local y regresa a pagar precio completo.",
  },
  {
    icon: CheckCircle2,
    title: "Cancelación con constancia",
    body: "Si no puedes entregar, cancelas desde el panel: se devuelve el dinero al cliente y queda registrada la comisión.",
  },
];

function Negocios() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Para negocios</p>
      <h1 className="mt-2 max-w-3xl text-4xl">
        Deja de botar comida buena: véndela y que tus clientes compren lo mismo por menos precio
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Cada día, panaderías, restaurantes y supermercados del Ecuador desechan producto perfectamente apto.
        Con RescataFood lo publicas como paquete sorpresa, recuperas parte de tu inversión y reduces el
        desperdicio alimentario en tu ciudad.
      </p>
      <Button asChild size="lg" className="mt-6 rounded-full">
        <Link to="/panel">Registrar mi negocio gratis</Link>
      </Button>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-3xl border bg-card p-6 shadow-soft">
            <b.icon className="size-6 text-secondary" />
            <h2 className="mt-3 text-lg font-semibold">{b.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-3xl border border-accent/30 bg-accent/5 p-6">
        <h2 className="text-xl">Reglas obligatorias de calidad y precio</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>· El precio del paquete debe ser <strong>menor</strong> al precio original del producto. El sistema lo valida y rechaza cualquier publicación que no cumpla.</li>
          <li>· El producto debe estar <strong>en buen estado</strong>: nada podrido, en mal estado, con mala presentación ni sobras manipuladas por otras personas.</li>
          <li>· Máximo <strong>100 paquetes por día</strong> por negocio.</li>
          <li>· La comisión del 10% por paquete vendido se factura incluso si el local cancela el pedido.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Cómo funciona en 4 pasos</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            "Registras tu negocio en 2 minutos.",
            "Publicas tu paquete con foto, descripción y precio.",
            "El cliente paga en la app y el pedido te llega al panel.",
            "Entregas con el código de retiro y cobras el 90%.",
          ].map((step, i) => (
            <li key={step} className="rounded-3xl border bg-card p-5 text-sm shadow-soft">
              <span className="font-display text-2xl text-secondary">{i + 1}</span>
              <p className="mt-2 text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}