import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Search, SlidersHorizontal, Star, MapPin,
    Map, List, UtensilsCrossed, Navigation, X, ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BottomNav from '@/components/BottomNav';
import { getExternos } from '@/api/locales';

/* ─── Fix Leaflet default icon paths broken by Vite ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── Custom icons ─── */
const userIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:18px;height:18px;
        background:#3B82F6;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(59,130,246,0.5);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const pinIcon = (active = false) => L.divIcon({
    className: '',
    html: `<div style="
        width:36px;height:36px;
        background:${active ? '#0F172A' : '#EA580C'};
        border:2.5px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(15,23,42,0.3);
        display:flex;align-items:center;justify-content:center;
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

/* ─── Invalida el tamaño después del mount (fix Leaflet en flex) ─── */
function MapReady() {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 50);
        return () => clearTimeout(t);
    }, [map]);
    return null;
}

/* ─── Fly to user position when available ─── */
function FlyToUser({ pos }) {
    const map = useMap();
    useEffect(() => {
        if (pos) map.flyTo(pos, 16, { animate: true, duration: 1.2 });
    }, [pos, map]);
    return null;
}

/* ─── Locate button that re-centers on user ─── */
function LocateBtn({ pos, onLocate }) {
    const map = useMap();
    const handle = () => {
        if (pos) { map.flyTo(pos, 16, { animate: true, duration: 1 }); return; }
        onLocate();
    };
    return (
        <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '90px', marginRight: '12px' }}>
            <button
                onClick={handle}
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                style={{ pointerEvents: 'all' }}>
                <Navigation size={18} className={pos ? 'text-blue-600' : 'text-slate-400'} />
            </button>
        </div>
    );
}

/* ─── Map view ─── */
const UTP_ATE = [-12.0855, -76.9723]; // UTP Ate default center

function MapaView({ locales, onPinClick, selectedId }) {
    const [userPos, setUserPos]   = useState(null);
    const [geoErr,  setGeoErr]    = useState(false);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) { setGeoErr(true); return; }
        navigator.geolocation.getCurrentPosition(
            pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
            ()  => setGeoErr(true),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => { requestLocation(); }, [requestLocation]);

    const localesConCoordenadas = locales.filter(l => l.latitud && l.longitud);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <MapContainer
                center={UTP_ATE}
                zoom={15}
                zoomControl={false}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapReady />
                <FlyToUser pos={userPos} />

                {/* User location */}
                {userPos && (
                    <>
                        <Circle
                            center={userPos}
                            radius={60}
                            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.12, weight: 1.5 }}
                        />
                        <Marker position={userPos} icon={userIcon} />
                    </>
                )}

                {/* Local pins */}
                {localesConCoordenadas.map(l => (
                    <Marker
                        key={l.id}
                        position={[l.latitud, l.longitud]}
                        icon={pinIcon(selectedId === l.id)}
                        eventHandlers={{ click: () => onPinClick(l) }}
                    />
                ))}

                {/* Locate + zoom controls */}
                <LocateBtn pos={userPos} onLocate={requestLocation} />
            </MapContainer>

            {/* No GPS banner */}
            {geoErr && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm
                    rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-[12px] text-slate-600 pointer-events-none">
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    Activa la ubicación para ver tu posición
                </div>
            )}

            {/* No pins info banner */}
            {localesConCoordenadas.length === 0 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm
                    rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-[12px] text-slate-600 pointer-events-none">
                    <MapPin size={13} className="text-orange-600 shrink-0" />
                    Los locales aún no tienen coordenadas registradas
                </div>
            )}
        </div>
    );
}

/* ─── Bottom sheet del pin seleccionado ─── */
function LocalSheet({ local, onClose }) {
    if (!local) return null;
    const precio = Number(local.precio_min ?? 0);
    const rating = Number(local.rating_promedio ?? 0).toFixed(1);
    const cat    = local.categoria?.nombre ?? 'Restaurante';

    return (
        <div className="absolute bottom-0 left-0 right-0 z-[1000]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Scrim */}
            <div className="absolute inset-0 -top-screen" onClick={onClose} />

            <div className="relative bg-white rounded-t-[20px] shadow-[0_-6px_24px_rgba(15,23,42,0.22)] pb-24">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                </div>

                {/* Header row */}
                <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img src={local.foto_url ?? '/placeholder.jpg'} alt={local.nombre}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.src = '/placeholder.jpg'; }} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-[15px]">{local.nombre}</p>
                            <p className="text-[11px] text-slate-400">{cat}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <X size={14} className="text-slate-500" />
                    </button>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-4 px-4 pb-4">
                    <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span className="text-[12px] font-semibold text-slate-700">{rating}</span>
                    </div>
                    <span className="text-[12px] font-bold text-orange-600">
                        Desde S/{precio.toFixed(0)}
                    </span>
                    {local.distancia_metros && (
                        <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            <span className="text-[12px] text-slate-400">{local.distancia_metros}m</span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="px-4">
                    <Link to={`/locales-externos/${local.id}`}
                        className="flex items-center justify-center gap-2 w-full h-12 bg-orange-600
                            text-white font-bold rounded-2xl active:scale-[0.97] transition-transform
                            shadow-[0_4px_12px_rgba(234,88,12,0.35)]">
                        Ver local
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ─── Filter chips ─── */
const FILTROS = ['Todos', 'Hasta S/10', '< 5 min', 'Almuerzo', 'Menú del día'];

/* ─── Card de lista ─── */
function ECard({ local }) {
    const nombre = local.nombre ?? '';
    const precio = Number(local.precio_min ?? 0);
    const rating = Number(local.rating_promedio ?? 0).toFixed(1);
    const cat    = local.categoria?.nombre ?? 'Restaurante';
    const tag    = local.productos?.[0]?.nombre ?? 'Menú del día';
    const dist   = local.distancia_metros;

    return (
        <Link to={`/locales-externos/${local.id}`}
            className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(15,23,42,0.063)] active:scale-[0.98] transition-transform">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={local.foto_url ?? '/placeholder.jpg'} alt={nombre}
                    className="w-full h-full object-cover" loading="lazy"
                    onError={e => { e.target.src = '/placeholder.jpg'; }} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
                <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-slate-900 text-[13px] truncate">{nombre}</p>
                    <span className="shrink-0 text-[10px] font-semibold text-green-700 bg-green-50 rounded-lg px-1.5 py-0.5">
                        Abierto
                    </span>
                </div>
                <p className="text-[11px] text-slate-500">{cat} · S/{precio.toFixed(0)}–{(precio + 4).toFixed(0)}</p>
                <span className="self-start text-[10px] font-medium text-orange-600 bg-orange-50 rounded-lg px-[7px] py-[2px]">
                    {tag}
                </span>
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-[3px]">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-semibold text-slate-700">{rating}</span>
                    </div>
                    {dist && (
                        <div className="flex items-center gap-[3px]">
                            <MapPin size={11} className="text-slate-400" />
                            <span className="text-[11px] text-slate-400">{dist}m</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

/* ─── Página principal ─── */
export default function LocalesExternosTodos() {
    const navigate  = useNavigate();
    const [locales, setLocales]  = useState([]);
    const [loading, setLoading]  = useState(true);
    const [query,   setQuery]    = useState('');
    const [filtro,  setFiltro]   = useState('Todos');
    const [tab,     setTab]      = useState('lista');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        getExternos()
            .then(r => setLocales(r.data.data ?? r.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = Array.isArray(locales) ? locales.filter(l => {
        const matchQuery = !query || l.nombre?.toLowerCase().includes(query.toLowerCase());
        const matchCat   =
            filtro === 'Todos'        ? true :
            filtro === 'Hasta S/10'   ? Number(l.precio_min ?? 0) <= 10 :
            filtro === '< 5 min'      ? Number(l.distancia_metros ?? 999) < 500 :
            filtro === 'Almuerzo'     ? ['Criolla', 'Menú del día'].includes(l.categoria?.nombre) :
            filtro === 'Menú del día' ? l.productos?.[0]?.nombre?.toLowerCase().includes('men') :
            true;
        return matchQuery && matchCat;
    }) : [];

    const isMapaTab = tab === 'mapa';
    const headerRef = useRef(null);
    const [mapH, setMapH] = useState(0);

    useEffect(() => {
        if (!isMapaTab) return;
        const measure = () => {
            const hh = headerRef.current?.offsetHeight ?? 0;
            const navH = 80; // BottomNav height
            setMapH(window.innerHeight - hh - navH);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [isMapaTab]);

    return (
        <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
            {/* Status bar */}
            <div className="h-11 bg-white shrink-0" />

            {/* Header */}
            <div ref={headerRef} className="bg-white px-5 pt-3 pb-0 shrink-0">
                {/* Nav row */}
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => navigate(-1)} className="text-slate-900">
                        <ArrowLeft size={22} />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px]">Locales Externos</p>
                    <SlidersHorizontal size={20} className="text-orange-600" />
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-xl px-3.5 h-[44px] mb-3">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                        type="text" value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar local, menú del día..."
                        className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none"
                    />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
                    {FILTROS.map(f => (
                        <button key={f} onClick={() => setFiltro(f)}
                            className={`shrink-0 px-[10px] py-[5px] rounded-2xl text-[11px] font-semibold border transition-colors ${
                                filtro === f
                                    ? 'bg-orange-600 text-white border-orange-600'
                                    : 'bg-white text-slate-500 border-[#E2E8F0]'
                            }`}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Tab bar */}
                <div className="flex border-t border-[#E2E8F0] -mx-5">
                    {[
                        { key: 'lista', label: 'Lista', Icon: List },
                        { key: 'mapa',  label: 'Mapa',  Icon: Map  },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className="flex-1 flex flex-col items-center">
                            <div className="flex items-center justify-center gap-1.5 h-[42px]">
                                <t.Icon size={14} className={tab === t.key ? 'text-orange-600' : 'text-slate-400'} />
                                <span className={`text-[14px] ${tab === t.key ? 'font-bold text-orange-600' : 'text-slate-400'}`}>
                                    {t.label}
                                </span>
                            </div>
                            <div className={`h-[2px] w-full ${tab === t.key ? 'bg-orange-600' : 'bg-[#F1F5F9]'}`} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Result count — lista only */}
            {!loading && !isMapaTab && (
                <p className="px-5 pt-2 pb-1 text-[12px] text-slate-500 shrink-0">
                    {filtered.length} local{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''} cerca de UTP Ate
                </p>
            )}

            {/* ── LISTA ── */}
            {!isMapaTab && (
                <main className="flex-1 overflow-y-auto min-h-0 px-5 pt-1 pb-28">
                    {loading ? (
                        <div className="space-y-3 pt-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-[88px] bg-slate-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <UtensilsCrossed size={48} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-[14px] font-medium text-slate-500">No se encontraron locales</p>
                            <p className="text-[12px] text-slate-400 mt-1">Prueba con otro filtro o búsqueda</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pt-1 pb-4">
                            {filtered.map(l => <ECard key={l.id} local={l} />)}
                        </div>
                    )}
                </main>
            )}

            {/* ── MAPA ── */}
            {isMapaTab && mapH > 0 && (
                <div className="relative" style={{ height: mapH, flexShrink: 0, overflow: 'hidden' }}>
                    <MapaView
                        locales={filtered}
                        selectedId={selected?.id}
                        onPinClick={l => setSelected(prev => prev?.id === l.id ? null : l)}
                    />
                    <LocalSheet local={selected} onClose={() => setSelected(null)} />
                </div>
            )}

            <BottomNav />
        </div>
    );
}
