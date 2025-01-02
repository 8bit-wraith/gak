#!/bin/bash

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Setting up GAK development environment...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    echo -e "Please install Node.js from: ${BLUE}https://nodejs.org${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Create symlink
echo -e "\n${YELLOW}🔗 Creating symlink for global usage...${NC}"
npm link

# Make scripts executable
echo -e "\n${YELLOW}🔧 Making scripts executable...${NC}"
chmod +x gak.mjs
chmod +x scripts/*.sh

# Run tests
echo -e "\n${YELLOW}🧪 Running tests...${NC}"
npm test

# Success message
echo -e "\n${GREEN}✅ GAK development environment is ready!${NC}"
echo -e "${BLUE}You can now use 'gak' command globally.${NC}"
echo -e "\nTry these commands:"
echo -e "${CYAN}gak --help${NC} - Show help"
echo -e "${CYAN}gak test${NC} - Search for 'test' in current directory"
echo -e "${CYAN}npm run dev:test${NC} - Run test search"
echo -e "${CYAN}npm test${NC} - Run test suite"
echo -e "\n${GREEN}Happy coding! 🎉${NC}"
echo -e "${YELLOW}Trisha from Accounting says: 'Make those keywords searchable!' 📊${NC}" 