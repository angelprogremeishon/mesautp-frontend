import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import FoodImg from '@/components/FoodImg';
import { getPedidos, calificar } from '@/api/pedidos';

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Muy bueno'];
const CHIPS  = ['Buena porción', 'Sabor casero', 'Precio justo', 'Puntual', 'Muy rico', 'Limpio'];

export default function EscribirResena() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [pedido,  setPedido]  = useState(location.state?.pedido ?? null);
    const [estrellas, setEstrellas] = useState(5);
    const [hover,   setHover]   = useState(0);
    const [tags,    setTags]    = useState([]);
    const [comentario, setComentario] = useState('');
    const [saving,  setSaving]  = useState(false);

    // Si entran directo (sin state), busca el pedido y precarga la reseña si ya existe.
    useEffect(() => {
        if (pedido) {
            if (pedido.resena) {
                setEstrellas(pedido.resena.estrellas);
                setComentario(pedido.resena.comentario ?? '');
            }
            return;
        }
        getPedidos().then(r => {
            const p = r.data.find(x => String(x.id) === String(id));
            if (!p) { navigate('/mis-pedidos', { replace: true }); return; }
            setPedido(p);
            if (p.resena) {
                setEstrellas(p.resena.estrellas);
                setComentario(p.resena.comentario ?? '');
            }
        });
    }, [id, pedido, navigate]);

    const toggleTag = (t) =>
        setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    const submit = async () => {
        if (estrellas < 1) return toast.error('Selecciona cuántas estrellas le das.');
        setSaving(true);
        try {
            const tagsText = tags.join(' · ');
            const comentarioFinal = [tagsText, comentario.trim()].filter(Boolean).join(' — ');
            await calificar(id, { estrellas, comentario: comentarioFinal || null });
            toast.success('¡Gracias por tu reseña!');
            navigate('/mis-pedidos', { replace: true });
        } catch {
            toast.error('No se pudo publicar la reseña.');
        } finally {
            setSaving(false);
        }
    };

    const nombreItem = pedido?.producto?.nombre ?? pedido?.local?.nombre ?? 'Pedido';
    const vendedor   = pedido?.local?.nombre ?? '';
    const fecha = pedido
        ? new Date(pedido.created_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '';
    const shown = hover || estrellas;

    return (
        <div className="min-h-dvh bg-white flex flex-col">
            <div className="h-11 shrink-0 lg:hidden" />

            {/* Nav */}
            <div className="px-5 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-xl lg:mx-auto flex items-center gap-3 py-3">
                    <button onClick={() => navigate('/mis-pedidos')} className="text-slate-900">
                        <ArrowLeft size={22} />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px] lg:text-[24px]">Calificar pedido</p>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 pt-2 pb-10 lg:px-8 lg:max-w-xl lg:mx-auto lg:w-full">
                {/* Resumen del pedido */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-6">
                    <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <FoodImg src={pedido?.local?.foto_url} alt={nombreItem} className="w-full h-full object-cover" iconSize={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-[14px] truncate">{nombreItem}</p>
                        <p className="text-[12px] text-slate-400 truncate">{vendedor}{vendedor && ' · '}{fecha}</p>
                    </div>
                </div>

                {/* Estrellas */}
                <p className="text-center font-bold text-slate-900 text-[15px]">¿Cómo calificarías este pedido?</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button"
                            onClick={() => setEstrellas(n)}
                            onMouseEnter={() => setHover(n)}
                            onMouseLeave={() => setHover(0)}
                            className="active:scale-90 transition-transform">
                            <Star size={36} className={n <= shown ? 'text-orange-500 fill-orange-500' : 'text-slate-200'} />
                        </button>
                    ))}
                </div>
                <p className="text-center text-orange-600 font-semibold text-[13px] mt-2 h-5">{LABELS[shown] ?? ''}</p>

                {/* Chips */}
                <p className="font-semibold text-slate-900 text-[14px] mt-6 mb-2">¿Qué destacarías?</p>
                <div className="flex flex-wrap gap-2">
                    {CHIPS.map(t => {
                        const active = tags.includes(t);
                        return (
                            <button key={t} type="button" onClick={() => toggleTag(t)}
                                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                                    active
                                        ? 'bg-orange-600 text-white border-orange-600'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                }`}>
                                {t}
                            </button>
                        );
                    })}
                </div>

                {/* Comentario */}
                <p className="font-semibold text-slate-900 text-[14px] mt-6 mb-2">Comentario (opcional)</p>
                <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    rows={4}
                    placeholder="Cuéntanos cómo estuvo tu experiencia..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />

                <button onClick={submit} disabled={saving}
                    className="w-full h-[52px] bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform disabled:opacity-60 mt-5 shadow-[0_4px_12px_rgba(234,88,12,0.35)]">
                    <Send size={18} />
                    {saving ? 'Publicando...' : 'Publicar reseña'}
                </button>
            </main>
        </div>
    );
}
