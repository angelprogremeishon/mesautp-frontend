import { useEffect, useState } from 'react';
import { ArrowLeft, Timer, CircleCheck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BottomNavEmprendedor from '@/components/BottomNavEmprendedor';
import { getDashboard, confirmarPedido, marcarListo } from '@/api/emprendedor';

const TABS = ['Pendientes', 'Confirmados', 'Completados'];

const ESTADO_MAP = {
    pendiente:  { label: 'Pendiente',  Icon: Timer,        iconColor: 'text-orange-600', bg: 'bg-orange-50' },
    confirmado: { label: 'Confirmado', Icon: CircleCheck,  iconColor: 'text-blue-600',   bg: 'bg-blue-50' },
    listo:      { label: 'Listo',      Icon: CircleCheck,  iconColor: 'text-green-600',  bg: 'bg-green-50' },
    entregado:  { label: 'Entregado',  Icon: CircleCheck,  iconColor: 'text-slate-400',  bg: 'bg-slate-50' },
    cancelado:  { label: 'Cancelado',  Icon: CircleCheck,  iconColor: 'text-red-400',    bg: 'bg-red-50' },
};

export default function EmprendedorPedidos() {
    const navigate = useNavigate();
    const [pedidos,  setPedidos]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [tab,      setTab]      = useState('Pendientes');

    useEffect(() => {
        getDashboard()
            .then(r => setPedidos(r.data.pedidos ?? []))
            .finally(() => setLoading(false));
    }, []);

    const handleConfirmar = async (id) => {
        try {
            const { data } = await confirmarPedido(id);
            setPedidos(prev => prev.map(p => p.id === id ? data.pedido : p));
            toast.success('Pedido confirmado');
        } catch {
            toast.error('No se pudo confirmar el pedido');
        }
    };

    const handleListo = async (id) => {
        try {
            const { data } = await marcarListo(id);
            setPedidos(prev => prev.map(p => p.id === id ? data.pedido : p));
            toast.success('Pedido listo para recoger');
        } catch {
            toast.error('No se pudo actualizar el pedido');
        }
    };

    const filterMap = {
        Pendientes:  pedidos.filter(p => p.estado === 'pendiente'),
        Confirmados: pedidos.filter(p => ['confirmado', 'listo'].includes(p.estado)),
        Completados: pedidos.filter(p => ['entregado', 'cancelado'].includes(p.estado)),
    };
    const shown = filterMap[tab] ?? [];

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 shrink-0" />

            {/* Header */}
            <div className="bg-white px-5 shrink-0">
                <div className="flex items-center gap-3 py-3">
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft size={22} className="text-slate-900" />
                    </button>
                    <p className="flex-1 font-bold text-slate-900 text-[18px]">Pedidos Recibidos</p>
                    <Package size={20} className="text-orange-600" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors ${
                                tab === t
                                    ? 'text-orange-600 border-b-[3px] border-orange-600 -mb-px'
                                    : 'text-slate-400'
                            }`}>
                            {t}
                            {filterMap[t]?.length > 0 && (
                                <span className={`ml-1 text-[10px] ${tab === t ? 'text-orange-600' : 'text-slate-400'}`}>
                                    ({filterMap[t].length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : shown.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Package size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No hay pedidos {tab.toLowerCase()}</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {shown.map(p => {
                            const estado = ESTADO_MAP[p.estado] ?? ESTADO_MAP.pendiente;
                            const { Icon, iconColor, bg } = estado;
                            const letter = p.user?.name?.[0]?.toUpperCase() ?? '?';
                            const hora   = new Date(p.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center shrink-0`}>
                                            <Icon size={20} className={iconColor} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-slate-900 text-[14px] truncate">
                                                    {p.user?.name ?? 'Cliente'}
                                                </p>
                                                <span className="font-bold text-orange-600 text-[14px]">
                                                    S/ {Number(p.total).toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                {p.producto?.nombre ?? 'Pedido'} · ×{p.cantidad} · {hora}
                                            </p>
                                        </div>
                                    </div>

                                    {p.nota && (
                                        <p className="text-[12px] text-slate-500 italic mt-2 px-1">
                                            "{p.nota}"
                                        </p>
                                    )}

                                    {p.estado === 'pendiente' && (
                                        <button onClick={() => handleConfirmar(p.id)}
                                            className="mt-3 w-full h-10 bg-blue-600 text-white text-[13px] font-bold rounded-xl">
                                            Confirmar pedido
                                        </button>
                                    )}
                                    {p.estado === 'confirmado' && (
                                        <button onClick={() => handleListo(p.id)}
                                            className="mt-3 w-full h-10 bg-green-600 text-white text-[13px] font-bold rounded-xl">
                                            Marcar como listo
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <BottomNavEmprendedor />
        </div>
    );
}
