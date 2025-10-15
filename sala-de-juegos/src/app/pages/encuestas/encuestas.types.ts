export interface Encuesta {
  ID_ENCUESTA: number;
  JUEGO: 'Ahorcado' | 'Mayor/Menor' | 'Preguntados' | 'Arkanoid' | string;
  PUNTAJE: number;
  COMENTARIO?: string | null;
  FECHA: string;
  ID_USUARIO: string;
  USUARIOS?: { EMAIL: string } | { EMAIL: string }[] | null;
}

export interface RespuestaEncuesta {
  id: number;
  usuarioEmail: string;
  juego: string;
  puntaje: number;
  fechaISO: string;
  comentario?: string | null;
}

export const JUEGOS: Array<Encuesta['JUEGO']> = [
  'Ahorcado', 'Mayor/Menor', 'Preguntados', 'Arkanoid'
];
