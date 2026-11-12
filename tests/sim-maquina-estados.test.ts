import { describe, expect, it } from 'vitest';
import { MAQUINAS, ESPERA_MS, aplicarEvento, avanzarSim, cambiarCfg, crearSim, eventoValido, lecturasDe, type Sim } from '../src/simuladores/maquina-estados/motor';
import type { PresetMaquina } from '../src/simuladores/maquina-estados/tipos';
import { armarPlano } from '../src/simuladores/maquina-estados/geometria';
import { desdeNum } from '../src/simuladores/formato';

const lect = (p: PresetMaquina, s: Sim, clave: string) => lecturasDe(p, s).find((x) => x.clave === clave)?.valor;
const ev = (p: PresetMaquina, s: Sim, ...ids: string[]) => ids.reduce((acc, id) => aplicarEvento(p, acc, id), s);
const espera = (p: PresetMaquina, s: Sim, ms = ESPERA_MS) => avanzarSim(p, s, ms);
const textoLog = (s: Sim) => s.log.map((x) => x.texto).join('\n');

describe('SimMaquinaEstados · estructura común', () => {
  const presets = Object.keys(MAQUINAS) as PresetMaquina[];
  it('hay 5 presets y todos traen estado, transiciones y un diagrama coherente', () => {
    expect(presets).toHaveLength(5);
    for (const p of presets) {
      const def = MAQUINAS[p];
      const s = crearSim(p);
      expect(lect(p, s, 'estado')).toBeDefined();
      expect(lect(p, s, 'transiciones')).toBe(0);
      const ids = new Set(def.diagrama.nodos.map((n) => n.id));
      for (const f of def.diagrama.flechas) {
        expect(ids.has(f.de), `${p}: ${f.de}`).toBe(true);
        expect(ids.has(f.a), `${p}: ${f.a}`).toBe(true);
      }
      expect(ids.has(s.e.estado)).toBe(true);
      for (const angosto of [false, true]) {
        const plano = armarPlano(def.diagrama, angosto);
        expect(plano.cajas).toHaveLength(def.diagrama.nodos.length);
        expect(plano.flechas).toHaveLength(def.diagrama.flechas.length);
      }
    }
  });
  it('un evento inválido no cambia nada', () => {
    const s = crearSim('proceso-linux');
    expect(aplicarEvento('proceso-linux', s, 'wait')).toBe(s);
  });
});

describe('SimMaquinaEstados · circuit-breaker', () => {
  const P = 'circuit-breaker' as const;
  const con = (cfg: Record<string, number>) => Object.entries(cfg).reduce((s, [k, v]) => cambiarCfg(s, k, v), crearSim(P));

  it('con falla 80 % y umbral 50 % abre el circuito; después las llamadas no crecen y los rechazados sí', () => {
    let s = con({ tasa: 80, umbral: 50 });
    s = avanzarSim(P, s, 3000);
    expect(lect(P, s, 'estado')).toBe('abierto');
    const llamadas = lect(P, s, 'llamadas-al-servicio') as number;
    const rech = lect(P, s, 'rechazados-rapido') as number;
    s = avanzarSim(P, s, 2000);
    expect(lect(P, s, 'estado')).toBe('abierto');
    expect(lect(P, s, 'llamadas-al-servicio')).toBe(llamadas);
    expect(lect(P, s, 'rechazados-rapido') as number).toBeGreaterThan(rech);
  });
  it('al bajar la falla a 0 %, tras la espera pasa por semi-abierto y vuelve a cerrado', () => {
    let s = con({ tasa: 80, umbral: 50, espera: 5 });
    s = avanzarSim(P, s, 3000);
    expect(s.e.estado).toBe('abierto');
    s = cambiarCfg(s, 'tasa', 0);
    const estados: string[] = [];
    for (let i = 0; i < 200; i++) {
      s = avanzarSim(P, s, 50);
      if (estados[estados.length - 1] !== s.e.estado) estados.push(s.e.estado);
    }
    expect(estados).toEqual(['abierto', 'semi-abierto', 'cerrado']);
    expect(textoLog(s)).toContain('el pedido de prueba anduvo');
  });
  it('si el servicio sigue fallando, la prueba falla y vuelve a abierto', () => {
    let s = con({ tasa: 100, umbral: 50, espera: 1 });
    s = avanzarSim(P, s, 1500);
    expect(s.e.estado).toBe('abierto');
    const vistos = new Set<string>();
    for (let i = 0; i < 100; i++) { s = avanzarSim(P, s, 50); vistos.add(s.e.estado); }
    expect(vistos.has('semi-abierto')).toBe(true);
    expect(textoLog(s)).toContain('el pedido de prueba falló');
  });
  it('con falla 0 % nunca abre y las lecturas son enteras (10 pedidos por segundo)', () => {
    let s = con({ tasa: 0 });
    s = avanzarSim(P, s, 10_000);
    expect(s.e.estado).toBe('cerrado');
    expect(lect(P, s, 'llamadas-al-servicio')).toBe(100);
    expect(lect(P, s, 'rechazados-rapido')).toBe(0);
    expect(lect(P, s, 'fallas-ventana')).toBe('0');
  });
  it('es determinista: misma semilla, mismo recorrido; otra semilla, otro', () => {
    const corre = (semilla: number) => {
      let s = crearSim(P, semilla);
      s = cambiarCfg(s, 'tasa', 40);
      s = avanzarSim(P, s, 20_000);
      return [s.e.estado, lect(P, s, 'llamadas-al-servicio'), lect(P, s, 'rechazados-rapido'), s.e.transiciones].join('|');
    };
    expect(corre(42)).toBe(corre(42));
    expect(corre(7)).not.toBe(corre(42) + 'x');
  });
  it('el tiempo se puede cortar en pasos de 50 ms sin cambiar el resultado', () => {
    let a = cambiarCfg(crearSim(P), 'tasa', 60);
    let b = a;
    a = avanzarSim(P, a, 8000);
    for (let i = 0; i < 160; i++) b = avanzarSim(P, b, 50);
    expect(b.e).toEqual(a.e);
  });
});

