import { useState } from 'react';

function Welcome({ onStart }) {
  const [name, setName] = useState('');
  const [prn, setPrn] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && prn.trim()) {
      onStart({ name: name.trim(), prn: prn.trim() });
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <img
          src="https://mitwpu.edu.in/uploads/images/MIT-WPU-logo-1.webp"
          alt="MIT-WPU Logo"
          style={{
            maxWidth: '350px',
            height: 'auto',
            marginBottom: '30px',
            filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))'
          }}
        />
        <h1>AI-Powered Knowledge Assessment Platform</h1>
        <p style={{ fontSize: '1rem', marginTop: '10px', color: 'var(--text-secondary)' }}>
          MIT World Peace University, Pune
        </p>
        <p style={{ fontSize: '0.95rem', marginTop: '5px', opacity: '0.8' }}>
          Technology, Research, Social Innovation & Partnerships
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prn">PRN (Personal Registration Number)</label>
          <input
            type="text"
            id="prn"
            value={prn}
            onChange={(e) => setPrn(e.target.value)}
            placeholder="Enter your PRN"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || !prn.trim()}
        >
          Continue →
        </button>
      </form>
    </div>
  );
}

export default Welcome;
