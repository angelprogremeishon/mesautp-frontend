import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, MapPin, Timer, Phone, Smartphone, Camera, Check, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboard, actualizarLocal } from '@/api/emprendedor';

function Field({ label, icon: Icon, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-900">{label}</label>
            <div className="flex items-center gap-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-xl px-3.5 py-3 focus-within:border-orange-500 transition-colors">
                <Icon size={16} className="text-slate-400 shrink-0" />
                <input {...props} className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none" />
            </div>
        </div>
    );
}

export default function MiLocal() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [foto, setFoto]       = useState(null);
    const [preview, setPreview] = useState(null);
    const [tipo, setTipo]       = useState('externo');
    const [form, setForm] = useState({
        nombre: '', descripcion: '', direccion: '', punto_entrega: '',
        horario: '', whatsapp: '', yape: '',
    });
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    useEffect(() => {
        getDashboard()
            .then(r => {
                const l = r.data.local;
                if (!l) { navigate('/emprendedor/registro', { replace: true }); return; }
                setTipo(l.tipo);
                setPreview(l.foto_url ?? null);
                setForm({
                    nombre: l.nombre ?? '', descripcion: l.descripcion ?? '',
                    direccion: l.direccion ?? '', punto_entrega: l.punto_entrega ?? '',
                    horario: l.horario ?? '', whatsapp: l.whatsapp ?? '', yape: l.yape ?? '',
                });
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const pickFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const save = async () => {
        if (!form.nombre.trim()) return toast.error('El nombre del local es obligatorio.');
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('nombre', form.nombre.trim());
            ['descripcion', 'direccion', 'punto_entrega', 'horario', 'whatsapp'].forEach(k => {
                if (form[k].trim()) fd.append(k, form[k].trim());
            });
            if (form.yape.trim()) { fd.append('yape', form.yape.trim()); fd.append('plin', form.yape.trim()); }
            if (foto) fd.append('foto', foto);
            await actualizarLocal(fd);
            toast.success('Local actualizado');
        } catch {
            toast.error('No se pudo guardar. Revisa los datos.');
        } finally {
            setSaving(false);
        }
    };

    const cerrarSesion = async () => { await logout(); navigate('/login', { replace: true }); };

    const isExterno = tipo === 'externo';

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 shrink-0 lg:hidden" />
            <div className="bg-white px-5 lg:px-8 lg:pt-6 shrink-0">
                <div className="w-full lg:max-w-2xl lg:mx-auto flex items-center gap-3 py-3">
                    <button onClick={() => navigate('/emprendedor')} className="text-slate-900">
                        <ArrowLeft size={22} />
                    </button>
                    <p className="font-bold text-slate-900 text-[18px] lg:text-[24px]">Mi local</p>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-5 pt-4 pb-28 lg:px-8 lg:pb-10 lg:max-w-2xl lg:mx-auto lg:w-full">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <label className="w-full h-[120px] bg-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 border-2 border-dashed border-slate-300 cursor-pointer overflow-hidden">
                            {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : (
                                <><Camera size={28} /><span className="text-[12px]">Cambiar foto del local</span></>
                            )}
                            <input type="file" accept="image/*" onChange={pickFoto} className="hidden" />
                        </label>

                        <Field label="Nombre del local *" icon={Store} value={form.nombre} onChange={set('nombre')} placeholder="Nombre" />
                        {isExterno ? (
                            <Field label="Dirección" icon={MapPin} value={form.direccion} onChange={set('direccion')} placeholder="Dirección o referencia" />
                        ) : (
                            <Field label="Punto de entrega" icon={MapPin} value={form.punto_entrega} onChange={set('punto_entrega')} placeholder="Ej: Patio principal" />
                        )}
                        <Field label="Horario" icon={Timer} value={form.horario} onChange={set('horario')} placeholder="Ej: Lun–Vie 12:00–15:00" />
                        <Field label="WhatsApp" icon={Phone} type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="999 888 777" />
                        <Field label="Yape / Plin" icon={Smartphone} type="tel" value={form.yape} onChange={set('yape')} placeholder="Número de pagos" />

                        <button onClick={save} disabled={saving}
                            className="w-full h-[52px] bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform disabled:opacity-60 mt-1">
                            {saving ? 'Guardando...' : 'Guardar cambios'}{!saving && <Check size={18} />}
                        </button>

                        <button onClick={cerrarSesion}
                            className="w-full h-[52px] bg-white text-red-600 font-semibold rounded-2xl border border-red-200 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform">
                            <LogOut size={18} />
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
