// src/app/services/results.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type JuegoTipo = 'Ahorcado' | 'Mayor/Menor' | 'Preguntados' | 'Arkanoid';

export interface Resultado {
  ID_RESULTADO?: number;
  ID_USUARIO: string;
  JUEGO: JuegoTipo;
  PUNTAJE: number;
  TIEMPO_PARTIDA: number;
  GANO: boolean;
  CREATED_AT?: string;
}

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  async guardarResultado(r: Omit<Resultado, 'ID_RESULTADO' | 'CREATED_AT'>): Promise<void> {
    const { error } = await this.supabase.from('RESULTADOS').insert(r);
    if (error) throw error;
  }

  async listarPorUsuario(uid: string, juego?: JuegoTipo): Promise<Resultado[]> {
    let q = this.supabase
      .from('RESULTADOS')
      .select('*')
      .eq('ID_USUARIO', uid)
      .order('CREATED_AT', { ascending: false });

    if (juego) q = q.eq('JUEGO', juego);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Resultado[];
  }

  async listarTodosConUsuario(): Promise<Array<Resultado & { USUARIOS: { EMAIL: string } }>> {
    const { data, error } = await this.supabase
      .from('RESULTADOS')
      .select('*, USUARIOS(EMAIL)')
      .order('CREATED_AT', { ascending: false });

    if (error) throw error;
    return (data ?? []) as any;
  }
}
