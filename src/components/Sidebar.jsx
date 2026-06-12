import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Store, Users, ShoppingBag, User, UtensilsCrossed, LogOut,
    LayoutDashboard, CirclePlus, Inbox, BarChart2, Star, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CONSUMER_TABS = [
    { to: '/locales-externos', label: 'Locales Externos', Icon: Store },
    { to: '/locales-internos', label: 'Locales Internos', Icon: Users },
    { to: '/mis-pedidos',      label: 'Mis Pedidos',      Icon: ShoppingBag },
    { to: '/perfil',           label: 'Mi Perfil',        Icon: User },
];

const EMPRENDEDOR_TABS = [
    { to: '/emprendedor',          label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/emprendedor/publicar', label: 'Publicar',  Icon: CirclePlus },
    { to: '/emprendedor/pedidos',  label: 'Pedidos',   Icon: Inbox },
    { to: '/emprendedor/ventas',   label: 'Ventas',    Icon: BarChart2 },
    { to: '/emprendedor/calificaciones', label: 'Calificaciones', Icon: Star },
    { to: '/emprendedor/mi-local', label: 'Mi local', Icon: Settings },
];

/**
 * Sidebar de navegación — solo visible en desktop (lg+).
 * En móvil/tablet la navegación sigue siendo el BottomNav flotante.
 */
export default function Sidebar() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isEmprendedor = pathname.startsWith('/emprendedor');
    const tabs = isEmprendedor ? EMPRENDEDOR_TABS : CONSUMER_TABS;

    const firstName = user?.name?.split(' ')?.[0] ?? 'Estudiante';
    const letter    = user?.name?.[0]?.toUpperCase() ?? 'U';

    const handleLogout = async () => { await logout(); navigate('/login'); };

    return (
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex-col z-40">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-6 h-20 border-b border-slate-100">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <UtensilsCrossed size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-lg font-display leading-none">MesaUTP</p>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {isEmprendedor ? 'Panel Emprendedor' : 'UTP Ate'}
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                {tabs.map(({ to, label, Icon, end }) => (
                    <NavLink key={to} to={to} end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
                                isActive
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }>
                        {({ isActive }) => (
                            <>
                                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User + logout */}
            <div className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-orange-600 font-bold text-sm">{letter}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">{firstName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email ?? ''}</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
