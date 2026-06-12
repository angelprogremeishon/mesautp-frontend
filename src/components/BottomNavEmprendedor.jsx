import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CirclePlus, Inbox, BarChart2, ShoppingCart } from 'lucide-react';

const TABS = [
    { to: '/emprendedor',           label: 'Panel',    Icon: LayoutDashboard },
    { to: '/emprendedor/publicar',  label: 'Publicar', Icon: CirclePlus },
    { to: '/emprendedor/pedidos',   label: 'Pedidos',  Icon: Inbox },
    { to: '/locales-externos',      label: 'Comprar',  Icon: ShoppingCart },
];

export default function BottomNavEmprendedor() {
    return (
        <div className="lg:hidden fixed bottom-0 inset-x-0 flex justify-center pb-4 z-50 pointer-events-none">
            <nav className="pointer-events-auto w-[358px] h-14 bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_4px_20px_rgba(15,23,42,0.15)] flex items-center justify-between px-4 gap-1">
                {TABS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} end={to === '/emprendedor'}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 rounded-[20px] py-1.5 px-3 transition-colors ${
                                isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-400'
                            }`
                        }>
                        {({ isActive }) => (
                            <>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
