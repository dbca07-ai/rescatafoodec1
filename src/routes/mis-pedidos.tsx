const STATUS: Record<string, { label: string; className: string }> = {

  paid: { label: "Pagado · listo para retirar", className: "bg-primary text-primary-foreground" },

  reserved: { label: "Reservado · pendiente de pago", className: "bg-yellow-500 text-white" },

  paid_in_store: { label: "Pagado en local · listo para retirar", className: "bg-blue-500 text-white" },

  collected: { label: "Retirado", className: "bg-secondary text-secondary-foreground" },

  cancelled_by_store: { label: "Cancelado por el local", className: "bg-accent text-accent-foreground" },

};



// ============ MOSTRAR ÓRDENES ============

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

    

    {/* ============ MENSAJES POR ESTADO ============ */}

    {o.status === "reserved" && (

      <p className="mt-3 rounded-xl bg-yellow-100 p-3 text-sm text-yellow-900">

        📌 Tu reserva está confirmada. Presenta tu código cuando vayas a pagar y retirar el paquete en {o.businesses?.name}.

      </p>

    )}

    

    {o.status === "paid" && (

      <p className="mt-3 rounded-xl bg-primary/10 p-3 text-sm">

        ✅ Pago confirmado. Muestra tu código en el local para retirar tu paquete.

      </p>

    )}

    

    {o.status === "paid_in_store" && (

      <p className="mt-3 rounded-xl bg-blue-100 p-3 text-sm text-blue-900">

        ✅ Pagado en el local. Tu paquete está listo para llevar.

      </p>

    )}

    

    {o.status === "cancelled_by_store" && (

      <p className="mt-3 rounded-xl bg-accent/10 p-3 text-sm">

        El local canceló este pedido{o.cancel_reason ? `: "${o.cancel_reason}"` : ""}. Se te devuelve el

        valor pagado.

      </p>

    )}

  </article>

))} 

