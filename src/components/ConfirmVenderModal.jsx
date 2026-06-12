import { useEffect, useRef } from 'react';
import { ChefHat, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

/**
 * Modal: "¿Deseas crear tu cuenta de emprendedor?"
 * Aparece cuando un estudiante sin panel de ventas pulsa "Vender mi comida".
 * Al confirmar, va directo a completar los datos del local (sin elegir tipo).
 */
export default function ConfirmVenderModal({ open, onClose, onConfirm }) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open || !panelRef.current) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.fromTo(panelRef.current, { opacity: 0, y: 20, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'back.out(1.5)' });
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}>
            <div ref={panelRef} onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-sm p-7 text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 grid place-items-center mx-auto mb-4">
                    <ChefHat size={32} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-display">¿Deseas crear tu cuenta de emprendedor?</h2>
                <p className="text-[14px] text-slate-500 leading-relaxed mt-2 mb-6">
                    Empieza a vender tu comida a tus compañeros de UTP Ate. Usarás tu misma cuenta de estudiante:
                    solo completa los datos de tu emprendimiento.
                </p>
                <button onClick={onConfirm}
                    className="group w-full h-13 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer mb-2.5">
                    Sí, crear mi emprendimiento
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onClose}
                    className="w-full text-[13px] text-slate-500 hover:text-slate-700 transition-colors py-2 cursor-pointer">
                    Ahora no
                </button>
            </div>
        </div>
    );
}
