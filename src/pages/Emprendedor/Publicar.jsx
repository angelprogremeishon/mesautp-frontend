import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import BottomNavEmprendedor from '@/components/BottomNavEmprendedor';
import { guardarProducto } from '@/api/emprendedor';

export default function EmprendedorPublicar() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        cantidad_disponible: '10',
    });
    const [saving,   setSaving]   = useState(false);
    const [success,  setSuccess]  = useState(false);
    const [error,    setError]    = useState('');

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        if (!form.nombre.trim()) {
            toast.error('El nombre del plato es obligatorio.');
            return;
        }
        if (!form.precio || Number(form.precio) <= 0) {
            toast.error('Ingresa un precio válido.');
            return;
        }

        try {
            const fd = new FormData();
            fd.append('nombre',             form.nombre.trim());
            fd.append('descripcion',        form.descripcion);
            fd.append('precio',             form.precio);
            fd.append('cantidad_disponible', form.cantidad_disponible);
            fd.append('es_menu_dia',        '1');
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
            <div className="h-11 shrink-0" />

            {/* Nav */}
            <div className="bg-white px-5 shrink-0">
                <div className="flex items-center gap-3 py-3">
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft size={22} className="text-slate-900" />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px]">Publicar Oferta Diaria</p>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 pt-4 pb-28">
                {/* Photo placeholder */}
                <button className="w-full h-[140px] bg-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 mb-5 border-2 border-dashed border-slate-300">
                    <Camera size={32} />
                    <p className="text-[13px] font-medium">Agregar foto del plato</p>
                    <p className="text-[11px]">Recomendado: 800×600px</p>
                </button>

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

                    {/* Info strip */}
                    <div className="bg-blue-50 rounded-xl p-3.5 text-[12px] text-blue-700">
                        La oferta estará visible hasta las 2:00 pm o hasta agotar existencias.
                    </div>

                    {error && (
                        <p className="text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                    )}

                    <button type="submit" disabled={saving}
                        className="w-full h-[52px] bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60 active:scale-[0.97] transition-transform shadow-[0_4px_12px_rgba(234,88,12,0.35)]">
                        {saving ? 'Publicando...' : 'Publicar oferta del día'}
                    </button>
                </form>
            </main>

            <BottomNavEmprendedor />
        </div>
    );
}
