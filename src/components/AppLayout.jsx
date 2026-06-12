import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChevronLeft, LogOut, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from './BottomNav';

export default function AppLayout({ title, back, actions, children, toast: externalToast }) {
    const { logout } = useAuth();
    const navigate   = useNavigate();
    const [toast, setToast] = useState(externalToast ?? null);

    useEffect(() => {
        if (externalToast) {
            setToast(externalToast);
            const t = setTimeout(() => setToast(null), 4500);
            return () => clearTimeout(t);
        }
    }, [externalToast]);

    const handleBack = () => {
        if (typeof back === 'string') navigate(back);
        else if (typeof back === 'function') back();
        else navigate(-1);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 bg-white lg:hidden" />

            <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
                <div className="max-w-md lg:max-w-2xl mx-auto flex items-center h-14 px-4 gap-3">
                    {back !== undefined && (
                        <button onClick={handleBack} className="p-1 -ml-1 text-slate-600">
                            <ChevronLeft size={22} />
                        </button>
                    )}
                    <h1 className="flex-1 font-bold text-slate-900 text-lg font-display truncate">{title}</h1>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                    {back === undefined && (
                        <button onClick={handleLogout} className="p-2 -mr-1 text-slate-400" title="Cerrar sesión">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </header>

            {toast && (
                <div className="max-w-md lg:max-w-2xl mx-auto w-full px-4 pt-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center justify-between gap-3">
                        <span className="flex-1">{toast}</span>
                        <button onClick={() => setToast(null)} className="text-green-400 shrink-0"><X size={14} /></button>
                    </div>
                </div>
            )}

            <main className="flex-1 max-w-md lg:max-w-2xl mx-auto w-full px-4 pb-24 lg:pb-10">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
