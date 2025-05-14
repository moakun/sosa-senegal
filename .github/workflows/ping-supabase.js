const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function pingSupabase() {
  console.log('Starting Supabase ping process...');
  console.log(`Pinging URL: ${supabaseUrl.substring(0, 20)}...`);
  
  let succeeded = false;
  
  try {
    // Method 1: Try to use the auth API - this should be available on all projects
    console.log('Trying auth API ping...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (!authError) {
      console.log('✅ Auth API ping successful!');
      succeeded = true;
    } else {
      console.log('❌ Auth API ping failed:', authError.message);
      
      // Method 2: Try to get information about available schemas
      console.log('Trying storage health check...');
      const { data: storageData, error: storageError } = await supabase
        .storage
        .listBuckets();
      
      if (!storageError) {
        console.log('✅ Storage API ping successful!');
        succeeded = true;
      } else {
        console.log('❌ Storage API ping failed:', storageError.message);
        
        // Method 3: Last resort - try a simple REST query
        console.log('Trying direct REST ping...');
        
        // Make a simple GET request to the REST endpoint
        // This should trigger database activity even if it returns an error
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        console.log(`REST ping status: ${response.status}`);
        if (response.status < 500) {
          // Any response other than a server error is good enough
          console.log('✅ REST API ping successful!');
          succeeded = true;
        } else {
          console.log('❌ REST API ping failed with server error');
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error during ping:', err.message);
  }
  
  if (succeeded) {
    console.log('✅ Ping successful! Database will remain active for another 7 days');
    return true;
  } else {
    console.error('❌ All ping methods failed');
    return false;
  }
}

// Execute the ping function
pingSupabase()
  .then(result => {
    if (result) {
      console.log('Ping process completed successfully');
      process.exit(0);
    } else {
      console.error('Ping process failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });