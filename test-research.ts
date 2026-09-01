import { config } from 'dotenv';
import { tavilyClient } from './src/core/research/tavilyClient.js';
import { synthesizeResearch } from './src/core/research/researchSynthesizer.js';

config({ path: '.env.local' });

async function test() {
  console.log('1. Iniciando Tavily...');
  const startMs = Date.now();
  
  try {
    const mainSearch = await tavilyClient.researchCompany('Plántulas de Colombia');
    console.log(`- Búsqueda principal lista (${Date.now() - startMs}ms)`);
    
    const contactSearch = await tavilyClient.findContacts('Plántulas de Colombia');
    console.log(`- Búsqueda contactos lista (${Date.now() - startMs}ms)`);
    
    console.log('2. Iniciando Síntesis IA...');
    const synthesisMs = Date.now();
    const result = await synthesizeResearch('Plántulas de Colombia', mainSearch, contactSearch);
    
    console.log(`- Síntesis lista (${Date.now() - synthesisMs}ms)`);
    console.log('RESULTADO:', result.profile.companyName, '|', result.profile.estimatedSize);
  } catch (err) {
    console.error('ERROR EN EL PIPELINE:', err);
  }
}

test();
