import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, ShoppingBag, Star, HelpCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';

export default function PerfilIndex() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const letter    = user?.name?.[0]?.toUpperCase() ?? 'U';
    const firstName = user?.name?.split(' ')?.[0] ?? 'Usuario';

    const handleLogout = async () => {
        toast.info('Sesión cerrada');
        await logout();
        navigate('/login');
    };

    const MENU = [
        { icon: ShoppingBag, label: 'Historial completo de pedidos', to: '/mis-pedidos', color: 'bg-orange-50' },
        { icon: Star,         label: 'Mis reseñas',                  to: '/mis-pedidos', color: 'bg-orange-50' },
        { icon: HelpCircle,   label: 'Ayuda y soporte',              to: null,           color: 'bg-orange-50' },
    ];

    return (
        <div className="min-h-dvh bg-slate-50 flex flex-col">
            <div className="h-11 shrink-0 bg-orange-600" />

            {/* Orange gradient header */}
            <div className="bg-gradient-to-b from-orange-600 to-orange-700 px-5 pb-6">
                <div className="flex items-center justify-between py-3">
                    <p className="font-bold text-white text-[18px] font-display">Mi Perfil</p>
                    <Settings size={22} className="text-white" />
                </div>

                <div className="flex flex-col items-center gap-2 pt-2">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-orange-600 font-extrabold text-[32px]">{letter}</span>
                    </div>
                    <p className="font-bold text-white text-[20px] font-display">{user?.name ?? 'Usuario'}</p>
                    <p className="text-red-200 text-[12px]">{user?.email}</p>
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 mt-1">
                        <span className="text-white text-[11px]">✓ Estudiante verificado · UTP Ate</span>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="bg-white shadow-sm flex items-center shrink-0">
                {[
                    { val: '0',  label: 'Pedidos' },
                    { val: 'S/0', label: 'Ahorrado' },
                    { val: '—',   label: 'Calificación' },
                ].map((s, i) => (
                    <div key={s.label} className={`flex-1 flex flex-col items-center py-4 gap-1 ${i > 0 ? 'border-l border-slate-100' : ''}`}>
                        <span className="font-extrabold text-orange-600 text-[22px]">{s.val}</span>
                        <span className="text-[11px] text-slate-400">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Menu list */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-28">
                <div className="bg-white rounded-2xl divide-y divide-slate-100">
                    {MENU.map(item => (
                        <button key={item.label} onClick={() => item.to && navigate(item.to)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3.5">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center`}>
                                    <item.icon size={16} className="text-orange-600" />
                                </div>
                                <span className="text-[14px] text-slate-900">{item.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-400" />
                        </button>
                    ))}
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5">
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                            <LogOut size={16} className="text-red-600" />
                        </div>
                        <span className="text-[14px] text-red-600">Cerrar sesión</span>
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