describe('SimMaquinaEstados · unidad-systemd', () => {
  const P = 'unidad-systemd' as const;
  const muere = (s: Sim) => ev(P, s, 'muere');
  /** muere y espera a que vuelva a `active` (1 s simulado en activating) */
  const ciclo = (s: Sim) => espera(P, muere(s), 1000);

  it('con Restart=on-failure, una muerte pasa por activating y vuelve a active sumando 1 reinicio', () => {
    let s = muere(crearSim(P));
    expect(s.e.estado).toBe('activating');
    s = espera(P, s, 1000);
    expect(s.e.estado).toBe('active');
    expect(lect(P, s, 'reinicios')).toBe(1);
    expect(textoLog(s)).toContain('app.service: Main process exited, code=exited, status=1/FAILURE');
  });
  it('5 muertes en menos de 10 s simulados dejan la unidad en failed con start-limit-hit', () => {
    let s = crearSim(P);
    for (let i = 0; i < 4; i++) s = ciclo(s);
    expect(s.e.estado).toBe('active');
    s = muere(s);
    expect(s.e.estado).toBe('failed');
    expect(textoLog(s)).toContain('start-limit-hit');
  });
  it('si las muertes se espacian más de 10 s, el límite no se dispara', () => {
    let s = crearSim(P);
    for (let i = 0; i < 6; i++) { s = ciclo(s); s = espera(P, s, 3000); }
    expect(s.e.estado).toBe('active');
    expect(lect(P, s, 'reinicios')).toBe(6);
    expect(textoLog(s)).not.toContain('start-limit-hit');
  });
  it('"Esperar 10 s" vacía la ventana: después de esperar hacen falta otras 5 muertes', () => {
    let s = crearSim(P);
    for (let i = 0; i < 4; i++) s = ciclo(s);
    expect(lect(P, s, 'muertes-recientes')).toBe(4);
    s = espera(P, s);
    expect(lect(P, s, 'muertes-recientes')).toBe(0);
    s = muere(s);
    expect(s.e.estado).toBe('activating');
  });
  it('sin Restart, una muerte deja failed directo; reset-failed lleva a inactive y start a active', () => {
    let s = cambiarCfg(crearSim(P), 'restart', false);
    s = muere(s);
    expect(s.e.estado).toBe('failed');
    s = ev(P, s, 'reset-failed');
    expect(s.e.estado).toBe('inactive');
    s = espera(P, ev(P, s, 'start'), 1000);
    expect(s.e.estado).toBe('active');
  });
  it('sin el límite, 5 muertes seguidas siguen reiniciando', () => {
    let s = cambiarCfg(crearSim(P), 'limite', false);
    for (let i = 0; i < 6; i++) s = ciclo(s);
    expect(s.e.estado).toBe('active');
    expect(lect(P, s, 'reinicios')).toBe(6);
  });
  it('stop y restart pasan por deactivating; solo se habilita lo válido', () => {
    let s = crearSim(P);
    expect(eventoValido(P, s, 'start')).toBe(false);
    expect(eventoValido(P, s, 'reset-failed')).toBe(false);
    s = ev(P, s, 'restart');
    expect(s.e.estado).toBe('deactivating');
    s = espera(P, s, 1000);
    expect(s.e.estado).toBe('activating');
    s = espera(P, s, 1000);
    expect(s.e.estado).toBe('active');
    s = espera(P, ev(P, s, 'stop'), 1000);
    expect(s.e.estado).toBe('inactive');
  });
});

