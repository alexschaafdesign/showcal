import re
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime

# Database connection parameters
DB_NAME = "tcup_db"
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

for event in events:
    event_details = {'venue': "The Cedar Cultural Center"}

    # Get the event URL
    link = event.find("a", href=True)
    if not link:
        print("No event link found for this event card.")
        continue

    event_url = link['href']
    full_event_url = f"https://www.thecedar.org{event_url}"
    event_details['event_link'] = full_event_url

    # Get the event date
    date_tag = event.find("time", class_="event-date")
    if date_tag and date_tag.has_attr("datetime"):
        date_text = date_tag["datetime"]
        event_date = datetime.strptime(date_text, "%Y-%m-%d").date()
        event_details['date'] = event_date
    else:
        print("Event date not found.")
        continue

    # Extract start time
    try:
        start_time_tag = event.find("time", class_="event-time-localized-start")
        if start_time_tag:
            start_time_text = start_time_tag.get_text(strip=True).replace(" ", " ")
            show_time = datetime.strptime(start_time_text, "%I:%M %p").time()
            event_details['start'] = datetime.combine(event_date, show_time)
        else:
            event_details['start'] = None
    except Exception as e:
        print(f"Error parsing start time: {e}")
        event_details['start'] = None

    # Navigate to individual event page
    try:
        driver.get(full_event_url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.eventitem-column-meta"))
        )
        event_soup = BeautifulSoup(driver.page_source, 'html.parser')
    except TimeoutException:
        print(f"Timed out loading page: {full_event_url}")
        continue

    # Extract band names
    meta_div = event_soup.find("div", class_="eventitem-column-meta")
    if meta_div:
        title_tag = meta_div.find("h1", class_="eventitem-title")
        if title_tag:
            title_text = title_tag.get_text(strip=True)
            connectors = [" and ", " + ", " & ", " with ", " featuring "]
            for connector in connectors:
                if connector in title_text.lower():
                    band_names = [band.strip() for band in title_text.split(connector)]
                    break
            else:
                band_names = [title_text.strip()]
            event_details['bands'] = ", ".join(band_names)
        else:
            print("Band title not found.")
    else:
        print("Meta div not found for band names.")

    # Extract flyer image
    try:
        flyer_image_tag = event_soup.select_one(
            "div.eventitem-column-content img.sqs-image-shape-container-element"
        )
        if flyer_image_tag and 'src' in flyer_image_tag.attrs:
            flyer_image = flyer_image_tag['src'].replace("-size", "-original")
            event_details['flyer_image'] = flyer_image
        else:
            event_details['flyer_image'] = None
    except Exception as e:
        print(f"Error parsing flyer image: {e}")
        event_details['flyer_image'] = None

    # Append if valid
    if not event_details['start']:
        print(f"Missing start time for event: {event_details['event_link']}")
    if not event_details['flyer_image']:
        print(f"Missing flyer image for event: {event_details['event_link']}")
    if event_details['start'] and event_details['bands']:
        events_data.append(event_details)
    else:
        print(f"Skipped event due to missing critical data: {event_details}")

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Directly assign the correct venue_id
venue_id = 262  # Correct venue ID

# Fetch existing events to avoid duplicates
cursor.execute("SELECT venue_id, start, event_link FROM shows")
existing_events = set(cursor.fetchall())

# Prepare rows for 'shows' table insertion, only if 'bands' is not empty
rows_to_add = []
for event in events_data:
    if event.get('start') and (event['venue_id'], event['start'], event['event_link']) not in existing_events:
        print(f"Adding event to rows_to_add: {event}")
        rows_to_add.append((
            venue_id,
            event['bands'],
            event['start'],
            event['event_link'],
            event['flyer_image']
        ))

# Insert rows if they exist
if rows_to_add:
    insert_query = """
    INSERT INTO shows (venue_id, bands, start, event_link, flyer_image)
    VALUES (%s, %s, %s, %s, %s)
    """
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the shows table.")
else:
    print("No new events to add to the shows table.")

# Close the database connection
cursor.close()
conn.close()

print("Events processed and added to the database.")