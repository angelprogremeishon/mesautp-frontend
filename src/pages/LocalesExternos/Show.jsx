import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, MapPin, Timer, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { getExterno } from '@/api/locales';
import { crearPedido } from '@/api/pedidos';

export default function LocalesExternosShow() {
    const { id }  = useParams();
    const navigate = useNavigate();
    const [local,      setLocal]      = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [reservando, setReservando] = useState(null);
    const [cantidad,   setCantidad]   = useState(1);
    const [nota,       setNota]       = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        getExterno(id).then(({ data }) => setLocal(data)).finally(() => setLoading(false));
    }, [id]);

    const confirmar = async () => {
        setProcessing(true);
        try {
            const { data } = await crearPedido({
                local_id: local.id, producto_id: reservando.id, cantidad, nota,
            });
            navigate('/reserva/confirmacion', {
                state: {
                    pedido: data.pedido, local, producto: reservando,
                    cantidad, whatsapp_url: data.whatsapp_url,
                }
            });
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Error al crear el pedido.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-dvh bg-white flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-orange-600 border-t-transparent animate-spin" />
        </div>
    );

    if (!local) return (
        <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-6">
            <p className="text-slate-400">Local no encontrado</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-orange-600 font-semibold">Volver</button>
        </div>
    );

    const precioMin = Number(local.precio_min ?? 0).toFixed(0);
    const precioMax = Number(local.precio_max ?? 0).toFixed(0);

    return (
        <>
            <div className="min-h-dvh bg-white flex flex-col pb-[80px]">
                {/* Hero image */}
                <div className="relative h-[220px] bg-slate-200 shrink-0">
                    <img src={local.foto_url ?? '/placeholder.jpg'} alt={local.nombre}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = '/placeholder.jpg'; }} />
                    {/* Floating nav */}
                    <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4">
                        <div className="h-11" /> {/* status bar */}
                    </div>
                    <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-4">
                        <button onClick={() => navigate(-1)}
                            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                            <ArrowLeft size={18} className="text-slate-900" />
                        </button>
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Heart size={18} className="text-orange-600" />
                        </button>
                    </div>
                </div>

                {/* Detail card */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                    {/* Name + status */}
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-[24px] font-extrabold text-slate-900 font-display leading-tight flex-1">{local.nombre}</h1>
                        <span className="shrink-0 text-[12px] font-bold text-green-700 bg-green-50 rounded-full px-3 py-1.5">
                            Abierto
                        </span>
                    </div>

                    {/* Category */}
                    <p className="text-[13px] text-slate-500">{local.categoria?.nombre ?? 'Restaurante'}</p>

                    {/* Meta row */}
                    <div className="flex items-center gap-5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Star size={14} className="text-orange-600 fill-orange-600" />
                            <span className="text-[13px] font-semibold text-slate-900">
                                {Number(local.rating_promedio).toFixed(1)} · {local.total_resenas} reseñas
                            </span>
                        </div>
                        {local.distancia_metros && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-orange-600" />
                                <span className="text-[13px] text-slate-500">{local.distancia_metros}m a pie</span>
                            </div>
                        )}
                        {local.horario && (
                            <div className="flex items-center gap-1.5">
                                <Timer size={14} className="text-orange-600" />
                                <span className="text-[13px] text-slate-500">{local.horario}</span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Menu del dia */}
                    {local.productos?.length > 0 && (
                        <div>
                            <h2 className="font-bold text-slate-900 text-[17px] mb-1">Menú del día</h2>
                            <div className="divide-y divide-slate-100">
                                {local.productos.map(p => (
                                    <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 text-[13px]">{p.nombre}</p>
                                            {p.descripcion && <p className="text-[11px] text-slate-500 mt-0.5">{p.descripcion}</p>}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="font-bold text-orange-600 text-[14px]">S/ {Number(p.precio).toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400">{p.cantidad_disponible} disp.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reseñas */}
                    {local.resenas?.length > 0 && (
                        <div>
                            <h2 className="font-bold text-slate-900 text-[17px] mb-3">Reseñas recientes</h2>
                            {local.resenas.slice(0, 3).map(r => (
                                <div key={r.id} className="bg-orange-50 rounded-xl p-3 mb-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[12px] font-semibold text-slate-800">{r.user?.name}</span>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10}
                                                    className={i < r.estrellas ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                    </div>
                                    {r.comentario && <p className="text-[12px] text-slate-500 leading-relaxed">{r.comentario}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reserve bar */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 shadow-[0_-2px_8px_rgba(15,23,42,0.06)] px-5 py-3 flex items-center justify-between gap-4 max-w-md mx-auto">
                <div>
                    <p className="text-[11px] text-slate-400">Precio</p>
                    <p className="font-extrabold text-slate-900 text-[20px]">S/ {precioMin} – S/ {precioMax}</p>
                </div>
                {local.productos?.length > 0 && (
                    <button onClick={() => { setReservando(local.productos[0]); setCantidad(1); setNota(''); }}
                        className="flex items-center gap-2 bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl active:scale-[0.97] transition-transform">
                        <ShoppingBag size={18} />
                        Reservar
                    </button>
                )}
            </div>

            {/* Bottom sheet reserva */}
            {reservando && (
                <div className="fixed inset-0 z-50 flex items-end">
                    <div className="absolute inset-0 bg-slate-900/50" onClick={() => setReservando(null)} />
                    <div className="relative bg-white w-full rounded-t-3xl p-6 max-w-md mx-auto shadow-2xl">
                        <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
                        <p className="font-bold text-slate-900 text-lg mb-0.5">{reservando.nombre}</p>
                        <p className="text-sm text-orange-600 font-semibold mb-5">S/ {Number(reservando.precio).toFixed(2)} por unidad</p>

                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">Cantidad</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
                                        className="w-9 h-9 rounded-xl border border-slate-200 font-bold text-lg flex items-center justify-center">−</button>
                                    <span className="text-lg font-bold w-8 text-center">{cantidad}</span>
                                    <button onClick={() => setCantidad(c => Math.min(c + 1, reservando.cantidad_disponible ?? 99))}
                                        className="w-9 h-9 rounded-xl border border-slate-200 font-bold text-lg flex items-center justify-center">+</button>
                                    <span className="text-sm text-slate-500 ml-1">
                                        Total: <strong>S/ {(Number(reservando.precio) * cantidad).toFixed(2)}</strong>
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">Nota (opcional)</label>
                                <input type="text" value={nota} onChange={e => setNota(e.target.value)}
                                    placeholder="Sin cebolla, extra ají..."
                                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>

                        <button onClick={confirmar} disabled={processing}
                            className="w-full h-12 bg-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                            <ShoppingBag size={18} />
                            {processing ? 'Reservando...' : 'Confirmar reserva'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
