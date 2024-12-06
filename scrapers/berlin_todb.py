import re
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from datetime import datetime
from db_utils import connect_to_db, insert_show, insert_band, link_band_to_show, get_venue_id
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Set ChromeDriver path
CHROMEDRIVER_PATH = '/usr/local/bin/chromedriver'  # Replace with the correct path to your ChromeDriver

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')  # Run Chrome in headless mode (no UI)
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

# Initialize WebDriver with Service
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=chrome_options)

# URL of the event page
url = 'https://www.berlinmpls.com/calendar'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'eventlist-event eventlist-event--upcoming eventlist-event--hasimg eventlist-hasimg is-loaded'))
    )
    print("Event cards loaded successfully.")
except Exception as e:
    print("Event cards did not load in time:", e)

# Parse page source with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
events = soup.find_all("article", class_="eventlist-event eventlist-event--upcoming eventlist-event--hasimg eventlist-hasimg is-loaded")
events_data = []

# Function to split band names
def split_band_names(band_string):
    return [b.strip() for b in re.split(r'\s*(?:,|w/|&|\+)\s*', band_string) if b.strip()]

# Process each event
for event in events:
    try:
        event_details = {}

        # Venue name
        event_details['venue'] = "Berlin"

        # Event bands and link
        h1_tag = event.find("h1", class_="eventlist-title")
        if h1_tag:
            a_tag = h1_tag.find("a", href=True)
            if a_tag:
                event_details['bands'] = a_tag.get_text(strip=True)
                event_details['event_link'] = "https://www.berlinmpls.com" + a_tag['href']
            else:
                event_details['bands'] = h1_tag.get_text(strip=True)
                event_details['event_link'] = None
        else:
            event_details['bands'] = None
            event_details['event_link'] = None



        # If event link exists, navigate to the event page to get flyer_image and datetime
            if event_details['event_link']:
                driver.get(event_details['event_link'])
                time.sleep(2)  # Adjust sleep time as needed for page load

                # Parse the event page
                event_soup = BeautifulSoup(driver.page_source, 'html.parser')

                print(event_soup.prettify())

                # Initialize flyer_image in event_details
                event_details['flyer_image'] = None

                # Extract flyer image
                image_wrapper = event_soup.find("div", class_="image-block-wrapper")
                if image_wrapper:
                    img_tag = image_wrapper.find("img", src=True)
                    event_details['flyer_image'] = img_tag['src'] if img_tag else None
                else:
                    event_details['flyer_image'] = None

                print(f"Flyer image found for {event_details['bands']}: {event_details['flyer_image']}")

                # Extract date and time
                try:
                    date_time_container = event_soup.find("ul", class_="eventitem-meta event-meta event-meta-date-time-container")
                    if date_time_container:
                        time_item = date_time_container.find("li", class_="eventitem-meta-item eventitem-meta-time event-meta-item")
                        if time_item:
                            time_span = time_item.find("time", class_="event-time-localized-start")
                            if time_span and time_span.get("datetime"):
                                event_details['start'] = datetime.fromisoformat(time_span["datetime"])
                            else:
                                print("Time span or datetime attribute missing.")
                                event_details['start'] = None
                        else:
                            print("Time item not found.")
                            event_details['start'] = None
                    else:
                        print("Date-time container not found.")
                        event_details['start'] = None
                except Exception as e:
                    print(f"Error extracting start date and time for {event_details['bands']}: {e}")
                    event_details['start'] = None
            else:
                event_details['flyer_image'] = None
                event_details['start'] = None
                print(f"No event link for {event_details['bands']}")

                print(f"Flyer image: {event_details['flyer_image']}, Start: {event_details['start']}")


        # Add the event to the data
        events_data.append(event_details)

    except Exception as e:
        print(f"Error processing event: {e}")

# Close the driver
driver.quit()

# Database connection
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for Berlin
venue_id = get_venue_id(cursor, "Berlin")

# Counters for summary
shows_added = 0
shows_skipped = 0
bands_added = 0
bands_skipped = 0

# Insert events into the database
for event_details in events_data:
    try:
        # Insert or update the show
        show_id, was_inserted = insert_show(
            cursor,
            venue_id=venue_id,
            bands=event_details['bands'],
            start=event_details.get('start'),  # Use .get() to avoid KeyError
            event_link=event_details['event_link'],
            flyer_image=event_details['flyer_image'],
        )
        if was_inserted:
            shows_added += 1
            print(f"Inserted new show with ID: {show_id}")
        else:
            shows_skipped += 1
            print(f"Skipped existing show with ID: {show_id}")

        # Process bands and link to the show
        for band_name in split_band_names(event_details['bands'] or ""):
            band_id, band_inserted = insert_band(cursor, band_name)
            if band_inserted:
                bands_added += 1
            else:
                bands_skipped += 1
            link_band_to_show(cursor, band_id, show_id)
    except Exception as e:
        print(f"Error processing event {event_details['bands']}: {e}")
        conn.rollback()

# Commit changes and close the connection
conn.commit()
cursor.close()
conn.close()

# Print summary
print(f"Events processed. Added: {shows_added}, Skipped: {shows_skipped}.")
print(f"Bands processed. Added: {bands_added}, Skipped: {bands_skipped}.")