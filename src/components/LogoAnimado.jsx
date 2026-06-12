import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * Logo MesaUTP vectorizado (SVG) con animación de ensamblaje por piezas (GSAP).
 *
 * - Carga el SVG inline desde /mesautp-logo.svg para poder animar sus paths.
 * - Las piezas aparecen escalonadas (izq → der) con un micro-rebote del conjunto.
 * - `variant="white"` recolorea todo a blanco (para fondos oscuros / panel naranja).
 *   `variant="brand"` conserva los colores de marca (naranja + grafito).
 *
 * Props:
 *   className  → clases para el contenedor (controla el tamaño vía width).
 *   variant    → 'white' | 'brand'   (default 'brand')
 *   play       → boolean: dispara la animación cuando pasa a true (default true)
 */
export default function LogoAnimado({ className = '', variant = 'brand', play = true }) {
    const hostRef = useRef(null);
    const tlRef   = useRef(null);
    const [svg, setSvg] = useState('');

    // Carga el SVG una vez
    useEffect(() => {
        let alive = true;
        fetch('/mesautp-logo.svg')
            .then(r => r.text())
            .then(t => { if (alive) setSvg(t); })
            .catch(() => { /* si falla, el contenedor queda vacío */ });
        return () => { alive = false; };
    }, []);

    // Inyecta el SVG, recolorea y anima
    useEffect(() => {
        const host = hostRef.current;
        if (!host || !svg) return;

        host.innerHTML = svg;
        const el = host.querySelector('svg');
        if (!el) return;

        // El SVG escala al ancho del contenedor
        el.removeAttribute('width');
        el.removeAttribute('height');
        el.style.width = '100%';
        el.style.height = 'auto';
        el.style.display = 'block';

        const paths = Array.from(el.querySelectorAll('path'));

        // Recolorea según variante
        if (variant === 'white') {
            paths.forEach(p => p.setAttribute('fill', '#ffffff'));
        }

        if (!play) return;

        // Animación de ensamblaje por piezas (no se mueven paths individuales:
        // eso descuadra la geometría del SVG — solo fundido escalonado + rebote
        // del conjunto, ordenado por posición horizontal).
        if (tlRef.current) tlRef.current.kill();

        const ordered = paths.slice().sort((a, b) => {
            try { return a.getBBox().x - b.getBBox().x; } catch { return 0; }
        });

        gsap.set(el, { transformOrigin: '50% 100%' });
        gsap.set(paths, { opacity: 0 });

        const tl = gsap.timeline();
        tl.from(el, { scale: 0.9, y: 10, duration: 0.5, ease: 'back.out(1.6)' }, 0)
          .to(ordered, {
              opacity: 1, duration: 0.35, ease: 'power2.out',
              stagger: { each: 0.05, from: 'start' },
          }, 0.1)
          .add(() => { gsap.set(paths, { clearProps: 'opacity' }); });

        tlRef.current = tl;
        return () => { tl.kill(); };
    }, [svg, variant, play]);

    return <div ref={hostRef} className={className} aria-label="MesaUTP" role="img" />;
}
