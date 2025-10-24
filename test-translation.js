// Quick test script for translation API
const API_BASE = 'http://localhost:3000';

async function testTranslation() {
  console.log('🧪 Testing Translation API...\n');
  
  // Test 1: Single translation
  console.log('Test 1: Single Translation (English → Japanese)');
  try {
    const response = await fetch(`${API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Breaking: AI Revolution Transforms Global Markets',
        targetLanguage: 'ja',
        sourceLanguage: 'en'
      })
    });
    
    const data = await response.json();
    console.log('✅ Success:', data.translation);
    console.log('');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Test 2: Batch translation
  console.log('Test 2: Batch Translation (English → Spanish)');
  try {
    const response = await fetch(`${API_BASE}/api/translate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: [
          'Live AI News',
          'Latest Articles',
          'Read More'
        ],
        targetLanguage: 'es',
        sourceLanguage: 'en'
      })
    });
    
    const data = await response.json();
    console.log('✅ Success:');
    data.results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.translation}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  console.log('🎉 Translation API tests complete!');
}

testTranslation();
