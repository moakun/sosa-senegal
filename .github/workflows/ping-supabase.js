const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function pingSupabase() {
  try {
    console.log('Pinging Supabase database...');
    
    // A simple query to keep the database active
    // Using a lightweight system query that doesn't require a custom function
    const { data, error } = await supabase
      .from('_http_request')  // This is an internal system table that always exists
      .select('count(*)')
      .limit(1);
    
    if (error) {
      // Fall back to even simpler query if the first one fails
      const { data: timestamp, error: timestampError } = await supabase
        .rpc('pgstatspack.get_stat_statements', { limit_in: 1 })
        .select('count(*)')
        .limit(1);
        
      if (timestampError) {
        // Final fallback to the simplest possible query
        const { data: simpleData, error: simpleError } = await supabase
          .from('pg_stat_statements')
          .select('count(*)')
          .limit(1);
          
        if (simpleError) {
          console.error('All ping attempts failed. Last error:', simpleError);
          process.exit(1);
        }
      }
    }
    
    const currentTime = new Date().toISOString();
    console.log('Ping successful at:', currentTime);
    console.log('Database will remain active for another 7 days');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the ping function
pingSupabase();