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

# URL of the .ics file
ics_url = "https://whitesquirrelbar.com/calendar/?ical=1"

# Fetch and parse the .ics content
response = requests.get(ics_url)
response.raise_for_status()  # Check if the download was successful
calendar = Calendar(response.text)

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Create tables if they don't exist
cursor.execute("""
    CREATE TABLE IF NOT EXISTS shows (
        venue TEXT,
        bands TEXT,
        start TIMESTAMP,
        event_link TEXT
    );
""")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS bands (
        band TEXT PRIMARY KEY
    );
""")

# Prepare to store unique bands and events
events_data = []
band_names = set()

# Function to split band names based on custom rules
def split_band_names(band_string):
    bands = re.split(r'\s+w\.?\s+', band_string)
    separated_bands = []
    for band in bands:
        separated_bands.extend(band.split(","))
    return [b.strip() for b in separated_bands if b.strip()]

# Loop through each event in the .ics file
for event in calendar.events:
    event_details = {}

    # Set venue name for this .ics file
    event_details['venue'] = "White Squirrel"

    # Parse band names using custom split logic
    band_names_list = split_band_names(event.name)
    event_details['bands'] = ", ".join(band_names_list)  # Store all bands in a single field as a comma-separated string

    # Add each band name to the `band_names` set for unique insertion later
    band_names.update(band_names_list)

    # Event URL and start date-time
    event_details['event_link'] = event.url if event.url else "N/A"
    # Normalize the datetime to remove timezone info for comparison
    event_details['start'] = event.begin.datetime.replace(tzinfo=None)

    # Append to events_data for later insertion into the shows table
    events_data.append(event_details)

# Fetch existing events to avoid duplicates (normalize `start` to remove timezone)
cursor.execute("SELECT venue, start FROM shows")
existing_events = {(row[0], row[1].replace(tzinfo=None)) for row in cursor.fetchall()}

# Insert unique events into the 'shows' table
rows_to_add = []
duplicate_count = 0

for event in events_data:
    if (event['venue'], event['start']) not in existing_events:
        rows_to_add.append((event['venue'], event['bands'], event['start'], event['event_link']))
        print(f"Adding new event: {event}")
    else:
        print(f"Skipping duplicate event: {event}")
        duplicate_count += 1

if rows_to_add:
    insert_query = """
    INSERT INTO shows (venue, bands, start, event_link)
    VALUES (%s, %s, %s, %s)
    """
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the shows table.")
else:
    print("No new events to add to the shows table. All entries are duplicates.")

print(f"{duplicate_count} events skipped as duplicates.")

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

print("ICS events processed and added to the database.")