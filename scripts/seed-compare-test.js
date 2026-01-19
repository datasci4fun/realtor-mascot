const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://realtor:realtor_secret_123@localhost:5489/realtor_leads'
});

async function seedCompareTest() {
  const client = await pool.connect();

  try {
    console.log('Setting up compare feature test data...\n');

    // 1. Create or get test lead
    let leadId;
    const existingLead = await client.query(
      "SELECT id FROM leads WHERE email = 'test@example.com'"
    );

    if (existingLead.rows.length > 0) {
      leadId = existingLead.rows[0].id;
      console.log('✓ Using existing test lead:', leadId);
    } else {
      const newLead = await client.query(
        `INSERT INTO leads (name, email, phone, intent, timeline, budget, source, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        ['Test User', 'test@example.com', '(555) 123-4567', 'buying', '1-3_months', '$300k-400k', 'manual', 'qualified']
      );
      leadId = newLead.rows[0].id;
      console.log('✓ Created test lead:', leadId);
    }

    // 2. Create test properties
    const properties = [
      {
        slug: 'test-123-oak-street',
        address: '123 Oak Street',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        list_price: 425000,
        beds: 3,
        baths: 2,
        sqft: 1850,
        year_built: 2018,
        property_type: 'Single Family',
        status: 'active',
        headline: 'Modern Home in Oak Lawn',
        description: 'Beautiful modern home with updated kitchen and open floor plan.'
      },
      {
        slug: 'test-456-maple-avenue',
        address: '456 Maple Avenue',
        city: 'Plano',
        state: 'TX',
        zip: '75024',
        list_price: 385000,
        beds: 4,
        baths: 3,
        sqft: 2200,
        year_built: 2015,
        property_type: 'Single Family',
        status: 'active',
        headline: 'Spacious Family Home',
        description: 'Large family home with 4 bedrooms and a big backyard.'
      },
      {
        slug: 'test-789-elm-drive',
        address: '789 Elm Drive',
        city: 'Frisco',
        state: 'TX',
        zip: '75034',
        list_price: 550000,
        beds: 4,
        baths: 3,
        sqft: 2800,
        year_built: 2020,
        property_type: 'Single Family',
        status: 'active',
        headline: 'Luxury New Construction',
        description: 'Brand new luxury home with premium finishes throughout.'
      },
      {
        slug: 'test-321-pine-court',
        address: '321 Pine Court',
        city: 'Allen',
        state: 'TX',
        zip: '75002',
        list_price: 299000,
        beds: 3,
        baths: 2,
        sqft: 1600,
        year_built: 2010,
        property_type: 'Single Family',
        status: 'active',
        headline: 'Affordable Starter Home',
        description: 'Great starter home in excellent school district.'
      },
      {
        slug: 'test-555-cedar-lane',
        address: '555 Cedar Lane',
        city: 'McKinney',
        state: 'TX',
        zip: '75070',
        list_price: 475000,
        beds: 5,
        baths: 4,
        sqft: 3200,
        year_built: 2019,
        property_type: 'Single Family',
        status: 'pending',
        headline: 'Executive Family Home',
        description: 'Stunning executive home with pool and outdoor kitchen.'
      }
    ];

    const propertyIds = [];

    for (const prop of properties) {
      // Check if property exists
      const existing = await client.query(
        'SELECT id FROM properties WHERE slug = $1',
        [prop.slug]
      );

      let propId;
      if (existing.rows.length > 0) {
        propId = existing.rows[0].id;
        console.log(`✓ Property exists: ${prop.address}`);
      } else {
        const result = await client.query(
          `INSERT INTO properties (slug, address, city, state, zip, list_price, beds, baths, sqft, year_built, property_type, status, headline, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           RETURNING id`,
          [prop.slug, prop.address, prop.city, prop.state, prop.zip, prop.list_price, prop.beds, prop.baths, prop.sqft, prop.year_built, prop.property_type, prop.status, prop.headline, prop.description]
        );
        propId = result.rows[0].id;
        console.log(`✓ Created property: ${prop.address}`);
      }
      propertyIds.push(propId);
    }

    // 3. Add favorites for the test lead
    console.log('\nAdding favorites...');

    for (const propId of propertyIds) {
      // Check if favorite exists
      const existing = await client.query(
        'SELECT id FROM favorites WHERE lead_id = $1 AND property_id = $2',
        [leadId, propId]
      );

      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO favorites (lead_id, property_id, notes) VALUES ($1, $2, $3)',
          [leadId, propId, 'Added for testing']
        );
        console.log(`✓ Added favorite: property ${propId}`);
      } else {
        console.log(`✓ Favorite exists: property ${propId}`);
      }
    }

    console.log('\n========================================');
    console.log('Setup complete!');
    console.log('========================================');
    console.log('\nTo test the compare feature:');
    console.log('1. Go to http://localhost:3000/portal/login');
    console.log('2. Enter email: test@example.com');
    console.log('3. Click the debug login link (if PORTAL_DEBUG_LOGIN=true)');
    console.log('4. Go to Favorites or Compare in the sidebar');
    console.log('5. Select 2-4 properties to compare');
    console.log('========================================\n');

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCompareTest();
