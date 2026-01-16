import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ProductList from './components/ProductList';
import ProductDetail from './pages/ProductDetail';

function AppContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Connecting...');
  const [requestFlow, setRequestFlow] = useState([
    { step: 'Frontend', status: 'pending', icon: '💻', description: 'React App Initialized' },
    { step: 'Nginx Proxy', status: 'pending', icon: '🔄', description: 'Port 8080 → 5000 Routing' },
    { step: 'Backend Service', status: 'pending', icon: '⚙️', description: 'Express API Processing' },
    { step: 'Database', status: 'pending', icon: '💾', description: 'PostgreSQL Query' }
  ]);
  const [responseTime, setResponseTime] = useState(null);
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // multiplier for delays (1..4)
  const [flowLogs, setFlowLogs] = useState([]);
  const stepResolverRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendStatus('Fetching from backend...');
      setResponseTime(null);
      const startTime = performance.now();
      
      // Update flow steps
      const updateFlow = (stepIndex, status) => {
        setRequestFlow(prev => {
          const newFlow = [...prev];
          newFlow[stepIndex].status = status;
          return newFlow;
        });
      };

      // Wait helper: respects manual/auto mode and speed multiplier
      const waitFor = async (ms) => {
        const delay = Math.max(50, Math.round(ms * speed));
        if (mode === 'manual') {
          setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Awaiting manual step (delay ${delay}ms)` }]);
          await new Promise(resolve => { stepResolverRef.current = resolve; });
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      };

      // Step 1: Frontend
      updateFlow(0, 'active');
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Frontend initialized' }]);
      await waitFor(700);
      updateFlow(0, 'complete');
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Request passed to Nginx proxy' }]);

      // Step 2: Nginx Proxy
      updateFlow(1, 'active');
      await waitFor(500);
      updateFlow(1, 'complete');
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Nginx forwarded request to backend' }]);

      // Step 3: Backend Service
      updateFlow(2, 'active');
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Backend received request; calling DB' }]);
      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      updateFlow(2, 'complete');

      // Step 4: Database
      updateFlow(3, 'active');
      await waitFor(400);
      const data = await response.json();
      updateFlow(3, 'complete');
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Database returned ${data.length} rows` }]);
      
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(0);
      setResponseTime(duration);
      
      setProducts(data);
      setLastFetched(new Date().toLocaleTimeString());
      setBackendStatus(`✓ Backend connected (${data.length} products)`);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err.message}`);
      setBackendStatus(`✗ Backend error: ${err.message}`);
      setRequestFlow(prev => prev.map(step => ({ ...step, status: 'error' })));
    } finally {
      setLoading(false);
    }
  };

  // Controls: play/pause, step, reset
  const handleStep = () => {
    if (stepResolverRef.current) {
      stepResolverRef.current();
      stepResolverRef.current = null;
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Manual step triggered' }]);
    }
  };

  const handlePlayPause = async () => {
    if (playing) {
      setPlaying(false);
      setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Playback paused' }]);
      return;
    }
    setPlaying(true);
    setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Playback started' }]);
    // Start flow (fetchProducts handles mode)
    await fetchProducts();
    setPlaying(false);
    setFlowLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Playback finished' }]);
  };

  const handleResetFlow = () => {
    setRequestFlow([
      { step: 'Frontend', status: 'pending', icon: '💻', description: 'React App Initialized' },
      { step: 'Nginx Proxy', status: 'pending', icon: '🔄', description: 'Port 8080 → 5000 Routing' },
      { step: 'Backend Service', status: 'pending', icon: '⚙️', description: 'Express API Processing' },
      { step: 'Database', status: 'pending', icon: '💾', description: 'PostgreSQL Query' }
    ]);
    setFlowLogs([]);
    setResponseTime(null);
    setError(null);
    setBackendStatus('Connecting...');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📦 Product Management</h1>
        <p>Microservices-based Product Catalog</p>
        <div className="backend-status">
          <span className={backendStatus.includes('✓') ? 'status-ok' : 'status-error'}>
            {backendStatus}
          </span>
          {lastFetched && <span className="last-fetched">Last updated: {lastFetched}</span>}
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading">
            <div className="network-flow-container">
              <div className="flow-controls">
                <div className="flow-controls-left">
                  <button className="control-btn" onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}>{mode === 'auto' ? 'Auto' : 'Manual'}</button>
                  <button className="control-btn" onClick={handlePlayPause}>{playing ? '⏸️ Pause' : '▶️ Play'}</button>
                  <button className="control-btn" onClick={handleStep}>⏭️ Step</button>
                  <button className="control-btn" onClick={handleResetFlow}>🔁 Reset</button>
                </div>
                <div className="flow-controls-right">
                  <label className="speed-label">Speed:</label>
                  <input type="range" min="0.5" max="3" step="0.5" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
                  <span className="speed-value">{speed}x</span>
                </div>
              </div>
              <h3>📡 Network Request Flow</h3>
              <div className="network-flow">
                {requestFlow.map((step, idx) => (
                  <div key={idx} className="flow-step">
                    <div className={`flow-node ${step.status}`}>
                      <span className="flow-icon">{step.icon}</span>
                    </div>
                    <div className="flow-info">
                      <div className="flow-step-title">{step.step}</div>
                      <div className="flow-step-desc">{step.description}</div>
                      {step.status === 'active' && <div className="flow-status active-pulse">Processing...</div>}
                      {step.status === 'complete' && <div className="flow-status complete">✓ Done</div>}
                      {step.status === 'error' && <div className="flow-status error">✗ Failed</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flow-logs">
                <h4>Trace Log</h4>
                <div className="logs-list">
                  {flowLogs.length === 0 && <div className="log-entry">No events yet. Start the flow.</div>}
                  {flowLogs.map((l, i) => (
                    <div key={i} className="log-entry">[{l.time}] {l.msg}</div>
                  ))}
                </div>
              </div>
            </div>
            {responseTime && (
              <div className="response-metrics">
                <p>Total Response Time: <strong>{responseTime}ms</strong></p>
              </div>
            )}
          </div>
        )}
        {error && <div className="error">⚠️ {error}</div>}
        {!loading && !error && (
          <>
            <div className="refresh-container">
              <button className="refresh-btn" onClick={fetchProducts}>
                🔄 Refresh Products
              </button>
              {responseTime && <span className="response-time-badge">Response: {responseTime}ms</span>}
            </div>
            <Routes>
              <Route path="/" element={<ProductList products={products} />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Product Management App | Frontend ↔ Backend Interaction Demo</p>
        <p className="architecture">
          React Frontend (8080) → Nginx Proxy → Backend Service (5000) → PostgreSQL DB
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
