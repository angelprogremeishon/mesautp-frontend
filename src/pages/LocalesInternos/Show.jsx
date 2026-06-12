import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, MapPin, Star, Smartphone, ShoppingBag, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import FoodImg from '@/components/FoodImg';
import { getInterno } from '@/api/locales';
import { crearPedido } from '@/api/pedidos';

export default function LocalesInternosShow() {
    const { id }  = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => location.key === 'default' ? navigate('/locales-internos') : navigate(-1);
    const [local,      setLocal]      = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [cantidad,   setCantidad]   = useState(1);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        getInterno(id).then(({ data }) => setLocal(data)).finally(() => setLoading(false));
    }, [id]);

    const producto = local?.productos?.[0];

    const confirmar = async () => {
        if (!producto) return;
        setProcessing(true);
        try {
            const { data } = await crearPedido({
                local_id: local.id, producto_id: producto.id, cantidad,
            });
            navigate('/reserva/confirmacion', {
                state: {
                    pedido: data.pedido, local, producto,
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
            <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
    );

    if (!local) return (
        <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-6">
            <p className="text-slate-400">Oferta no encontrada</p>
            <button onClick={goBack} className="mt-4 text-blue-600 font-semibold">Volver</button>
        </div>
    );

    const letter = local.nombre[0]?.toUpperCase() ?? '?';
    const disponibles = producto?.cantidad_disponible ?? 5;
    const precioUnit  = Number(producto?.precio ?? local.precio_min);

    /* Selector de cantidad reutilizable */
    const QtySelector = () => (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <button onClick={() => setCantidad(c => Math.max(1, c - 1))}><Minus size={16} className="text-slate-500" /></button>
            <span className="font-bold text-slate-900 text-[16px] min-w-[20px] text-center">{cantidad}</span>
            <button onClick={() => setCantidad(c => Math.min(c + 1, disponibles))}><Plus size={16} className="text-orange-600" /></button>
        </div>
    );

    return (
        <div className="min-h-dvh bg-white lg:bg-slate-50">
            {/* Nav bar (móvil) */}
            <div className="lg:hidden h-11 bg-white" />
            <div className="lg:hidden flex items-center justify-between px-5 pb-3 pt-1 bg-white">
                <button onClick={goBack}><ArrowLeft size={22} className="text-slate-900" /></button>
                <p className="font-bold text-slate-900 text-[18px] font-display">Detalle de Oferta</p>
                <Share2 size={20} className="text-slate-500" />
            </div>

            <div className="lg:max-w-6xl lg:mx-auto lg:px-8 lg:py-8 lg:grid lg:grid-cols-[1.7fr_1fr] lg:gap-8 lg:items-start">

                {/* ─── Columna principal ─── */}
                <div className="flex flex-col pb-[88px] lg:pb-0 lg:bg-white lg:rounded-3xl lg:shadow-sm lg:overflow-hidden">
                    {/* Desktop top bar */}
                    <div className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2">
                        <button onClick={goBack} className="flex items-center gap-1.5 text-slate-400 text-sm hover:text-slate-600 transition-colors">
                            <ArrowLeft size={16} /> Volver
                        </button>
                        <Share2 size={18} className="text-slate-400" />
                    </div>

                    {/* Dish hero */}
                    <div className="h-[200px] lg:h-[320px] bg-slate-100 shrink-0 lg:mx-8 lg:rounded-2xl lg:overflow-hidden">
                        <FoodImg src={local.foto_url} alt={local.nombre} className="w-full h-full object-cover" iconSize={48} />
                    </div>

                    {/* Offer card */}
                    <div className="px-5 py-5 lg:px-8 lg:py-6 space-y-4">
                        {/* Seller card */}
                        <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-3.5">
                            <div className="w-[50px] h-[50px] bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-[22px]">{letter}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 text-[16px]">{local.nombre}</p>
                                <p className="text-[12px] text-slate-500">{local.descripcion?.slice(0, 50) ?? 'Emprendedor UTP Ate'}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={11} className="text-amber-400 fill-amber-400" />
                                    <span className="text-[11px] font-semibold text-slate-700">{Number(local.rating_promedio).toFixed(1)}</span>
                                </div>
                            </div>
                            {local.whatsapp && (
                                <a href={`https://wa.me/${local.whatsapp}`} target="_blank" rel="noreferrer"
                                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">WA</span>
                                </a>
                            )}
                        </div>

                        {/* Dish name + price */}
                        <div>
                            <p className="font-extrabold text-slate-900 text-[22px] lg:text-[26px] font-display">{producto?.nombre ?? local.nombre}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="font-extrabold text-blue-600 text-[28px]">
                                    S/ {precioUnit.toFixed(2)}
                                </span>
                                <span className="text-[12px] font-semibold text-green-700 bg-green-50 rounded-full px-3 py-1.5">
                                    {disponibles} porciones disponibles
                                </span>
                            </div>
                        </div>

                        {/* Point card */}
                        {local.punto_entrega && (
                            <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                                <MapPin size={20} className="text-orange-600 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[11px] text-slate-400">Punto de encuentro</p>
                                    <p className="text-[13px] font-semibold text-slate-900">{local.punto_entrega}</p>
                                </div>
                                {local.horario && (
                                    <span className="text-[11px] font-bold text-white bg-orange-600 rounded-lg px-2 py-1 shrink-0">
                                        {local.horario}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Payment */}
                        <div>
                            <p className="font-bold text-slate-900 text-[15px] mb-2">Método de pago</p>
                            <div className="flex gap-2.5">
                                {local.yape && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                                        <Smartphone size={14} className="text-blue-600" />
                                        <span className="text-[13px] font-semibold text-slate-900">Yape</span>
                                    </div>
                                )}
                                {local.plin && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                                        <Smartphone size={14} className="text-blue-600" />
                                        <span className="text-[13px] font-semibold text-slate-900">Plin</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Panel de reserva sticky (desktop) ─── */}
                <aside className="hidden lg:block lg:sticky lg:top-8">
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <p className="text-[12px] text-slate-400">Precio por porción</p>
                        <p className="font-extrabold text-blue-600 text-[30px] mb-1">S/ {precioUnit.toFixed(2)}</p>
                        <p className="text-[12px] text-green-700 font-semibold mb-5">{disponibles} porciones disponibles</p>

                        <p className="text-[13px] font-medium text-slate-700 mb-2">Cantidad</p>
                        <div className="flex items-center justify-between mb-5">
                            <QtySelector />
                            <span className="text-sm text-slate-500">
                                Total <strong className="text-slate-900">S/ {(precioUnit * cantidad).toFixed(2)}</strong>
                            </span>
                        </div>

                        <button onClick={confirmar} disabled={processing || disponibles === 0}
                            className="w-full h-[52px] bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                            <ShoppingBag size={18} />
                            {processing ? 'Reservando...' : 'Reservar ahora'}
                        </button>
                        <p className="text-[11px] text-slate-400 text-center mt-3">
                            Paga por Yape o Plin al recoger
                        </p>
                    </div>
                </aside>
            </div>

            {/* CTA bar (móvil) */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 shadow-[0_-2px_8px_rgba(15,23,42,0.06)] px-5 py-3 flex items-center gap-3 max-w-md mx-auto">
                <QtySelector />
                <button onClick={confirmar} disabled={processing || disponibles === 0}
                    className="flex-1 h-[50px] bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.97] transition-transform">
                    <ShoppingBag size={18} />
                    {processing ? 'Reservando...' : `Reservar · S/ ${(precioUnit * cantidad).toFixed(2)}`}
                </button>
            </div>
        </div>
    );
}
