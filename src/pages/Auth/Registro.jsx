import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, IdCard, KeyRound, ArrowRight, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { verify, completarRegistro } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import LogoAnimado from '@/components/LogoAnimado';

// Campo de formulario. Definido FUERA del componente para que React no lo
// recree en cada render (eso desmontaba el input y perdía el foco al escribir).
function Field({ icon: Icon, label, name, value, error, onChange, ...rest }) {
    return (
        <div>
            <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">{label}</label>
            <div className={`flex items-center gap-2.5 rounded-xl px-4 h-12 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-500'}`}>
                <Icon size={18} className="text-orange-500 shrink-0" />
                <input {...rest} value={value} onChange={onChange}
                    className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none" />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default function Registro() {
    const [params]   = useSearchParams();
    const navigate   = useNavigate();
    const { login }  = useAuth();

    const token = params.get('token');

    const [phase, setPhase]   = useState('checking'); // checking | form | invalid
    const [email, setEmail]   = useState('');
    const [form, setForm]     = useState({ name: '', apellido: '', dni: '', pin: '', pin_confirmation: '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Valida el token al cargar
    useEffect(() => {
        if (!token) { setPhase('invalid'); return; }
        verify(token)
            .then(({ data }) => { setEmail(data.email); setPhase('form'); })
            .catch(() => setPhase('invalid'));
    }, [token]);

    const set = (k) => (e) => {
        let v = e.target.value;
        if (k === 'dni')                       v = v.replace(/\D/g, '').slice(0, 8);
        if (k === 'pin' || k === 'pin_confirmation') v = v.replace(/\D/g, '').slice(0, 6);
        setForm(f => ({ ...f, [k]: v }));
        setErrors(er => ({ ...er, [k]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim())      e.name = 'Ingresa tu nombre.';
        if (!form.apellido.trim())  e.apellido = 'Ingresa tu apellido.';
        if (form.dni.length !== 8)  e.dni = 'El DNI debe tener 8 dígitos.';
        if (form.pin.length < 4)    e.pin = 'El PIN debe tener 4 a 6 dígitos.';
        if (form.pin !== form.pin_confirmation) e.pin_confirmation = 'Los PIN no coinciden.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const { data } = await completarRegistro({ token, ...form });
            login(data.token, data.user);
            toast.success(`¡Cuenta creada! Bienvenido/a, ${data.user.name}`);
            navigate('/locales-externos', { replace: true });
        } catch (err) {
            const apiErr = err.response?.data?.errors;
            if (apiErr) {
                setErrors(Object.fromEntries(Object.entries(apiErr).map(([k, v]) => [k, v[0]])));
            }
            toast.error(err.response?.data?.message ?? 'No se pudo completar el registro.');
        } finally {
            setSaving(false);
        }
    };

    // ── Estados de carga / token inválido ──
    if (phase === 'checking') {
        return (
            <div className="min-h-dvh bg-orange-600 flex items-center justify-center">
                <div className="text-white text-center">
                    <Loader2 size={44} className="animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium">Verificando tu enlace...</p>
                </div>
            </div>
        );
    }
    if (phase === 'invalid') {
        return (
            <div className="min-h-dvh bg-gradient-to-br from-orange-500 to-orange-800 flex items-center justify-center px-6">
                <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 grid place-items-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900 font-display">Enlace no válido</h1>
                    <p className="text-sm text-slate-500 mt-2 mb-6">
                        Este enlace de registro expiró o ya fue usado. Solicita uno nuevo desde el inicio.
                    </p>
                    <button onClick={() => navigate('/login', { replace: true })}
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    // ── Formulario de registro ──
    return (
        <div className="min-h-dvh flex flex-col lg:flex-row bg-orange-600">
            {/* Hero marca */}
            <div className="relative flex flex-col flex-1 lg:w-1/2 lg:min-h-dvh bg-gradient-to-b lg:bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 overflow-hidden">
                <div className="absolute -top-28 -left-24 w-80 h-80 bg-white rounded-full opacity-[0.07] blur-xl" />
                <div className="absolute -bottom-32 right-0 w-96 h-96 bg-amber-300 rounded-full opacity-[0.08] blur-2xl" />
                <div className="relative flex flex-col items-center justify-center flex-1 px-8 py-16 gap-5 text-center">
                    <LogoAnimado variant="white" className="w-[280px] sm:w-[340px] max-w-[85vw] drop-shadow-xl" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight max-w-[320px] font-display">
                        Crea tu cuenta en segundos
                    </h1>
                    <p className="text-[14px] text-orange-50/90 max-w-[300px]">
                        Completa tus datos y elige un PIN. Lo usarás para ingresar la próxima vez.
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <div className="relative bg-white rounded-t-[2.5rem] lg:rounded-none -mt-8 lg:mt-0 px-7 pt-9 pb-10 lg:w-1/2 lg:min-h-dvh lg:justify-center lg:px-16 flex flex-col gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] lg:shadow-none z-10">
                <div className="lg:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-3 mb-3" />

                <div className="mb-1">
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display">Completa tu registro</h2>
                    <p className="text-[13px] text-slate-500 mt-1">
                        Para <span className="font-semibold text-orange-600">{email}</span>
                    </p>
                </div>

                <form onSubmit={submit} noValidate className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                        <Field icon={User} label="Nombre" name="name" value={form.name} error={errors.name} onChange={set('name')}
                            placeholder="Andrea" autoComplete="given-name" />
                        <Field icon={User} label="Apellido" name="apellido" value={form.apellido} error={errors.apellido} onChange={set('apellido')}
                            placeholder="Quispe" autoComplete="family-name" />
                    </div>
                    <Field icon={IdCard} label="DNI" name="dni" value={form.dni} error={errors.dni} onChange={set('dni')}
                        placeholder="71234567" inputMode="numeric" />
                    <div className="grid grid-cols-2 gap-3">
                        <Field icon={KeyRound} label="PIN (4-6 dígitos)" name="pin" value={form.pin} error={errors.pin} onChange={set('pin')}
                            type="password" placeholder="••••" inputMode="numeric" />
                        <Field icon={KeyRound} label="Confirmar PIN" name="pin_confirmation" value={form.pin_confirmation} error={errors.pin_confirmation} onChange={set('pin_confirmation')}
                            type="password" placeholder="••••" inputMode="numeric" />
                    </div>

                    <button type="submit" disabled={saving}
                        className="group w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base disabled:opacity-60 transition-colors active:scale-[0.98] cursor-pointer shadow-lg shadow-orange-600/25">
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <>Crear cuenta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                <div className="bg-orange-50 rounded-xl p-3.5 flex gap-2.5 mt-1">
                    <ShieldCheck size={18} className="text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-orange-900">
                        Tu PIN se guarda cifrado. La próxima vez ingresarás solo con tu correo y PIN.
                    </p>
                </div>
            </div>
        </div>
    );
}
