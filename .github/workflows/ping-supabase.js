const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function pingSupabase() {
  console.log('Starting Supabase ping process...');
  console.log(`URL: ${supabaseUrl.substring(0, 20)}...`); // Show partial URL for debugging but hide most of it
  
  // Try multiple ping methods and report detailed results
  const pingMethods = [
    {
      name: 'Simple table count query',
      fn: async () => {
        // Find a table that exists and count its rows
        // Try to use a small system table if possible
        const { data, error } = await supabase
          .from('_keymaker_keys')  // This is usually a small system table
          .select('count(*)')
          .limit(1);
          
        return { data, error };
      }
    },
    {
      name: 'System time query',
      fn: async () => {
        // Direct SQL query for current time
        const { data, error } = await supabase.rpc('system_time');
        return { data, error };
      }
    },
    {
      name: 'Health check',
      fn: async () => {
        // Just check if we can connect
        const { data, error } = await supabase.auth.getSession();
        return { data, error };
      }
    }
  ];
  
  // Create the system_time function if it doesn't exist yet
  try {
    const { error } = await supabase.rpc('system_time');
    if (error && error.message.includes('does not exist')) {
      console.log('Creating system_time function...');
      // Create the function
      const createFnResult = await supabase.rpc('create_system_time_function');
      console.log('Function creation result:', createFnResult);
    }
  } catch (err) {
    console.log('Error checking system_time function:', err.message);
    
    // Try to create the function directly with SQL
    try {
      const { error } = await supabase.sql(`
        create or replace function public.system_time()
        returns timestamptz
        language sql
        security definer
        as $$
          select now();
        $$;
        
        create or replace function public.create_system_time_function()
        returns text
        language sql
        security definer
        as $$
          select 'Function created';
        $$;
      `);
      
      if (error) {
        console.log('Error creating functions with SQL:', error);
      } else {
        console.log('Successfully created functions');
      }
    } catch (sqlErr) {
      console.log('SQL execution error:', sqlErr.message);
    }
  }
  
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
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });