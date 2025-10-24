#!/usr/bin/env node

// 🎯 CAPTURE OUR CONVERSATION - Log current Kiro conversation for CAI training
// Run this to capture our ongoing conversation for the ultimate AI fusion

import { captureCurrentConversation } from './backend/cai/conversation-capture.js';

async function main() {
  console.log('🎯 Capturing our conversation for CAI training...');
  console.log('📚 This will log all our interactions to create your ultimate personalized AI');
  
  try {
    const interactionCount = await captureCurrentConversation();
    
    console.log(`✅ Successfully captured ${interactionCount} interactions!`);
    console.log('🧠 This data will be used to train CAI to think and respond like Kiro');
    console.log('🚀 Your ultimate personalized AI is getting smarter!');
    
    // Also trigger via API if CAI server is running
    try {
      const response = await fetch('http://localhost:3001/capture-current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📡 Also logged via CAI API:', result.message);
      }
    } catch (apiError) {
      console.log('ℹ️ CAI server not running - data logged directly to database');
    }
    
  } catch (error) {
    console.error('❌ Failed to capture conversation:', error);
  }
}

main();