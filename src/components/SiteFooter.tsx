import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg">RescataFood Ecuador</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Compra lo mismo por menos precio: paquetes sorpresa de comida en buen estado, rescatada de
            panaderías, restaurantes y supermercados de todo el Ecuador.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Explora</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li><Link to="/explorar" className="hover:text-foreground">Paquetes sorpresa cerca de ti</Link></li>
            <li><Link to="/negocios" className="hover:text-foreground">Registra tu negocio</Link></li>
            <li><Link to="/mis-pedidos" className="hover:text-foreground">Mis pedidos y códigos de retiro</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Cómo funciona el cobro</p>
          <p className="mt-2 text-muted-foreground">
            Pagas en la app. El negocio recibe el pedido al instante y solo paga una comisión del 10% por
            paquete vendido. Si el local cancela, queda constancia y la comisión igual se factura.
          </p>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} RescataFood Ecuador · Menos desperdicio alimentario, lo mismo por menos precio.
      </p>
    </footer>
  );
}