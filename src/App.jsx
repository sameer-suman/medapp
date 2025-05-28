import React, { useEffect, useState } from 'react';
import { initializeDb } from './db/initdb';
import db from './db/initdb';

function App() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
  });

  const [status, setStatus] = useState('');
   const [query, setQuery] = useState('SELECT * FROM patients;');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    initializeDb()
      .then(() => {
        console.log('Database is ready');
      })
      .catch((err) => {
        console.error('DB init failed', err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const { name, age, gender, phone, address } = form;

  try {
    // Use parameterized query to prevent SQL injection
    await db.query(
      `INSERT INTO patients (name, age, gender, phone, address) VALUES ($1, $2, $3, $4, $5);`,
      [name, parseInt(age), gender, phone, address]
    );

    // Verify insertion
    const result = await db.query(
      `SELECT * FROM patients WHERE name = $1 AND phone = $2 ORDER BY id DESC LIMIT 1;`,
      [name, phone]
    );

    console.log("Inserted patient:", result);

    if (result.rows.length > 0) {
      setStatus(`✅ Patient "${result.rows[0].name}" registered successfully!`);
    } else {
      setStatus("⚠️ Registration might have failed.");
    }

    // Reset form
    setForm({
      name: '',
      age: '',
      gender: '',
      phone: '',
      address: '',
    });
  } catch (err) {
    console.error('❌ Error inserting patient:', err);
    setStatus('❌ Failed to register patient');
  }
};

  const runQuery = async () => {
  setQueryError(null);
  setQueryResult(null);

  try {
    if (!query.trim().toLowerCase().startsWith('select')) {
      setQueryError('Only SELECT queries are allowed.');
      return;
    }

    // For simplicity, no parameters passed now, but you can add param parsing here if needed
    const result = await db.query(query);

    // result.fields contains column info, result.rows contains data
    const columns = result.fields.map(f => f.name);
    const rows = result.rows;

    setQueryResult({ columns, rows });
  } catch (err) {
    setQueryError(err.message || 'Error executing query');
  }
};

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Register Patient</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Name:</label><br />
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Age:</label><br />
          <input type="number" name="age" value={form.age} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Gender:</label><br />
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Phone:</label><br />
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Address:</label><br />
          <textarea name="address" value={form.address} onChange={handleChange} required />
        </div>
        <button type="submit">Register</button>
      </form>

      <p>{status}</p>
       <hr style={{ margin: '2rem 0' }} />

      <h2>Query Patients</h2>
      <textarea
        style={{ width: '100%', height: '100px', fontFamily: 'monospace', fontSize: '1rem' }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={runQuery} style={{ marginTop: '0.5rem' }}>
        Run Query
      </button>

      {queryError && <p style={{ color: 'red' }}>Error: {queryError}</p>}

      {queryResult && (
  <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        {queryResult.columns.map((col) => (
          <th key={col}>{col}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {queryResult.rows.map((row, i) => (
        <tr key={i}>
          {row.map((val, j) => (
            <td key={j}>{val?.toString() ?? ''}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)}


    </div>
  );
}

export default App;
