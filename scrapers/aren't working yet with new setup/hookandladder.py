from ics import Calendar
import psycopg2
import requests
import re
from datetime import datetime

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Load the .ics file
with open("/Users/musicdaddy/Desktop/venues/scrapers/hook.ics", "r") as f:
    calendar = Calendar(f.read())

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Create tables with unique constraints to prevent duplicate events based on venue and start time
cursor.execute("""
    CREATE TABLE IF NOT EXISTS shows (
        id SERIAL PRIMARY KEY,
        venue TEXT,
        bands TEXT,
        start TIMESTAMP,
        event_link TEXT,
        UNIQUE (venue, start)
    );
""")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS bands (
        band TEXT PRIMARY KEY
    );
""")

# Function to split band names based on custom rules
def split_band_names(band_string):
    # Split by custom rules: commas, "and", "with", "w/", "&", and "+"
    bands = re.split(r',|\s+and\s+|\s+with\s+|w/|W/|&|\+', band_string, flags=re.IGNORECASE)
    # Strip extra whitespace and filter out any empty strings
    return [b.strip() for b in bands if b.strip()]

# Prepare to store unique bands and events
events_data = []
band_names = set()

# Loop through each event in the .ics file
for event in calendar.events:
    event_details = {}

    # Set venue name for this .ics file
    event_details['venue'] = "Hook & Ladder"

    # Parse and format band names for storage in both tables
    band_names_list = split_band_names(event.name)
    event_details['bands'] = ", ".join(band_names_list)  # Store all bands as a comma-separated string

    # Add each band name to the `band_names` set for unique insertion into bands table
    band_names.update(band_names_list)

    # Event URL and start date-time
    event_details['event_link'] = event.url if event.url else "N/A"

    # Use the event's actual start date and time from the .ics file
    event_details['start'] = event.begin.datetime.replace(second=0, microsecond=0)
    # Append to events_data for later insertion into the shows table
    events_data.append(event_details)

# Counters for added and skipped events
added_count = 0
skipped_count = 0

# Insert unique events into the 'shows' table
for event in events_data:
    # Check for duplicates before attempting to insert based on 'venue' and 'start' only
    cursor.execute("""
        SELECT 1 FROM shows WHERE venue = %s AND start = %s
    """, (event['venue'], event['start']))
    
    if cursor.fetchone():
        print(f"Skipped duplicate event: {event['bands']} at {event['venue']} on {event['start']}")
        skipped_count += 1
    else:
        cursor.execute("""
            INSERT INTO shows (venue, bands, start, event_link)
            VALUES (%s, %s, %s, %s)
        """, (event['venue'], event['bands'], event['start'], event['event_link']))
        print(f"Added event: {event['bands']} at {event['venue']} on {event['start']}")
        added_count += 1

conn.commit()

# Fetch existing bands to avoid duplicates
cursor.execute("SELECT band FROM bands")
existing_bands = set(row[0] for row in cursor.fetchall())

# Insert unique bands into the 'bands' table
bands_to_add = [(band,) for band in band_names if band not in existing_bands]
if bands_to_add:
    cursor.executemany("INSERT INTO bands (band) VALUES (%s)", bands_to_add)
    conn.commit()
    print(f"{len(bands_to_add)} new bands added to the bands table.")
else:
    print("No new bands to add to the bands table. All entries are duplicates.")

# Close the database connection
cursor.close()
conn.close()

# Summary of added and skipped events
print(f"Total events added: {added_count}")
print(f"Total events skipped due to duplicates: {skipped_count}")

print("ICS events processed and added to the database.")