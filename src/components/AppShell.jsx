import Sidebar from './Sidebar';

/**
 * Envoltura de las páginas autenticadas.
 * - Desktop (lg+): muestra el Sidebar fijo a la izquierda y empuja el
 *   contenido con lg:pl-64. El BottomNav de cada página queda oculto (lg:hidden).
 * - Móvil/tablet: el Sidebar está oculto y la navegación es el BottomNav flotante.
 */
export default function AppShell({ children }) {
    return (
        <div className="min-h-dvh bg-slate-50">
            <Sidebar />
            <div className="lg:pl-64">
                {children}
            </div>
        </div>
    );
}
