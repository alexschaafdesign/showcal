import re
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.berlinmpls.com/calendar'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'eventlist-event eventlist-event--upcoming eventlist-event--hasimg eventlist-hasimg is-loaded'))
    )
    print("Event cards loaded successfully.")
except:
    print("Event cards did not load in time.")

# Extract page source and parse with BeautifulSoup, then check if events were found
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all individual event articles
events = soup.find_all("article", class_="eventlist-event eventlist-event--upcoming eventlist-event--hasimg eventlist-hasimg is-loaded")
if not events:
    print("No events found on the page.")
else:
    print(f"Found {len(events)} events to process.")

# Initialize an empty list to hold all event data
events_data = []
band_names = set()  # Use a set to store unique band names

# Loop through each event block
for event in events:
    # Initialize a dictionary to store the event details for each event
    event_details = {}

    # Set the venue for the event
    event_details['venue'] = "Berlin"

    # Find the bands (main event title)
    h1_tag = event.find("h1", class_="eventlist-title")
    if h1_tag:
        a_tag = h1_tag.find("a", href=True)
        if a_tag:
            event_details['bands'] = a_tag.get_text(strip=True)
            event_details['event_link'] = "https://www.berlinmpls.com" + a_tag['href']
            band_names.add(event_details['bands'])  # Add band name to the set
        else:
            event_details['bands'] = h1_tag.get_text(strip=True)
            event_details['event_link'] = "N/A"
            band_names.add(event_details['bands'])  # Add band name to the set
    else:
        event_details['bands'] = "N/A"
        event_details['event_link'] = "N/A"

    # Find the date and time within the 'eventlist-meta event-meta' ul
    meta_list = event.find("ul", class_="eventlist-meta event-meta")
    if meta_list:
        # Extract date
        date_tag = meta_list.find("li", class_="eventlist-meta-item eventlist-meta-date event-meta-item")
        if date_tag:
            event_details['date'] = date_tag.get_text(strip=True)
        else:
            event_details['date'] = 'N/A'

        # Extract time
        time_tag = meta_list.find("li", class_="eventlist-meta-item eventlist-meta-time event-meta-item")
        if time_tag:
            time_text = time_tag.find("time", class_="event-time-localized-start")
            if time_text:
                event_details['time'] = time_text.get_text(strip=True)
            else:
                event_details['time'] = 'N/A'
        else:
            event_details['time'] = 'N/A'

    # Combine date and time to create `start`
    try:
        start_datetime = datetime.strptime(f"{event_details['date']} {event_details['time']}", "%A, %B %d, %Y %I:%M\u202f%p")
        event_details['start'] = start_datetime
    except ValueError as e:
        print(f"Error combining date and time for {event_details['bands']}: {e}")
        event_details['start'] = None

    # Append the event to events_data
    events_data.append(event_details.copy())

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Check if the tables exist; create them if not
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

# Fetch existing events to avoid duplicates
cursor.execute("SELECT bands, start FROM shows")
existing_events = set(cursor.fetchall())

# Prepare rows to add to the 'shows' table with `start` datetime
rows_to_add = []
for event in events_data:
    if event['start'] and (event['bands'], event['start']) not in existing_events:
        rows_to_add.append((
            event['venue'],
            event['bands'],
            event['start'],
            event.get('event_link', '')
        ))

# Insert new events into the 'shows' table
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

# Show notification when done
os.system('osascript -e \'display notification "Berlin Scrape finished!" with title "Berlin Scrape finished"\'')