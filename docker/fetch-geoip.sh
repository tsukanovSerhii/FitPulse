#!/bin/sh
# Downloads IP Geolocation by DB-IP (City Lite, CC BY 4.0, https://db-ip.com) to /geo.
# The file is published monthly; early in a month the previous one is used. A failed download
# leaves no file and the API runs without countries instead of failing the build.
mkdir -p /geo
year=$(date +%Y)
month=$(date +%m)
prev_month=$(( ${month#0} - 1 ))
prev_year=$year
if [ "$prev_month" -eq 0 ]; then prev_month=12; prev_year=$(( year - 1 )); fi
for stamp in "$year-$month" "$prev_year-$(printf %02d "$prev_month")"; do
  if wget -qO- "https://download.db-ip.com/free/dbip-city-lite-$stamp.mmdb.gz" | gunzip > /geo/dbip-city-lite.mmdb 2>/dev/null \
    && [ -s /geo/dbip-city-lite.mmdb ]; then
    echo "DB-IP City Lite $stamp downloaded"
    exit 0
  fi
done
rm -f /geo/dbip-city-lite.mmdb
echo "DB-IP download failed; building without geolocation"
