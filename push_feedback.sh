#!/bin/bash

# Configuration
BACKUP_FILE="data/feedback_data.csv"
REPO_DIR="."
BRANCH="develop"
LOCK_FILE="/tmp/backup_commit.lock"
LOG_FILE="/var/log/feedback_updater.log"

# Initialisation
exec >> "$LOG_FILE" 2>&1
echo "[$(date)] Script starting..."

# Verrouillage amélioré
acquire_lock() {
    if mkdir "$LOCK_FILE" 2>/dev/null; then
        trap 'rm -rf "$LOCK_FILE"' EXIT INT TERM ERR
    else
        echo "[$(date)] Script already running. Exiting."
        exit 1
    fi
}

# Fonction de calcul robuste des modifications
count_changes() {
    # Compte les modifications staged
    local staged=$(git diff --cached --numstat "$BACKUP_FILE" | awk '{s+=$1} END {print s+0}')
    # Compte les modifications non staged
    local unstaged=$(git diff --numstat "$BACKUP_FILE" | awk '{s+=$1} END {print s+0}')
    echo $((staged + unstaged))
}

# Boucle principale
while true; do
    acquire_lock
    
    if ! cd "$REPO_DIR"; then
        echo "[$(date)] ERROR: Can't access $REPO_DIR"
        exit 1
    fi

    NEW_ENTRIES=$(count_changes)
    echo "[$(date)] Detected changes: $NEW_ENTRIES"

    if [ "$NEW_ENTRIES" -ge 10 ]; then
        echo "[$(date)] Processing $NEW_ENTRIES new entries..."
        
        if ! git add "$BACKUP_FILE"; then
            echo "[$(date)] ERROR: git add failed"
            continue
        fi

        if ! git commit -m "Auto-commit: $NEW_ENTRIES new entries"; then
            echo "[$(date)] ERROR: git commit failed"
            continue
        fi

        # Gestion robuste des conflits
        if ! git -c pull.rebase=true pull origin "$BRANCH"; then
            echo "[$(date)] CONFLICT: Reset and retry..."
            git reset --hard HEAD
            continue
        fi

        if git push origin "$BRANCH"; then
            echo "[$(date)] Successfully pushed $NEW_ENTRIES entries"
        else
            echo "[$(date)] ERROR: git push failed"
        fi
    fi
    echo "test"
    sleep 60
done
