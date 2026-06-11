import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, MapPin, Star, UtensilsCrossed } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getInternos } from '@/api/locales';

const CHIPS = ['Hoy', 'Hasta S/8', 'Patio', 'Biblioteca'];

function InternoCard({ local }) {
    const nombre    = local.nombre;
    const letter    = nombre[0]?.toUpperCase() ?? '?';
    const producto  = local.productos?.[0];
    const disponible = local.total_resenas ?? producto?.cantidad_disponible ?? 5;

    return (
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
            {/* Top: avatar + info + badge */}
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-lg">{letter}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-[13px] truncate">{nombre}</p>
                    <p className="text-[11px] text-slate-400">{local.descripcion?.slice(0, 40) ?? 'Emprendedor UTP Ate'}</p>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-green-700 bg-green-50 rounded-xl px-2 py-1">
                    {disponible} disp.
                </span>
            </div>

            {/* Dish row */}
            {producto && (
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={local.foto_url ?? '/placeholder.jpg'} alt={producto.nombre}
                            className="w-full h-full object-cover" loading="lazy"
                            onError={e => { e.target.src = '/placeholder.jpg'; }} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-[12px] font-medium text-slate-900 leading-tight">{producto.nombre}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-600">S/ {Number(producto.precio).toFixed(2)}</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                {Number(local.rating_promedio).toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Location + CTA */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin size={12} className="text-slate-400" />
                    {local.punto_entrega ?? 'Campus UTP Ate'}
                </div>
                <Link to={`/locales-internos/${local.id}`}
                    className="px-3.5 py-1.5 bg-blue-600 text-white text-[12px] font-semibold rounded-xl active:scale-[0.97] transition-transform">
                    Reservar
                </Link>
            </div>
        </div>
    );
}

export default function LocalesInternosIndex() {
    const navigate  = useNavigate();
    const [locals,   setLocals]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [chip,     setChip]     = useState('Hoy');

    useEffect(() => {
        getInternos()
            .then(r => setLocals(r.data.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 bg-white shrink-0" />

            {/* Header */}
            <div className="bg-white px-5 pt-3 pb-0 shrink-0">
                {/* Nav row */}
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => navigate(-1)} className="text-slate-900">
                        <ArrowLeft size={22} />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px] font-display">Locales Internos</p>
                    <Info size={22} className="text-blue-600" />
                </div>

                {/* Info strip */}
                <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mb-3">
                    <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-blue-700 leading-snug">
                        Compañeros UTP Ate que cocinan y venden en el campus hoy. Paga por Yape o Plin.
                    </p>
                </div>

                {/* Chips */}
                <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                    {CHIPS.map(c => (
                        <button key={c} onClick={() => setChip(c)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                chip === c
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-500 border-slate-200'
                            }`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="flex items-center gap-2 pt-4 pb-3">
                    <UtensilsCrossed size={15} className="text-blue-600" />
                    <p className="font-bold text-slate-900 text-[15px]">
                        Disponible ahora · {loading ? '...' : locals.length} {locals.length === 1 ? 'oferta' : 'ofertas'}
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-slate-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : locals.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <UtensilsCrossed size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No hay emprendedores con oferta hoy</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {locals.map(l => <InternoCard key={l.id} local={l} />)}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
