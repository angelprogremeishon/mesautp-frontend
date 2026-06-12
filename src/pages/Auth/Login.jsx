import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Store, Send, Mail, RefreshCw, ShieldCheck, ArrowLeft, UtensilsCrossed, MailCheck, Timer, Lock, LogIn, UserPlus, ArrowRight, MapPin, Sparkles, KeyRound, Loader2,
    Pizza, Coffee, Sandwich, Soup, Salad, IceCream, Cookie, Drumstick, CupSoda, Croissant, Cherry, Egg,
    Wallet, Clock, Store as StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import { sendLink, emprendedorLogin, checkEmail, loginPin } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import LogoAnimado from '@/components/LogoAnimado';

// Íconos de comida que flotan en el fondo del panel naranja.
// pos en % (top/left), size en px, dur de flotación.
const FLOATING_FOODS = [
    { Icon: Pizza,     top: '8%',  left: '12%', size: 46, dur: 7 },
    { Icon: Coffee,    top: '18%', left: '78%', size: 38, dur: 9 },
    { Icon: Sandwich,  top: '70%', left: '8%',  size: 42, dur: 8 },
    { Icon: Soup,      top: '82%', left: '70%', size: 50, dur: 10 },
    { Icon: IceCream,  top: '40%', left: '85%', size: 36, dur: 7.5 },
    { Icon: Cookie,    top: '55%', left: '20%', size: 34, dur: 9.5 },
    { Icon: Drumstick, top: '30%', left: '6%',  size: 40, dur: 8.5 },
    { Icon: Salad,     top: '88%', left: '40%', size: 38, dur: 7 },
    { Icon: CupSoda,   top: '12%', left: '45%', size: 32, dur: 9 },
    { Icon: Croissant, top: '60%', left: '88%', size: 36, dur: 8 },
    { Icon: Cherry,    top: '48%', left: '50%', size: 30, dur: 10 },
    { Icon: Egg,       top: '25%', left: '30%', size: 28, dur: 9 },
];

// Secciones de valor (features) que reemplazan los chips de precio.
const FEATURES = [
    { Icon: MapPin, title: 'Cerca del campus', desc: 'Locales y compañeros a pasos de UTP Ate' },
    { Icon: Wallet, title: 'Precios de estudiante', desc: 'Menús desde S/7 pensados para tu bolsillo' },
    { Icon: Clock,  title: 'Pide y recoge', desc: 'Reserva tu plato y recógelo sin esperas' },
];