describe('SimMaquinaEstados · proceso-linux', () => {
  const P = 'proceso-linux' as const;
  it('termina (exit) lleva a Z; sigue en la tabla hasta que el padre hace wait()', () => {
    let s = ev(P, crearSim(P), 'exit');
    expect(lect(P, s, 'estado-ps')).toBe('Z');
    expect(lect(P, s, 'pid')).toBe(4242);
    expect(MAQUINAS[P].resumen!(s.e, s.cfg).lineas.join('\n')).toContain('<defunct>');
    s = ev(P, s, 'wait');
    expect(s.e.estado).toBe('fuera-de-la-tabla');
    expect(MAQUINAS[P].resumen!(s.e, s.cfg).lineas.join('\n')).toContain('ya no figura');
  });
  it('en D, SIGSTOP queda pendiente ("señal pendiente") y se aplica al salir de D', () => {
    let s = ev(P, crearSim(P), 'pide-disco');
    expect(lect(P, s, 'estado-ps')).toBe('D');
    s = ev(P, s, 'sigstop');
    expect(lect(P, s, 'estado-ps')).toBe('D');
    expect(textoLog(s)).toContain('señal pendiente');
    expect(lect(P, s, 'senal-pendiente')).toBe('SIGSTOP');
    s = ev(P, s, 'llega-dato');
    expect(lect(P, s, 'estado-ps')).toBe('T');
    expect(lect(P, s, 'senal-pendiente')).toBe('ninguna');
  });
  it('los eventos válidos dependen del estado (la letra de ps acompaña)', () => {
    let s = crearSim(P);
    expect(lect(P, s, 'estado-ps')).toBe('R');
    expect(eventoValido(P, s, 'llega-dato')).toBe(false);
    s = ev(P, s, 'espera-tecla');
    expect(lect(P, s, 'estado-ps')).toBe('S');
    expect(eventoValido(P, s, 'pide-disco')).toBe(false);
    s = ev(P, s, 'sigstop');
    expect(lect(P, s, 'estado-ps')).toBe('T');
    s = ev(P, s, 'sigcont');
    expect(lect(P, s, 'estado-ps')).toBe('R');
  });
});

describe('SimMaquinaEstados · contenedor-docker', () => {
  const P = 'contenedor-docker' as const;
  const pol = (p: string) => cambiarCfg(crearSim(P), 'politica', p);

  it('con política no, salir con código 1 deja exited (con y sin 10 s de uptime)', () => {
    let s = ev(P, pol('no'), 'exit1');
    expect(s.e.estado).toBe('exited');
    expect(lect(P, s, 'codigo-salida')).toBe(1);
    s = ev(P, espera(P, pol('no')), 'exit1');
    expect(s.e.estado).toBe('exited');
  });
  it('REGLA DE LOS 10 s: con on-failure, salir antes de 10 s de uptime deja exited sin reiniciar y el log lo dice', () => {
    let s = pol('on-failure');
    s = avanzarSim(P, s, 4200);
    expect(desdeNum(String(lect(P, s, 'uptime')))).toBeCloseTo(4.2, 5);
    s = ev(P, s, 'exit1');
    expect(s.e.estado).toBe('exited');
    expect(lect(P, s, 'reinicios')).toBe(0);
    expect(textoLog(s)).toContain('salió antes de los 10 s: la política de reinicio no se aplica');
    // y aunque pase el tiempo, no vuelve solo
    s = avanzarSim(P, s, 30_000);
    expect(s.e.estado).toBe('exited');
  });
  it('con on-failure, tras esperar 10 s, salir con código 1 pasa por restarting y vuelve a running', () => {
    let s = espera(P, pol('on-failure'));
    expect(lect(P, s, 'uptime')).toBe('10,0');
    expect(textoLog(s)).toContain('lleva 10 s en running');
    s = ev(P, s, 'exit1');
    expect(s.e.estado).toBe('restarting');
    expect(lect(P, s, 'reinicios')).toBe(1);
    s = avanzarSim(P, s, 1000);
    expect(s.e.estado).toBe('running');
    // el reloj de uptime arranca de nuevo: otra salida inmediata ya no se reinicia
    expect(lect(P, s, 'uptime')).toBe('0,0');
    s = ev(P, s, 'exit1');
    expect(s.e.estado).toBe('exited');
  });
  it('el uptime corre solo en running: pausado y reiniciando no suma', () => {
    let s = avanzarSim(P, pol('always'), 3000);
    s = ev(P, s, 'pause');
    s = avanzarSim(P, s, 20_000);
    expect(lect(P, s, 'uptime')).toBe('3,0');
    s = ev(P, s, 'unpause');
    s = avanzarSim(P, s, 2000);
    expect(lect(P, s, 'uptime')).toBe('5,0');
  });
  it('con always, después de docker stop queda exited y vuelve a running recién con reiniciar el daemon', () => {
    let s = ev(P, espera(P, pol('always')), 'stop');
    expect(s.e.estado).toBe('exited');
    s = avanzarSim(P, s, 20_000);
    expect(s.e.estado).toBe('exited');
    s = ev(P, s, 'daemon');
    expect(s.e.estado).toBe('running');
  });
  it('con unless-stopped, después de docker stop no vuelve ni con reiniciar el daemon', () => {
    let s = ev(P, espera(P, pol('unless-stopped')), 'stop');
    s = ev(P, s, 'daemon');
    expect(s.e.estado).toBe('exited');
    expect(textoLog(s)).toContain('unless-stopped lo respeta');
  });
  it('con unless-stopped, si cayó solo (sin docker stop) el daemon sí lo levanta', () => {
    let s = pol('unless-stopped');
    s = ev(P, s, 'exit1'); // antes de 10 s: exited sin reinicio
    expect(s.e.estado).toBe('exited');
    s = ev(P, s, 'daemon');
    expect(s.e.estado).toBe('running');
  });
  it('ciclo de vida: stop, rm, create, start; solo habilita lo válido', () => {
    let s = crearSim(P);
    expect(eventoValido(P, s, 'start')).toBe(false);
    expect(eventoValido(P, s, 'rm')).toBe(false);
    s = ev(P, s, 'stop');
    expect(lect(P, s, 'codigo-salida')).toBe(143);
    s = ev(P, s, 'rm');
    expect(s.e.estado).toBe('removed');
    s = ev(P, s, 'create');
    expect(s.e.estado).toBe('created');
    s = ev(P, s, 'start');
    expect(s.e.estado).toBe('running');
    expect(s.e.transiciones).toBe(4);
  });
});

