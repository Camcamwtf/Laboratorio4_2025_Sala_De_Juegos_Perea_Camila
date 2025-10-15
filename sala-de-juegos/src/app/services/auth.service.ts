import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

interface Usuario {
  ID_USUARIO: string;
  EMAIL: string;
  NOMBRE?: string | null;
  PERFIL?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;

  private _user$ = new BehaviorSubject<User | null>(null);
  public user$ = this._user$.asObservable();
  private _ready$ = new BehaviorSubject<boolean>(false);
  public  ready$  = this._ready$.asObservable();

  public miUsuario$ = this.user$.pipe(
    switchMap(usuario => {
      if (!usuario) return of(null);
      return from(this.getMiUsuario()).pipe(
        catchError(err => { console.error('Error al obtener mi usuario:', err?.message || err); return of(null); })
      );
    }),
    shareReplay(1)
  );

  public esAdmin$ = this.miUsuario$.pipe(
    map(miUsuario => (miUsuario?.PERFIL ?? '').toString().toLowerCase() === 'administrador'),
    shareReplay(1)
  );

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
    this.bootstrap();
  }

  private async bootstrap() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) console.warn('getSession error:', error.message);
    this._user$.next(session?.user ?? null);

    this.supabase.auth.onAuthStateChange((_evt, sess) => {
      this._user$.next(sess?.user ?? null);

      if (!this._ready$.value) this._ready$.next(true);
    });

    if (!this._ready$.value) this._ready$.next(true);
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) { console.error('Error al intentar loguearse:', error.message); throw error; }
    return data.user;
  }

  async register(email: string, password: string, nombre?: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    const user = data.user!;
    const { error: upsertErr } = await this.supabase.from('USUARIOS').upsert({
      ID_USUARIO: user.id,
      EMAIL: email,
      NOMBRE: nombre ?? null,
      PERFIL: 'Usuario'
    });
    if (upsertErr) throw upsertErr;

    return user;
  }

  async logout() {
    await this.supabase.auth.signOut();
  }

  async getUsuarioActual(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user ?? null;
  }

  async getMiUsuario(): Promise<Usuario | null> {
    const user = await this.getUsuarioActual();
    if (!user) return null;
    const { data, error } = await this.supabase
      .from('USUARIOS')
      .select('*')
      .eq('ID_USUARIO', user.id)
      .single<Usuario>();
    if (error) throw error;
    return data;
  }
}
