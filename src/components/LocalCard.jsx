import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import StarRating from './StarRating';

export default function LocalCard({ local, href }) {
    return (
        <Link to={href} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
            <div className="relative h-36 bg-slate-100">
                <img
                    src={local.foto_url ?? local.foto ?? '/placeholder.jpg'}
                    alt={local.nombre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => { e.target.src = '/placeholder.jpg'; }}
                />
                {local.estado === 'aprobado' && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        Abierto
                    </span>
                )}
            </div>
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{local.nombre}</h3>
                    <StarRating value={local.rating_promedio} count={local.total_resenas} />
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{local.categoria?.nombre ?? local.categoria}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {local.precio_min && (
                        <span className="text-xs text-orange-600 font-semibold">
                            Desde S/ {Number(local.precio_min).toFixed(0)}
                        </span>
                    )}
                    {local.distancia_metros && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={11} />{local.distancia_metros}m
                        </span>
                    )}
                    {local.horario && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={11} />{local.horario}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
