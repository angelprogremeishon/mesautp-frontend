import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, MapPin, Star, UtensilsCrossed, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import FoodImg from '@/components/FoodImg';
import { getInternos } from '@/api/locales';
import { matchQuery, matchChipInterno } from '@/lib/filtros';

const CHIPS = ['Hoy', 'Hasta S/8', 'Patio', 'Biblioteca'];

function InternoCard({ local }) {
    const nombre    = local.nombre;
    const letter    = nombre[0]?.toUpperCase() ?? '?';
    const producto  = local.productos?.[0];
    const disponible = local.total_resenas ?? producto?.cantidad_disponible ?? 5;

    return (
        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] transition-shadow">
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
                        <FoodImg src={producto.foto_url ?? local.foto_url} alt={producto.nombre} className="w-full h-full object-cover" iconSize={22} />
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
    const [query,    setQuery]    = useState('');

    useEffect(() => {
        getInternos()
            .then(r => setLocals(r.data.data))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(
        () => locals.filter(l => matchQuery(l, query) && matchChipInterno(l, chip)),
        [locals, query, chip]
    );

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 bg-white shrink-0 lg:hidden" />

            {/* Header */}
            <div className="bg-white px-5 pt-3 pb-0 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-6xl lg:mx-auto">
                    {/* Nav row */}
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => navigate(-1)} className="text-slate-900 lg:hidden">
                            <ArrowLeft size={22} />
                        </button>
                        <p className="font-bold text-slate-900 text-[18px] lg:text-[24px] font-display">Locales Internos</p>
                        <Info size={22} className="text-blue-600" />
                    </div>

                    {/* Search bar (funcional) */}
                    <div className="flex items-center gap-2.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 mb-3 lg:max-w-xl focus-within:border-blue-400 transition-colors">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text" value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Buscar compañero o platillo..."
                            className="flex-1 bg-transparent text-[14px] text-slate-900 placeholder-slate-400 outline-none"
                        />
                        {query && <button onClick={() => setQuery('')} className="text-[12px] text-slate-400 shrink-0">Limpiar</button>}
                    </div>

                    {/* Info strip */}
                    <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mb-3 lg:max-w-2xl">
                        <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-snug">
                            Compañeros UTP Ate que cocinan y venden en el campus hoy. Paga por Yape o Plin.
                        </p>
                    </div>

                    {/* Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-3 lg:flex-wrap" style={{ scrollbarWidth: 'none' }}>
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
            </div>

            {/* Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-28 lg:px-8 lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
                <div className="flex items-center gap-2 pt-4 pb-3">
                    <UtensilsCrossed size={15} className="text-blue-600" />
                    <p className="font-bold text-slate-900 text-[15px] lg:text-lg">
                        Disponible ahora · {loading ? '...' : filtered.length} {filtered.length === 1 ? 'oferta' : 'ofertas'}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-slate-200 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <UtensilsCrossed size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">
                            {query ? `Sin resultados para "${query}"` : 'No hay emprendedores con oferta hoy'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filtered.map(l => <InternoCard key={l.id} local={l} />)}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
