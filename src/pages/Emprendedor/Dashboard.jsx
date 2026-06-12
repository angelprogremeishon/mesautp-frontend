import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CircleUser, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavEmprendedor from '@/components/BottomNavEmprendedor';
import FoodImg from '@/components/FoodImg';
import { getDashboard, confirmarPedido, marcarListo, marcarEntregado } from '@/api/emprendedor';

const ESTADO_BADGE = {
    pendiente:  { text: 'Pendiente',  cls: 'bg-orange-50 text-orange-700' },
    confirmado: { text: 'Confirmado', cls: 'bg-blue-50 text-blue-700' },
    listo:      { text: 'Listo',      cls: 'bg-green-50 text-green-700' },
    entregado:  { text: 'Entregado',  cls: 'bg-slate-100 text-slate-500' },
};

export default function EmprendedorDashboard() {
    const { user }  = useAuth();
    const navigate  = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        setLoading(true);
        getDashboard()
            .then(r => {
                if (!r.data.local) navigate('/emprendedor/registro', { replace: true });
                else setData(r.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleConfirmar = async (id) => {
        try {
            const { data: res } = await confirmarPedido(id);
            setData(prev => ({
                ...prev,
                pedidos: prev.pedidos.map(p => p.id === id ? res.pedido : p),
            }));
            toast.success('Pedido confirmado');
        } catch {
            toast.error('No se pudo confirmar el pedido');
        }
    };

    const handleListo = async (id) => {
        try {
            const { data: res } = await marcarListo(id);
            setData(prev => ({
                ...prev,
                pedidos: prev.pedidos.map(p => p.id === id ? res.pedido : p),
            }));
            toast.success('Pedido marcado como listo para recoger');
        } catch {
            toast.error('No se pudo actualizar el pedido');
        }
    };

    const handleEntregar = async (id) => {
        try {
            const { data: res } = await marcarEntregado(id);
            setData(prev => ({
                ...prev,
                pedidos: prev.pedidos.map(p => p.id === id ? res.pedido : p),
            }));
            toast.success('Pedido entregado');
        } catch {
            toast.error('No se pudo actualizar el pedido');
        }
    };

    const local    = data?.local;
    const pedidos  = data?.pedidos ?? [];
    const stats    = data?.stats ?? {};

    const pendientes  = pedidos.filter(p => p.estado === 'pendiente');
    const confirmados = pedidos.filter(p => ['confirmado', 'listo'].includes(p.estado));
    const ingresos    = Number(stats.ingresos_hoy ?? 0);
    const rating      = Number(local?.rating_promedio ?? 0).toFixed(1);
    const localName   = local?.nombre ?? user?.name ?? 'Mi local';
    const producto    = local?.productos?.find(p => p.es_menu_dia) ?? local?.productos?.[0];

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 shrink-0 bg-orange-600 lg:hidden" />

            {/* Orange gradient header */}
            <div className="bg-gradient-to-b from-orange-600 to-orange-700 px-5 pb-5 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-5xl lg:mx-auto">
                    <div className="flex items-center justify-between py-3">
                        <p className="font-extrabold text-white text-[18px] lg:text-[22px]">MesaUTP · Panel</p>
                        <div className="flex items-center gap-3">
                            <Bell size={22} className="text-white" />
                            <button onClick={() => navigate('/emprendedor/mi-local')} aria-label="Mi local">
                                <CircleUser size={22} className="text-white lg:hidden" />
                            </button>
                        </div>
                    </div>
                    <p className="font-bold text-white text-[20px] lg:text-[26px]">
                        ¡Buenos días, {localName}!
                    </p>
                    <p className="text-red-200 text-[13px] mt-0.5">
                        {loading
                            ? 'Cargando...'
                            : `Tienes ${pendientes.length} pedido${pendientes.length !== 1 ? 's' : ''} pendiente${pendientes.length !== 1 ? 's' : ''} hoy`}
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div className="flex gap-2.5 px-4 py-3 shrink-0 lg:px-8 lg:max-w-5xl lg:mx-auto lg:w-full">
                {[
                    { val: stats.pedidos_hoy ?? pedidos.length, label: 'Pedidos hoy',  color: 'text-orange-600' },
                    { val: `S/${ingresos.toFixed(0)}`,          label: 'Ingresos',     color: 'text-green-600' },
                    { val: rating,                               label: 'Rating',       color: 'text-blue-600', to: '/emprendedor/calificaciones' },
                ].map(m => (
                    <button key={m.label} type="button"
                        onClick={() => m.to && navigate(m.to)}
                        disabled={!m.to}
                        className="flex-1 flex flex-col items-center gap-1 bg-white rounded-2xl py-3.5 lg:py-6 shadow-sm enabled:active:scale-[0.97] transition-transform">
                        <span className={`font-extrabold text-[24px] lg:text-[32px] ${m.color}`}>{m.val}</span>
                        <span className="text-[10px] lg:text-[12px] text-slate-400 text-center">
                            {m.label}{m.to ? ' →' : ''}
                        </span>
                    </button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto px-4 pb-28 space-y-4 lg:px-8 lg:pb-10 lg:max-w-5xl lg:mx-auto lg:w-full lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start">
                {/* Today's offer */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <p className="font-bold text-slate-900 text-[16px]">Oferta de hoy</p>
                        <button onClick={() => navigate('/emprendedor/publicar', producto ? { state: { producto, fotoUrl: local?.foto_url } } : undefined)}
                            className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-[11px] font-semibold rounded-xl px-2.5 py-1.5">
                            <Pencil size={12} />
                            {producto ? 'Editar' : 'Publicar'}
                        </button>
                    </div>
                    {loading ? (
                        <div className="mx-4 mb-4 h-20 bg-slate-100 rounded-xl animate-pulse" />
                    ) : producto ? (
                        <div className="flex items-center gap-3 px-4 pb-4">
                            <div className="w-[70px] h-[70px] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                <FoodImg src={producto.foto_url ?? local?.foto_url} alt={producto.nombre} className="w-full h-full object-cover" iconSize={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 text-[14px]">{producto.nombre}</p>
                                <p className="text-[12px] text-slate-500 truncate">{producto.descripcion}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="font-bold text-orange-600 text-[14px]">
                                        S/ {Number(producto.precio).toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-green-600 font-semibold">
                                        {producto.cantidad_disponible} disp.
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-4 mb-4 text-center py-6 text-slate-400">
                            <p className="text-sm">No has publicado una oferta hoy</p>
                            <button onClick={() => navigate('/emprendedor/publicar')}
                                className="mt-2 text-orange-600 text-sm font-semibold">
                                Publicar ahora →
                            </button>
                        </div>
                    )}
                </div>

                {/* Pending orders */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-slate-900 text-[16px]">Pedidos pendientes</p>
                        <button onClick={() => navigate('/emprendedor/pedidos')}
                            className="bg-orange-50 text-orange-600 text-[11px] font-semibold rounded-xl px-2.5 py-1.5">
                            Ver todos ({pendientes.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : pendientes.length === 0 ? (
                        <div className="bg-white rounded-2xl p-4 text-center text-slate-400">
                            <p className="text-sm">No hay pedidos pendientes</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pendientes.slice(0, 3).map(p => {
                                const badge  = ESTADO_BADGE[p.estado] ?? ESTADO_BADGE.pendiente;
                                const letter = p.user?.name?.[0]?.toUpperCase() ?? '?';
                                return (
                                    <div key={p.id}
                                        className="bg-white rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-sm">
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <div className="w-[38px] h-[38px] bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                                <span className="font-bold text-orange-600">{letter}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-[13px] truncate">
                                                    {p.user?.name ?? 'Cliente'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 truncate">
                                                    {p.producto?.nombre ?? 'Pedido'} · ×{p.cantidad}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className="font-bold text-orange-600 text-[14px]">
                                                S/{Number(p.total).toFixed(0)}
                                            </span>
                                            {p.estado === 'pendiente' ? (
                                                <button onClick={() => handleConfirmar(p.id)}
                                                    className="text-[10px] font-bold bg-blue-600 text-white rounded-lg px-2.5 py-1">
                                                    Confirmar
                                                </button>
                                            ) : p.estado === 'confirmado' ? (
                                                <button onClick={() => handleListo(p.id)}
                                                    className="text-[10px] font-bold bg-green-600 text-white rounded-lg px-2.5 py-1">
                                                    Marcar listo
                                                </button>
                                            ) : p.estado === 'listo' ? (
                                                <button onClick={() => handleEntregar(p.id)}
                                                    className="text-[10px] font-bold bg-slate-800 text-white rounded-lg px-2.5 py-1">
                                                    Entregar
                                                </button>
                                            ) : (
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                                                    {badge.text}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* CTA publish */}
                <button onClick={() => navigate('/emprendedor/publicar')}
                    className="w-full h-[50px] bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform shadow-[0_4px_12px_rgba(234,88,12,0.35)] lg:col-span-2">
                    <Plus size={20} />
                    Publicar nueva oferta del día
                </button>
            </main>

            <BottomNavEmprendedor />
        </div>
    );
}
