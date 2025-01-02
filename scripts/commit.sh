#!/bin/bash

# Fun commit script for GAK! 🎉

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fun emoji arrays
COMMIT_EMOJIS=("🎉" "✨" "🚀" "🔧" "🎨" "📝" "🐛" "🔥" "⚡️" "🌈")
RANDOM_EMOJI=${COMMIT_EMOJIS[$RANDOM % ${#COMMIT_EMOJIS[@]}]}

# Check if message provided
if [ -z "$1" ]; then
    echo -e "${RED}Oops! ${NC}You forgot to tell me what changed! Try:"
    echo -e "${YELLOW}./scripts/commit.sh \"Your amazing changes\"${NC}"
    exit 1
fi

# Fun commit messages from Trisha in Accounting
TRISHA_COMMENTS=(
    "Trisha says this commit is absolutely fabulous! ✨"
    "Trisha from Accounting approved this commit! 📊"
    "This code spark joy! - Trisha 🌟"
    "Trisha thinks this commit deserves a raise! 💰"
    "Accounting dept. gives this commit 5 stars! ⭐️⭐️⭐️⭐️⭐️"
)
RANDOM_COMMENT=${TRISHA_COMMENTS[$RANDOM % ${#TRISHA_COMMENTS[@]}]}

# Stage changes
echo -e "${CYAN}Staging changes...${NC}"
git add .

# Show what's being committed
echo -e "\n${PURPLE}Here's what we're committing:${NC}"
git status -s

# Commit with style
echo -e "\n${GREEN}Committing with Trisha's blessing...${NC}"
git commit -m "$RANDOM_EMOJI $1" -m "$RANDOM_COMMENT"

# Push if successful
if [ $? -eq 0 ]; then
    echo -e "\n${BLUE}Pushing to remote...${NC}"
    git push
    echo -e "\n${GREEN}All done! ${RANDOM_EMOJI} Keep being awesome!${NC}"
else
    echo -e "\n${RED}Oops! Something went wrong with the commit.${NC}"
    exit 1
fi 