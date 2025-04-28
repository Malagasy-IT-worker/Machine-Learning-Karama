#!/bin/bash

WATCH_DIR="/home/admin/ml_karama/data"
FILE_TO_WATCH="feedback_data.csv"
S3_BUCKET="s3://ankoay-s3/data"

LAST_LINE_COUNT=0


while true; do
    inotifywait -e modify "$WATCH_DIR/$FILE_TO_WATCH" >/dev/null 2>&1

    CURRENT_LINE_COUNT=$(wc -l < "$WATCH_DIR/$FILE_TO_WATCH")

    if [ "$CURRENT_LINE_COUNT" -gt "$LAST_LINE_COUNT" ]; then
        echo "New line detected. Saving to S3..."
        aws s3 cp "$WATCH_DIR/$FILE_TO_WATCH" "$S3_BUCKET/"
        LAST_LINE_COUNT=$CURRENT_LINE_COUNT
    fi

    sleep 1
done
