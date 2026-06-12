import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, CircleCheck, Clock, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import BottomNavEmprendedor from '@/components/BottomNavEmprendedor';
import { guardarProducto } from '@/api/emprendedor';

// Construye la URL absoluta de una foto guardada en storage.
// Respeta VITE_STORAGE_URL; si no está, la deriva de VITE_API_URL.
const STORAGE_BASE = import.meta.env.VITE_STORAGE_URL
    ?? (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '') + '/storage';
const STORAGE = STORAGE_BASE.replace(/\/+$/, '') + '/';
const fotoUrl = (path) => (path?.startsWith('http') ? path : path ? STORAGE + path : null);

export default function EmprendedorPublicar() {
    const navigate = useNavigate();
    const location = useLocation();
    // Si venimos del botón "Editar", el producto llega por el state de navegación.
    const editing = location.state?.producto ?? null;

    const [form, setForm] = useState({
        nombre:              editing?.nombre ?? '',
        descripcion:         editing?.descripcion ?? '',
        precio:              editing?.precio != null ? String(editing.precio) : '',
        cantidad_disponible: editing?.cantidad_disponible != null ? String(editing.cantidad_disponible) : '10',
        hora_inicio:         editing?.hora_inicio?.slice(0, 5) ?? '11:00',
        hora_fin:            editing?.hora_fin?.slice(0, 5) ?? '14:00',
    });
    const [saving,   setSaving]   = useState(false);
    const [success,  setSuccess]  = useState(false);
    const [error,    setError]    = useState('');
    const [foto,     setFoto]     = useState(null);
    // Precarga la foto existente al editar (URL del storage); o la nueva elegida.
    const [preview,  setPreview]  = useState(
        fotoUrl(editing?.foto) ?? fotoUrl(location.state?.fotoUrl) ?? null
    );

    const pickFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Validar ANTES de bloquear el botón (evita que quede colgado).
        if (!form.nombre.trim())                       return toast.error('El nombre del plato es obligatorio.');
        if (!form.precio || Number(form.precio) <= 0)  return toast.error('Ingresa un precio válido.');
        if (form.hora_inicio && form.hora_fin && form.hora_fin <= form.hora_inicio)
            return toast.error('La hora de fin debe ser posterior a la de inicio.');

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('nombre',             form.nombre.trim());
            fd.append('descripcion',        form.descripcion);
            fd.append('precio',             form.precio);
            fd.append('cantidad_disponible', form.cantidad_disponible);
            fd.append('es_menu_dia',        '1');
            if (form.hora_inicio) fd.append('hora_inicio', form.hora_inicio);
            if (form.hora_fin)    fd.append('hora_fin', form.hora_fin);
            if (foto) fd.append('foto', foto);
            await guardarProducto(fd);
            toast.success('Oferta publicada correctamente');
            setSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Error al publicar la oferta.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 gap-5">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CircleCheck size={40} className="text-green-600" />
                </div>
                <p className="font-extrabold text-slate-900 text-[22px] text-center">¡Oferta publicada!</p>
                <p className="text-slate-500 text-[14px] text-center">
                    Tu oferta ya está disponible para los estudiantes.
                </p>
                <button onClick={() => navigate('/emprendedor')}
                    className="w-full max-w-xs h-[50px] bg-orange-600 text-white font-bold rounded-2xl">
                    Ir al panel
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 shrink-0 lg:hidden" />

            {/* Nav */}
            <div className="bg-white px-5 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-2xl lg:mx-auto flex items-center gap-3 py-3">
                    <button onClick={() => navigate(-1)} className="lg:hidden">
                        <ArrowLeft size={22} className="text-slate-900" />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px] lg:text-[24px]">{editing ? 'Editar Oferta Diaria' : 'Publicar Oferta Diaria'}</p>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 pt-4 pb-28 lg:px-8 lg:pb-10 lg:max-w-2xl lg:mx-auto lg:w-full">
                {/* Photo upload — proporción 4:3 (como se mostrará), la foto se ve completa */}
                <label className="relative group w-full aspect-[4/3] max-h-[260px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 mb-5 border-2 border-dashed border-slate-300 cursor-pointer overflow-hidden">
                    {preview ? (
                        <>
                            {/* Fondo difuminado para rellenar los lados sin recortar el plato */}
                            <img src={preview} alt="" aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50" />
                            <img src={preview} alt="preview" className="relative h-full w-full object-contain" />
                            {/* Overlay para cambiar la foto */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="flex items-center gap-2 text-white text-[13px] font-semibold bg-black/40 rounded-full px-3.5 py-2">
                                    <Camera size={16} /> Cambiar foto
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Camera size={32} />
                            <p className="text-[13px] font-medium">Agregar foto del plato</p>
                            <p className="text-[11px]">Recomendado: 800×600px · JPG o PNG</p>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={pickFoto} className="hidden" />
                </label>

                {/* Vista previa: así verán tu oferta los estudiantes */}
                {(form.nombre || preview) && (
                    <div className="mb-5">
                        <p className="text-[12px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                            <Star size={13} className="text-amber-400 fill-amber-400" /> Vista previa de tu oferta
                        </p>
                        <div className="bg-white rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 grid place-items-center">
                                {preview
                                    ? <img src={preview} alt="" className="w-full h-full object-cover" />
                                    : <Camera size={20} className="text-slate-300" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 truncate">{form.nombre || 'Nombre del plato'}</p>
                                {form.descripcion && <p className="text-[11px] text-slate-400 truncate">{form.descripcion}</p>}
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[15px] font-extrabold text-blue-600">S/ {form.precio ? Number(form.precio).toFixed(2) : '0.00'}</span>
                                    <span className="text-[10px] font-bold text-green-700 bg-green-50 rounded-lg px-2 py-0.5">{form.cantidad_disponible || 0} disp.</span>
                                </div>
                            </div>
                        </div>
                        {(form.hora_inicio && form.hora_fin) && (
                            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                                <Clock size={11} /> Disponible de {form.hora_inicio} a {form.hora_fin}
                            </p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                            Nombre del plato <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="nombre" required value={form.nombre} onChange={handleChange}
                            placeholder="Ej. Lomo saltado con arroz"
                            className="w-full h-[48px] border border-slate-200 rounded-xl px-4 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                            Descripción
                        </label>
                        <textarea
                            name="descripcion" value={form.descripcion} onChange={handleChange}
                            placeholder="Ingredientes principales, info de alérgenos..."
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                                Precio (S/) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number" name="precio" required min="0.5" step="0.5"
                                value={form.precio} onChange={handleChange}
                                placeholder="8.50"
                                className="w-full h-[48px] border border-slate-200 rounded-xl px-4 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="w-[110px]">
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                                Cantidad
                            </label>
                            <input
                                type="number" name="cantidad_disponible" min="1"
                                value={form.cantidad_disponible} onChange={handleChange}
                                className="w-full h-[48px] border border-slate-200 rounded-xl px-4 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Horario de disponibilidad (configurable por el emprendedor) */}
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Clock size={15} className="text-orange-600" /> Horario de disponibilidad
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <span className="block text-[11px] text-slate-400 mb-1">Desde</span>
                                <input
                                    type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange}
                                    className="w-full h-[48px] border border-slate-200 rounded-xl px-4 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <span className="text-slate-400 mt-5">—</span>
                            <div className="flex-1">
                                <span className="block text-[11px] text-slate-400 mb-1">Hasta</span>
                                <input
                                    type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange}
                                    className="w-full h-[48px] border border-slate-200 rounded-xl px-4 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">
                            Tu oferta estará visible solo en este rango o hasta agotar existencias. Ajústalo a tu disponibilidad.
                        </p>
                    </div>

                    {error && (
                        <p className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                    )}

                    <button type="submit" disabled={saving}
                        className="w-full h-[52px] bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60 active:scale-[0.97] transition-transform shadow-[0_4px_12px_rgba(234,88,12,0.35)]">
                        {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Publicar oferta del día'}
                    </button>
                </form>
            </main>

            <BottomNavEmprendedor />
        </div>
    );
}
