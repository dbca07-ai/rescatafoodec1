import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión o crear cuenta | RescataFood Ecuador" },
      {
        name: "description",
        content:
          "Crea tu cuenta gratis en RescataFood Ecuador y empieza a rescatar paquetes de comida: lo mismo por menos precio.",
      },
      { property: "og:title", content: "Iniciar sesión | RescataFood Ecuador" },
      { property: "og:description", content: "Accede para pedir paquetes o administrar tu negocio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const search = useRouterState({ select: (s) => s.location.search }) as { next?: string };
  const next = typeof search?.next === "string" && search.next.startsWith("/") ? search.next : "/explorar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: next });
  }, [user, navigate, next]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("¡Bienvenido de vuelta!");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Cuenta creada. Ya puedes rescatar tu primer paquete.");
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-14">
      <h1 className="text-3xl">Entra y paga menos por lo mismo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Una sola cuenta sirve para pedir paquetes y para registrar tu negocio.
      </p>

      <Tabs defaultValue="login" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 rounded-full">
          <TabsTrigger value="login" className="rounded-full">Iniciar sesión</TabsTrigger>
          <TabsTrigger value="signup" className="rounded-full">Crear cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={signIn} className="mt-6 space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-full">Entrar</Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={signUp} className="mt-6 space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email2">Correo</Label>
              <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password2">Contraseña</Label>
              <Input id="password2" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-full">Crear cuenta gratis</Button>
          </form>
        </TabsContent>
      </Tabs>
    </main>
  );
}