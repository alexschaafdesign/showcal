import re
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, get_venue_id

# Set ChromeDriver path
CHROMEDRIVER_PATH = '/usr/local/bin/chromedriver'  # Replace with your ChromeDriver path

# Configure Chrome options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

# Initialize WebDriver
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=chrome_options)

# URL of the event page
url = 'https://www.berlinmpls.com/calendar'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'eventlist-event--upcoming'))
    )
    print("Event cards loaded successfully.")
except Exception as e:
    print(f"Error waiting for event cards: {e}")
    driver.quit()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
event_cards = soup.find_all("article", class_="eventlist-event--upcoming")

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for Berlin
try:
    venue_id = get_venue_id(cursor, "Berlin")
except ValueError as e:
    print(e)
    conn.close()
    exit()

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Function to split and clean band names
def split_band_names(band_string):
    return [b.strip() for b in re.split(r'\s*(?:,|w/|&|\+)\s*', band_string) if b.strip()]

# Process each event card
for card in event_cards:
    # Extract event details
    event_name = None
    event_date = None
    event_time = None
    event_link = None
    flyer_image = None
    bands = []

    h1_tag = card.find("h1", class_="eventlist-title")
    if h1_tag:
        a_tag = h1_tag.find("a", href=True)
        if a_tag:
            event_name = a_tag.get_text(strip=True)
            event_link = "https://www.berlinmpls.com" + a_tag['href']
        else:
            event_name = h1_tag.get_text(strip=True)

    # Navigate to event page for additional details
    if event_link:
        driver.get(event_link)
        time.sleep(2)
        event_soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Extract flyer image
        image_wrapper = event_soup.find("div", class_="image-block-wrapper")
        if image_wrapper:
            img_tag = image_wrapper.find("img", src=True)
            if img_tag:
                flyer_image = img_tag['src']

        # Extract date and time
        date_time_container = event_soup.find("ul", class_="eventitem-meta")
        if date_time_container:
            time_item = date_time_container.find("li", class_="eventitem-meta-time")
            if time_item:
                time_span = time_item.find("time", class_="event-time-localized-start")
                if time_span and time_span.get("datetime"):
                    event_date_time = datetime.fromisoformat(time_span["datetime"])
                    event_date = event_date_time.strftime("%Y-%m-%d")
                    event_time = event_date_time.strftime("%H:%M")

    # Combine date and time into a single datetime object
    try:
        start = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
    except ValueError as e:
        print(f"Skipping event due to date/time format issue: {event_name}. Error: {e}")
        continue

    # Extract bands
    if event_name:
        bands.append(event_name)
    support_tag = card.find(class_="vp-support")
    if support_tag:
        additional_bands = split_band_names(support_tag.get_text(strip=True))
        bands.extend(additional_bands)

    # Remove duplicates and clean band names
    bands = list(dict.fromkeys([band.strip() for band in bands]))

    # Process the show
    try:
        show_id, was_inserted = insert_show(conn, cursor, venue_id, ", ".join(bands), start, event_link, flyer_image)
        if was_inserted:
            added_count += 1
            print(f"Inserted event: {event_name} on {start}")
        else:
            duplicate_count += 1
            print(f"Duplicate event found: {event_name} on {start}")
    except Exception as e:
        print(f"Error processing event: {event_name}. Error: {e}")
        conn.rollback()

# Commit all changes to the database
conn.commit()
cursor.close()
conn.close()

# Print summary
print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}.")