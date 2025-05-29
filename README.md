# Patient Database App

An application to register and query patients. Uses Pglite for data storage.

Vercel link to use app: https://medapp-henna.vercel.app/ 
## Setup

```bash
git clone https://github.com/sameer-suman/medapp.git
cd medapp
npm install
npm run dev
Then open the activated development server in your browser to use the app.
```

Usage:
Register patients via the form.
Run SQL queries in the query box to the table 'patients'.
Supports all SQL query types but if the table is dropped, the site needs to be refreshed.


Challenges faced:
Fixing bundler error.
Parameterising queries.
Persisting the data across refreshes.
Implementing multi-tab worker.
Using live query to update the table across tabs when new patient is inserted.
