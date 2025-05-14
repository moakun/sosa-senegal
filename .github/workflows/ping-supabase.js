const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function pingSupabase() {
  console.log('Starting Supabase ping process...');
  console.log(`URL: ${supabaseUrl.substring(0, 20)}...`);
  
  // Try multiple ping methods until one succeeds
  const pingMethods = [
    {
      name: 'Direct SQL query',
      fn: async () => {
        // This approach works without needing any custom functions
        // It directly executes SQL through the REST API
        const { data, error } = await supabase.rpc('pg_sleep', { seconds: 0.1 });
        // pg_sleep is a built-in PostgreSQL function that should exist in all databases
        return { data, error };
      }
    },
    {
      name: 'Health check',
      fn: async () => {
        // Check if we can connect at all
        const { data, error } = await supabase.auth.getSession();
        return { data, error };
      }
    },
    {
      name: 'Simple query',
      fn: async () => {
        // Just fetch schema information - should work on any database
        const { data, error } = await supabase
          .from('pg_catalog.pg_tables')
          .select('schemaname')
          .limit(1);
        return { data, error };
      }
    }
  ];
  
  // Try each ping method
  let succeeded = false;
  for (const method of pingMethods) {
    try {
      console.log(`Trying method: ${method.name}`);
      const { data, error } = await method.fn();
      
      if (error) {
        console.log(`  Failed: ${error.message}`);
      } else {
        console.log(`  Success!`);
        console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}`);
        succeeded = true;
        break;  // Exit after first successful method
      }
    } catch (err) {
      console.log(`  Exception: ${err.message}`);
    }
  }
  
  if (succeeded) {
    console.log('Ping successful! Database will remain active for another 7 days');
    return true;
  } else {
    console.error('All ping methods failed');
    return false;
  }
}

// Execute the ping function
pingSupabase()
  .then(result => {
    if (result) {
      console.log('Ping completed successfully');
      process.exit(0);
    } else {
      console.error('Ping failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });