import { Injectable } from '@angular/core';

export interface OpcionBandera {
  label: string;
  code: string;
  img: string;
}

export interface PreguntaBandera {
  q: string;
  opciones: OpcionBandera[];
  correctaCode: string;
}

const flagUrl = (alpha2: string, w: 40 | 80 | 160 | 320 = 80) => `https://flagcdn.com/w${w}/${alpha2.toLowerCase()}.png`;

const CANDIDATOS = [
  { label: 'Argentina',      code: 'ar' },
  { label: 'Brasil',         code: 'br' },
  { label: 'Chile',          code: 'cl' },
  { label: 'España',         code: 'es' },
  { label: 'Italia',         code: 'it' },
  { label: 'Japón',          code: 'jp' },
  { label: 'Alemania',       code: 'de' },
  { label: 'Francia',        code: 'fr' },
  { label: 'Colombia',       code: 'co' },
  { label: 'México',         code: 'mx' },
  { label: 'Uruguay',        code: 'uy' },
  { label: 'Perú',           code: 'pe' },
  { label: 'Portugal',       code: 'pt' },
  { label: 'Reino Unido',    code: 'gb' },
  { label: 'Canadá',         code: 'ca' },
  { label: 'Estados Unidos', code: 'us' },
  { label: 'Australia',      code: 'au' },
  { label: 'Nueva Zelanda',  code: 'nz' }
];

@Injectable({ providedIn: 'root' })
export class BanderasService {
  private withImg(cands: {label:string;code:string}[], w: 40|80|160|320 = 80) {
    return cands.map(c => ({ ...c, img: flagUrl(c.code, w) }));
  }

  getPreguntasRandom(n = 10): PreguntaBandera[] {
    const pool = [...CANDIDATOS].sort(() => Math.random() - 0.5);
    const preguntas: PreguntaBandera[] = [];

    for (let i = 0; i < Math.min(n, pool.length); i++) {
      const correcta = pool[i];
      const distractores = pool
        .filter(p => p.code !== correcta.code)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const opciones = this.withImg([correcta, ...distractores]).sort(() => Math.random() - 0.5);

      preguntas.push({
        q: `¿Cuál es la bandera de ${correcta.label}?`,
        opciones,
        correctaCode: correcta.code
      });
    }
    return preguntas;
  }
}