describe('SimMaquinaEstados · incidente-itil', () => {
  const P = 'incidente-itil' as const;
  it('recorre el ciclo completo hasta cerrado', () => {
    const s = ev(P, crearSim(P), 'clasificar', 'asignar', 'pedir-datos', 'responde', 'solucion', 'confirma');
    expect(s.e.estado).toBe('cerrado');
    expect(s.e.transiciones).toBe(6);
  });
  it('sigue fallando desde resuelto pasa a reabierto, y se reasigna', () => {
    let s = ev(P, crearSim(P), 'clasificar', 'asignar', 'solucion', 'sigue-fallando');
    expect(s.e.estado).toBe('reabierto');
    s = ev(P, s, 'asignar');
    expect(s.e.estado).toBe('en-curso');
  });
  it('abrir problema suma 1 a problemas-abiertos sin cerrar ni cambiar el estado; pedir cambio suma cambios-pedidos', () => {
    let s = ev(P, crearSim(P), 'clasificar', 'asignar');
    const t = s.e.transiciones;
    s = ev(P, s, 'problema');
    expect(lect(P, s, 'problemas-abiertos')).toBe(1);
    expect(s.e.estado).toBe('en-curso');
    s = ev(P, s, 'problema', 'cambio');
    expect(lect(P, s, 'problemas-abiertos')).toBe(2);
    expect(lect(P, s, 'cambios-pedidos')).toBe(1);
    expect(s.e.transiciones).toBe(t);
    expect(textoLog(s)).toContain('PRB-0002');
  });
  it('la prioridad sale de impacto × urgencia al clasificar', () => {
    const pr = (impacto: string, urgencia: string) => {
      let s = cambiarCfg(cambiarCfg(crearSim(P), 'impacto', impacto), 'urgencia', urgencia);
      s = ev(P, s, 'clasificar');
      return lect(P, s, 'prioridad');
    };
    expect(pr('alto', 'alta')).toBe('P1');
    expect(pr('alto', 'media')).toBe('P2');
    expect(pr('bajo', 'baja')).toBe('P4');
    expect(lect(P, crearSim(P), 'prioridad')).toBe('—');
  });
  it('solo habilita los eventos válidos desde el estado actual y marca la nota fija', () => {
    const s = crearSim(P);
    expect(eventoValido(P, s, 'clasificar')).toBe(true);
    expect(eventoValido(P, s, 'confirma')).toBe(false);
    expect(eventoValido(P, s, 'sigue-fallando')).toBe(false);
    expect(MAQUINAS[P].nota).toBe('Flujo típico de una herramienta de mesa de ayuda; ITIL 4 no fija estos estados');
    expect(MAQUINAS[P].eventos).toHaveLength(9);
  });
  it('cada acción avanza 5 minutos simulados en el log', () => {
    const s = ev(P, crearSim(P), 'clasificar');
    expect(s.log[s.log.length - 1]!.t).toBe(300_000);
  });
});
