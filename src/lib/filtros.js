const DIACRITICS = /[̀-ͯ]/g;

/** Normaliza texto: minúsculas y sin acentos, para búsquedas tolerantes. */
export const norm = (s) =>
    (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(DIACRITICS, '');

/** ¿El local coincide con el texto buscado? (nombre, categoría, descripción, productos) */
export const matchQuery = (l, q) => {
    if (!q) return true;
    const t = norm(q);
    return (
        norm(l.nombre).includes(t) ||
        norm(l.categoria?.nombre).includes(t) ||
        norm(l.descripcion).includes(t) ||
        norm(l.punto_entrega).includes(t) ||
        (l.productos ?? []).some(p => norm(p.nombre).includes(t) || norm(p.descripcion).includes(t))
    );
};

const precio = (l) => Number(l.precio_min ?? 0);
const dist   = (l) => Number(l.distancia_metros ?? 9999);

/** Filtros por chip para locales EXTERNOS. */
export const matchChipExterno = (l, chip) => {
    switch (chip) {
        case 'Hasta S/10': return precio(l) <= 10;
        case 'Hasta S/15': return precio(l) <= 15;
        case '< 5 min':    return dist(l) <= 500;
        case 'Veggie':     return norm(l.categoria?.nombre).includes('veg') ||
                                  (l.productos ?? []).some(p => norm(p.nombre).includes('veg'));
        case 'Todos':
        default:           return true;
    }
};

/** Filtros por chip para locales INTERNOS. */
export const matchChipInterno = (l, chip) => {
    switch (chip) {
        case 'Hasta S/8':   return precio(l) <= 8;
        case 'Patio':       return norm(l.punto_entrega).includes('patio');
        case 'Biblioteca':  return norm(l.punto_entrega).includes('biblio');
        case 'Hoy':
        default:            return true;
    }
};
