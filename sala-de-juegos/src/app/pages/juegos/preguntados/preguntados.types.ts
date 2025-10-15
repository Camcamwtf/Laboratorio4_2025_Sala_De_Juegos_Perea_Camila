export interface Opcion {
  label: string;
  code: string;
  img: string;
}

export interface Pregunta {
  q: string;
  opciones: Opcion[];
  correctaCode: string;
}
