#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { readFileSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { fileURLToPath } from 'url';
import { globbySync } from 'globby';
import isTextPath from 'is-text-path';
import prettyBytes from 'pretty-bytes';
import fs from 'fs/promises';
import ora from 'ora';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const isWindows = process.platform === 'win32';

// ANSI color shortcuts
const dim = chalk.dim;
const blue = chalk.blue;
const yellow = chalk.yellow;
const red = chalk.red;
const green = chalk.green;
const gray = chalk.gray;

// File type to emoji mapping
const FILE_TYPE_EMOJIS = {
	js: '📜', // JavaScript
	mjs: '📜', // JavaScript Module
	py: '🐍', // Python
	rs: '🦀', // Rust
	go: '🐹', // Go
	rb: '💎', // Ruby
	php: '🐘', // PHP
	java: '☕', // Java
	cpp: '⚡', // C++
	c: '⚡', // C
	h: '📋', // Header
	css: '🎨', // CSS
	html: '🌐', // HTML
	md: '📝', // Markdown
	json: '📦', // JSON
	yml: '⚙️', // YAML
	yaml: '⚙️', // YAML
	sh: '🐚', // Shell
	bash: '🐚', // Bash
	bat: '🪟', // Windows Batch
	ps1: '🪟', // PowerShell
	txt: '📄', // Text
	default: '📂' // Default
};

// Get emoji for file type
function getFileEmoji(filePath) {
	const ext = filePath.split('.').pop().toLowerCase();
	return FILE_TYPE_EMOJIS[ext] || FILE_TYPE_EMOJIS.default;
}

