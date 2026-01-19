const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://realtor:realtor_secret_123@localhost:5489/realtor_leads'
});

async function seedTestLead() {
  try {
    // Check if lead already exists
    const existing = await pool.query(
      "SELECT id, name, email FROM leads WHERE email = 'test@example.com'"
    );

    if (existing.rows.length > 0) {
      console.log('Test lead already exists:');
      console.log(existing.rows[0]);
      return;
    }

    // Create test lead
    const result = await pool.query(
      `INSERT INTO leads (name, email, phone, intent, timeline, budget, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email`,
      ['Test User', 'test@example.com', '(555) 123-4567', 'buying', '1-3_months', '$300k-400k', 'manual', 'qualified']
    );

    console.log('Test lead created:');
    console.log(result.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

seedTestLead();
