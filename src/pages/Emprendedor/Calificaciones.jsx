import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import BottomNavEmprendedor from '@/components/BottomNavEmprendedor';
import { getCalificaciones } from '@/api/emprendedor';

function Stars({ n, size = 14 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={size}
                    className={i < n ? 'text-orange-500 fill-orange-500' : 'text-slate-200'} />
            ))}
        </div>
    );
}

function ReviewCard({ resena }) {
    const nombre = resena.user?.name ?? 'Estudiante';
    const letter = nombre[0]?.toUpperCase() ?? '?';
    const fecha  = new Date(resena.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

    return (
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <span className="text-orange-600 font-bold text-sm">{letter}</span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-[13px] leading-tight">{nombre}</p>
                        <p className="text-[11px] text-slate-400">{fecha}</p>
                    </div>
                </div>
                <Stars n={resena.estrellas} />
            </div>
            {resena.comentario && (
                <p className="text-[12px] text-slate-600 leading-relaxed">{resena.comentario}</p>
            )}
        </div>
    );
}

export default function EmprendedorCalificaciones() {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCalificaciones()
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    const promedio     = Number(data?.promedio ?? 0).toFixed(1);
    const total        = data?.total ?? 0;
    const distribucion = data?.distribucion ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const resenas      = data?.resenas ?? [];

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 bg-white shrink-0 lg:hidden" />

            {/* Header */}
            <div className="bg-white px-5 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-4xl lg:mx-auto flex items-center gap-3 py-3">
                    <button onClick={() => navigate('/emprendedor')} className="text-slate-900">
                        <ArrowLeft size={22} />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px] lg:text-[24px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Mis Calificaciones
                    </p>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto pb-28 lg:pb-10 lg:max-w-4xl lg:mx-auto lg:w-full lg:px-8 lg:pt-4 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start">
                {/* Resumen de rating */}
                <div className="bg-white px-5 py-5 lg:rounded-2xl lg:shadow-sm flex items-center gap-5">
                    <div className="flex flex-col items-center shrink-0">
                        <span className="text-[48px] font-extrabold text-orange-600 leading-none" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {promedio}
                        </span>
                        <div className="mt-1"><Stars n={Math.round(promedio)} /></div>
                        <span className="text-[11px] text-slate-400 mt-1">{total} reseña{total !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                        {[5, 4, 3, 2, 1].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 w-5">{s}★</span>
                                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full transition-all"
                                        style={{ width: `${distribucion[s] ?? 0}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-400 w-8 text-right">{distribucion[s] ?? 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lista de reseñas */}
                <div className="px-5 lg:px-0 pt-5 lg:pt-0">
                    <p className="font-bold text-slate-900 text-[16px] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Reseñas recientes
                    </p>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : resenas.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Aún no tienes reseñas</p>
                            <p className="text-[12px] text-slate-400 mt-1">Aparecerán aquí cuando tus clientes califiquen sus pedidos.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {resenas.map(r => <ReviewCard key={r.id} resena={r} />)}
                        </div>
                    )}
                </div>
            </main>

            <BottomNavEmprendedor />
        </div>
    );
}
