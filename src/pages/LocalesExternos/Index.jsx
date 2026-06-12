import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, LogOut, Store, Users, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import FoodImg from '@/components/FoodImg';
import { getExternos, getInternos } from '@/api/locales';
import { matchQuery, matchChipExterno, matchChipInterno } from '@/lib/filtros';

const CHIPS_EXT = ['Todos', 'Hasta S/10', 'Hasta S/15', '< 5 min', 'Veggie'];
const CHIPS_INT = ['Hoy', 'Hasta S/8', 'Patio', 'Biblioteca'];

function ExtCard({ local }) {
    return (
        <Link to={`/locales-externos/${local.id}`}
            className="shrink-0 w-40 lg:w-auto bg-white rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(15,23,42,0.10)] active:scale-[0.97] hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-all">
            <div className="h-24 lg:h-36 bg-slate-100 overflow-hidden">
                <FoodImg src={local.foto_url} alt={local.nombre} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5 lg:p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-slate-900 text-xs lg:text-sm leading-tight truncate">{local.nombre}</p>
                    <div className="flex items-center gap-0.5 shrink-0">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-slate-500">{Number(local.rating_promedio).toFixed(1)}</span>
                    </div>
                </div>
                <p className="text-[10px] lg:text-xs text-slate-400 truncate">{local.productos?.[0]?.nombre ?? 'Menú del día'}</p>
                <div className="flex items-center justify-between">
                    <span className="text-[13px] lg:text-[15px] font-bold text-orange-600">S/ {Number(local.precio_min).toFixed(0)}</span>
                    {local.distancia_metros && (
                        <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <MapPin size={9} />{local.distancia_metros}m
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

function IntCardRow({ local }) {
    const producto = local.productos?.[0];
    return (
        <Link to={`/locales-internos/${local.id}`}
            className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(15,23,42,0.07)] active:scale-[0.98] hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] transition-all">
            <div className="w-[68px] h-[68px] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <FoodImg src={local.foto_url} alt={local.nombre} className="w-full h-full object-cover" iconSize={22} />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 text-sm truncate">{local.nombre}</p>
                    <span className="shrink-0 text-[10px] font-bold text-green-700 bg-green-50 rounded-lg px-2 py-0.5">
                        {local.total_resenas ?? 5} disp.
                    </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{producto?.nombre ?? 'Oferta del día'}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600">S/ {Number(local.precio_min).toFixed(2)}</span>
                    {local.punto_entrega && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPin size={10} />{local.punto_entrega}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function LocalesExternosIndex() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [externos, setExternos] = useState([]);
    const [internos, setInternos] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [activeTab, setActiveTab] = useState('externos');
    const [chipExt, setChipExt] = useState('Todos');
    const [query, setQuery] = useState('');

    useEffect(() => {
        Promise.all([
            getExternos().then(r => r.data.data),
            getInternos().then(r => r.data.data),
        ]).then(([ext, int]) => {
            setExternos(ext);
            setInternos(int);
        }).finally(() => setLoading(false));
    }, []);

    const changeTab = (key) => {
        setActiveTab(key);
        setChipExt(key === 'externos' ? 'Todos' : 'Hoy');
    };

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const firstName = user?.name?.split(' ')?.[0] ?? 'estudiante';
    const letter    = firstName[0]?.toUpperCase() ?? 'U';

    const extFiltered = useMemo(
        () => externos.filter(l => matchQuery(l, query) && matchChipExterno(l, chipExt)),
        [externos, query, chipExt]
    );
    const intFiltered = useMemo(
        () => internos.filter(l => matchQuery(l, query) && (activeTab === 'internos' ? matchChipInterno(l, chipExt) : true)),
        [internos, query, chipExt, activeTab]
    );

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            {/* Status bar placeholder (solo móvil) */}
            <div className="h-11 bg-white shrink-0 lg:hidden" />

            {/* Header */}
            <div className="bg-white px-5 pt-3 pb-0 lg:px-8 lg:pt-8 shrink-0">
                <div className="w-full lg:max-w-6xl lg:mx-auto">
                    {/* Greeting row */}
                    <div className="flex items-center justify-between mb-3 lg:mb-5">
                        <div>
                            <p className="font-bold text-slate-900 text-[18px] lg:text-[26px] font-display">¡Hola, {firstName}!</p>
                            <p className="text-[12px] lg:text-sm text-slate-500 mt-0.5">¿Qué vas a comer hoy?</p>
                        </div>
                        {/* Avatar + logout solo en móvil/tablet (en desktop está en el sidebar) */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-base">{letter}</span>
                            </div>
                            <button onClick={handleLogout} className="p-1 text-slate-400">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Search bar (funcional) */}
                    <div className="flex items-center gap-2.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 lg:py-3 mb-3 lg:max-w-xl focus-within:border-orange-400 transition-colors">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text" value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Buscar comida, local o compañero..."
                            className="flex-1 bg-transparent text-[14px] text-slate-900 placeholder-slate-400 outline-none"
                        />
                        {query
                            ? <button onClick={() => setQuery('')} className="text-[12px] text-slate-400 shrink-0">Limpiar</button>
                            : <SlidersHorizontal size={16} className="text-orange-600 shrink-0" />}
                    </div>

                    {/* Tab toggle */}
                    <div className="flex border-b border-slate-100">
                        {[
                            { key: 'externos', label: 'Locales Externos', Icon: Store },
                            { key: 'internos', label: 'Locales Internos', Icon: Users },
                        ].map(t => (
                            <button key={t.key} onClick={() => changeTab(t.key)}
                                className={`flex-1 lg:flex-none lg:px-8 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-colors ${
                                    activeTab === t.key
                                        ? 'text-orange-600 border-b-[3px] border-orange-600 -mb-px'
                                        : 'text-slate-400'
                                }`}>
                                <t.Icon size={14} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter chips */}
                    <div className="flex gap-2 overflow-x-auto py-3 lg:flex-wrap" style={{ scrollbarWidth: 'none' }}>
                        {(activeTab === 'externos' ? CHIPS_EXT : CHIPS_INT).map(chip => (
                            <button key={chip} onClick={() => setChipExt(chip)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    chipExt === chip
                                        ? activeTab === 'externos'
                                            ? 'bg-orange-600 text-white border-orange-600'
                                            : 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-500 border-slate-200'
                                }`}>
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto pb-28 lg:pb-10">
                <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 lg:pt-2">
                    {loading ? (
                        <div className="px-5 lg:px-0 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : (
                        <>
                            {/* Sección Externos */}
                            {activeTab === 'externos' && (
                                <>
                                    <div className="flex items-center justify-between px-5 lg:px-0 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Store size={16} className="text-orange-600" />
                                            <p className="font-bold text-slate-900 text-base lg:text-lg">Cerca del campus</p>
                                        </div>
                                        <Link to="/locales-externos/todos" className="text-[12px] text-orange-600">Ver todos →</Link>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto px-5 pb-2 lg:px-0 lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-4 lg:overflow-visible" style={{ scrollbarWidth: 'none' }}>
                                        {extFiltered.length === 0 ? (
                                            <p className="text-sm text-slate-400 py-4">
                                                {query ? `Sin resultados para "${query}"` : 'No hay locales disponibles'}
                                            </p>
                                        ) : extFiltered.map(l => <ExtCard key={l.id} local={l} />)}
                                    </div>

                                    <div className="flex items-center justify-between px-5 lg:px-0 pt-5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-blue-600" />
                                            <p className="font-bold text-slate-900 text-base lg:text-lg">Compañeros que cocinan hoy</p>
                                        </div>
                                        <button onClick={() => changeTab('internos')} className="text-[12px] text-blue-600">Ver todos →</button>
                                    </div>
                                    <div className="flex flex-col gap-2 px-5 pb-2 lg:px-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3">
                                        {intFiltered.length === 0 ? (
                                            <p className="text-sm text-slate-400 py-4">
                                                {query ? `Sin resultados para "${query}"` : 'No hay emprendedores hoy'}
                                            </p>
                                        ) : intFiltered.slice(0, query ? 99 : 3).map(l => <IntCardRow key={l.id} local={l} />)}
                                    </div>
                                </>
                            )}

                            {/* Sección Internos */}
                            {activeTab === 'internos' && (
                                <>
                                    <div className="flex items-center justify-between px-5 lg:px-0 pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                            <UtensilsCrossed size={16} className="text-blue-600" />
                                            <p className="font-bold text-slate-900 text-base lg:text-lg">Disponible ahora</p>
                                        </div>
                                        <span className="text-[12px] text-blue-600">{intFiltered.length} oferta{intFiltered.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 px-5 lg:px-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3">
                                        {intFiltered.length === 0 ? (
                                            <p className="text-sm text-slate-400 py-4">
                                                {query ? `Sin resultados para "${query}"` : 'No hay ofertas hoy'}
                                            </p>
                                        ) : intFiltered.map(l => <IntCardRow key={l.id} local={l} />)}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
