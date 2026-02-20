import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import dataExam1 from './data/exam1.json'
import dataExam2 from './data/exam2.json'

function App() {
  const [activeExam, setActiveExam] = useState('exam1')
  const [examData, setExamData] = useState({ meta: null, questions: [] })

  // Extract meta separately to power the sidebar
  const getMeta = (data) => data && data.length > 0 ? (Array.isArray(data[0]) ? data[0][0] : data[0]) : {};
  const exam1Meta = getMeta(dataExam1);
  const exam2Meta = getMeta(dataExam2);

  useEffect(() => {
    // Load dataset based on selection
    const rawData = activeExam === 'exam1' ? dataExam1 : dataExam2;

    if (rawData && rawData.length > 0) {
      const meta = Array.isArray(rawData[0]) ? rawData[0][0] : rawData[0];
      const questions = Array.isArray(rawData[1]) ? rawData[1] : (rawData.slice(1) || []);

      setExamData({ meta, questions });
    }
  }, [activeExam])

  const { meta, questions } = examData;

  // Filter out "Aleatoria" questions, keep only individual questions with names
  const individualQuestions = questions.filter(q => q.q && q.tipodepregunta !== 'Aleatoria');

  const parseToNum = (val) => {
    if (!val) return 0;
    return parseFloat(val.toString().replace(',', '.').replace('%', ''));
  };

  const getMetricBadge = (value, type) => {
    if (!value) return null;
    const num = parseToNum(value);

    if (type === 'discrimination') {
      if (num >= 30) return <span className="badge badge-success">Excelente</span>
      if (num >= 20) return <span className="badge badge-warning">Buena</span>
      return <span className="badge badge-danger">Revisar</span>
    }

    if (type === 'facility') {
      if (num >= 30 && num <= 70) return <span className="badge badge-success">Óptimo</span>
      if (num > 70) return <span className="badge badge-warning">Fácil</span>
      return <span className="badge badge-danger">Difícil</span>
    }
    return null;
  }

  // Prepare chart data
  const chartData = individualQuestions.map(q => ({
    name: q.nombredelapregunta || q.q,
    facility: parseToNum(q.ndicedefacilidad),
    discrimination: parseToNum(q.ndicedediscriminacin)
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{data.name}</p>
          <p style={{ color: 'var(--accent-green)' }}>Dificultad (Facilidad): {data.facility}%</p>
          <p style={{ color: 'var(--accent-purple)' }}>Discriminación: {data.discrimination}%</p>
        </div>
      );
    }
    return null;
  };

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
            style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
          >
            {exam1Meta?.nombredelcuestionario || 'Cargando Examen 1...'}
          </button>
          <button
            className={`btn btn-secondary ${activeExam === 'exam2' ? 'active' : ''}`}
            onClick={() => setActiveExam('exam2')}
            style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
          >
            {exam2Meta?.nombredelcuestionario || 'Cargando Examen 2...'}
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

            {/* Scatter Chart */}
            <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', color: 'var(--text-secondary)' }}>
              Distribución de Preguntas: Dificultad vs Discriminación
            </h3>
            <div className="glass-card" style={{ padding: '2rem 1rem', marginBottom: '3rem', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    type="number"
                    dataKey="facility"
                    name="Índice de Facilidad"
                    unit="%"
                    stroke="var(--text-muted)"
                    domain={['auto', 'auto']}
                  />
                  <YAxis
                    type="number"
                    dataKey="discrimination"
                    name="Índice de Discriminación"
                    unit="%"
                    stroke="var(--text-muted)"
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
                  <Scatter name="Preguntas" data={chartData}>
                    {
                      chartData.map((entry, index) => {
                        // Color points conditionally based on discrimination
                        const color = entry.discrimination < 20 ? 'var(--accent-red)' :
                          entry.discrimination < 30 ? 'var(--accent-amber)' :
                            'var(--accent-green)';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })
                    }
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-green)' }}></span> Excelente (&ge;30%)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)' }}></span> Buena (20-29%)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-red)' }}></span> Revisar (&lt;20%)
                </span>
              </div>
            </div>

            {/* Question Table */}
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Detalle de Preguntas Individuales
            </h3>

            <div className="table-container glass-card" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Pregunta (Referencia)</th>
                    <th>Facilidad</th>
                    <th>Estado Facilidad</th>
                    <th>Discriminación</th>
                    <th>Estado Discrim.</th>
                    <th>Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {individualQuestions.map((q, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{q.nombredelapregunta || `Q ${q.q}`}</td>
                      <td>{q.ndicedefacilidad}</td>
                      <td>{getMetricBadge(q.ndicedefacilidad, 'facility')}</td>
                      <td style={{ fontWeight: '500' }}>{q.ndicedediscriminacin}</td>
                      <td>{getMetricBadge(q.ndicedediscriminacin, 'discrimination')}</td>
                      <td className="text-muted">{q.eficienciadiscriminativa}</td>
                    </tr>
                  ))}
                  {individualQuestions.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                        No hay preguntas individuales en los datos de este examen.
                      </td>
                    </tr>
                  )}
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
