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
events = soup.select("article.eventlist-event")[:3]  # Process only the first 3 events
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
    else:
        event_date = None

    # Get the start time and combine with event date
    start_time_tag = event.find("time", class_="event-time-localized-start")
    if start_time_tag:
        start_time_text = start_time_tag.get_text(strip=True)
        start_time_text = start_time_text.replace(" ", " ")  # Replace non-standard spaces
        try:
            show_time = datetime.strptime(start_time_text, "%I:%M %p").time()
            if event_date:
                event_details['start'] = datetime.combine(event_date, show_time)
            else:
                event_details['start'] = None
        except ValueError:
            event_details['start'] = None
    else:
        event_details['start'] = None

    # Navigate to the individual event page to get additional details
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

    # Extract flyer image
    flyer_image_tag = event.find("img", {"data-src": True})
    if flyer_image_tag:
        flyer_image = flyer_image_tag["data-src"]
        event_details['flyer_image'] = flyer_image
        print(f"Extracted flyer image URL: {flyer_image}")  # Debugging: Print the extracted URL
    else:
        event_details['flyer_image'] = None
        print("No flyer image found for this event.")  # Debugging: Indicate no flyer image found

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
        event_link TEXT UNIQUE,
        flyer_image TEXT
    );
""")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS bands (
        band TEXT UNIQUE
    );
""")

# Fetch existing events to avoid duplicates
cursor.execute("SELECT venue, start, event_link FROM shows")
existing_events = set(cursor.fetchall())

# Fetch existing events with missing flyer_image
cursor.execute("SELECT id, event_link FROM shows WHERE flyer_image IS NULL")
events_missing_flyers = cursor.fetchall()

# Create a dictionary to map event_link to the show ID
events_missing_flyers_dict = {event_link: event_id for event_id, event_link in events_missing_flyers}

# Prepare a list for updating flyer URLs in existing events
updates_to_apply = []

for event in events_data:
    if event.get("event_link") in events_missing_flyers_dict:
        if event.get("flyer_image"):  # Check if the new flyer_image is available
            updates_to_apply.append((event["flyer_image"], events_missing_flyers_dict[event["event_link"]]))

# Update flyer_image for existing events in the database
if updates_to_apply:
    update_query = """
    UPDATE shows
    SET flyer_image = %s
    WHERE id = %s
    """
    cursor.executemany(update_query, updates_to_apply)
    conn.commit()
    print(f"Updated flyer_image for {len(updates_to_apply)} existing events.")
else:
    print("No flyer URLs to update in existing events.")

# Prepare rows for 'shows' table insertion, only if 'bands' is not empty
rows_to_add = []
unique_bands = set()
for event in events_data:
    if event.get('start') and (event['venue'], event['start'], event['event_link']) not in existing_events:
        rows_to_add.append((
            event['venue'],
            event['bands'],
            event['start'],
            event['event_link'],
            event['flyer_image']
        ))
        for band in event['bands'].split(", "):
            unique_bands.add(band.strip())

# Insert rows if they exist
if rows_to_add:
    insert_query = """
    INSERT INTO shows (venue, bands, start, event_link, flyer_image)
    VALUES (%s, %s, %s, %s, %s)
    """
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the shows table.")
else:
    print("No new events to add to the shows table.")

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