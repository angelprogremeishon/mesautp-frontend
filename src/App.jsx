import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UtensilsCrossed } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import Login                 from '@/pages/Auth/Login';
import AuthCallback          from '@/pages/Auth/Callback';
import LocalesExternosIndex  from '@/pages/LocalesExternos/Index';
import LocalesExternosShow   from '@/pages/LocalesExternos/Show';
import LocalesExternosTodos  from '@/pages/LocalesExternos/Todos';
import LocalesInternosIndex  from '@/pages/LocalesInternos/Index';
import LocalesInternosShow   from '@/pages/LocalesInternos/Show';
import MisPedidos            from '@/pages/Pedidos/Index';
import Perfil                from '@/pages/Perfil/Index';
import ReservaConfirmacion   from '@/pages/Reserva/Confirmacion';
import EmprendedorDashboard  from '@/pages/Emprendedor/Dashboard';
import EmprendedorRegistro   from '@/pages/Emprendedor/Registro';
import EmprendedorPublicar   from '@/pages/Emprendedor/Publicar';
import EmprendedorPedidos    from '@/pages/Emprendedor/Pedidos';
import EmprendedorVentas     from '@/pages/Emprendedor/Ventas';

function PrivateRoute({ children }) {
    const { isAuth, ready } = useAuth();
    if (!ready) return null;
    return isAuth ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
    const { isAuth, ready } = useAuth();
    if (!ready) return null;
    return !isAuth ? children : <Navigate to="/locales-externos" replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{ className: 'font-sans text-sm' }}
            />
            <BrowserRouter>
                <Routes>
                    {/* Raíz */}
                    <Route path="/" element={<Navigate to="/locales-externos" replace />} />

                    {/* Auth */}
                    <Route path="/login"         element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Consumidor */}
                    <Route path="/locales-externos"       element={<PrivateRoute><LocalesExternosIndex /></PrivateRoute>} />
                    <Route path="/locales-externos/todos" element={<PrivateRoute><LocalesExternosTodos /></PrivateRoute>} />
                    <Route path="/locales-externos/:id"   element={<PrivateRoute><LocalesExternosShow /></PrivateRoute>} />
                    <Route path="/locales-internos"       element={<PrivateRoute><LocalesInternosIndex /></PrivateRoute>} />
                    <Route path="/locales-internos/:id"   element={<PrivateRoute><LocalesInternosShow /></PrivateRoute>} />
                    <Route path="/mis-pedidos"            element={<PrivateRoute><MisPedidos /></PrivateRoute>} />
                    <Route path="/perfil"                 element={<PrivateRoute><Perfil /></PrivateRoute>} />
                    <Route path="/reserva/confirmacion"   element={<PrivateRoute><ReservaConfirmacion /></PrivateRoute>} />

                    {/* Emprendedor */}
                    <Route path="/emprendedor"          element={<PrivateRoute><EmprendedorDashboard /></PrivateRoute>} />
                    <Route path="/emprendedor/registro" element={<PrivateRoute><EmprendedorRegistro /></PrivateRoute>} />
                    <Route path="/emprendedor/publicar" element={<PrivateRoute><EmprendedorPublicar /></PrivateRoute>} />
                    <Route path="/emprendedor/pedidos"  element={<PrivateRoute><EmprendedorPedidos /></PrivateRoute>} />
                    <Route path="/emprendedor/ventas"   element={<PrivateRoute><EmprendedorVentas /></PrivateRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

function NotFound() {
    return (
        <div className="min-h-dvh bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
            <UtensilsCrossed size={64} className="text-orange-300 mb-4" />
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Página no encontrada</h1>
            <p className="text-sm text-slate-500 mb-6">La ruta que buscas no existe.</p>
            <a href="/locales-externos" className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl text-sm">
                Ir al inicio
            </a>
        </div>
    );
}
