import time
import re
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from datetime import datetime
from db_utils import connect_to_db, insert_show, insert_band, link_band_to_show, get_venue_id

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.mortimerscalendar.com/'  # Replace with actual URL
driver.get(url)

# Wait for the main event list to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'li[data-hook="event-list-item"]'))
    )
    print("Event cards loaded successfully.")
except:
    print("Event cards did not load in time.")

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
events = soup.find_all("li", {"data-hook": "event-list-item"})
events_data = []
band_names = set()

# Counters
shows_added = 0
shows_skipped = 0
bands_added = 0
bands_skipped = 0

# Function to split band names based on custom rules
def split_band_names(band_string):
    bands = re.split(r'\s*(?:,|w/|&|\+)\s*', band_string)
    return [b.strip() for b in bands if b.strip()]

# Loop through each event item to click and extract details from individual event pages
for event in events:
    try:
        # Click on the "Details" button to go to the event's page
        details_button = event.find("a", {"data-hook": "ev-rsvp-button"})
        event_link = details_button['href']
        driver.get(event_link)
        time.sleep(2)  # Adjust sleep as needed for page load

        # Parse the event page with BeautifulSoup
        event_soup = BeautifulSoup(driver.page_source, 'html.parser')
        event_details = {}

        # Set the venue name
        event_details['venue'] = "Mortimer's"

        # Extract bands
        band_tag = event_soup.find("h1", class_="lEpN4c q198bJ fKdwAf")
        if band_tag:
            band_names_list = split_band_names(band_tag.get_text(strip=True))
            event_details['bands'] = ", ".join(band_names_list)
            band_names.update(band_names_list)
        else:
            event_details['bands'] = "N/A"

        # Extract date and time
        date_time_tag = event_soup.find("p", {"data-hook": "event-full-date", "class": "wJMJC7 zKq4yB"})
        if date_time_tag:
            date_time_text = date_time_tag.get_text(strip=True).split(" – ")[0]
            try:
                start_datetime = datetime.strptime(date_time_text, "%b %d, %Y, %I:%M %p")
                event_details['start'] = start_datetime
            except ValueError as e:
                print(f"Error parsing start date and time for event: {e}")
                event_details['start'] = None
        else:
            event_details['start'] = None

        # Extract show flyer using `data-hook="event-image"`
        flyer_img_tag = event_soup.find("div", {"data-hook": "event-image"})
        if flyer_img_tag:
            # Check for the highest resolution image
            wow_image_tag = flyer_img_tag.find("wow-image")
            if wow_image_tag and "data-image-info" in wow_image_tag.attrs:
                image_info = json.loads(wow_image_tag["data-image-info"])
                if "imageData" in image_info and "uri" in image_info["imageData"]:
                    # Construct the full URL
                    base_url = "https://static.wixstatic.com/media/"
                    flyer_file_name = image_info["imageData"]["uri"]
                    event_details['flyer_image'] = f"{base_url}{flyer_file_name}"
                    print(f"Found high-res show flyer: {event_details['flyer_image']}")
                else:
                    print("Could not find a high-res flyer URI in imageData.")
                    event_details['flyer_image'] = None
            else:
                img_tag = flyer_img_tag.find("img")
                if img_tag and "src" in img_tag.attrs:
                    event_details['flyer_image'] = img_tag["src"]
                    print(f"Found standard flyer: {event_details['flyer_image']}")
                else:
                    print("No flyer image found for this event.")
                    event_details['flyer_image'] = None
        else:
            event_details['flyer_image'] = None
            print("No flyer image section found for this event.")

        # Save event link
        event_details['event_link'] = event_link

        # Append event details to events_data
        events_data.append(event_details.copy())

        # Go back to the main event list page
        driver.back()
        time.sleep(2)

    except Exception as e:
        print("Failed to expand event details or retrieve event link:", e)
        continue

# Close the driver
driver.quit()

# Connect to the PostgreSQL database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for Mortimer's
venue_id = get_venue_id(cursor, "Mortimer's")

# Process each event
for event_details in events_data:
    try:
        # Insert or update the show
        show_id, was_inserted = insert_show(
            cursor,
            venue_id=venue_id,
            bands=event_details['bands'],
            start=event_details['start'],
            event_link=event_details['event_link'],
            flyer_image=event_details['flyer_image'],
            allow_update=True  # Allow updates to existing records
        )
        if was_inserted:
            shows_added += 1
            print(f"Inserted new show with ID: {show_id}")
        else:
            shows_skipped += 1
            print(f"Updated existing show with ID: {show_id}")

        # Process each band
        for band_name in split_band_names(event_details['bands']):
            band_id, band_inserted = insert_band(cursor, band_name)
            if band_inserted:
                bands_added += 1
            else:
                bands_skipped += 1
            link_band_to_show(cursor, band_id, show_id)

    except Exception as e:
        print(f"Error processing event: {event_details['bands']}. Error: {e}")
        conn.rollback()

# Commit all changes and close the connection
conn.commit()
cursor.close()
conn.close()

# Print summary
print(f"Events processed. Added: {shows_added}, Updated: {shows_skipped}.")
print(f"Bands processed. Added: {bands_added}, Skipped (duplicates): {bands_skipped}.")