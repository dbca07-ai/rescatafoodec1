import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PackageCard, type PackageRow } from "@/components/PackageCard";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/format";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Paquetes sorpresa baratos en Ecuador | RescataFood" },
      {
        name: "description",
        content:
          "Explora paquetes sorpresa de comida en Quito, Guayaquil y Cuenca. Compra lo mismo por menos precio y evita el desperdicio alimentario.",
      },
      { property: "og:title", content: "Paquetes sorpresa baratos en Ecuador | RescataFood" },
      {
        property: "og:description",
        content: "Comida en buen estado hasta 70% más barata en negocios locales del Ecuador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explorar,
});

function Explorar() {
  const [city, setCity] = useState("Todas");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, businesses(name, city, category)")
        .eq("active", true)
        .gt("quantity_left", 0)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PackageRow[];
    },
  });

  const packages = (data ?? []).filter(
    (p) =>
      (city === "Todas" || p.businesses?.city === city) &&
      (q.trim() === "" ||
        `${p.title} ${p.description} ${p.businesses?.name ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl sm:text-4xl">Paquetes sorpresa cerca de ti</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Lo mismo que comprarías hoy, por mucho menos precio. Cada paquete es comida en buen estado que el
        local no alcanzó a vender.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar panadería, restaurante, paquete…"
            className="rounded-full pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todas", ...CITIES].map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                city === c ? "border-transparent bg-secondary text-secondary-foreground" : "hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Cargando paquetes…</p>
      ) : packages.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
          Todavía no hay paquetes publicados con estos filtros. ¿Tienes un negocio? Publica el tuyo y vende
          lo que hoy se desperdicia.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}
    </main>
  );
}