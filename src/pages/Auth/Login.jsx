import { useState, useEffect } from 'react';
import { GraduationCap, Store, Send, Mail, RefreshCw, ShieldCheck, ArrowLeft, UtensilsCrossed, MailCheck, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { sendLink } from '@/api/auth';

/* ─── Pantalla 01: Welcome ─── */
function WelcomeScreen({ onRole }) {
    return (
        <div className="min-h-dvh flex flex-col lg:flex-row">
            <div className="relative flex flex-col flex-1 lg:w-1/2 lg:min-h-dvh bg-gradient-to-b lg:bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 overflow-hidden">
                <div className="absolute -top-24 -left-20 w-72 h-72 bg-white rounded-full opacity-[0.06]" />
                <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-white rounded-full opacity-[0.05]" />

                <div className="flex flex-col items-center justify-center flex-1 px-8 pt-16 pb-8 lg:py-16 gap-5 text-center">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <UtensilsCrossed size={26} className="text-orange-600" />
                        </div>
                        <span className="text-3xl font-extrabold text-white font-display">MesaUTP</span>
                    </div>

                    <h1 className="text-xl font-bold text-white leading-snug max-w-[280px]">
                        Comida económica cerca del campus, en un solo lugar
                    </h1>
                    <p className="text-[13px] text-red-200 leading-relaxed max-w-[280px]">
                        Descubre locales externos, compra a tus compañeros y gestiona tu propio negocio gastronómico.
                    </p>

                    <div className="flex gap-2.5 flex-wrap justify-center">
                        {[
                            { label: 'Menú Criollo',   price: 'S/9', bg: 'bg-orange-200' },
                            { label: 'Seco de Pollo',  price: 'S/7', bg: 'bg-blue-100' },
                            { label: 'Ají de Gallina', price: 'S/8', bg: 'bg-green-100' },
                        ].map(c => (
                            <div key={c.label} className={`${c.bg} rounded-xl px-3 py-1.5 flex flex-col items-center`}>
                                <span className="text-[10px] font-semibold text-slate-900">{c.label}</span>
                                <span className="text-[13px] font-bold text-orange-600">{c.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white px-7 pt-8 pb-10 lg:w-1/2 lg:min-h-dvh lg:justify-center lg:px-16 flex flex-col gap-4">
                <div className="text-center mb-1">
                    <h2 className="text-xl font-bold text-slate-900 font-display">¿Cómo quieres ingresar?</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Accede con tu correo institucional UTP (@utp.edu.pe)</p>
                </div>

                <button onClick={() => onRole('estudiante')}
                    className="w-full h-14 bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-base active:scale-[0.98] transition-transform">
                    <GraduationCap size={22} />
                    Soy Estudiante
                </button>

                <button onClick={() => onRole('emprendedor')}
                    className="w-full h-14 bg-white text-blue-600 font-bold rounded-2xl border-2 border-blue-600 flex items-center justify-center gap-2.5 text-base active:scale-[0.98] transition-transform">
                    <Store size={22} />
                    Soy Emprendedor
                </button>

                <button
                    onClick={() => { window.location.href = 'http://localhost:8000/admin'; }}
                    className="text-center text-xs text-slate-400 hover:text-slate-600 transition-colors mt-1">
                    Administrador
                </button>
            </div>
        </div>
    );
}

/* ─── Pantalla 02: Formulario ─── */
function FormScreen({ role, email, setEmail, error, processing, onSubmit, onBack }) {
    const isEst = role === 'estudiante';
    return (
        <div className="min-h-dvh lg:min-h-0 bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto lg:overflow-visible px-6 pb-8 lg:px-10 lg:pb-10">
                <button onClick={onBack} className="flex items-center gap-2 pt-12 lg:pt-8 pb-2 text-slate-500 text-sm hover:text-slate-700 transition-colors">
                    <ArrowLeft size={20} className="text-slate-900" /> Inicio
                </button>

                <div className="flex items-center gap-2 mt-4 mb-2">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                        <UtensilsCrossed size={18} className="text-white" />
                    </div>
                    <span className="text-[22px] font-extrabold text-slate-900 font-display">MesaUTP</span>
                </div>

                <h1 className="text-[26px] font-bold text-slate-900 font-display mt-3">Bienvenido/a</h1>
                <p className="text-[14px] text-slate-500 leading-relaxed mt-1 mb-6 max-w-[330px]">
                    Ingresa con tu correo institucional. Te enviaremos un enlace mágico para entrar sin contraseña.
                </p>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-6 ${isEst ? 'bg-orange-50' : 'bg-blue-50'}`}>
                    {isEst
                        ? <GraduationCap size={14} className="text-orange-600" />
                        : <Store size={14} className="text-blue-600" />}
                    <span className={`text-xs font-semibold ${isEst ? 'text-orange-600' : 'text-blue-600'}`}>
                        Ingresando como: {isEst ? 'Estudiante' : 'Emprendedor'}
                    </span>
                </div>

                <form onSubmit={onSubmit} noValidate className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">
                            Correo institucional UTP *
                        </label>
                        <div className={`flex items-center gap-2.5 rounded-xl px-4 h-12 border-2 bg-slate-50 ${error ? 'border-red-400' : 'border-blue-600'}`}>
                            <Mail size={18} className="text-blue-600 shrink-0" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="andrea.quispe@utp.edu.pe"
                                className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none"
                                inputMode="email"
                                autoComplete="email"
                            />
                        </div>
                        {error
                            ? <p className="mt-1 text-xs text-red-500">{error}</p>
                            : <p className="mt-1 text-[11px] text-slate-400">Solo cuentas @utp.edu.pe son aceptadas</p>
                        }
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full h-14 bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 text-base disabled:opacity-60 active:scale-[0.98] transition-transform">
                        <Send size={20} />
                        {processing ? 'Enviando...' : 'Enviar enlace mágico'}
                    </button>
                </form>

                <div className="bg-blue-50 rounded-xl p-3.5 flex gap-2.5 mt-6">
                    <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[12px] font-semibold text-blue-900">Comunidad verificada</p>
                        <p className="text-[11px] text-blue-600 mt-0.5">Solo estudiantes UTP Ate acceden a la plataforma.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Pantalla 03: Verificación ─── */
function VerifyScreen({ email, onResend, onChangeEmail }) {
    const [seconds, setSeconds] = useState(900);
    const [resent,  setResent]  = useState(false);

    useEffect(() => {
        const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');

    const handleResend = async () => {
        await onResend();
        setSeconds(900);
        setResent(true);
        toast.success('Enlace reenviado a tu correo');
        setTimeout(() => setResent(false), 3000);
    };

    return (
        <div className="min-h-dvh lg:min-h-0 bg-white flex flex-col items-center px-7 pt-16 lg:pt-10 pb-8 lg:pb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-50 to-orange-200 flex items-center justify-center shadow-lg shadow-orange-200 mb-7">
                <MailCheck size={48} className="text-orange-600" />
            </div>

            <h1 className="text-[26px] font-bold text-slate-900 font-display text-center">Revisa tu correo</h1>
            <p className="text-[14px] text-slate-500 leading-relaxed text-center mt-2 mb-7 max-w-[300px]">
                Enviamos un enlace mágico a <strong className="text-slate-800">{email}</strong>.
                Toca el enlace para ingresar automáticamente.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 mb-6">
                {[
                    'Abre la app de correo en tu teléfono',
                    'Busca el mensaje de MesaUTP',
                    "Toca el botón 'Ingresar a MesaUTP'",
                ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <p className="text-[13px] text-slate-800">{step}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-1.5 bg-orange-50 px-4 py-2.5 rounded-full mb-6">
                <Timer size={14} className="text-orange-600" />
                <span className="text-[12px] font-semibold text-orange-600">
                    El enlace expira en {mm}:{ss}
                </span>
            </div>

            <button onClick={handleResend}
                className="w-full h-14 bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-semibold text-slate-600 text-[15px] mb-4 active:scale-[0.98] transition-transform">
                <RefreshCw size={18} className={resent ? 'text-green-500' : ''} />
                {resent ? 'Enviado' : 'Reenviar enlace'}
            </button>

            <button onClick={onChangeEmail} className="text-[12px] text-blue-600">
                Correo incorrecto? Cambiar correo
            </button>
        </div>
    );
}

/* ─── Componente principal ─── */
export default function Login() {
    const [step,       setStep]       = useState('welcome');
    const [role,       setRole]       = useState('');
    const [email,      setEmail]      = useState('');
    const [error,      setError]      = useState('');
    const [processing, setProcessing] = useState(false);

    const pickRole = (r) => { setRole(r); setStep('form'); setError(''); };

    const submit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            const msg = 'Ingresa tu correo institucional.';
            setError(msg);
            toast.error(msg);
            return;
        }
        if (!email.trim().toLowerCase().endsWith('@utp.edu.pe')) {
            const msg = 'Solo se aceptan correos @utp.edu.pe.';
            setError(msg);
            toast.error(msg);
            return;
        }

        setProcessing(true);
        try {
            await sendLink(email.trim());
            setStep('sent');
            toast.success('Enlace enviado a tu correo UTP');
        } catch (err) {
            const msg = err.response?.data?.errors?.email?.[0]
                ?? err.response?.data?.message
                ?? 'Error al enviar el enlace.';
            setError(msg);
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const resend = async () => {
        try { await sendLink(email); } catch { /* silencioso */ }
    };

    // La pantalla de bienvenida usa split-screen completo en desktop.
    if (step === 'welcome') return <WelcomeScreen onRole={pickRole} />;

    // Form y verificación se centran como tarjeta sobre un fondo en desktop.
    const screen =
        step === 'sent'
            ? <VerifyScreen email={email} onResend={resend} onChangeEmail={() => { setStep('form'); setError(''); }} />
            : <FormScreen
                role={role}
                email={email}
                setEmail={setEmail}
                error={error}
                processing={processing}
                onSubmit={submit}
                onBack={() => setStep('welcome')}
              />;

    return (
        <div className="lg:min-h-dvh lg:bg-gradient-to-br lg:from-orange-50 lg:to-slate-100 lg:flex lg:items-center lg:justify-center lg:p-6">
            <div className="lg:w-[460px] lg:max-h-[94vh] lg:overflow-y-auto lg:rounded-[32px] lg:shadow-2xl lg:bg-white">
                {screen}
            </div>
        </div>
    );
}
