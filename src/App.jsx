import { useState, useEffect } from 'react'
import dataExam1 from './data/exam1.json'
import dataExam2 from './data/exam2.json'

function App() {
  const [activeExam, setActiveExam] = useState('exam1')
  const [examData, setExamData] = useState({ meta: null, questions: [] })

  useEffect(() => {
    // Load dataset based on selection
    const rawData = activeExam === 'exam1' ? dataExam1 : dataExam2;
    
    // Parse the Moodle JSON format
    // Moodle exports an array of arrays. 
    // Usually [0][0] is overall stats, and [1] is the array of questions.
    // Sometimes it's structured slightly differently depending on the export, but testing the provided files.
    if (rawData && rawData.length > 0) {
      const meta = Array.isArray(rawData[0]) ? rawData[0][0] : rawData[0];
      const questions = Array.isArray(rawData[1]) ? rawData[1] : (rawData.slice(1) || []);
      
      setExamData({ meta, questions });
    }
  }, [activeExam])

  const { meta, questions } = examData;

  const getMetricBadge = (value, type) => {
    if (!value) return null;
    const num = parseFloat(value.replace(',', '.').replace('%', ''));
    
    // Discrimination index rules of thumb: >30 excellent, 20-29 good, 10-19 marginal, <10 poor
    if (type === 'discrimination') {
      if (num >= 30) return <span className="badge badge-success">Excelente</span>
      if (num >= 20) return <span className="badge badge-warning">Buena</span>
      return <span className="badge badge-danger">Revisar</span>
    }
    
    // Facility index (Difficulty): 40-60 is ideal, >80 too easy, <20 too hard
    if (type === 'facility') {
      if (num >= 30 && num <= 70) return <span className="badge badge-success">Óptimo</span>
      if (num > 70) return <span className="badge badge-warning">Fácil</span>
      return <span className="badge badge-danger">Difícil</span>
    }
    return null;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <h2 className="text-gradient">Analytica</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Dashboard de Evaluación</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className={`btn btn-secondary ${activeExam === 'exam1' ? 'active' : ''}`}
            onClick={() => setActiveExam('exam1')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Examen 1 - Grupo A
          </button>
          <button 
            className={`btn btn-secondary ${activeExam === 'exam2' ? 'active' : ''}`}
            onClick={() => setActiveExam('exam2')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Examen 2 - Grupo B
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content animate-fade-in">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1>Dashboard de Análisis</h1>
          <p className="text-muted">Análisis estadístico automatizado de calidad de ítems.</p>
        </header>

        {meta ? (
          <>
            {/* Overview Metrics */}
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Métricas Globales: {meta.nombredelcuestionario}</h3>
            <div className="metrics-grid">
              <div className="glass-card metric-card">
                <span className="metric-title">Promedio General</span>
                <span className="metric-value">{meta.promediodelosprimerosintentos}</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-title">Consistencia Interna</span>
                <span className="metric-value" style={{ color: 'var(--accent-indigo)' }}>
                  {meta.coeficientedeconsistenciainternaparaintentosconmejorescalificaciones || 'N/A'}
                </span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-title">Intentos Totales</span>
                <span className="metric-value">{meta.nmerototaldeintentoscompletados}</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-title">Ratio de Error</span>
                <span className="metric-value text-gradient">
                  {meta.ratiodeerrorparaintentosconmejorescalificaciones || 'N/A'}
                </span>
              </div>
            </div>

            {/* Question Table */}
            <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', color: 'var(--text-secondary)' }}>
              Análisis del Índice de Preguntas
            </h3>
            
            <div className="table-container glass-card" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Pregunta # / Ref</th>
                    <th>Tipo</th>
                    <th>Facilidad</th>
                    <th>Estado Facilidad</th>
                    <th>Discriminación</th>
                    <th>Estado Discrim.</th>
                    <th>Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.filter(q => q.q).map((q, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>Q {q.q}</td>
                      <td className="text-muted">{q.tipodepregunta}</td>
                      <td>{q.ndicedefacilidad}</td>
                      <td>{getMetricBadge(q.ndicedefacilidad, 'facility')}</td>
                      <td style={{ fontWeight: '500' }}>{q.ndicedediscriminacin}</td>
                      <td>{getMetricBadge(q.ndicedediscriminacin, 'discrimination')}</td>
                      <td className="text-muted">{q.eficienciadiscriminativa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <p className="text-muted">Cargando datos del examen...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
