"use client";
import { useState, useEffect } from 'react';

export default function CuestionarioInteractivo({ cuestionario }) {
  const [modoTest, setModoTest] = useState(false);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [preguntasTest, setPreguntasTest] = useState([]);
  
  // Estados para el examen interactivo
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState({});
  const [examenCalificado, setExamenCalificado] = useState(false);

  // Estados para la configuración dinámica
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [configAjustes, setConfigAjustes] = useState({
    cantidad: 5,
    dificultad: 'Intermedio',
    enfoque: 'General',
    formato: 'Directo/Teórico',
    idioma: 'Español'
  });

  // Al cargar la página, buscamos configuraciones guardadas
  useEffect(() => {
    const configGuardada = localStorage.getItem('flipanswer_ia_config');
    if (configGuardada) {
      setConfigAjustes(JSON.parse(configGuardada));
    }
  }, []);

  const handleConfigChange = (parametro, valor) => {
    const nuevaConfig = { ...configAjustes, [parametro]: valor };
    setConfigAjustes(nuevaConfig);
    localStorage.setItem('flipanswer_ia_config', JSON.stringify(nuevaConfig));
  };

  // Esta función AHORA SÓLO SE EJECUTA cuando se presiona explícitamente el botón de generar
  const generarTestIA = async () => {
    setCargandoIA(true);
    setExamenCalificado(false);
    setRespuestasSeleccionadas({});
    
    try {
      const res = await fetch('/api/generar-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titulo: cuestionario.titulo, 
          preguntas: cuestionario.preguntas,
          config: configAjustes
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreguntasTest(data.test);
      } else {
        alert('No se pudo generar el test por el momento.');
      }
    } catch (error) {
      alert('Error de conexión con la IA.');
    }
    setCargandoIA(false);
  };

  const seleccionarOpcion = (preguntaIndex, opcionIndex) => {
    if (examenCalificado) return; 
    setRespuestasSeleccionadas({
      ...respuestasSeleccionadas,
      [preguntaIndex]: opcionIndex
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector de Modo y Botón de Configuración */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 gap-2 p-1 bg-white border border-flip-slate/10 rounded-xl shadow-xs">
          {/* BOTÓN PESTAÑA TARJETAS: Ahora solo cambia el modo visual, no borra nada */}
          <button 
            onClick={() => setModoTest(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${!modoTest ? 'bg-flip-dark text-white shadow-xs' : 'text-flip-slate hover:bg-flip-light'}`}
          >
            🎴 Tarjetas de Repaso
          </button>
          
          {/* BOTÓN PESTAÑA TEST: Solo cambia la vista, respeta el examen si ya existía */}
          <button 
            onClick={() => setModoTest(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-15 ${modoTest ? 'bg-flip-teal text-white shadow-xs' : 'text-flip-teal hover:bg-flip-teal/5'}`}
          >
            📝 Autoevaluación {cargandoIA && <span className="animate-pulse text-xs opacity-70">(Cargando...)</span>}
          </button>
        </div>
        
        <button 
          onClick={() => setMostrarConfig(!mostrarConfig)}
          className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all cursor-pointer ${mostrarConfig ? 'bg-flip-dark text-white border-flip-dark' : 'bg-white text-flip-dark border-flip-slate/20 hover:border-flip-slate'}`}
        >
          ⚙️ Ajustes
        </button>
      </div>

      {/* PANEL DE CONFIGURACIÓN DESPLEGABLE */}
      {mostrarConfig && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-flip-slate/10 animate-fade-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-flip-slate uppercase tracking-wider">Preguntas</label>
            <select 
              value={configAjustes.cantidad} 
              onChange={(e) => handleConfigChange('cantidad', e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm text-flip-dark bg-slate-50 outline-none"
            >
              <option value="3">3 Preguntas (Rápido)</option>
              <option value="5">5 Preguntas (Normal)</option>
              <option value="10">10 Preguntas (Extenso)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-flip-slate uppercase tracking-wider">Dificultad</label>
            <select 
              value={configAjustes.dificultad} 
              onChange={(e) => handleConfigChange('dificultad', e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm text-flip-dark bg-slate-50 outline-none"
            >
              <option value="Fácil">Básica (Conceptos clave)</option>
              <option value="Intermedio">Intermedia (Estándar)</option>
              <option value="Difícil">Difícil (Análisis profundo)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-flip-slate uppercase tracking-wider">Formato</label>
            <select 
              value={configAjustes.formato} 
              onChange={(e) => handleConfigChange('formato', e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm text-flip-dark bg-slate-50 outline-none"
            >
              <option value="Directo/Teórico">Directo / Teórico</option>
              <option value="Caso Clínico">Casos Clínicos</option>
              <option value="Verdadero/Falso (como opción múltiple)">Análisis de afirmaciones</option>
            </select>
          </div>
        </div>
      )}

      {/* MODO 1: VISTA DE TARJETAS TRADICIONALES */}
      {!modoTest && (
        <div className="space-y-4 md:space-y-6">
          {cuestionario.preguntas.map((item, index) => (
            <div key={item._id?.toString() || index} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-flip-slate/10">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center sm:items-start gap-2">
                  <span className="text-flip-teal/20 font-black text-2xl sm:text-4xl leading-none select-none">
                    Q{index + 1}
                  </span>
                </div>
                <div className="flex-1 w-full">
                  <h2 className="text-lg font-bold text-flip-dark mb-3 leading-relaxed">
                    {item.pregunta}
                  </h2>
                  <details className="group bg-flip-light rounded-xl p-1 cursor-pointer border border-flip-slate/5 transition-colors">
                    <summary className="font-semibold text-flip-teal list-none text-center py-3 select-none rounded-lg text-sm md:text-base">
                      Ver Respuesta Correcta
                    </summary>
                    <div className="p-4 bg-flip-dark text-white rounded-b-xl text-sm md:text-base leading-relaxed">
                      {item.respuesta}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODO 2: PANTALLA DEL EXAMEN GENERADO POR IA */}
      {modoTest && (
        <div className="space-y-6 animate-fade-in">
          {cargandoIA ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-flip-slate/10">
              <span className="text-4xl block mb-3 animate-bounce">🧬</span>
              <p className="font-bold text-flip-dark">Analizando apuntes y generando test...</p>
              <p className="text-xs text-flip-slate mt-1">Esto evitará repetir las mismas preguntas</p>
            </div>
          ) : preguntasTest.length === 0 ? (
            /* CASO A: PESTAÑA VACÍA - El usuario entra por primera vez y debe presionar el botón */
            <div className="text-center py-12 bg-white rounded-2xl border border-flip-slate/10 p-6">
              <span className="text-4xl block mb-3">📝</span>
              <h3 className="font-bold text-flip-dark text-lg mb-2">¿Listo para una autoevaluación?</h3>
              <p className="text-sm text-flip-slate mb-6 max-w-md mx-auto">
                La Inteligencia Artificial diseñará un examen de opción múltiple único basado exclusivamente en este tema.
              </p>
              <button
                onClick={generarTestIA}
                className="px-6 py-3 bg-flip-teal text-white font-bold rounded-xl shadow-md cursor-pointer hover:opacity-95"
              >
                Generar Test
              </button>
            </div>
          ) : (
            /* CASO B: EL TEST YA EXISTE - Se muestra el examen y respeta la navegación */
            <>
              {preguntasTest.map((item, pIdx) => (
                <div key={pIdx} className="bg-white p-5 rounded-2xl shadow-sm border border-flip-slate/10 overflow-hidden">
                  <h3 className="font-bold text-flip-dark text-base md:text-lg mb-4 leading-relaxed">
                    <span className="text-flip-teal mr-1">{pIdx + 1}.</span> {item.pregunta}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {item.opciones.map((opcion, oIdx) => {
                      const esSeleccionada = respuestasSeleccionadas[pIdx] === oIdx;
                      const esCorrecta = item.respuestaCorrecta === oIdx;
                      
                      let claseBoton = "border border-slate-200 bg-slate-50 text-flip-dark hover:bg-slate-100";
                      
                      if (!examenCalificado && esSeleccionada) {
                        claseBoton = "border-flip-teal bg-flip-teal/10 font-semibold text-flip-teal";
                      } else if (examenCalificado) {
                        claseBoton = "border-slate-200 bg-slate-50 text-flip-dark/50";
                        if (esCorrecta) {
                          claseBoton = "border-green-500 bg-green-500/10 font-bold text-green-700";
                        } else if (esSeleccionada && !esCorrecta) {
                          claseBoton = "border-red-500 bg-red-500/10 text-red-700 line-through";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={examenCalificado}
                          onClick={() => seleccionarOpcion(pIdx, oIdx)}
                          className={`w-full text-left p-3.5 rounded-xl text-sm transition-all cursor-pointer ${claseBoton}`}
                        >
                          {opcion}
                        </button>
                      );
                    })}
                  </div>

                  {examenCalificado && item.explicacion && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fade-in">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Feedback del Tutor</p>
                      <p className="text-sm text-blue-900 leading-relaxed">{item.explicacion}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Botón de Enviar o Probar otra combinación */}
              {!examenCalificado ? (
                <button
                  onClick={() => setExamenCalificado(true)}
                  disabled={Object.keys(respuestasSeleccionadas).length < preguntasTest.length}
                  className="w-full py-4 bg-flip-teal text-white font-bold rounded-xl shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed text-base cursor-pointer hover:opacity-95"
                >
                  Entregar y Evaluar Examen
                </button>
              ) : (
                <button
                  onClick={generarTestIA}
                  className="w-full py-4 bg-flip-dark text-white font-bold rounded-xl shadow-md text-base cursor-pointer hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <span>🔄</span> Probar otra combinación de preguntas
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}