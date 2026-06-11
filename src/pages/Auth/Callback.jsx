import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { verify, getMe } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const { login }      = useAuth();
    const navigate       = useNavigate();

    useEffect(() => {
        const token   = searchParams.get('token');
        const source  = searchParams.get('from');
        const errCode = searchParams.get('error');

        if (errCode) {
            const msg = errCode === 'invalid_domain'
                ? 'Solo se aceptan cuentas @utp.edu.pe'
                : 'No se pudo conectar con Google. Intenta de nuevo.';
            toast.error(msg);
            setTimeout(() => navigate('/login', { replace: true }), 2500);
            return;
        }

        if (!token) {
            toast.error('Token inválido o expirado.');
            setTimeout(() => navigate('/login', { replace: true }), 2500);
            return;
        }

        if (source === 'google') {
            // Sanctum token directo desde Google OAuth
            localStorage.setItem('token', token);
            getMe()
                .then(({ data }) => {
                    login(token, data);
                    toast.success(`¡Bienvenido/a, ${data.name?.split(' ')[0]}!`);
                    navigate(data.role === 'emprendedor' ? '/emprendedor' : '/locales-externos', { replace: true });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    toast.error('Error al autenticar con Google.');
                    navigate('/login', { replace: true });
                });
        } else {
            // Magic link
            verify(token)
                .then(({ data }) => {
                    login(data.token, data.user);
                    toast.success(`¡Bienvenido/a, ${data.user.name?.split(' ')[0]}!`);
                    navigate(
                        data.user.role === 'emprendedor' ? '/emprendedor' : '/locales-externos',
                        { replace: true }
                    );
                })
                .catch(err => {
                    toast.error(err.response?.data?.message ?? 'El enlace expiró o ya fue usado.');
                    setTimeout(() => navigate('/login', { replace: true }), 2500);
                });
        }
    }, []);

    return (
        <div className="min-h-dvh bg-orange-600 flex items-center justify-center">
            <div className="text-white text-center">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium">Verificando acceso...</p>
            </div>
        </div>
    );
}
