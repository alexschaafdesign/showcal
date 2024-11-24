from ics import Calendar
import requests
import re
from datetime import datetime
from db_utils import connect_to_db, get_venue_id, insert_show, insert_band, link_band_to_show

# URL of the .ics file
ics_url = "https://whitesquirrelbar.com/calendar/?ical=1"

# Fetch and parse the .ics content
response = requests.get(ics_url)
response.raise_for_status()  # Check if the download was successful
ics_content = response.text
calendar = Calendar(ics_content)

# Connect to the PostgreSQL database
conn = connect_to_db()
cursor = conn.cursor()

# Counters for tracking results
show_count = 0
inserted_shows = 0
skipped_shows = 0
band_count = 0
inserted_bands = 0
linked_bands = 0

try:
    # Get the venue ID for "White Squirrel"
    venue_id = get_venue_id(cursor, "White Squirrel")

    # Function to split band names based on custom rules
    def split_band_names(band_string):
        bands = re.split(r'\s+w\.?\s+', band_string)
        separated_bands = []
        for band in bands:
            separated_bands.extend(band.split(","))
        return [b.strip() for b in separated_bands if b.strip()]

    # Function to extract flyer image URL
    def get_flyer_image(event_uid):
        # Use regex to find the ATTACH field for the specific event UID
        event_block_pattern = re.compile(rf"UID:{event_uid}.*?END:VEVENT", re.DOTALL)
        event_block_match = event_block_pattern.search(ics_content)
        if event_block_match:
            event_block = event_block_match.group(0)
            attach_pattern = re.compile(r"ATTACH;FMTTYPE=image/[^:]+:(.+)")
            attach_match = attach_pattern.search(event_block)
            if attach_match:
                return attach_match.group(1).strip()
        return "N/A"

    # Loop through each event in the .ics file
    for event in calendar.events:
        show_count += 1  # Increment the total show count

        # Parse event details
        bands = split_band_names(event.name)
        start_time = event.begin.datetime.replace(tzinfo=None)
        event_link = event.url if event.url else "N/A"
        flyer_image = "N/A"  # Adjust if needed

        # Insert show and get its ID
        try:
            show_id, was_inserted = insert_show(cursor, venue_id, ", ".join(bands), start_time, event_link, flyer_image)
            if was_inserted:
                inserted_shows += 1
            else:
                skipped_shows += 1
        except ValueError as e:
            print(f"Error inserting show: {e}")
            skipped_shows += 1
            continue  # Skip to the next event if show insertion fails

        # Process each band
        for band_name in bands:
            band_count += 1  # Increment the total band count
            try:
                band_id, was_inserted = insert_band(cursor, band_name)
                if was_inserted:
                    inserted_bands += 1
            except ValueError as e:
                print(f"Error inserting band: {e}")
                continue  # Skip to the next band if insertion fails

            # Link the band to the show
            link_band_to_show(cursor, band_id, show_id)
            linked_bands += 1

    # Commit changes to the database
    conn.commit()

    # Log the results
    print("\nScraping Results:")
    print(f"Total shows found: {show_count}")
    print(f"Inserted shows: {inserted_shows}")
    print(f"Skipped shows (duplicates): {skipped_shows}")
    print(f"Total bands found: {band_count}")
    print(f"Inserted bands: {inserted_bands}")
    print(f"Bands linked to shows: {linked_bands}")

except Exception as e:
    print(f"Error: {e}")
    conn.rollback()

finally:
    # Close the database connection
    cursor.close()
    conn.close()