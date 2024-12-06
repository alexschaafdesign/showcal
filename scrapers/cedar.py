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
url = 'https://www.thecedar.org/events'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "article.eventlist-event"))
    )
    print("Event cards loaded successfully.")
except:
    print("Event cards did not load in time.")
    driver.quit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')

# Find all music event cards
events = soup.select("article.eventlist-event")
events_data = []

# Loop through each music event card to gather event details
for event in events:
    event_details = {'venue': "The Cedar Cultural Center"}

    # Get the event URL
    link = event.find("a", href=True)
    if link:
        event_url = link['href']
        full_event_url = f"https://www.thecedar.org{event_url}"  # Ensure full URL if relative
        event_details['event_link'] = full_event_url

    # Get the event date
    date_tag = event.find("time", class_="event-date")
    if date_tag and date_tag.has_attr("datetime"):
        date_text = date_tag["datetime"]
        event_date = datetime.strptime(date_text, "%Y-%m-%d").date()
        print(f"Parsed event date: {event_date}")
    else:
        event_date = None
        print("Date not found.")

    # Get the start time and combine with event date
    start_time_tag = event.find("time", class_="event-time-localized-start")
    if start_time_tag:
        start_time_text = start_time_tag.get_text(strip=True)
        
        # Replace non-standard characters in time text if needed
        start_time_text = start_time_text.replace(" ", " ")  # Replace non-standard spaces

        try:
            show_time = datetime.strptime(start_time_text, "%I:%M %p").time()
            if event_date:
                # Combine date and time to form a complete datetime object
                event_details['start'] = datetime.combine(event_date, show_time)
                print(f"Parsed start datetime: {event_details['start']}")
            else:
                event_details['start'] = None
                print("Date missing, cannot combine with time.")
        except ValueError:
            print(f"Error parsing time: {start_time_text}")
            event_details['start'] = None
    else:
        event_details['start'] = None
        print("Start time not found.")

    # Now navigate to the individual event page to get band names
    driver.get(full_event_url)
    event_soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Extract band names
    band_names = []
    headers = event_soup.find_all("h4", style="white-space:pre-wrap;")
    for header in headers:
        band_name = header.get_text(strip=True)
        if band_name.lower() not in ["listen", "about this show"]:
            band_names.append(band_name)

    # Join all bands in a single string for 'shows' table and list for 'bands' table
    event_details['bands'] = ", ".join(band_names)
    print(f"Parsed band names: {band_names}")
    events_data.append(event_details.copy())

# Close the driver after scraping
driver.quit()

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
        id SERIAL PRIMARY KEY,
        venue TEXT,
        bands TEXT,
        start TIMESTAMP,
        event_link TEXT UNIQUE
    );
""")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS bands (
        band TEXT PRIMARY KEY
    );
""")

# Fetch existing events to avoid duplicates
cursor.execute("SELECT venue, start, event_link FROM shows")
existing_events = set(cursor.fetchall())

# Prepare rows for 'shows' table insertion, only if 'bands' is not empty
rows_to_add = []
unique_bands = set()  # Track unique bands to insert into the bands table
for event in events_data:
    if event.get('start') and (event['venue'], event['start'], event['event_link']) not in existing_events:
        print(f"Adding event to rows_to_add: {event}")
        rows_to_add.append((
            event['venue'],
            event['bands'],
            event['start'],
            event['event_link']
        ))
        
        # Add each band to unique_bands set for insertion into the bands table
        for band in event['bands'].split(", "):
            unique_bands.add(band.strip())

# Insert rows if they exist
if rows_to_add:
    insert_query = """
    INSERT INTO shows (venue, bands, start, event_link)
    VALUES (%s, %s, %s, %s)
    """
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the shows table.")
else:
    print("No new events to add to the shows table.")

# Prepare unique band names for the 'bands' table insertion
for event in events_data:
    if event.get('bands'):
        for band in event['bands'].split(", "):
            unique_bands.add(band.strip())

# Log unique bands to verify
print(f"Unique bands collected for insertion: {unique_bands}")

# Insert unique bands into the 'bands' table
if unique_bands:
    for band in unique_bands:
        cursor.execute("INSERT INTO bands (band) VALUES (%s) ON CONFLICT (band) DO NOTHING", (band,))
    conn.commit()
    print(f"{len(unique_bands)} unique bands added to the bands table.")
else:
    print("No bands to add to the bands table.")

# Close the database connection
cursor.close()
conn.close()

print("Events processed and added to the database.")