import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from db_utils import connect_to_db, insert_show, insert_band, link_band_to_show, get_venue_id

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.greenroommn.com/events#/events'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'vp-event-card'))
    )
except Exception as e:
    print(f"Error waiting for event cards: {e}")
    driver.quit()
    exit()

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
event_cards = soup.find_all(class_='vp-event-card')

# Connect to the database
conn = connect_to_db()
cursor = conn.cursor()

# Get venue ID for "Green Room"
try:
    venue_id = get_venue_id(cursor, "Green Room")
except ValueError as e:
    print(e)
    conn.close()
    exit()

# Counters for added, updated, and skipped events
added_count = 0
updated_count = 0
duplicate_count = 0

# Current year for events
current_year = datetime.now().year

# Loop through each event card to extract details and process
for card in event_cards:
    # Extract event details
    name_tag = card.find(class_='vp-event-name')
    date_tag = card.find(class_='vp-date')
    time_tag = card.find(class_='vp-time')
    support_tag = card.find(class_='vp-support')
    
    event_name = name_tag.get_text(strip=True) if name_tag else "N/A"
    event_date = date_tag.get_text(strip=True) if date_tag else "N/A"
    event_time = time_tag.get_text(strip=True) if time_tag else "N/A"
    support = support_tag.get_text(strip=True) if support_tag else None

    # Extracting the show flyer
    flyer_image = None
    flyer_div = card.find(class_='vp-cover-img')  # Locate the div
    if flyer_div:
        # Check if the div contains an <img> tag with the flyer image
        img_tag = flyer_div.find('img')
        if img_tag and img_tag.has_attr('src'):
            flyer_image = img_tag['src']  # Extract the image URL
        else:
            # If no <img> tag, check for inline styles with background-image
            style_attr = flyer_div.get('style', '')
            match = re.search(r'url\((.*?)\)', style_attr)  # Extract URL from background-image
            if match:
                flyer_image = match.group(1).strip('\'"')  # Remove quotes around the URL
    print(f"Found show flyer: {flyer_image}")  # Print the flyer URL

    # Combine date and time into a single datetime object
    date_str = f"{event_date} {current_year}"
    try:
        start_datetime = datetime.strptime(f"{date_str} {event_time}", "%a %b %d %Y %I:%M %p")
    except ValueError as e:
        print(f"Skipping event due to date/time format issue: {event_name}. Error: {e}")
        continue

    # Process the show
    try:
        show_id, was_inserted = insert_show(cursor, venue_id, None, start_datetime, None, flyer_image, allow_update=True)
        if was_inserted:
            added_count += 1
            print(f"Inserted event: {event_name} on {start_datetime}")
        else:
            if flyer_image:  # Flyer updated
                updated_count += 1
                print(f"Updated event with flyer: {event_name} on {start_datetime}")
            else:
                duplicate_count += 1
                print(f"Duplicate event found (no update needed): {event_name} on {start_datetime}")

        # Process support bands if present
        if support:
            support_bands = [band.strip() for band in re.split(r',|&|with', support) if band.strip()]
            for band_name in support_bands:
                band_id = insert_band(cursor, band_name)
                link_band_to_show(cursor, band_id, show_id)

    except Exception as e:
        print(f"Error processing event: {event_name}. Error: {e}")
        conn.rollback()  # Rollback on error to maintain consistency
        continue

# Commit all changes to the database
conn.commit()

# Close the database connection
cursor.close()
conn.close()

# Print summary of added, updated, and skipped events
print(f"All events processed. Added: {added_count}, Updated: {updated_count}, Duplicates skipped: {duplicate_count}.")