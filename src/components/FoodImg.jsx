import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

/**
 * Imagen de comida con fallback elegante.
 * Si la URL falta o falla al cargar, muestra un bloque neutro con icono
 * en vez de una imagen rota o un espacio en blanco.
 */
export default function FoodImg({ src, alt, className = '', iconSize = 28 }) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;

    if (showFallback) {
        return (
            <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}>
                <UtensilsCrossed size={iconSize} className="text-slate-300" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            onError={() => setFailed(true)}
        />
    );
}
