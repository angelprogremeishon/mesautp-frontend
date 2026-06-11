import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, CircleCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNavEmprendedor from '@/components/BottomNavEmprendedor';
import { getDashboard } from '@/api/emprendedor';

export default function EmprendedorVentas() {
    const navigate = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboard()
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    const pedidos   = data?.pedidos ?? [];
    const stats     = data?.stats   ?? {};
    const entregados = pedidos.filter(p => p.estado === 'entregado');
    const totalHoy   = entregados.reduce((s, p) => s + Number(p.total), 0);
    const totalItems = entregados.reduce((s, p) => s + Number(p.cantidad), 0);
    const rating     = Number(data?.local?.rating_promedio ?? 0).toFixed(1);

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 shrink-0" />

            {/* Header */}
            <div className="bg-white px-5 shrink-0">
                <div className="flex items-center gap-3 py-3">
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft size={22} className="text-slate-900" />
                    </button>
                    <p className="flex-1 font-bold text-slate-900 text-[18px]">Historial de Ventas</p>
                    <TrendingUp size={20} className="text-orange-600" />
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { val: stats.pedidos_semana ?? 0, label: 'Esta semana', color: 'text-orange-600' },
                        { val: `S/${totalHoy.toFixed(0)}`, label: 'Ingresos hoy', color: 'text-green-600' },
                        { val: rating,                     label: 'Rating',      color: 'text-blue-600' },
                    ].map(m => (
                        <div key={m.label} className="flex flex-col items-center gap-1 bg-white rounded-2xl py-3.5 shadow-sm">
                            <span className={`font-extrabold text-[22px] ${m.color}`}>{m.val}</span>
                            <span className="text-[10px] text-slate-400 text-center">{m.label}</span>
                        </div>
                    ))}
                </div>

                {/* Resumen del día */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="font-bold text-slate-900 text-[16px] mb-3">Resumen del día</p>
                    <div className="space-y-2.5">
                        {[
                            { label: 'Ventas completadas', val: entregados.length },
                            { label: 'Porciones vendidas', val: totalItems },
                            { label: 'Total recaudado',    val: `S/ ${totalHoy.toFixed(2)}`, blue: true },
                        ].map(r => (
                            <div key={r.label} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                                <span className="text-[13px] text-slate-500">{r.label}</span>
                                <span className={`text-[14px] font-bold ${r.blue ? 'text-blue-600' : 'text-slate-900'}`}>
                                    {r.val}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Historial de pedidos */}
                <div>
                    <p className="font-bold text-slate-900 text-[16px] mb-2">Pedidos entregados</p>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : entregados.length === 0 ? (
                        <div className="bg-white rounded-2xl p-5 text-center text-slate-400">
                            <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Sin ventas registradas aún</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entregados.map(p => {
                                const hora = new Date(p.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                                const fecha = new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
                                return (
                                    <div key={p.id} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                                        <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                            <CircleCheck size={18} className="text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-[13px] truncate">
                                                {p.user?.name ?? 'Cliente'}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                {p.producto?.nombre ?? 'Pedido'} · {fecha} {hora}
                                            </p>
                                        </div>
                                        <span className="font-bold text-green-600 text-[14px] shrink-0">
                                            S/ {Number(p.total).toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <BottomNavEmprendedor />
        </div>
    );
}
