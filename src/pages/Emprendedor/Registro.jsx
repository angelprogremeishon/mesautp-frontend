import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Store, ChefHat, ArrowLeft, ArrowRight, Check, Camera,
    MapPin, Tag, Timer, Phone, Smartphone, IdCard, User, BookOpen, ShieldCheck,
    Mail, Lock, ChevronDown, Loader2, KeyRound, LogIn,
    Utensils, Drumstick, Fish, Sparkles, Soup, Salad, Cookie, CupSoda,
} from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { emprendedorRegister, checkEmail, loginPin } from '@/api/auth';
import { registrar as activarEmprendimiento } from '@/api/emprendedor';
import { useAuth } from '@/contexts/AuthContext';

// Categorías con ícono para el dropdown custom.
const CATEGORIAS = [
    { label: 'Criolla',          Icon: Utensils },
    { label: 'Pollo a la brasa', Icon: Drumstick },
    { label: 'Mariscos',         Icon: Fish },
    { label: 'Fusión',           Icon: Sparkles },
    { label: 'Menú del día',     Icon: Soup },
    { label: 'Veggie',           Icon: Salad },
    { label: 'Snacks',           Icon: Cookie },
    { label: 'Bebidas',          Icon: CupSoda },
];

/* ─── Dropdown de categorías custom y animado ─── */
function CategoryDropdown({ value, onChange, accent = 'orange' }) {
    const [open, setOpen] = useState(false);
    const ref      = useRef(null);
    const panelRef = useRef(null);
    const selected = CATEGORIAS.find(c => c.label === value);
    const ring   = accent === 'blue' ? 'focus-within:border-blue-500' : 'focus-within:border-orange-500';
    const active = accent === 'blue' ? 'text-blue-600' : 'text-orange-600';
    const activeBg = accent === 'blue' ? 'bg-blue-50' : 'bg-orange-50';

    // Cierra al hacer clic fuera
    useEffect(() => {
        const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    // Animación de apertura del panel
    useEffect(() => {
        if (open && panelRef.current) {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduce) return;
            gsap.fromTo(panelRef.current, { opacity: 0, y: -8, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' });
            gsap.fromTo(panelRef.current.querySelectorAll('[data-opt]'),
                { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.03 });
        }
    }, [open]);

    return (
        <div className={`flex flex-col gap-1.5 ${open ? 'relative z-50' : ''}`} ref={ref}>
            <label className="text-[12px] font-semibold text-slate-900">Categoría gastronómica</label>
            <div className="relative">
                <button type="button" onClick={() => setOpen(o => !o)}
                    className={`w-full flex items-center gap-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] rounded-xl px-3.5 py-3 transition-colors cursor-pointer ${ring} ${open ? (accent === 'blue' ? 'border-blue-500' : 'border-orange-500') : ''}`}>
                    {selected ? <selected.Icon size={16} className={active} /> : <Tag size={16} className="text-slate-400" />}
                    <span className={`flex-1 text-left text-[13px] ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {selected ? selected.label : 'Selecciona una categoría'}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div ref={panelRef}
                        className="absolute z-[60] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.18)] p-1.5 max-h-[280px] overflow-y-auto">
                        {CATEGORIAS.map(c => {
                            const isSel = c.label === value;
                            return (
                                <button key={c.label} type="button" data-opt
                                    onClick={() => { onChange(c.label); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${isSel ? activeBg : 'hover:bg-slate-50'}`}>
                                    <span className={`grid place-items-center w-8 h-8 rounded-lg ${isSel ? activeBg : 'bg-slate-100'}`}>
                                        <c.Icon size={16} className={isSel ? active : 'text-slate-500'} />
                                    </span>
                                    <span className={`flex-1 text-[13px] font-medium ${isSel ? active : 'text-slate-700'}`}>{c.label}</span>
                                    {isSel && <Check size={15} className={active} />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

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
    const location = useLocation();
    const { login, isAuth, user } = useAuth();
    // Si un estudiante logueado llega con state.directInterno (botón "Vender mi
    // comida"), arrancamos directo en el formulario de datos del local interno.
    const directInterno = !!location.state?.directInterno && isAuth;
    const [step, setStep] = useState(directInterno ? 2 : 1);
    const [tipo, setTipo] = useState(directInterno ? 'interno' : 'externo');
    const [loading, setLoading] = useState(false);
    const [foto, setFoto]       = useState(null);
    const [preview, setPreview] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const contentRef = useRef(null);

    // Al continuar desde el paso 1 decidimos el flujo según el tipo:
    //  · Externo  → registro completo (crea cuenta).
    //  · Interno  → DEBE usar su cuenta de estudiante:
    //       - si está logueado  → solo completa los datos del local.
    //       - si no tiene cuenta → modal para crear su cuenta de estudiante.
    const continuarDesdeTipo = () => {
        if (tipo === 'interno') {
            if (!isAuth) { setShowStudentModal(true); return; }
        }
        setStep(2);
    };

    // Animación de entrada al cambiar de paso (respeta reduced-motion).
    useEffect(() => {
        if (!contentRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // El paso activo es el único hijo; animamos sus campos (nietos) en cascada.
        const stepBox = contentRef.current.firstElementChild;
        const items = stepBox ? stepBox.children : [];
        gsap.fromTo(items, { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06 });
    }, [step, tipo]);

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

    // Interno (estudiante ya logueado): solo activa su emprendimiento con los
    // datos del local. NO crea cuenta — reutiliza la sesión actual.
    const activarInterno = async () => {
        if (!form.nombre.trim())   return toast.error('Ingresa el nombre de tu emprendimiento.');
        if (!form.whatsapp.trim()) return toast.error('Ingresa tu WhatsApp para pedidos.');
        if (!form.yape.trim())     return toast.error('Ingresa tu número Yape/Plin.');

        setLoading(true);
        try {
            // El código de matrícula y el nombre los deriva el backend de la
            // cuenta del estudiante (correo). Aquí solo enviamos lo que falta.
            const fd = new FormData();
            fd.append('tipo', 'interno');
            fd.append('nombre', form.nombre.trim());
            fd.append('whatsapp', form.whatsapp.trim());
            fd.append('yape', form.yape.trim());
            fd.append('plin', form.yape.trim());
            if (form.ciclo_carrera.trim()) fd.append('ciclo_carrera', form.ciclo_carrera.trim());

            await activarEmprendimiento(fd);
            toast.success('¡Listo! Tu emprendimiento está en revisión.');
            navigate('/emprendedor', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors)[0]?.[0]
                : err.response?.data?.message;
            toast.error(msg ?? 'No se pudo activar tu emprendimiento. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Externo: registro completo que crea la cuenta (paso 3).
    const submit = async () => {
        if (!form.name.trim())  return toast.error('Ingresa tu nombre.');
        if (!form.email.trim()) return toast.error('Ingresa tu correo.');
        if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres.');
        if (form.password !== form.password_confirmation) return toast.error('Las contraseñas no coinciden.');

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('tipo', 'externo');
            fd.append('name', form.name.trim());
            fd.append('email', form.email.trim());
            fd.append('password', form.password);
            fd.append('password_confirmation', form.password_confirmation);
            fd.append('nombre', form.nombre.trim());
            fd.append('whatsapp', form.whatsapp.trim());
            if (form.yape.trim()) { fd.append('yape', form.yape.trim()); fd.append('plin', form.yape.trim()); }
            fd.append('direccion', form.direccion.trim());
            if (form.categoria) fd.append('categoria', form.categoria);
            if (form.horario.trim()) fd.append('horario', form.horario.trim());
            if (foto) fd.append('foto', foto);

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

    // El interno son 2 pasos (tipo → datos); el externo son 3 (tipo → local → cuenta).
    const totalSteps = isExterno ? 3 : 2;
    const progress = `${Math.round((step / totalSteps) * 100)}%`;

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
                                ? `Paso 1 de ${totalSteps}`
                                : step === 2
                                    ? `Paso 2 de ${totalSteps} · ${isExterno ? 'Emprendedor Externo' : 'Emprendedor Interno'}`
                                    : `Paso 3 de ${totalSteps} · Tu cuenta`}
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
                <div ref={contentRef} className="flex-1 overflow-y-auto px-6 lg:px-8 pb-10 pt-2">
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
                            <button onClick={continuarDesdeTipo}
                                className={`lg:col-span-2 w-full h-[50px] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform ${isExterno ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} cursor-pointer`}>
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
                            <CategoryDropdown value={form.categoria} accent="orange"
                                onChange={(v) => setForm(f => ({ ...f, categoria: v }))} />
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
                            {/* Datos que YA tenemos de tu cuenta de estudiante (no se piden de nuevo) */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                                <p className="text-[12px] font-semibold text-slate-900 flex items-center gap-1.5">
                                    <ShieldCheck size={14} className="text-blue-600" /> Datos de tu cuenta UTP
                                </p>
                                <div className="flex items-center gap-2.5">
                                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-blue-50 shrink-0"><User size={15} className="text-blue-600" /></span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 leading-none">Nombre</p>
                                        <p className="text-[13px] font-medium text-slate-800 truncate">{[user?.name, user?.apellido].filter(Boolean).join(' ') || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-blue-50 shrink-0"><IdCard size={15} className="text-blue-600" /></span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 leading-none">Código de matrícula</p>
                                        <p className="text-[13px] font-medium text-slate-800 truncate">{user?.email ? user.email.split('@')[0].toUpperCase() : '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-blue-50 shrink-0"><Mail size={15} className="text-blue-600" /></span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 leading-none">Correo</p>
                                        <p className="text-[13px] font-medium text-slate-800 truncate">{user?.email ?? '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Solo lo que falta */}
                            <Field label="Ciclo y carrera" icon={BookOpen} accent="blue" value={form.ciclo_carrera} onChange={set('ciclo_carrera')}
                                placeholder="Ej: 7mo ciclo · Ing. de Sistemas" />
                            <Field label="Nombre de tu emprendimiento *" icon={ChefHat} accent="blue" value={form.nombre} onChange={set('nombre')}
                                placeholder="Ej: Las Delicias de Camila" />
                            <Field label="WhatsApp para pedidos *" icon={Phone} accent="blue" type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                                placeholder="999 888 777" />
                            <Field label="Número Yape / Plin *" icon={Smartphone} accent="blue" type="tel" value={form.yape} onChange={set('yape')}
                                placeholder="Número para recibir pagos" />

                            <button onClick={activarInterno} disabled={loading}
                                className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-colors mt-1 disabled:opacity-60 cursor-pointer">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Activar mi emprendimiento <Check size={18} /></>}
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

            {/* Modal: requiere cuenta de estudiante para ser interno */}
            {showStudentModal && (
                <StudentRequiredModal
                    onClose={() => setShowStudentModal(false)}
                    onCreate={() => navigate('/login')}
                    onSuccess={() => { setShowStudentModal(false); setStep(2); }}
                />
            )}
        </div>
    );
}

/* ─── Modal: identifícate como estudiante (login embebido) ─── */
// El estudiante interno se autentica aquí mismo con su correo + PIN y continúa.
// Si el correo no tiene cuenta, ofrece ir a crearla.
function StudentRequiredModal({ onClose, onCreate, onSuccess }) {
    const panelRef = useRef(null);
    const { login } = useAuth();

    const [phase, setPhase] = useState('email');   // email | pin | nocuenta
    const [email, setEmail] = useState('');
    const [pin, setPin]     = useState('');
    const [name, setName]   = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy]   = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.fromTo(panelRef.current, { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'back.out(1.5)' });
    }, []);

    // Paso 1: el correo → ¿existe cuenta?
    const submitEmail = async (e) => {
        e.preventDefault();
        setError('');
        const value = email.trim().toLowerCase();
        if (!value.endsWith('@utp.edu.pe')) { setError('Usa tu correo @utp.edu.pe.'); return; }
        setBusy(true);
        try {
            const { data } = await checkEmail(value);
            if (data.status === 'pin') { setName(data.name ?? ''); setPhase('pin'); }
            else setPhase('nocuenta');   // no tiene cuenta de estudiante todavía
        } catch (err) {
            setError(err.response?.data?.message ?? 'No se pudo verificar el correo.');
        } finally { setBusy(false); }
    };

    // Paso 2: PIN → inicia sesión y continúa al registro del local
    const submitPin = async (e) => {
        e.preventDefault();
        setError('');
        if (pin.length < 4) { setError('Ingresa tu PIN.'); return; }
        setBusy(true);
        try {
            const { data } = await loginPin(email.trim().toLowerCase(), pin);
            login(data.token, data.user);
            toast.success(`¡Hola, ${data.user.name}! Continúa con tu emprendimiento.`);
            onSuccess();   // cierra modal + avanza al paso 2
        } catch (err) {
            setError(err.response?.data?.errors?.pin?.[0] ?? 'Correo o PIN incorrectos.');
        } finally { setBusy(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}>
            <div ref={panelRef} onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 grid place-items-center mx-auto mb-4">
                    <ChefHat size={32} className="text-blue-600" />
                </div>

                {phase === 'email' && (
                    <>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display text-center">Identifícate como estudiante</h2>
                        <p className="text-[13px] text-slate-500 leading-relaxed mt-2 mb-5 text-center">
                            Para vender dentro del campus usa tu cuenta de estudiante UTP. Ingresa tu correo para continuar.
                        </p>
                        <form onSubmit={submitEmail} className="space-y-3">
                            <div className={`flex items-center gap-2.5 rounded-xl px-4 h-12 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                                <Mail size={18} className="text-blue-600 shrink-0" />
                                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                                    placeholder="u20230045@utp.edu.pe" inputMode="email" autoComplete="email" autoFocus
                                    className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none" />
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                            <button type="submit" disabled={busy}
                                className="group w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-60">
                                {busy ? <Loader2 size={18} className="animate-spin" /> : <>Continuar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </form>
                    </>
                )}

                {phase === 'pin' && (
                    <>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display text-center">Hola{name ? `, ${name}` : ''} 👋</h2>
                        <p className="text-[13px] text-slate-500 leading-relaxed mt-2 mb-5 text-center">
                            Ingresa tu PIN para continuar como <span className="font-semibold text-blue-600">{email}</span>
                        </p>
                        <form onSubmit={submitPin} className="space-y-3">
                            <div className={`flex items-center gap-2.5 rounded-xl px-4 h-14 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                                <KeyRound size={20} className="text-blue-600 shrink-0" />
                                <input type="password" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                                    placeholder="••••" inputMode="numeric" autoFocus
                                    className="flex-1 bg-transparent text-2xl tracking-[0.4em] text-slate-900 focus:outline-none" />
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                            <button type="submit" disabled={busy}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-60">
                                {busy ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={18} /> Ingresar y continuar</>}
                            </button>
                        </form>
                        <button onClick={() => { setPhase('email'); setPin(''); setError(''); }}
                            className="w-full text-[12px] text-slate-500 hover:text-blue-600 transition-colors mt-3 cursor-pointer">
                            Usar otro correo
                        </button>
                    </>
                )}

                {phase === 'nocuenta' && (
                    <>
                        <h2 className="text-xl font-extrabold text-slate-900 font-display text-center">Aún no tienes cuenta</h2>
                        <p className="text-[13px] text-slate-500 leading-relaxed mt-2 mb-5 text-center">
                            No encontramos una cuenta de estudiante con <span className="font-semibold text-slate-700">{email}</span>.
                            Crea tu cuenta de estudiante primero para acceder a los beneficios de estudiante emprendedor.
                        </p>
                        <button onClick={onCreate}
                            className="group w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer mb-2">
                            Crear mi cuenta de estudiante
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => { setPhase('email'); setError(''); }}
                            className="w-full text-[12px] text-slate-500 hover:text-slate-700 transition-colors py-1.5 cursor-pointer">
                            Probar con otro correo
                        </button>
                    </>
                )}

                <button onClick={onClose}
                    className="w-full text-[13px] text-slate-400 hover:text-slate-600 transition-colors mt-3 cursor-pointer">
                    Cancelar
                </button>
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
