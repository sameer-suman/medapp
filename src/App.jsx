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
  const inputStyle = {
  width: '40vw',
  padding: '0.5rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

useEffect(() => {
  if (status) {
    window.scrollBy({
      top: window.innerHeight/3,
      behavior: 'smooth'
    });
  }
}, [queryResult]);


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
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px' }}>
<div style={{ 
  width: '100vw', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center'
}}>
  <h1>Patient Database</h1>
</div>
<div style={{ 
  width: '100vw', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center' 
}}>
  <div style={{ 
    marginLeft:'5vw',
     width: '40vw', 
  display: 'flex', 
  flexDirection:'column',
  justifyContent: 'center', 
  alignItems: 'center', 
}}>
      <form onSubmit={handleSubmit} style={{
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#115599',
  alignItems:'center',
  justifyContent:'center',
  display:'flex',
  flexDirection:'column'

}}>  
<h2>Register New Patient</h2>

  <div style={{ marginBottom: '1rem' }}>
    <label>Name:</label><br />
    <input 
      type="text" 
      name="name" 
      value={form.name} 
      onChange={handleChange} 
      required 
      style={inputStyle} 
    />
  </div>

  <div style={{ marginBottom: '1rem' }}>
    <label>Age:</label><br />
    <input 
      type="number" 
      name="age" 
      value={form.age} 
      onChange={handleChange} 
      required 
      style={inputStyle} 
      min="0"
    />
  </div>

  <div style={{ marginBottom: '1rem' }}>
    <label>Gender:</label><br />
    <select 
      name="gender" 
      value={form.gender} 
      onChange={handleChange} 
      required 
      style={inputStyle}
    >
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  </div>

  <div style={{ marginBottom: '1rem' }}>
    <label>Phone:</label><br />
    <input 
      type="tel" 
      name="phone" 
      value={form.phone} 
      onChange={handleChange} 
      required 
      style={inputStyle} 
    />
  </div>

  <div style={{ marginBottom: '1rem' }}>
    <label>Address:</label><br />
    <textarea 
      name="address" 
      value={form.address} 
      onChange={handleChange} 
      required 
      style={{ ...inputStyle, height: '80px', resize: 'vertical' }} 
    />
  </div>

  <div style={{ textAlign: 'center' }}>
    <button 
      type="submit" 
      disabled={isSubmitting} 
      style={{
        padding: '0.5rem 1.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none'
      }}
    >
      {isSubmitting ? 'Registering...' : 'Register'}
    </button>
  </div>
</form>

       </div>
       <div style={{width:'12vw'}}>

       </div>
       <div style={{
             width: '40vw', 
  display: 'flex', 
  flexDirection:'column',
  justifyContent: 'center', 
  alignItems: 'center', 
  marginRight:'5vw'
       }}>
       <div style={{ 
  width:'100%',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#115599',
  alignItems:'center',
  justifyContent:'center',
  display:'flex',
  flexDirection:'column',
    padding: '1rem',

  }}>
      <h2>Query Patients</h2>
      <textarea
        style={{ width: '80%', height: '100px', fontFamily: 'monospace', fontSize: '1rem',marginBottom:'1rem' }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={runQuery} disabled={queryRunning} style={{
        padding: '0.5rem 1.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none'
      }}>
  {queryRunning ? 'Running...' : 'Run Query'}
</button>
</div>
</div>
</div>
<div style={{ 
  marginLeft:'10vw',
  width: '80vw', 
  display: 'flex', 
  flexDirection:'column',
  justifyContent: 'center',
  alignItems: 'center' 
}}>
      <p>{status}</p>

      {queryError && <p style={{ color: 'red' }}>Error: {queryError}</p>}

      {queryResult && queryResult.columns.length > 2?(
         <div style={{ width: '100%', overflowX: 'auto', marginTop: '1rem' }}>
        <table border="1" cellPadding="8" style={{marginTop: '1rem', width: '100%', borderCollapse: 'collapse' }}>
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
        </div>
      ): null}
      </div>
    </div>
  );
}

export default App;
