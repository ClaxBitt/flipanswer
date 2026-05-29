"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  // ESTADOS DE SEGURIDAD
  const [estaDesbloqueado, setEstaDesbloqueado] = useState(false);
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [verificando, setVerificando] = useState(false);

  // ESTADO DE CUESTIONARIOS EXISTENTES
  const [cuestionarios, setCuestionarios] = useState([]);

  // ESTADOS DEL FORMULARIO
  const [titulo, setTitulo] = useState('');
  const [referencia, setReferencia] = useState('');
  const [textoMarkdown, setTextoMarkdown] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // FUNCIÓN PARA TRAER LOS TEMAS DESDE LA API
  const cargarCuestionarios = async () => {
    try {
      const res = await fetch('/api/cuestionarios');
      if (res.ok) {
        const resultado = await res.json();
        setCuestionarios(resultado.data);
      }
    } catch (error) {
      console.error("Error cargando cuestionarios:", error);
    }
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    setVerificando(true);
    setErrorLogin('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setEstaDesbloqueado(true);
        cargarCuestionarios(); // Cargamos la lista inmediatamente al desbloquear
      } else {
        setErrorLogin('Contraseña incorrecta. Acceso denegado.');
      }
    } catch (error) {
      setErrorLogin('Error de conexión.');
    }
    setVerificando(false);
  };

  const eliminarCuestionario = async (id, tituloCuestionario) => {
    const confirmar = confirm(`¿Estás completamente seguro de que deseas eliminar "${tituloCuestionario}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/cuestionarios/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password // Pasamos la clave para validar el borrado
        }
      });

      if (res.ok) {
        // Filtramos el estado local para quitarlo de la pantalla de inmediato
        setCuestionarios(cuestionarios.filter(c => c._id !== id));
        alert('Cuestionario eliminado con éxito.');
      } else {
        alert('No se pudo eliminar el cuestionario. Verifica tus permisos.');
      }
    } catch (error) {
      alert('Error de conexión al intentar eliminar.');
    }
  };

  const procesarCuestionario = (texto) => {
    const bloques = texto.split('\n\n'); 
    const preguntas = [];

    bloques.forEach(bloque => {
      const regexRespuesta = /\(\((.*?)\)\)/s; 
      const match = bloque.match(regexRespuesta);

      if (match) {
        const respuesta = match[1].trim();
        const pregunta = bloque.replace(match[0], '').trim();
        if (pregunta && respuesta) {
          preguntas.push({ pregunta, respuesta });
        }
      }
    });
    return preguntas;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault(); 
    setCargando(true);
    setMensaje('');

    const preguntasProcesadas = procesarCuestionario(textoMarkdown);

    if (preguntasProcesadas.length === 0) {
      setMensaje('❌ No se encontraron preguntas válidas. Usa el formato ((respuesta)).');
      setCargando(false);
      return;
    }

    try {
      const res = await fetch('/api/cuestionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, referencia, preguntas: preguntasProcesadas, password }),
      });

      if (res.ok) {
        setMensaje(`✅ ¡Éxito! Se guardaron ${preguntasProcesadas.length} preguntas.`);
        setTitulo('');
        setReferencia('');
        setTextoMarkdown('');
        cargarCuestionarios(); // Recargamos la lista para que aparezca el nuevo tema abajo
      } else {
        setMensaje('❌ Hubo un error al guardar o tu sesión expiró.');
      }
    } catch (error) {
      setMensaje('❌ Error de conexión.');
    }
    setCargando(false);
  };

  // VISTA 1: PANTALLA DE BLOQUEO
  if (!estaDesbloqueado) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-flip-light">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-flip-slate/20 text-center">
          <div className="w-16 h-16 bg-flip-teal/10 text-flip-teal rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-flip-dark mb-2">Acceso Restringido</h1>
          <p className="text-flip-slate mb-6">Ingresa la contraseña maestra para administrar el material.</p>
          
          <form onSubmit={manejarLogin}>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full p-4 mb-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-flip-teal outline-none transition-all text-center text-lg tracking-widest text-flip-dark"
            />
            <button 
              type="submit" 
              disabled={verificando}
              className="w-full bg-flip-dark text-white font-bold py-4 rounded-xl hover:bg-flip-dark/90 transition-all disabled:opacity-50 text-lg cursor-pointer"
            >
              {verificando ? 'Verificando...' : 'Desbloquear Panel'}
            </button>
          </form>

          {errorLogin && (
            <p className="mt-4 text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {errorLogin}
            </p>
          )}

          <div className="mt-6">
            <Link href="/" className="text-flip-teal hover:underline text-sm font-medium">
              ← Volver a la plataforma
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // VISTA 2: PANEL DE CONTROL DESBLOQUEADO (Formulario + Lista de Eliminación)
  return (
    <main className="min-h-screen p-4 md:p-8 bg-flip-light">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-flip-dark flex items-center gap-2">
            <span className="text-flip-teal">🔓</span> Control
          </h1>
          <Link href="/" className="text-flip-teal hover:underline font-medium py-2">
            ← Volver
          </Link>
        </div>

        {/* Layout en malla: 1 columna en móvil, 2 columnas en pantallas grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMNA 1 Y 2: Formulario de Subida */}
          <form onSubmit={manejarEnvio} className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-flip-slate/20">
            <h2 className="text-lg font-bold text-flip-dark mb-4 pb-2 border-b border-flip-slate/10">Crear nuevo cuestionario</h2>
            
            <div className="mb-5">
              <label className="block text-flip-dark font-semibold mb-2 text-sm">Título del cuestionario</label>
              <input 
                type="text" 
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-flip-teal outline-none transition-all text-base"
              />
            </div>

            <div className="mb-5">
              <label className="block text-flip-dark font-semibold mb-2 text-sm">Link de referencia (Opcional)</label>
              <input 
                type="url" 
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej: Link de Drive o AccessMedicine"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-flip-teal outline-none transition-all text-base text-flip-slate"
              />
            </div>

            <div className="mb-6">
              <label className="block text-flip-dark font-semibold mb-2 text-sm">
                Contenido (Pregunta seguida de ((respuesta)) y doble salto)
              </label>
              <textarea 
                required
                value={textoMarkdown}
                onChange={(e) => setTextoMarkdown(e.target.value)}
                rows="8"
                placeholder="¿Pregunta de ejemplo?&#10;((Respuesta de ejemplo))"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-flip-teal outline-none transition-all font-mono text-sm"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-flip-teal text-white font-bold py-4 md:py-3 px-4 rounded-xl hover:opacity-90 transition-all disabled:bg-flip-slate/40 text-lg md:text-base active:scale-[0.98] cursor-pointer"
            >
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>

            {mensaje && (
              <div className={`mt-4 p-4 rounded-xl font-medium text-center text-sm ${mensaje.includes('✅') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {mensaje}
              </div>
            )}
          </form>

          {/* COLUMNA 3: Listado de Cuestionarios para Eliminar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-flip-slate/20">
            <h2 className="text-lg font-bold text-flip-dark mb-4 pb-2 border-b border-flip-slate/10">Gestionar cuestionarios</h2>
            
            {cuestionarios.length === 0 ? (
              <p className="text-sm text-flip-slate text-center py-4">No hay cuestionarios activos.</p>
            ) : (
              <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
                {cuestionarios.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 bg-flip-light rounded-xl border border-flip-slate/5 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-flip-dark text-sm truncate">{c.titulo}</p>
                      <p className="text-xs text-flip-slate">{c.preguntas.length} preguntas</p>
                    </div>
                    <button 
                      onClick={() => eliminarCuestionario(c._id, c.titulo)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}