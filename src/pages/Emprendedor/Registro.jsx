import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { registrar } from '@/api/emprendedor';

export default function EmprendedorRegistro() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre:        '',
        tipo:          'interno',
        categoria:     '',
        descripcion:   '',
        horario:       '',
        whatsapp:      '',
        yape:          '',
        plin:          '',
        punto_entrega: '',
        direccion:     '',
    });
    const [foto,    setFoto]    = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors,  setErrors]  = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const pickFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!form.nombre.trim()) {
            toast.error('El nombre del local es obligatorio.');
            return;
        }
        if (!form.categoria) {
            toast.error('Selecciona una categoría.');
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
            if (foto) fd.append('foto', foto);
            await registrar(fd);
            toast.success('Local registrado correctamente');
            navigate('/emprendedor', { replace: true });
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
                toast.error('Revisa los campos marcados.');
            } else {
                toast.error('Error al registrar. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Registrar local" back="/locales-externos">
            <div className="pt-3 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Store size={18} className="text-orange-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">Nuevo local</p>
                        <p className="text-xs text-slate-500">Completa los datos básicos para empezar</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Información básica</p>

                    <Field label="Nombre del local *" error={errors.nombre?.[0]}>
                        <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                            placeholder="Ej. Cevichería Los Amigos" className={inputCls(errors.nombre)} />
                    </Field>

                    <Field label="Tipo *" error={errors.tipo?.[0]}>
                        <div className="flex gap-2">
                            {['interno', 'externo'].map(t => (
                                <button key={t} type="button" onClick={() => set('tipo', t)}
                                    className={`flex-1 h-10 rounded-lg border text-sm font-semibold capitalize transition-colors ${form.tipo === t ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field label="Categoría *" error={errors.categoria?.[0]}>
                        <select value={form.categoria} onChange={e => set('categoria', e.target.value)} className={inputCls(errors.categoria)}>
                            <option value="">Selecciona una categoría</option>
                            {['Criolla', 'Pollo a la brasa', 'Mariscos', 'Fusión', 'Menú del día', 'Bebidas', 'Snacks'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Descripción" error={errors.descripcion?.[0]}>
                        <textarea rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                            placeholder="¿Qué ofreces? ¿Qué te hace especial?"
                            className={`${inputCls(errors.descripcion)} resize-none h-20`} />
                    </Field>

                    <Field label="Foto del local">
                        <label className="flex items-center gap-2 h-10 px-3 border border-slate-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors text-sm text-slate-600">
                            <Upload size={14} className="text-slate-400" />
                            {foto ? foto.name : 'Subir imagen (JPG/PNG)'}
                            <input type="file" accept="image/*" onChange={pickFoto} className="hidden" />
                        </label>
                        {preview && <img src={preview} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg" />}
                    </Field>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacto y pago</p>

                    <Field label="WhatsApp" error={errors.whatsapp?.[0]}>
                        <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                            placeholder="9XXXXXXXX" className={inputCls(errors.whatsapp)} />
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                        <Field label="N° Yape" error={errors.yape?.[0]}>
                            <input type="tel" value={form.yape} onChange={e => set('yape', e.target.value)}
                                placeholder="9XXXXXXXX" className={inputCls(errors.yape)} />
                        </Field>
                        <Field label="N° Plin" error={errors.plin?.[0]}>
                            <input type="tel" value={form.plin} onChange={e => set('plin', e.target.value)}
                                placeholder="9XXXXXXXX" className={inputCls(errors.plin)} />
                        </Field>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ubicación y horario</p>

                    <Field label="Horario" error={errors.horario?.[0]}>
                        <input type="text" value={form.horario} onChange={e => set('horario', e.target.value)}
                            placeholder="Lun–Vie, 12:00–15:00" className={inputCls(errors.horario)} />
                    </Field>

                    {form.tipo === 'externo' ? (
                        <Field label="Dirección" error={errors.direccion?.[0]}>
                            <input type="text" value={form.direccion} onChange={e => set('direccion', e.target.value)}
                                placeholder="Av. Javier Prado Este 4600" className={inputCls(errors.direccion)} />
                        </Field>
                    ) : (
                        <Field label="Punto de entrega" error={errors.punto_entrega?.[0]}>
                            <input type="text" value={form.punto_entrega} onChange={e => set('punto_entrega', e.target.value)}
                                placeholder="Pabellón C – 1er piso" className={inputCls(errors.punto_entrega)} />
                        </Field>
                    )}
                </div>

                <button type="submit" disabled={loading}
                    className="w-full h-12 bg-orange-600 text-white font-semibold rounded-xl disabled:opacity-60 mb-6">
                    {loading ? 'Registrando...' : 'Registrar local'}
                </button>
            </form>
        </AppLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function inputCls(error) {
    return `w-full h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;
}