/* ─── Pantalla 01: Welcome + login estudiante directo ─── */
function WelcomeScreen({ email, setEmail, error, processing, onSubmit, onEmprendedor }) {
    const rootRef  = useRef(null);
    const blobsRef = useRef([]);
    const foodsRef = useRef([]);

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ctx = gsap.context(() => {
            if (reduce) {
                // Sin animación: todo visible de inmediato
                gsap.set('[data-anim]', { opacity: 1, y: 0, x: 0 });
                gsap.set(foodsRef.current, { opacity: 0.12 });
                return;
            }

            // Entrada escalonada del contenido del panel naranja
            gsap.from('[data-anim="brand"]', {
                opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
                stagger: 0.12, delay: 0.15,
            });
            // Features: entrada escalonada
            gsap.from('[data-anim="feature"]', {
                opacity: 0, x: -20, duration: 0.55,
                ease: 'power3.out', stagger: 0.12, delay: 0.75,
            });
            // Panel de acceso: títulos + botones entran desde la derecha (desktop)
            gsap.from('[data-anim="access"]', {
                opacity: 0, y: 22, duration: 0.6, ease: 'power3.out',
                stagger: 0.1, delay: 0.5,
            });

            // Flotación infinita y sutil de los blobs decorativos
            blobsRef.current.forEach((b, i) => {
                if (!b) return;
                gsap.to(b, {
                    y: i % 2 ? 26 : -26, x: i % 2 ? -16 : 16,
                    duration: 6 + i, ease: 'sine.inOut',
                    repeat: -1, yoyo: true,
                });
            });

            // Íconos de comida flotando suavemente en el fondo
            foodsRef.current.forEach((el, i) => {
                if (!el) return;
                const f = FLOATING_FOODS[i];
                gsap.set(el, { opacity: 0, scale: 0.6, rotation: -12 });
                gsap.to(el, { opacity: 0.13, scale: 1, rotation: 0, duration: 1, delay: 0.3 + i * 0.08, ease: 'back.out(1.7)' });
                // flotación vertical en bucle
                gsap.to(el, {
                    y: i % 2 ? 22 : -22, rotation: i % 2 ? 8 : -8,
                    duration: f.dur, ease: 'sine.inOut',
                    repeat: -1, yoyo: true, delay: 1,
                });
            });
        }, rootRef);
        return () => ctx.revert();
    }, []);

    const setBlob = (i) => (el) => { blobsRef.current[i] = el; };
    const setFood = (i) => (el) => { foodsRef.current[i] = el; };

    return (
        <div ref={rootRef} className="min-h-dvh flex flex-col lg:flex-row bg-orange-600">
            {/* ── Panel marca (hero) ── */}
            <div className="relative flex flex-col flex-1 lg:w-1/2 lg:min-h-dvh bg-gradient-to-b lg:bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 overflow-hidden">
                {/* Blobs decorativos animados */}
                <div ref={setBlob(0)} className="absolute -top-28 -left-24 w-80 h-80 bg-white rounded-full opacity-[0.07] blur-xl" />
                <div ref={setBlob(1)} className="absolute top-1/3 -right-20 w-72 h-72 bg-amber-300 rounded-full opacity-[0.10] blur-2xl" />
                <div ref={setBlob(2)} className="absolute -bottom-32 left-1/4 w-96 h-96 bg-white rounded-full opacity-[0.05] blur-2xl" />
                {/* Grid sutil */}
                <div className="absolute inset-0 opacity-[0.04]"
                     style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                {/* Íconos de comida flotantes (fondo animado) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    {FLOATING_FOODS.map((f, i) => (
                        <f.Icon key={i} ref={setFood(i)} size={f.size}
                            className="absolute text-white"
                            style={{ top: f.top, left: f.left, opacity: 0 }} strokeWidth={1.5} />
                    ))}
                </div>

                <div className="relative flex flex-col items-center justify-center flex-1 px-8 pt-20 pb-12 lg:py-16 gap-6 text-center">
                    {/* Badge */}
                    <span data-anim="brand" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[12px] font-semibold">
                        <MapPin size={13} /> UTP Ate · Comida cerca del campus
                    </span>

                    {/* Logo grande animado */}
                    <div data-anim="brand">
                        <LogoAnimado variant="white" className="w-[300px] sm:w-[360px] max-w-[85vw] drop-shadow-xl" />
                    </div>

                    <h1 data-anim="brand" className="text-2xl sm:text-3xl font-extrabold text-white leading-tight max-w-[340px] font-display">
                        Comida económica cerca del campus, en un solo lugar
                    </h1>
                    <p data-anim="brand" className="text-[14px] text-orange-50/90 leading-relaxed max-w-[320px]">
                        Descubre locales externos, compra a tus compañeros y gestiona tu propio negocio gastronómico.
                    </p>

                    {/* Secciones de valor (features) */}
                    <div className="w-full max-w-[340px] flex flex-col gap-3 pt-2">
                        {FEATURES.map((f) => (
                            <div key={f.title} data-anim="feature"
                                className="flex items-center gap-3.5 text-left bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3">
                                <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/20 shrink-0">
                                    <f.Icon size={20} className="text-white" />
                                </span>
                                <div>
                                    <p className="text-[14px] font-bold text-white leading-tight">{f.title}</p>
                                    <p className="text-[12px] text-orange-50/80 leading-snug mt-0.5">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Panel de acceso ── */}
            {/* Mobile: tarjeta blanca tipo bottom-sheet que sube y solapa el hero.
                Desktop: mitad derecha blanca centrada. */}
            <div className="relative bg-white rounded-t-[2.5rem] lg:rounded-none -mt-8 lg:mt-0 px-7 pt-9 pb-10 lg:w-1/2 lg:min-h-dvh lg:justify-center lg:px-16 flex flex-col gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] lg:shadow-none z-10">
                {/* Asa visual del bottom-sheet (solo mobile) */}
                <div className="lg:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-3 mb-3" />

                {/* Encabezado estudiante */}
                <div data-anim="access" className="mb-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 mb-3">
                        <GraduationCap size={14} className="text-orange-600" />
                        <span className="text-xs font-semibold text-orange-600">Acceso para estudiantes</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display">Ingresa a tu cuenta</h2>
                    <p className="text-[13px] text-slate-500 mt-1.5">Con tu correo institucional UTP <span className="text-orange-600 font-semibold">(@utp.edu.pe)</span></p>
                </div>

                {/* Formulario de correo (login estudiante directo) */}
                <form data-anim="access" onSubmit={onSubmit} noValidate className="space-y-3">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">Correo institucional</label>
                        <div className={`flex items-center gap-2.5 rounded-xl px-4 h-13 py-3 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-500'}`}>
                            <Mail size={18} className="text-orange-500 shrink-0" />
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="andrea.quispe@utp.edu.pe" inputMode="email" autoComplete="email"
                                className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none"
                            />
                        </div>
                        {error
                            ? <p className="mt-1 text-xs text-red-500">{error}</p>
                            : <p className="mt-1 text-[11px] text-slate-400">Te reconoceremos y pediremos tu PIN. Si eres nuevo, te enviamos un enlace para registrarte.</p>}
                    </div>

                    <button type="submit" disabled={processing}
                        className="group relative w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base overflow-hidden disabled:opacity-60 transition-colors active:scale-[0.98] cursor-pointer shadow-lg shadow-orange-600/25">
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        {processing ? <Loader2 size={20} className="animate-spin" /> : <>Continuar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                {/* Separador */}
                <div data-anim="access" className="flex items-center gap-3 my-1">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] text-slate-400 font-medium">o</span>
                    <span className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Enlace a login emprendedor (separado) */}
                <button data-anim="access" onClick={onEmprendedor}
                    className="group w-full h-13 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-2xl flex items-center justify-center gap-2 text-[14px] transition-colors active:scale-[0.98] cursor-pointer">
                    <Store size={18} />
                    ¿Eres emprendedor? Ingresa aquí
                    <ArrowRight size={16} className="opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>

                <button data-anim="access"
                    onClick={() => {
                        const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '');
                        window.location.href = `${base}/admin`;
                    }}
                    className="text-center text-xs text-slate-400 hover:text-slate-600 transition-colors mt-1 cursor-pointer">
                    Acceso Administrador
                </button>
            </div>
        </div>
    );
}

