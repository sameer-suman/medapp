import React, { useEffect } from 'react'
import { initializeDb } from './db/initdb'

function App() {
  useEffect(() => {
    initializeDb().then(() => {
      console.log("Database is ready")
    }).catch(err => {
      console.error("DB init failed", err)
    });
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Patients</h1>
      <p>Database initialized.</p>
    </div>
  )
}

export default App
