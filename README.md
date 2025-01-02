# GAK (Global Awesome Keywords)

A powerful command-line tool for searching files with multiple keywords, offering flexible context display and advanced filtering options.

## Features

- 🔍 Search for multiple keywords across files
- 📂 Recursive directory searching
- 🎯 File type filtering
- 📝 Context-aware results (show surrounding lines or characters)
- 🎨 Syntax-highlighted output
- 📊 Search statistics
- 🚫 Binary file filtering
- 📏 File size limits
- 🎛️ Case-sensitive search options
- 📁 Custom ignore patterns

## Installation

```bash
npm install -g gak
```

## Usage

```bash
gak [options] [keywords...]
```

### Basic Examples

```bash
# Find files containing "password"
gak password

# Find files with both "config" and "secure" in /etc
gak -p /etc config secure

# Search only in JavaScript and Python files
gak -t js,py class method

# Show 2 lines of context around matches
gak -l 2 TODO

# Only show filenames of matches
gak -q password
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --path <path>` | Search path | Current directory |
| `-b, --binary` | Include binary files | false |
| `-i, --ignore <patterns...>` | Glob patterns to ignore | **/node_modules/**, **/.git/** |
| `-t, --type <extensions...>` | File extensions to search (e.g., js,py,txt) | All files |
| `-c, --context <chars>` | Characters to show around match | 0 |
| `-cb, --context-before <chars>` | Characters to show before match | 0 |
| `-ca, --context-after <chars>` | Characters to show after match | 0 |
| `-l, --lines <count>` | Lines to show around match | 0 |
| `-lb, --lines-before <count>` | Lines to show before match | 0 |
| `-la, --lines-after <count>` | Lines to show after match | 0 |
| `-m, --max-matches <count>` | Maximum matches per file | No limit |
| `-C, --case-sensitive` | Enable case-sensitive search | false |
| `-s, --size <limit>` | Skip files larger than size (e.g., 1mb, 500kb) | 10mb |
| `-q, --quiet` | Only show file names | false |
| `--stats` | Show search statistics | false |
| `-ss, --show-skips` | Show skipped files | false |

## Advanced Usage

### Context Display

GAK provides flexible ways to show context around matches:

```bash
# Show 5 characters before and after matches
gak -c 5 searchterm

# Show 2 lines before and 3 lines after matches
gak -lb 2 -la 3 searchterm

# Show 2 lines of context in both directions
gak -l 2 searchterm
```

### File Filtering

```bash
# Search only specific file types
gak -t js,py,md searchterm

# Ignore additional patterns
gak -i "**/dist/**" "**/build/**" searchterm

# Include binary files in search
gak -b searchterm

# Limit file size (skip larger files)
gak -s 500kb searchterm
```

### Output Control

```bash
# Show search statistics
gak --stats searchterm

# Show skipped files
gak -ss searchterm

# Quiet mode (only show file names)
gak -q searchterm

# Case-sensitive search
gak -C searchterm
```

## File Type Emojis

GAK uses emojis to indicate file types in the output:

- 📜 JavaScript (.js, .mjs)
- 🐍 Python (.py)
- 🦀 Rust (.rs)
- 🐹 Go (.go)
- 💎 Ruby (.rb)
- 🐘 PHP (.php)
- ☕ Java (.java)
- ⚡ C/C++ (.c, .cpp)
- 📋 Header files (.h)
- 🎨 CSS (.css)
- 🌐 HTML (.html)
- 📝 Markdown (.md)
- 📦 JSON (.json)
- ⚙️ YAML (.yml, .yaml)
- 🐚 Shell scripts (.sh, .bash)
- 📄 Text files (.txt)
- 📂 Other files

## Performance

- Skips binary files by default
- Configurable file size limits
- Efficient glob-based file filtering
- Optimized for large codebases

## Why GAK over grep?

GAK offers several advantages over traditional grep:

### 🚀 Speed & Performance
- Faster search performance due to modern Node.js streams and optimized file handling
- Smart file filtering that skips binary files and large files by default
- Efficient memory usage even with large codebases

### 🎯 Better User Experience
- Beautiful, colorful output with file type emojis
- Clear, human-readable error messages
- Progress indicators and search statistics
- No need to remember complex regex patterns for basic searches

### 💪 Advanced Features Made Simple
- Multi-keyword search without complex regex (just space-separate your terms!)
- Character-level context control (show exactly N chars before/after match)
- Smart file type detection and filtering
- Modern glob pattern support for ignoring files/directories

### 🛠️ Modern Defaults
- Sensible defaults that work for most use cases
- Case-insensitive search by default (use -C for case-sensitive)
- Automatic binary file skipping
- Smart file size limits to prevent hanging on large files

### 📊 Better Output Control
- Flexible context display (characters or lines)
- Statistics about your search
- Quiet mode for scripting
- Show skipped files for debugging

## Error Handling

GAK provides clear error messages for common issues:

- Permission denied errors
- Invalid file paths
- Binary file detection
- Size limit violations
- Invalid regex patterns

## Credits

Imagined by @8bit-wraith(Hue) & @aye.is

## License

MIT
