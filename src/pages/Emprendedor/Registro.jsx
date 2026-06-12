import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, ChefHat, ArrowLeft, ArrowRight, Check, Camera,
    MapPin, Tag, Timer, Phone, Smartphone, IdCard, User, BookOpen, ShieldCheck,
    Mail, Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { emprendedorRegister } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIAS = ['Criolla', 'Pollo a la brasa', 'Mariscos', 'Fusión', 'Menú del día', 'Veggie', 'Snacks', 'Bebidas'];

/* ─── Campo de texto con icono ─── */
function Field({ label, icon: Icon, accent = 'orange', ...props }) {
    const ring = accent === 'blue' ? 'focus-within:border-blue-500' : 'focus-within:border-orange-500';
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-900">{label}</label>
            <div className={`flex items-center gap-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-xl px-3.5 py-3 transition-colors ${ring}`}>
                <Icon size={16} className="text-slate-400 shrink-0" />
                <input {...props}
                    className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none" />
            </div>
        </div>
    );
}

/* ─── Tarjeta de selección de tipo (pantalla 13) ─── */
function TypeCard({ active, accent, icon: Icon, title, desc, feats, onClick }) {
    const isOrange = accent === 'orange';
    const sel = isOrange
        ? 'border-orange-600 shadow-[0_4px_16px_rgba(234,88,12,0.13)]'
        : 'border-blue-600 shadow-[0_4px_16px_rgba(37,99,235,0.13)]';
    return (
        <button type="button" onClick={onClick}
            className={`w-full text-left bg-white rounded-2xl p-5 transition-all ${
                active ? `${sel} border-[2.5px]` : 'border-[1.5px] border-[#E2E8F0] hover:border-slate-300'
            }`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isOrange ? 'bg-orange-50' : 'bg-blue-50'}`}>
                    <Icon size={26} className={isOrange ? 'text-orange-600' : 'text-blue-600'} />
                </div>
                {active && (
                    <span className={`flex items-center gap-1 text-white text-[11px] font-bold rounded-full px-2.5 py-1 ${isOrange ? 'bg-orange-600' : 'bg-blue-600'}`}>
                        <Check size={12} /> Seleccionado
                    </span>
                )}
            </div>
            <p className="font-bold text-slate-900 text-[17px] mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</p>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-3">{desc}</p>
            <div className="flex flex-col gap-1.5">
                {feats.map(f => (
                    <div key={f} className="flex items-center gap-2">
                        <Check size={13} className={isOrange ? 'text-orange-600' : 'text-blue-600'} />
                        <span className="text-[12px] text-slate-600">{f}</span>
                    </div>
                ))}
            </div>
        </button>
    );
}

export default function EmprendedorRegistro() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [tipo, setTipo] = useState('externo');
    const [loading, setLoading] = useState(false);
    const [foto, setFoto]       = useState(null);
    const [preview, setPreview] = useState(null);

    const [form, setForm] = useState({
        nombre: '', direccion: '', categoria: '', horario: '',
        whatsapp: '', yape: '',
        codigo_matricula: '', nombre_completo: '', ciclo_carrera: '',
        name: '', email: '', password: '', password_confirmation: '',
    });
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const pickFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const isExterno = tipo === 'externo';
    const accent = isExterno ? 'orange' : 'blue';

    const submit = async () => {
        // Validación de la cuenta (paso 3)
        if (!form.name.trim())  return toast.error('Ingresa tu nombre.');
        if (!form.email.trim()) return toast.error('Ingresa tu correo.');
        if (!isExterno && !form.email.trim().toLowerCase().endsWith('@utp.edu.pe'))
            return toast.error('El emprendedor interno debe usar su correo @utp.edu.pe.');
        if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres.');
        if (form.password !== form.password_confirmation) return toast.error('Las contraseñas no coinciden.');

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('tipo', tipo);
            fd.append('name', form.name.trim());
            fd.append('email', form.email.trim());
            fd.append('password', form.password);
            fd.append('password_confirmation', form.password_confirmation);
            fd.append('nombre', form.nombre.trim());
            fd.append('whatsapp', form.whatsapp.trim());
            if (form.yape.trim()) { fd.append('yape', form.yape.trim()); fd.append('plin', form.yape.trim()); }

            if (isExterno) {
                fd.append('direccion', form.direccion.trim());
                if (form.categoria) fd.append('categoria', form.categoria);
                if (form.horario.trim()) fd.append('horario', form.horario.trim());
                if (foto) fd.append('foto', foto);
            } else {
                if (form.codigo_matricula.trim()) fd.append('codigo_matricula', form.codigo_matricula.trim());
                if (form.ciclo_carrera.trim()) fd.append('ciclo_carrera', form.ciclo_carrera.trim());
                if (form.nombre_completo.trim()) fd.append('descripcion', form.nombre_completo.trim());
            }

            const { data } = await emprendedorRegister(fd);
            login(data.token, data.user);
            toast.success('¡Cuenta creada! Tu local está en revisión.');
            navigate('/emprendedor', { replace: true });
        } catch (err) {
            if (err.response?.status === 422) {
                const msg = err.response?.data?.errors?.email?.[0] ?? 'Revisa los datos ingresados.';
                toast.error(msg);
            } else {
                toast.error('Error al registrar. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const progress = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

    return (
        <div className="min-h-dvh bg-white flex flex-col">
            <div className="h-11 shrink-0 lg:hidden" />

            <div className="w-full lg:max-w-2xl lg:mx-auto flex-1 flex flex-col">
                {/* Header con progreso */}
                <div className="px-6 lg:px-8 pt-3 lg:pt-8 pb-2">
                    <div className="flex items-center gap-3 mb-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="text-slate-900">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <p className="text-[12px] text-slate-400">
                            {step === 1
                                ? 'Paso 1 de 3'
                                : step === 2
                                    ? `Paso 2 de 3 · ${isExterno ? 'Emprendedor Externo' : 'Emprendedor Interno'}`
                                    : 'Paso 3 de 3 · Tu cuenta'}
                        </p>
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-4">
                        <div className={`h-full rounded-full transition-all duration-300 ${isExterno ? 'bg-orange-600' : 'bg-blue-600'}`}
                            style={{ width: progress }} />
                    </div>

                    {step === 1 ? (
                        <>
                            <h1 className="text-[22px] font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                ¿Cómo quieres registrarte?
                            </h1>
                            <p className="text-[13px] text-slate-500 mt-1">Selecciona el tipo de emprendedor que mejor te describe.</p>
                        </>
                    ) : step === 2 ? (
                        <>
                            <h1 className="text-[22px] font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                {isExterno ? 'Datos de tu local' : 'Tus datos de emprendedor'}
                            </h1>
                            <p className="text-[13px] text-slate-500 mt-1">
                                {isExterno
                                    ? 'Esta información aparecerá en tu ficha pública para los estudiantes.'
                                    : "Tu perfil aparecerá en 'Locales Internos' para que tus compañeros te encuentren."}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-[22px] font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                Crea tu cuenta
                            </h1>
                            <p className="text-[13px] text-slate-500 mt-1">Con esto entrarás a tu panel cada vez, sin esperar correos.</p>
                        </>
                    )}
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-10 pt-2">
                    {step === 1 && (
                        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start">
                            <TypeCard
                                active={isExterno} accent="orange" icon={Store}
                                title="Emprendedor Externo"
                                desc="Tengo un local de comida cercano al campus UTP Ate y quiero registrarlo para que los estudiantes lo encuentren."
                                feats={['Ficha pública con menú', 'Recibe reservas de estudiantes', 'Aparece en el mapa del campus']}
                                onClick={() => setTipo('externo')}
                            />
                            <TypeCard
                                active={!isExterno} accent="blue" icon={ChefHat}
                                title="Estudiante Emprendedor Interno"
                                desc="Soy estudiante de UTP Ate y preparo comida casera para venderla dentro del campus."
                                feats={['Vende a tus compañeros', 'Pagos por Yape o Plin', 'Verificado con tu correo UTP']}
                                onClick={() => setTipo('interno')}
                            />
                            <button onClick={() => setStep(2)}
                                className={`lg:col-span-2 w-full h-[50px] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform ${isExterno ? 'bg-orange-600' : 'bg-blue-600'}`}>
                                Continuar como {isExterno ? 'Emprendedor Externo' : 'Emprendedor Interno'}
                                <ArrowRight size={18} />
                            </button>
                            <button onClick={() => navigate('/login')}
                                className="lg:col-span-2 w-full text-center text-[13px] text-slate-500 hover:text-slate-700 mt-1">
                                ¿Ya tienes cuenta? <span className="font-semibold text-blue-600">Inicia sesión</span>
                            </button>
                        </div>
                    )}

                    {step === 2 && isExterno && (
                        <div className="flex flex-col gap-4">
                            <Field label="Nombre del local *" icon={Store} value={form.nombre} onChange={set('nombre')}
                                placeholder="Ej: Doña Lucha Restaurante" />
                            <Field label="Dirección o referencia *" icon={MapPin} value={form.direccion} onChange={set('direccion')}
                                placeholder="Ej: Jr. Los Claveles 234, Ate Vitarte" />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold text-slate-900">Categoría gastronómica</label>
                                <div className="flex items-center gap-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-xl px-3.5 py-3 focus-within:border-orange-500">
                                    <Tag size={16} className="text-slate-400 shrink-0" />
                                    <select value={form.categoria} onChange={set('categoria')}
                                        className="flex-1 bg-transparent text-[13px] text-slate-900 outline-none">
                                        <option value="">Selecciona una categoría</option>
                                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Field label="Horario de atención" icon={Timer} value={form.horario} onChange={set('horario')}
                                placeholder="Ej: Lunes a Sábado · 11am – 3pm" />
                            <Field label="WhatsApp del local *" icon={Phone} type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                                placeholder="999 888 777" />
                            <Field label="Número Yape / Plin" icon={Smartphone} type="tel" value={form.yape} onChange={set('yape')}
                                placeholder="Mismo o diferente al WhatsApp" />

                            {/* Foto */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-semibold text-slate-900">Foto del local (opcional)</label>
                                <label className="flex flex-col items-center justify-center gap-2 h-[100px] bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-xl cursor-pointer hover:border-orange-400 transition-colors overflow-hidden">
                                    {preview ? (
                                        <img src={preview} alt="preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <>
                                            <Camera size={28} className="text-slate-400" />
                                            <span className="text-[12px] text-slate-400">Toca para subir foto</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" onChange={pickFoto} className="hidden" />
                                </label>
                            </div>

                            <button onClick={() => setStep(3)}
                                className={`w-full h-[52px] ${accent === 'blue' ? 'bg-blue-600' : 'bg-orange-600'} text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform mt-1`}>
                                Continuar
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && !isExterno && (
                        <div className="flex flex-col gap-3.5">
                            <Field label="Código de matrícula UTP *" icon={IdCard} accent="blue" value={form.codigo_matricula} onChange={set('codigo_matricula')}
                                placeholder="Ej: U20230045" />
                            <Field label="Nombre completo" icon={User} accent="blue" value={form.nombre_completo} onChange={set('nombre_completo')}
                                placeholder="Ej: Camila Ruiz Quispe" />
                            <Field label="Ciclo y carrera" icon={BookOpen} accent="blue" value={form.ciclo_carrera} onChange={set('ciclo_carrera')}
                                placeholder="Ej: 7mo ciclo · Ing. de Sistemas" />
                            <Field label="Nombre de tu emprendimiento *" icon={ChefHat} accent="blue" value={form.nombre} onChange={set('nombre')}
                                placeholder="Ej: Las Delicias de Camila" />
                            <Field label="WhatsApp para pedidos *" icon={Phone} accent="blue" type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                                placeholder="999 888 777" />
                            <Field label="Número Yape / Plin *" icon={Smartphone} accent="blue" type="tel" value={form.yape} onChange={set('yape')}
                                placeholder="Número para recibir pagos" />

                            <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3">
                                <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-800 leading-snug">
                                    Tu código de matrícula será verificado con el correo UTP que usaste para ingresar.
                                </p>
                            </div>

                            <button onClick={() => setStep(3)}
                                className={`w-full h-[52px] ${accent === 'blue' ? 'bg-blue-600' : 'bg-orange-600'} text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform mt-1`}>
                                Continuar
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <Field label="Tu nombre *" icon={User} accent={accent} value={form.name} onChange={set('name')}
                                placeholder="Ej: Camila Ruiz" />
                            <Field label={isExterno ? 'Correo *' : 'Correo UTP *'} icon={Mail} accent={accent} type="email"
                                value={form.email} onChange={set('email')}
                                placeholder={isExterno ? 'tucorreo@ejemplo.com' : 'u20230045@utp.edu.pe'} />
                            <Field label="Contraseña *" icon={Lock} accent={accent} type="password"
                                value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" />
                            <Field label="Confirmar contraseña *" icon={Lock} accent={accent} type="password"
                                value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="Repite tu contraseña" />
                            {!isExterno && (
                                <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3">
                                    <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-blue-800 leading-snug">Como estudiante UTP, usa tu correo @utp.edu.pe.</p>
                                </div>
                            )}
                            <SubmitBtn loading={loading} accent={accent} onClick={submit} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SubmitBtn({ loading, accent, onClick }) {
    const bg = accent === 'blue' ? 'bg-blue-600' : 'bg-orange-600';
    return (
        <button onClick={onClick} disabled={loading}
            className={`w-full h-[52px] ${bg} text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform disabled:opacity-60 mt-1`}>
            {loading ? 'Enviando...' : 'Finalizar registro'}
            {!loading && <Check size={18} />}
        </button>
    );
}
