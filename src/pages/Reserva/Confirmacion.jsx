import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle, CircleAlert } from 'lucide-react';

export default function ReservaConfirmacion() {
    const { state } = useLocation();
    const navigate  = useNavigate();

    if (!state?.pedido) {
        navigate('/locales-externos', { replace: true });
        return null;
    }

    const { pedido, local, producto, cantidad, whatsapp_url } = state;
    const total = Number(pedido.total ?? 0).toFixed(2);

    const rows = [
        { label: 'Plato',         value: producto?.nombre ?? pedido.producto?.nombre ?? '—' },
        { label: 'Vendedor',      value: local?.nombre ?? '—' },
        { label: 'Cantidad',      value: `${cantidad} porción${cantidad > 1 ? 'es' : ''}` },
        { label: 'Total',         value: `S/ ${total}`, blue: true },
        { label: 'Punto de recojo', value: local?.punto_entrega ?? 'A coordinar' },
        { label: 'Hora estimada', value: local?.horario ?? '12:00 – 13:00' },
    ];

    return (
        <div className="min-h-dvh bg-white flex flex-col">
            <div className="h-11" />

            {/* Success hero */}
            <div className="bg-gradient-to-b from-blue-50 to-white flex flex-col items-center px-7 pt-10 pb-8 gap-4">
                <div className="w-[88px] h-[88px] bg-blue-600 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,99,235,0.27)]">
                    <CheckCircle2 size={44} className="text-white" strokeWidth={2.5} />
                </div>
                <p className="font-extrabold text-slate-900 text-[24px] font-display text-center">¡Reserva confirmada!</p>
                <p className="text-[14px] text-slate-500 leading-relaxed text-center max-w-[300px]">
                    Tu pedido fue enviado a <strong className="text-slate-700">{local?.nombre}</strong>. Recógelo en el punto acordado.
                </p>
            </div>

            {/* Order summary */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
                <p className="font-bold text-slate-900 text-[16px]">Resumen del pedido</p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    {rows.map(r => (
                        <div key={r.label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                            <span className="text-[12px] text-slate-400">{r.label}</span>
                            <span className={`text-[13px] font-semibold ${r.blue ? 'text-blue-600' : 'text-slate-900'}`}>{r.value}</span>
                        </div>
                    ))}
                </div>

                {/* Pay alert */}
                <div className="flex items-start gap-2.5 bg-orange-50 rounded-xl p-3.5">
                    <CircleAlert size={18} className="text-orange-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[12px] font-semibold text-orange-800">Recuerda pagar vía Yape o Plin</p>
                        <p className="text-[11px] text-orange-600 mt-0.5 leading-snug">
                            Envía S/ {total} a {local?.nombre} antes de recoger tu pedido.
                        </p>
                    </div>
                </div>

                {/* WA button */}
                {whatsapp_url && (
                    <a href={whatsapp_url} target="_blank" rel="noreferrer"
                        className="w-full h-[50px] bg-[#25D366] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform">
                        <MessageCircle size={20} />
                        Enviar mensaje por WhatsApp
                    </a>
                )}

                {/* Back home */}
                <button onClick={() => navigate('/locales-externos')}
                    className="w-full h-[50px] bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-2xl active:scale-[0.97] transition-transform">
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}
