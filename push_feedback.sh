#!/bin/bash

BACKUP_FILE="data/feedback.csv"
REPO_DIR="."
BRANCH="develop"
LOCK_FILE="/tmp/backup_commit.lock"

acquire_lock() {
    if [ -e "$LOCK_FILE" ]; then
        exit 1
    fi
    touch "$LOCK_FILE"
}

release_lock() {
    rm -f "$LOCK_FILE"
}

trap release_lock EXIT INT TERM ERR

while true; do
    acquire_lock
    cd "$REPO_DIR" || { echo "Error: $REPO_DIR inaccessible"; exit 1; }

    NEW_ENTRIES=$(git diff --numstat --cached "$BACKUP_FILE" | awk '{print $1}')
    NEW_ENTRIES=$((NEW_ENTRIES + $(git diff --numstat "$BACKUP_FILE" | awk '{print $1}')))

    if [ "$NEW_ENTRIES" -ge 10 ]; then
        git add "$BACKUP_FILE"
        git commit -m "Auto-commit: $NEW_ENTRIES new data"
        git pull origin "$BRANCH" || {
            echo "Conflit - annulation..."
            git merge --abort
            git reset --hard HEAD
        }
        git push origin "$BRANCH"
    fi

    release_lock
    sleep 60
done