/* ─── Layout compartido de las pantallas de auth (encabezado con marca) ─── */
function AuthHeader({ onBack }) {
    return (
        <>
            <button onClick={onBack} className="flex items-center gap-2 pt-12 lg:pt-8 pb-2 text-slate-500 text-sm hover:text-slate-700 transition-colors cursor-pointer">
                <ArrowLeft size={20} className="text-slate-900" /> Inicio
            </button>
            <div className="flex items-center gap-2 mt-4 mb-2">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                    <UtensilsCrossed size={18} className="text-white" />
                </div>
                <span className="text-[22px] font-extrabold text-slate-900 font-display">MesaUTP</span>
            </div>
        </>
    );
}

/* ─── Paso 1: Correo institucional ─── */
function EmailScreen({ email, setEmail, error, processing, onSubmit, onBack }) {
    return (
        <div className="min-h-dvh lg:min-h-0 bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto lg:overflow-visible px-6 pb-8 lg:px-10 lg:pb-10">
                <AuthHeader onBack={onBack} />

                <h1 className="text-[26px] font-bold text-slate-900 font-display mt-3">Bienvenido/a</h1>
                <p className="text-[14px] text-slate-500 leading-relaxed mt-1 mb-6 max-w-[330px]">
                    Ingresa con tu correo institucional. Te reconoceremos y te pediremos tu PIN; si eres nuevo, te enviaremos un enlace para registrarte.
                </p>

                <form onSubmit={onSubmit} noValidate className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">
                            Correo institucional UTP *
                        </label>
                        <div className={`flex items-center gap-2.5 rounded-xl px-4 h-12 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-500'}`}>
                            <Mail size={18} className="text-orange-500 shrink-0" />
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="andrea.quispe@utp.edu.pe" inputMode="email" autoComplete="email" autoFocus
                                className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none"
                            />
                        </div>
                        {error
                            ? <p className="mt-1 text-xs text-red-500">{error}</p>
                            : <p className="mt-1 text-[11px] text-slate-400">Solo cuentas @utp.edu.pe son aceptadas</p>}
                    </div>

                    <button type="submit" disabled={processing}
                        className="group w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base disabled:opacity-60 transition-colors active:scale-[0.98] cursor-pointer shadow-lg shadow-orange-600/25">
                        {processing ? <Loader2 size={20} className="animate-spin" /> : <>Continuar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                <div className="bg-orange-50 rounded-xl p-3.5 flex gap-2.5 mt-6">
                    <ShieldCheck size={18} className="text-orange-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[12px] font-semibold text-orange-900">Comunidad verificada</p>
                        <p className="text-[11px] text-orange-700 mt-0.5">Solo estudiantes UTP Ate acceden a la plataforma.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Paso 2: Ingreso con PIN ─── */
function PinScreen({ email, name, pin, setPin, error, processing, onSubmit, onChangeEmail }) {
    return (
        <div className="min-h-dvh lg:min-h-0 bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto lg:overflow-visible px-6 pb-8 lg:px-10 lg:pb-10">
                <AuthHeader onBack={onChangeEmail} />

                <h1 className="text-[26px] font-bold text-slate-900 font-display mt-3">
                    Hola{name ? `, ${name}` : ''} 👋
                </h1>
                <p className="text-[14px] text-slate-500 leading-relaxed mt-1 mb-6">
                    Ingresa tu PIN para entrar como <span className="font-semibold text-orange-600">{email}</span>
                </p>

                <form onSubmit={onSubmit} noValidate className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">PIN de ingreso</label>
                        <div className={`flex items-center gap-2.5 rounded-xl px-4 h-14 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-orange-500'}`}>
                            <KeyRound size={20} className="text-orange-500 shrink-0" />
                            <input
                                type="password" value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="••••" inputMode="numeric" autoComplete="off" autoFocus
                                className="flex-1 bg-transparent text-2xl tracking-[0.4em] text-slate-900 focus:outline-none"
                            />
                        </div>
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <button type="submit" disabled={processing}
                        className="group w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base disabled:opacity-60 transition-colors active:scale-[0.98] cursor-pointer shadow-lg shadow-orange-600/25">
                        {processing ? <Loader2 size={20} className="animate-spin" /> : <><LogIn size={20} /> Ingresar</>}
                    </button>
                </form>

                <button onClick={onChangeEmail}
                    className="text-[12px] text-slate-500 hover:text-orange-600 transition-colors mt-5 mx-auto block cursor-pointer">
                    ¿No eres tú? Cambiar correo
                </button>
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
                Enviamos un enlace de registro a <strong className="text-slate-800">{email}</strong>.
                Ábrelo para crear tu cuenta y elegir tu PIN.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 mb-6">
                {[
                    'Abre la app de correo en tu teléfono',
                    'Busca el mensaje de MesaUTP',
                    "Toca el botón 'Completar registro'",
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

            <button onClick={onChangeEmail} className="text-[12px] text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">
                ¿Correo incorrecto? Cambiar correo
            </button>
        </div>
    );
}

/* ─── Hero split-screen reutilizable (panel de marca con fondo animado) ─── */
// theme: 'orange' (estudiante) | 'blue' (emprendedor)
function AuthHero({ theme = 'orange', badge, title, subtitle, features }) {
    const blobsRef = useRef([]);
    const foodsRef = useRef([]);
    const heroRef  = useRef(null);

    const grad = theme === 'blue'
        ? 'from-blue-500 via-blue-600 to-blue-800'
        : 'from-orange-500 via-orange-600 to-orange-800';

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ctx = gsap.context(() => {
            if (reduce) {
                gsap.set(foodsRef.current, { opacity: 0.12 });
                gsap.set('[data-hero]', { opacity: 1, y: 0, x: 0 });
                return;
            }
            gsap.from('[data-hero]', { opacity: 0, y: 22, duration: 0.7, ease: 'power3.out', stagger: 0.12, delay: 0.1 });
            blobsRef.current.forEach((b, i) => b && gsap.to(b, { y: i % 2 ? 24 : -24, x: i % 2 ? -14 : 14, duration: 6 + i, ease: 'sine.inOut', repeat: -1, yoyo: true }));
            foodsRef.current.forEach((el, i) => {
                if (!el) return;
                const f = FLOATING_FOODS[i];
                gsap.set(el, { opacity: 0, scale: 0.6, rotation: -12 });
                gsap.to(el, { opacity: 0.13, scale: 1, rotation: 0, duration: 1, delay: 0.3 + i * 0.07, ease: 'back.out(1.7)' });
                gsap.to(el, { y: i % 2 ? 20 : -20, rotation: i % 2 ? 8 : -8, duration: f.dur, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 });
            });
        }, heroRef);
        return () => ctx.revert();
    }, []);

    const setBlob = (i) => (el) => { blobsRef.current[i] = el; };
    const setFood = (i) => (el) => { foodsRef.current[i] = el; };

    return (
        <div ref={heroRef} className={`relative flex flex-col flex-1 lg:w-1/2 lg:min-h-dvh bg-gradient-to-b lg:bg-gradient-to-br ${grad} overflow-hidden`}>
            <div ref={setBlob(0)} className="absolute -top-28 -left-24 w-80 h-80 bg-white rounded-full opacity-[0.07] blur-xl" />
            <div ref={setBlob(1)} className={`absolute top-1/3 -right-20 w-72 h-72 rounded-full opacity-[0.10] blur-2xl ${theme === 'blue' ? 'bg-sky-300' : 'bg-amber-300'}`} />
            <div ref={setBlob(2)} className="absolute -bottom-32 left-1/4 w-96 h-96 bg-white rounded-full opacity-[0.05] blur-2xl" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                {FLOATING_FOODS.map((f, i) => (
                    <f.Icon key={i} ref={setFood(i)} size={f.size} strokeWidth={1.5}
                        className="absolute text-white" style={{ top: f.top, left: f.left, opacity: 0 }} />
                ))}
            </div>

            <div className="relative flex flex-col items-center justify-center flex-1 px-8 pt-20 pb-12 lg:py-16 gap-6 text-center">
                <span data-hero className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[12px] font-semibold">
                    {badge}
                </span>
                <div data-hero>
                    <LogoAnimado variant="white" className="w-[280px] sm:w-[340px] max-w-[85vw] drop-shadow-xl" />
                </div>
                <h1 data-hero className="text-2xl sm:text-3xl font-extrabold text-white leading-tight max-w-[340px] font-display">{title}</h1>
                <p data-hero className="text-[14px] text-white/85 leading-relaxed max-w-[320px]">{subtitle}</p>
                {features && (
                    <div className="w-full max-w-[340px] flex flex-col gap-3 pt-2">
                        {features.map((f) => (
                            <div key={f.title} data-hero className="flex items-center gap-3.5 text-left bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3">
                                <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/20 shrink-0">
                                    <f.Icon size={20} className="text-white" />
                                </span>
                                <div>
                                    <p className="text-[14px] font-bold text-white leading-tight">{f.title}</p>
                                    <p className="text-[12px] text-white/75 leading-snug mt-0.5">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const EMP_FEATURES = [
    { Icon: StoreIcon, title: 'Tu negocio en el campus', desc: 'Publica tu menú y llega a toda la UTP Ate' },
    { Icon: Wallet,    title: 'Cobra con Yape o Plin',    desc: 'Recibe pagos directos sin comisiones' },
    { Icon: Clock,     title: 'Gestiona tus pedidos',     desc: 'Confirma, prepara y entrega en orden' },
];

/* ─── Pantalla: Login Emprendedor (correo + contraseña) ─── */
function EmprendedorLoginScreen({ onBack }) {
    const { login } = useAuth();
    const navigate  = useNavigate();
    const rootRef   = useRef(null);
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [error, setError]           = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;
        const ctx = gsap.context(() => {
            gsap.from('[data-form]', { opacity: 0, y: 22, duration: 0.6, ease: 'power3.out', stagger: 0.1, delay: 0.4 });
        }, rootRef);
        return () => ctx.revert();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password) {
            const msg = 'Ingresa tu correo y contraseña.';
            setError(msg); toast.error(msg); return;
        }
        setProcessing(true);
        try {
            const { data } = await emprendedorLogin(email.trim(), password);
            login(data.token, data.user);
            toast.success(`¡Bienvenido/a, ${data.user.name?.split(' ')[0]}!`);
            navigate('/emprendedor', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message ?? 'No se pudo iniciar sesión.';
            setError(msg); toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div ref={rootRef} className="min-h-dvh flex flex-col lg:flex-row bg-blue-600">
            <AuthHero theme="blue"
                badge={<><Store size={13} /> Panel de emprendedores</>}
                title="Haz crecer tu negocio gastronómico"
                subtitle="Vende tu comida a toda la comunidad UTP Ate desde un solo lugar."
                features={EMP_FEATURES} />

            {/* Formulario */}
            <div className="relative bg-white rounded-t-[2.5rem] lg:rounded-none -mt-8 lg:mt-0 px-7 pt-9 pb-10 lg:w-1/2 lg:min-h-dvh lg:justify-center lg:px-16 flex flex-col gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] lg:shadow-none z-10">
                <div className="lg:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-3 mb-3" />

                <button data-form onClick={onBack} className="flex items-center gap-2 text-slate-500 text-sm hover:text-slate-700 transition-colors cursor-pointer self-start">
                    <ArrowLeft size={18} /> Volver al inicio
                </button>

                <div data-form className="mb-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 mb-3">
                        <Store size={14} className="text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600">Acceso para emprendedores</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 font-display">Ingresa a tu panel</h2>
                    <p className="text-[13px] text-slate-500 mt-1.5">Gestiona tu negocio con tu correo y contraseña</p>
                </div>

                <form onSubmit={submit} noValidate className="space-y-3.5">
                    <div data-form>
                        <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">Correo</label>
                        <div className={`flex items-center gap-2.5 rounded-xl px-4 h-12 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                            <Mail size={18} className="text-blue-600 shrink-0" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="tucorreo@ejemplo.com" autoComplete="email"
                                className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none" />
                        </div>
                    </div>
                    <div data-form>
                        <label className="block text-[13px] font-semibold text-slate-900 mb-1.5">Contraseña</label>
                        <div className={`flex items-center gap-2.5 rounded-xl px-4 h-12 border-2 bg-slate-50 transition-colors ${error ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                            <Lock size={18} className="text-blue-600 shrink-0" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" autoComplete="current-password"
                                className="flex-1 bg-transparent text-[14px] text-slate-900 focus:outline-none" />
                        </div>
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>

                    <button data-form type="submit" disabled={processing}
                        className="group w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base disabled:opacity-60 transition-colors active:scale-[0.98] cursor-pointer shadow-lg shadow-blue-600/25">
                        {processing ? <Loader2 size={20} className="animate-spin" /> : <><LogIn size={20} /> Iniciar sesión</>}
                    </button>
                </form>

                <div data-form className="flex items-center gap-3 my-1">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] text-slate-400 font-medium">o</span>
                    <span className="h-px flex-1 bg-slate-200" />
                </div>

                <button data-form onClick={() => navigate('/emprendedor/registro')}
                    className="group w-full h-13 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-2xl flex items-center justify-center gap-2 text-[14px] transition-colors active:scale-[0.98] cursor-pointer">
                    <UserPlus size={18} />
                    Crear cuenta de emprendedor
                    <ArrowRight size={16} className="opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

/* ─── Componente principal ─── */
// Flujo estudiante: welcome → email → (pin | sent)
//   · email existente y registrado  → pin
//   · email nuevo                    → sent (enlace de registro)
export default function Login() {
    const { login } = useAuth();
    const navigate  = useNavigate();

    const [step,       setStep]       = useState('welcome'); // welcome | email | pin | sent | emp-login
    const [email,      setEmail]      = useState('');
    const [name,       setName]       = useState('');
    const [pin,        setPin]        = useState('');
    const [error,      setError]      = useState('');
    const [processing, setProcessing] = useState(false);

    // Paso 1: el usuario envía su correo → decidimos PIN o registro
    const submitEmail = async (e) => {
        e.preventDefault();
        setError('');
        const value = email.trim().toLowerCase();
        if (!value)                          { setError('Ingresa tu correo institucional.'); return; }
        if (!value.endsWith('@utp.edu.pe'))  { setError('Solo se aceptan correos @utp.edu.pe.'); return; }

        setProcessing(true);
        try {
            const { data } = await checkEmail(value);
            if (data.status === 'pin') {
                setName(data.name ?? '');
                setPin('');
                setStep('pin');
            } else {
                // Usuario nuevo → enviar enlace de registro
                await sendLink(value);
                setStep('sent');
                toast.success('Enlace de registro enviado a tu correo UTP');
            }
        } catch (err) {
            const msg = err.response?.data?.errors?.email?.[0]
                ?? err.response?.data?.message
                ?? 'No se pudo procesar tu correo.';
            setError(msg);
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    // Paso 2: ingreso con PIN
    const submitPin = async (e) => {
        e.preventDefault();
        setError('');
        if (pin.length < 4) { setError('Ingresa tu PIN (4 a 6 dígitos).'); return; }

        setProcessing(true);
        try {
            const { data } = await loginPin(email.trim().toLowerCase(), pin);
            login(data.token, data.user);
            toast.success(`¡Bienvenido/a, ${data.user.name}!`);
            // Quien entra con PIN es estudiante: siempre va a la vista de comprar.
            // Si además vende, cambia a su panel desde el menú ("Mi panel de ventas").
            navigate('/locales-externos', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.errors?.pin?.[0]
                ?? err.response?.data?.message
                ?? 'Correo o PIN incorrectos.';
            setError(msg);
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const resend = async () => {
        try { await sendLink(email.trim().toLowerCase()); } catch { /* silencioso */ }
    };

    // Bienvenida = login estudiante directo (split-screen completo en desktop).
    if (step === 'welcome') return (
        <WelcomeScreen
            email={email} setEmail={setEmail} error={error} processing={processing}
            onSubmit={submitEmail} onEmprendedor={() => { setStep('emp-login'); setError(''); }}
        />
    );

    // El emprendedor entra con correo + contraseña (split-screen completo).
    if (step === 'emp-login') return <EmprendedorLoginScreen onBack={() => setStep('welcome')} />;

    let screen;
    if (step === 'pin') {
        screen = <PinScreen
            email={email} name={name} pin={pin} setPin={setPin}
            error={error} processing={processing} onSubmit={submitPin}
            onChangeEmail={() => { setStep('welcome'); setError(''); setPin(''); }}
        />;
    } else { // sent
        screen = <VerifyScreen email={email} onResend={resend}
            onChangeEmail={() => { setStep('welcome'); setError(''); }} />;
    }

    return (
        <div className="lg:min-h-dvh lg:bg-gradient-to-br lg:from-orange-50 lg:to-slate-100 lg:flex lg:items-center lg:justify-center lg:p-6">
            <div className="lg:w-[460px] lg:max-h-[94vh] lg:overflow-y-auto lg:rounded-[32px] lg:shadow-2xl lg:bg-white">
                {screen}
            </div>
        </div>
    );
}
