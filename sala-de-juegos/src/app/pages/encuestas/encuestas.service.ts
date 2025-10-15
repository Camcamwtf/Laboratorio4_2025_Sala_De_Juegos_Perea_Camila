import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Encuesta, RespuestaEncuesta } from './encuestas.types';
import { from, switchMap, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EncuestasService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  private pickEmail(usu: Encuesta['USUARIOS']): string {
    if (!usu) return '—';
    if (Array.isArray(usu)) return usu[0]?.EMAIL ?? '—';
    return usu.EMAIL ?? '—';
  }

  getRespuestas$(): Observable<RespuestaEncuesta[]> {
    return from(
      this.supabase
        .from('ENCUESTAS')
        .select('ID_ENCUESTA, JUEGO, PUNTAJE, COMENTARIO, FECHA, ID_USUARIO')
        .order('FECHA', { ascending: false })
    ).pipe(
      switchMap(async ({ data, error }) => {
        if (error) {
          console.error('[ENCUESTAS] error select ENCUESTAS:', error);
          return [];
        }
        const encuestas = (data ?? []) as Encuesta[];

        const ids = Array.from(new Set(encuestas.map(e => e.ID_USUARIO).filter(Boolean)));
        let emailMap = new Map<string, string>();

        if (ids.length > 0) {
          const { data: usuarios, error: uErr } = await this.supabase
            .from('USUARIOS')
            .select('ID_USUARIO, EMAIL')
            .in('ID_USUARIO', ids);

          if (uErr) {
            console.warn('[ENCUESTAS] no pude resolver emails:', uErr.message);
          } else {
            (usuarios ?? []).forEach(u => emailMap.set(u.ID_USUARIO as string, u.EMAIL as string));
          }
        }

        const rows: RespuestaEncuesta[] = encuestas.map(r => ({
          id: r.ID_ENCUESTA,
          usuarioEmail: emailMap.get(r.ID_USUARIO) ?? '—',
          juego: r.JUEGO,
          puntaje: r.PUNTAJE,
          fechaISO: r.FECHA,
          comentario: r.COMENTARIO ?? null
        }));

        return rows;
      })
    );
  }

  async crearEncuesta(params: { ID_USUARIO: string; JUEGO: Encuesta['JUEGO']; PUNTAJE: number; COMENTARIO?: string | null; }): Promise<void> {
    const { error } = await this.supabase.from('ENCUESTAS').insert({
      ID_USUARIO: params.ID_USUARIO,
      JUEGO: params.JUEGO,
      PUNTAJE: params.PUNTAJE,
      COMENTARIO: params.COMENTARIO ?? null,
      FECHA: new Date().toISOString()
    });
    if (error) throw error;
  }

  async listarPorUsuario(uid: string) {
    const { data, error } = await this.supabase
      .from('ENCUESTAS')
      .select('ID_ENCUESTA, JUEGO, PUNTAJE, COMENTARIO, FECHA')
      .eq('ID_USUARIO', uid)
      .order('FECHA', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}
