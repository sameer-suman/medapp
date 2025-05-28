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
      await db.exec({
        sql: `
          INSERT INTO patients (name, age, gender, phone, address)
          VALUES (?, ?, ?, ?, ?);
        `,
        args: [name, parseInt(age), gender, phone, address],
      });

      setStatus('✅ Patient registered successfully!');
      setForm({
        name: '',
        age: '',
        gender: '',
        phone: '',
        address: '',
      });
    } catch (err) {
      console.error('Error inserting patient:', err);
      setStatus('❌ Failed to register patient');
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
    </div>
  );
}

export default App;
