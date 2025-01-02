import { strict as assert } from 'assert';
import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const gakPath = join(__dirname, '..', 'gak.mjs');
const fixturesPath = join(__dirname, 'fixtures');

// Create test fixtures if they don't exist
if (!fs.existsSync(fixturesPath)) {
    fs.mkdirSync(fixturesPath, { recursive: true });
    
    // Create test files
    fs.writeFileSync(join(fixturesPath, 'test1.txt'), 'This is a test file\nwith multiple lines\nand test content');
    fs.writeFileSync(join(fixturesPath, 'test2.js'), 'function test() {\n  console.log("test");\n}');
    fs.writeFileSync(join(fixturesPath, 'binary.bin'), Buffer.from([0x00, 0x01, 0x02, 0x03]));
}

console.log('🧪 Running GAK tests...\n');

// Test helper function
function runGak(args) {
    try {
        return execSync(`node ${gakPath} -d ${args}`, { encoding: 'utf8' });
    } catch (error) {
        return error.stdout;
    }
}

// Test basic search
console.log('📝 Testing basic search...');
const basicResult = runGak('-p test/fixtures test');
assert(basicResult.includes('test1.txt'), 'Should find test in test1.txt');
assert(basicResult.includes('test2.js'), 'Should find test in test2.js');
console.log('✅ Basic search test passed!\n');

// Test file type filtering
console.log('🔍 Testing file type filtering...');
const jsResult = runGak('-p test/fixtures -t js test');
assert(jsResult.includes('test2.js'), 'Should find test in JS files');
assert(!jsResult.includes('test1.txt'), 'Should not find test in TXT files when filtering for JS');
console.log('✅ File type filtering test passed!\n');

// Test binary file handling
console.log('💾 Testing binary file handling...');
const binaryResult = runGak('-p test/fixtures test');
assert(!binaryResult.includes('binary.bin'), 'Should skip binary files by default');
console.log('✅ Binary file handling test passed!\n');

// Test case sensitivity
console.log('🔤 Testing case sensitivity...');
const caseResult = runGak('-p test/fixtures -C TEST');
assert(!caseResult.includes('test1.txt'), 'Should not find lowercase when searching uppercase with -C');
console.log('✅ Case sensitivity test passed!\n');

// Test context display
console.log('📖 Testing context display...');
const contextResult = runGak('-p test/fixtures -l 1 test');
assert(contextResult.includes('multiple lines'), 'Should show context lines');
console.log('✅ Context display test passed!\n');

console.log('🎉 All tests passed! Trisha from Accounting is proud of you! 🌟'); 