// Normalize path for current OS
function normalizePath(path) {
	return isWindows ? path.replace(/\//g, '\\') : path;
}

// Default ignore patterns for different OS
const defaultIgnorePatterns = [
	'**/node_modules/**',
	'**/.git/**',
	'**/.Trash/**',      // Skip macOS Trash
	'**/$Recycle.Bin/**', // Skip Windows Recycle Bin
	'**/lost+found/**',   // Skip Linux lost+found
	...(isWindows ? [
		'**/System Volume Information/**',
		'**/Windows/**',
		'**/Program Files/**',
		'**/Program Files (x86)/**',
		'**/ProgramData/**'
	] : [])
];

program
	.name('gak')
	.description('Global Awesome Keywords - Search files for multiple keywords')
	.argument('[keywords...]', 'Keywords to search for')
	.option('-p, --path <path>', 'Search path', '.')
	.option('-b, --binary', 'Include binary files', false)
	.option('-i, --ignore <patterns...>', 'Glob patterns to ignore', defaultIgnorePatterns)
	.option('-t, --type <types>', 'File extensions to search (e.g., js,py,txt)', '')
	.option('-c, --context <chars>', 'Number of characters to show around match', 0)
	.option('-cb, --context-before <chars>', 'Number of characters to show before match', 0)
	.option('-ca, --context-after <chars>', 'Number of characters to show after match', 0)
	.option('-l, --lines <count>', 'Number of lines to show around match', 0)
	.option('-lb, --lines-before <count>', 'Number of lines to show before match', 0)
	.option('-la, --lines-after <count>', 'Number of lines to show after match', 0)
	.option('-m, --max-matches <count>', 'Maximum matches per file', Number.MAX_SAFE_INTEGER)
	.option('-C, --case-sensitive', 'Enable case-sensitive search', false)
	.option('-s, --size <limit>', 'Skip files larger than size (e.g., 1mb, 500kb)', '10mb')
	.option('-q, --quiet', 'Only show file names', false)
	.option('--stats', 'Show search statistics', false)
	.option('-ss, --show-skips', 'Show skipped files', false)
	.option('-d, --debug', 'Show debug information', false)
	.option('-v, --verbose', 'Show verbose progress information', false)
	.version('1.0.0')
	.showHelpAfterError();

program.on('--help', () => {
	console.log('')
	console.log('Imagined by @8bit-wraith(Hue) & @aye.is');
	console.log('');
	console.log('Examples:');
	console.log('  $ gak password                     # Find files containing "password"');
	console.log('  $ gak -p /etc config secure        # Find files with both words in /etc');
	console.log('  $ gak -b api auth                  # Search in all file types');
	console.log('  $ gak -t js,py class method        # Search only in .js and .py files');
	console.log('  $ gak -c 2 TODO                    # Show 2 characters before and after matches');
	console.log('  $ gak -l 2 TODO                    # Show 2 lines before and after matches');
	console.log('  $ gak -s 1mb error                 # Skip files larger than 1MB');
	console.log('  $ gak -q password                  # Only show file names');
});

program.parse();

const options = program.opts();
const keywords = program.args;

if (!keywords.length) {
	program.help();
}

// Convert size limit to bytes
const sizeLimit = options.size.match(/^(\d+)(k|m|g)?b?$/i);
if (!sizeLimit) {
	console.error(red('Invalid size limit format. Use format like: 500kb, 1mb, 2gb'));
	process.exit(1);
}
const multipliers = { k: 1024, m: 1024 * 1024, g: 1024 * 1024 * 1024 };
const bytes = parseInt(sizeLimit[1]) * (sizeLimit[2] ? multipliers[sizeLimit[2].toLowerCase()] : 1);

// Helper function for debug logging
function debug(...args) {
	if (options.debug) {
		console.error(...args);
	}
}

// Build glob patterns based on file extensions
let patterns = ['**/*'];
if (options.type) {
	// Split comma-separated extensions and handle both formats (.js and js)
	const extensions = options.type.split(',')
		.filter(ext => ext.trim())  // Remove empty entries
		.map(ext => ext.trim())
		.map(ext => ext.startsWith('.') ? ext.slice(1) : ext);
	
	if (extensions.length > 0) {
		patterns = extensions.map(ext => `**/*.${ext}`);
		debug('Debug - File patterns:', patterns);
		debug('Debug - Extensions:', extensions);
	}
}

// Update file path display for current OS
function displayPath(filePath) {
	const relativePath = relative(process.cwd(), filePath);
	return isWindows ? relativePath.replace(/\\/g, '/') : relativePath;
}

// Fun loading messages
const loadingMessages = [
	"🔍 Searching like Sherlock...",
	"🚀 Zooming through files...",
	"🧙‍♂️ Casting search spells...",
	"🎯 Hunting for matches...",
	"🎨 Painting your results...",
	"🌈 Following the rainbow of code...",
	"🔮 Gazing into the codebase...",
	"🎭 Performing regex magic...",
	"🎪 Juggling through directories...",
	"🎡 Spinning through files..."
];

// Get random loading message
function getLoadingMessage() {
	return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}

// Progress bar helper
function getProgressBar(current, total, width = 20) {
	const progress = Math.min(current / total, 1);
	const filled = Math.round(width * progress);
	const empty = width - filled;
	return `[${'█'.repeat(filled)}${' '.repeat(empty)}] ${Math.round(progress * 100)}%`;
}

// Main search function
async function search(options, keywords) {
	const spinner = ora({
		text: getLoadingMessage(),
		spinner: 'dots12',
		color: 'cyan'
	}).start();

	const stats = {
		startTime: Date.now(),
		filesSearched: 0,
		matchesFound: 0,
		currentDir: '',
		totalFiles: 0,
		filesSkipped: {
			size: 0,
			binary: 0,
			error: 0,
			permission: 0
		}
	};

	// Declare updateSpinner at the start
	let updateSpinner;

	try {
		// Convert keywords to RegExp safely, escaping special chars if they're not already regexes
		const searchPatterns = keywords.map(keyword => {
			const isRegex = keyword.startsWith('/') && keyword.endsWith('/');
			return isRegex ?
				keyword.slice(1, -1) : // Remove the slashes for actual regex
				keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars for literal search
		});

		debug('Search patterns:', searchPatterns);

		// Get files matching patterns and count
		const allFiles = globbySync(patterns, {
			cwd: options.path,
			absolute: true,
			ignore: options.ignore,
			dot: true,
			onlyFiles: true,
			followSymbolicLinks: false,
			suppressErrors: true
		});
		stats.totalFiles = allFiles.length;
		debug('Debug - Total files to search:', stats.totalFiles);
		debug('Debug - Files:', allFiles);

		// Start spinner updates with progress
		updateSpinner = setInterval(() => {
			const progress = getProgressBar(stats.filesSearched, stats.totalFiles);
			const currentDir = stats.currentDir ? dim(`\n  📂 ${displayPath(stats.currentDir)}`) : '';
			spinner.text = `${getLoadingMessage()}\n  ${progress}${options.verbose ? currentDir : ''}`;
		}, 100);

		let foundMatches = false;

		// Helper function for searching file contents
		function searchAndDisplayContext(filePath, patterns) {
			try {
				const content = readFileSync(filePath, 'utf-8');
				debug(`Reading file: ${filePath}`);
				debug(`Content length: ${content.length}`);
				debug(`Patterns: ${patterns}`);
				
				const lines = content.split('\n');
				const matches = new Map();

				// Find matches for all patterns
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					debug(`Checking line ${i + 1}: ${line}`);

					// Check each pattern against the line
					for (const pattern of patterns) {
						debug(`Checking pattern: ${pattern}`);
						const regex = options.caseSensitive ? new RegExp(pattern, 'g') : new RegExp(pattern, 'gi');
						if (line.match(regex)) {
							debug(`Found match in line ${i + 1}`);
							if (!matches.has(i)) {
								matches.set(i, { line, patterns: new Set() });
							}
							matches.get(i).patterns.add(pattern);
						}
					}
				}

				if (matches.size > 0) {
					debug(`Found ${matches.size} matches in ${filePath}`);
					if (!options.quiet) {
						// Show file name with appropriate emoji and normalized path
						const emoji = getFileEmoji(filePath);
						console.log(`\n${emoji} ${blue(displayPath(filePath))}`);
					}

					let matchCount = 0;
					// Sort matches by line number
					const sortedMatches = Array.from(matches.entries()).sort(([a], [b]) => a - b);

					for (const [lineNum, match] of sortedMatches) {
						if (matchCount >= options.maxMatches) break;

						if (options.quiet) {
							console.log(filePath);
							matchCount++;
							continue;
						}

						// Highlight the matching line
						let highlightedLine = match.line;
						match.patterns.forEach(pattern => {
							const regex = options.caseSensitive ? new RegExp(pattern, 'g') : new RegExp(pattern, 'gi');
							highlightedLine = highlightedLine.replace(regex, yellow('$&'));
						});

						// Just show the matching line by default
						console.log(green(`${lineNum + 1}`) + dim(':') + ' ' + highlightedLine);

						// Get context sizes
						const charsBefore = options.contextBefore || options.context || 0;
						const charsAfter = options.contextAfter || options.context || 0;
						const linesBefore = options.linesBefore || options.lines || 0;
						const linesAfter = options.linesAfter || options.lines || 0;

						// Show additional context if requested
						if (linesBefore > 0 || linesAfter > 0) {
							// Line-based context
							const contextBefore = Math.max(0, lineNum - linesBefore);
							const contextAfter = Math.min(lines.length, lineNum + linesAfter + 1);

							// Print context lines before
							for (let i = contextBefore; i < lineNum; i++) {
								console.log(dim(`${i + 1}: ${lines[i]}`));
							}

							// Print context lines after
							for (let i = lineNum + 1; i < contextAfter; i++) {
								console.log(dim(`${i + 1}: ${lines[i]}`));
							}
						}

						console.log(''); // Add spacing between matches
						matchCount++;
					}

					stats.matchesFound += matches.size;
					return true;
				}
			} catch (error) {
				debug(`Error reading file ${filePath}: ${error.message}`);
			}
			return false;
		}

		for (const file of allFiles) {
			try {
				// Check if we can access the file first
				try {
					await fs.access(file, fs.constants.R_OK);
				} catch (error) {
					if (error.code === 'EACCES' || error.code === 'EPERM') {
						stats.filesSkipped.permission++;
						if (options.showSkips) {
							debug(`Skipping ${file}: Permission denied`);
						}
						continue;
					}
					throw error; // Re-throw other errors
				}

				// Update current directory for verbose output
				const dir = path.dirname(file);
				if (dir !== stats.currentDir) {
					stats.currentDir = dir;
					debug(`Searching in: ${displayPath(dir)}`);
				}

				const stat = statSync(file);

				// Skip if it's a directory
				if (stat.isDirectory()) {
					stats.filesSkipped.error++;
					if (options.showSkips) {
						debug(`Skipping directory: ${file}`);
					}
					continue;
				}

				// Skip large files
				if (stat.size > bytes) {
					stats.filesSkipped.size++;
					if (options.showSkips) {
						debug(`Skipping large file: ${file} (${prettyBytes(stat.size)})`);
					}
					continue;
				}

				// Skip binary files unless explicitly included
				if (!options.binary && !isTextPath(file)) {
					stats.filesSkipped.binary++;
					if (options.showSkips) {
						debug(`Skipping binary file: ${file}`);
					}
					continue;
				}

				stats.filesSearched++;

				// Search for all patterns in the file
				if (searchAndDisplayContext(file, searchPatterns)) {
					foundMatches = true;
				}
			} catch (error) {
				stats.filesSkipped.error++;
				if (options.showSkips) {
					if (error.code === 'ENOENT') {
						debug(`File not found: ${displayPath(file)}`);
					} else if (error.code === 'EISDIR') {
						debug(`Skipping directory: ${displayPath(file)}`);
					} else {
						debug(`Error processing ${displayPath(file)}: ${error.message}`);
					}
				}
				continue;
			}
		}

		if (!foundMatches) {
			console.log(red('\nNo matches found. Maybe try a different search term? 🤔'));
		}

		// Final stats
		if (options.stats) {
			const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
			console.log('\n📊 Search Statistics:');
			console.log(`  ⏱️  Time: ${duration}s`);
			console.log(`  📂 Files searched: ${stats.filesSearched}`);
			console.log(`  ✨ Files with matches: ${stats.matchesFound}`);
			console.log('  ⚠️  Files skipped:');
			console.log(`    📏 Size limit: ${stats.filesSkipped.size}`);
			console.log(`    💾 Binary files: ${stats.filesSkipped.binary}`);
			console.log(`    🔒 Permission denied: ${stats.filesSkipped.permission}`);
			console.log(`    ❌ Other errors: ${stats.filesSkipped.error}`);
		}
	} catch (error) {
		spinner.fail(red(`Error: ${error.message}`));
		process.exit(1);
	} finally {
		if (updateSpinner) clearInterval(updateSpinner);
		spinner.stop();
	}
}

// Run the search
const start = performance.now();
search({
	...options,
	pattern: keywords.join(' ')
}, keywords).then(() => {
	if (!options.quiet && !options.json) {
		const end = performance.now();
		console.log(dim(`\nSearch completed in ${(end - start).toFixed(2)}ms`));
	}
}).catch(error => {
	console.error(red(`Error: ${error.message}`));
	process.exit(1);
});