import React, { useEffect, useState } from 'react';
import { initializeDb } from './db/initdb';
import db from './db/initdb';
import { live } from '@electric-sql/pglite/live'
import { useRef } from 'react';


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
  const liveQueryRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryRunning, setQueryRunning] = useState(false);



 useEffect(() => {
  initializeDb()
    .then(() => {
      console.log('Database is ready');
    })
    .catch((err) => {
      console.error('DB init failed', err);
    });

  return () => {
    if (liveQueryRef.current) {
      liveQueryRef.current.unsubscribe();
      console.log('Live query unsubscribed on unmount');
    }
  };
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
      if (isSubmitting) return;

        setIsSubmitting(true);
    const { name, age, gender, phone, address } = form;

    try {
      await db.query(
        `INSERT INTO patients (name, age, gender, phone, address) VALUES ($1, $2, $3, $4, $5);`,
        [name, parseInt(age), gender, phone, address]
      );

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

      setForm({
        name: '',
        age: '',
        gender: '',
        phone: '',
        address: '',
      });
    } catch (err) {
  if (err.message.includes('duplicate')) {
    setStatus('⚠️ Patient with the same name and phone already exists.');
  } else {
    console.error('❌ Error inserting patient:', err);
    setStatus('❌ Failed to register patient');
  }
}finally {
    setIsSubmitting(false);
  }
  };

 const runQuery = async () => {
  if (queryRunning) return;
  setQueryRunning(true);

  setQueryError(null);
  setQueryResult(null);
  setStatus('');

  // Unsubscribe from previous live query if it exists
  if (
    liveQueryRef.current &&
    typeof liveQueryRef.current.unsubscribe === 'function'
  ) {
    await liveQueryRef.current.unsubscribe();
    liveQueryRef.current = null;
  }

  try {
        const isSelect = query.trim().toLowerCase().startsWith('select');
           if (isSelect) {
      const subscription = await db.live.query(query, [], (result) => {
      const columns = result.fields.map(f => f.name);
      const rows = result.rows;

      setQueryResult({ columns, rows });
      setStatus('✅ Query executed successfully!');
    });

    liveQueryRef.current = subscription;
    } else {
      const result = await db.query(query);
      setQueryResult({ columns: ['Result'], rows: [{ Result: '✅ Query executed successfully' }] });
      setStatus('✅ Query executed successfully');
    }
  } catch (err) {
    console.error('Live query failed:', err); 
    setQueryError(err.message || 'Error executing query');
    setStatus('❌ Query failed.');
  }

  setQueryRunning(false);
};


  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Patient Database</h1>
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
        <button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Registering...' : 'Register'}
</button>
       </form>

      <p>{status}</p>
      <hr style={{ margin: '2rem 0' }} />

      <h2>Query Patients</h2>
      <textarea
        style={{ width: '100%', height: '100px', fontFamily: 'monospace', fontSize: '1rem' }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={runQuery} disabled={queryRunning} style={{ marginTop: '0.5rem' }}>
  {queryRunning ? 'Running...' : 'Run Query'}
</button>


      {queryError && <p style={{ color: 'red' }}>Error: {queryError}</p>}

      {queryResult && queryResult.columns.length > 2?(
        <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {queryResult.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queryResult.rows.map((row, index) => (
  <tr key={row.id ?? index}>

                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.age}</td>
                <td>{row.gender}</td>
                <td>{row.phone}</td>
                <td>{row.address}</td>
<td>{new Date(row.created_at + 'Z').toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ): null}
    </div>
  );
}

export default App;
