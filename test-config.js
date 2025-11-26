#!/usr/bin/env node

/**
 * Test script to verify endpoint configuration system
 * This tests that .env configuration is properly loaded into endpoints.js
 */

import 'dotenv/config.js';
import { config, endpoints } from './src/config/endpoints.js';

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         Bytrix API - Endpoint Configuration Test               ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📋 ENVIRONMENT VARIABLES LOADED:');
console.log('─────────────────────────────────────────────────────────────────');
console.log(`✓ PORT: ${config.port}`);
console.log(`✓ NODE_ENV: ${config.env}`);
console.log(`✓ DOMAIN: ${config.domain}`);
console.log(`✓ LOG_LEVEL: ${config.logLevel}`);
console.log(`✓ S3 BUCKET: ${config.s3.bucket}`);
console.log(`✓ S3 REGION: ${config.s3.region}`);
console.log(`✓ SUPABASE TABLE: ${config.supabase.tableUploads}`);
console.log(`✓ GPT MODEL: ${config.gpt.model}`);
console.log(`✓ GPT TEMPERATURE: ${config.gpt.temperature}`);
console.log(`✓ MAX FILE SIZE: ${config.uploads.maxFileSize} bytes (${(config.uploads.maxFileSize / 1048576).toFixed(2)} MB)`);

console.log('\n🔗 ENDPOINTS CONFIGURATION:');
console.log('─────────────────────────────────────────────────────────────────');

console.log('\n📤 File Management:');
console.log(`   • Upload: POST ${endpoints.FILES.UPLOAD}`);
console.log(`   • List: GET ${endpoints.FILES.LIST}`);
console.log(`   • Get: GET ${endpoints.FILES.GET}`);
console.log(`   • Delete: DELETE ${endpoints.FILES.DELETE}`);
console.log(`   • Download (Public): GET ${endpoints.FILES.DOWNLOAD}`);

console.log('\n🤖 GPT:');
console.log(`   • Generate: POST ${endpoints.GPT.GENERATE}`);

console.log('\n🎯 GPT CRUD Actions:');
console.log(`   • List Files: GET ${endpoints.GPT_ACTIONS.FILES.LIST}`);
console.log(`   • Get File: GET ${endpoints.GPT_ACTIONS.FILES.GET}`);
console.log(`   • File Info: GET ${endpoints.GPT_ACTIONS.FILES.INFO}`);
console.log(`   • Delete File: DELETE ${endpoints.GPT_ACTIONS.FILES.DELETE}`);
console.log(`   • Query: POST ${endpoints.GPT_ACTIONS.QUERY}`);

console.log('\n💚 Health Check:');
console.log(`   • Health: GET ${endpoints.HEALTH}`);
console.log(`   • Info: GET ${endpoints.INFO}`);

console.log('\n✅ VERIFICATION CHECKLIST:');
console.log('─────────────────────────────────────────────────────────────────');
const checks = [
  { label: 'Port configured', pass: config.port > 0 },
  { label: 'Environment set', pass: config.env.length > 0 },
  { label: 'Domain configured', pass: config.domain.length > 0 },
  { label: 'S3 endpoint configured', pass: config.s3.endpoint.length > 0 },
  { label: 'Supabase URL configured', pass: config.supabase.url.length > 0 },
  { label: 'GPT API key configured', pass: config.gpt.apiKey.length > 0 },
  { label: 'JWT expiry set', pass: config.jwt.expiry > 0 },
  { label: 'Signed URL expiry set', pass: config.signedUrl.expiry > 0 },
  { label: 'Max file size set', pass: config.uploads.maxFileSize > 0 },
  { label: 'Endpoints properly loaded', pass: endpoints.BASE === (process.env.API_BASE_PATH || '/api/v1') },
];

let passed = 0;
checks.forEach(check => {
  if (check.pass) {
    console.log(`   ✅ ${check.label}`);
    passed++;
  } else {
    console.log(`   ❌ ${check.label}`);
  }
});

console.log('\n────────────────────────────────────────────────────────────────');
console.log(`   Result: ${passed}/${checks.length} checks passed`);

if (passed === checks.length) {
  console.log('\n🎉 Configuration test PASSED! System is ready to start.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Configuration test FAILED! Please check your .env file.\n');
  process.exit(1);
}
