import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Timer, CircleCheck, ShoppingBag, Star } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getPedidos } from '@/api/pedidos';

const TABS = ['Activos', 'Historial', 'Cancelados'];

const ESTADO_MAP = {
    pendiente:  { label: 'Pendiente',  Icon: Timer,       iconColor: 'text-green-600',  bg: 'bg-green-50' },
    confirmado: { label: 'Confirmado', Icon: CircleCheck, iconColor: 'text-blue-500',   bg: 'bg-blue-50' },
    listo:      { label: 'Listo',      Icon: CircleCheck, iconColor: 'text-orange-500', bg: 'bg-orange-50' },
    entregado:  { label: 'Entregado',  Icon: CircleCheck, iconColor: 'text-slate-400',  bg: 'bg-slate-50' },
    cancelado:  { label: 'Cancelado',  Icon: CircleCheck, iconColor: 'text-red-400',    bg: 'bg-red-50' },
};

function PedidoCard({ pedido }) {
    const navigate   = useNavigate();
    const estado = ESTADO_MAP[pedido.estado] ?? ESTADO_MAP['pendiente'];
    const { Icon, iconColor, bg } = estado;
    const nombreItem = pedido.producto?.nombre ?? pedido.local?.nombre ?? '—';
    const vendedor   = pedido.local?.nombre ?? '—';
    const fecha      = new Date(pedido.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    const hora       = new Date(pedido.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const activo     = ['pendiente', 'confirmado', 'listo'].includes(pedido.estado);

    return (
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-bold text-slate-900 text-[14px] truncate">{nombreItem}</p>
                    <p className="text-[11px] text-slate-400">
                        {vendedor} · {activo ? `Recojo: ${hora}` : `${fecha} · ${hora}`}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-orange-600">S/ {Number(pedido.total).toFixed(2)}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            activo ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {estado.label}
                        </span>
                    </div>
                </div>
            </div>

            {pedido.estado === 'entregado' && (
                <button
                    onClick={() => navigate(`/pedidos/${pedido.id}/calificar`, { state: { pedido } })}
                    className="mt-3 w-full h-10 border border-orange-200 text-orange-600 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    <Star size={15} className={pedido.resena ? 'fill-orange-500 text-orange-500' : ''} />
                    {pedido.resena ? `Tu reseña: ${pedido.resena.estrellas}★ · Editar` : 'Calificar pedido'}
                </button>
            )}
        </div>
    );
}

export default function PedidosIndex() {
    const [pedidos,  setPedidos]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [tab,      setTab]      = useState('Activos');

    useEffect(() => {
        getPedidos().then(r => setPedidos(r.data)).finally(() => setLoading(false));
    }, []);

    const activos    = pedidos.filter(p => ['pendiente', 'confirmado', 'listo'].includes(p.estado));
    const historial  = pedidos.filter(p => p.estado === 'entregado');
    const cancelados = pedidos.filter(p => p.estado === 'cancelado');
    const shown = tab === 'Activos' ? activos : tab === 'Historial' ? historial : cancelados;

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 bg-white shrink-0 lg:hidden" />

            {/* Header */}
            <div className="bg-white px-5 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-5xl lg:mx-auto">
                    <div className="flex items-center justify-between py-3">
                        <p className="font-bold text-slate-900 text-[20px] lg:text-[26px] font-display">Mis Pedidos</p>
                        <SlidersHorizontal size={22} className="text-orange-600" />
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`flex-1 lg:flex-none lg:px-10 py-2.5 text-[14px] font-semibold transition-colors ${
                                    tab === t
                                        ? 'text-orange-600 border-b-[3px] border-orange-600 -mb-px'
                                        : 'text-slate-400'
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <main className="flex-1 overflow-y-auto px-5 pt-4 pb-28 lg:px-8 lg:pb-10 lg:max-w-5xl lg:mx-auto lg:w-full">
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : shown.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No tienes pedidos {tab.toLowerCase()}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                        {shown.map(p => <PedidoCard key={p.id} pedido={p} />)}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
