import re
import datetime
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import psycopg2

# Database connection
conn = psycopg2.connect(
    dbname="tcup",
    user="aschaaf",
    password="notthesame",  # replace with your actual password
    host="localhost"
)
cursor = conn.cursor()

# Web scraper setup
driver = webdriver.Chrome()
driver.set_page_load_timeout(60)

# Load the URL and handle retries if needed
url = 'https://www.pilllar.com/pages/events'
try:
    print("Loading the URL...")
    driver.get(url)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
except Exception as e:
    print("Error loading page:", e)
    driver.quit()
    exit()

# Attempt to reveal hidden content if available
try:
    print("Attempting to expand hidden content...")
    more_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), '...')]")
    for button in more_buttons:
        driver.execute_script("arguments[0].click();", button)
        time.sleep(0.5)
except Exception:
    print("No expandable elements found or an error occurred.")

# Extract page source and parse with BeautifulSoup
print("Parsing page source...")
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event blocks
event_blocks = soup.find_all(class_='sse-row sse-clearfix')
events_data = []

# Track the current month based on the HTML structure
current_month = ""

# Loop through each event block to extract details
for block in event_blocks:
    event_details = {"venue": "Pilllar"}  # Default venue name if not provided

    # Look for a month header in each block
    month_tag = block.find('h1', class_='sse-size-42')
    if month_tag:
        current_month = month_tag.get_text(strip=True)

    # Extract date and handle missing dates
    date_tag = block.find('h1', class_='sse-size-64')
    if date_tag:
        day_info = date_tag.get_text(strip=True)
        cleaned_date = re.sub(r'\b(\w+)\.\s+', '', day_info)
        event_details['date'] = f"{current_month} {cleaned_date} {datetime.datetime.now().year}"
        # Format date if available
        try:
            event_date = datetime.datetime.strptime(event_details['date'], "%B %d %Y")
            event_details['date'] = event_date.strftime("%m/%d/%Y")
        except ValueError:
            event_details['date'] = None
    else:
        event_details['date'] = None

    # Extract event name
    name_tag = block.find('span', style=re.compile(r'font-size:\s*24px'))
    event_details['headliner'] = name_tag.get_text(strip=True) if name_tag else None

    # Set a fixed time or None if unavailable
    event_details['time'] = "18:30"

    # Combine date and time into `start` for database insertion
    try:
        if event_details['date'] and event_details['time']:
            event_details['start'] = datetime.datetime.strptime(
                f"{event_details['date']} {event_details['time']}", "%m/%d/%Y %H:%M"
            )
            print(f"Parsed start datetime: {event_details['start']} for event: {event_details['headliner']}")
        else:
            print(f"Missing date or time for event: {event_details['headliner']}")
            event_details['start'] = None
    except ValueError as ve:
        print(f"Error parsing start datetime for event '{event_details['headliner']}': {ve}")
        event_details['start'] = None

    # Extract support acts
    support_tag = name_tag.find_next('p') if name_tag else None
    event_details['support'] = support_tag.get_text(strip=True) if support_tag else None

    # Optional: Add additional fields, like 'link' and 'image', if they’re on the page
    link_tag = block.find('a', href=True)
    event_details['link'] = link_tag['href'] if link_tag else None

    # Extract image URL from the specific 'sse-column sse-half sse-center' div
    image_div = block.find('div', class_='sse-column sse-half sse-center')
    if image_div:
        image_tag = image_div.find('img')
        event_details['image'] = image_tag['src'] if image_tag else None
    else:
        event_details['image'] = None

    # Append the event details to the list
    events_data.append(event_details)

print(f"Extracted {len(events_data)} events.")

# Define counters for added and skipped events
added_count = 0
duplicate_count = 0
missing_start_count = 0

# Define the function to check if an event already exists in the database
def check_duplicate_event(event_details):
    if event_details['start'] is None:
        return False
    check_query = """
        SELECT 1 FROM "shows"
        WHERE start = %s AND venue = %s AND headliner = %s
    """
    cursor.execute(check_query, (
        event_details['start'],
        event_details['venue'], 
        event_details['headliner']
    ))
    return cursor.fetchone() is not None  # Returns True if a duplicate exists

# Define the function to insert events into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "shows" (venue, headliner, start, support, event_link, flyer_image)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        event_details.get('venue'),
        event_details.get('headliner'),
        event_details.get('start'),
        event_details.get('support'),
        event_details.get('link'),
        event_details.get('image')
    ))
    conn.commit()

# Insert all extracted events into the database
for event in events_data:
    # Skip events with no start datetime
    if not event.get('start'):
        print(f"Skipping event '{event.get('headliner')}' due to missing start datetime.")
        missing_start_count += 1
        continue
    
    # Check for duplicates before inserting
    if check_duplicate_event(event):
        print(f"Duplicate event '{event['headliner']}' found. Skipping insert.")
        duplicate_count += 1
    else:
        try:
            insert_event(event)
            added_count += 1
            print(f"Inserted event: {event['headliner']}")
        except Exception as e:
            print(f"Error inserting event {event['headliner']}: {e}")

# Close the database connection
cursor.close()
conn.close()

# Print summary of added and skipped events
print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}, Missing start datetime: {missing_start_count}.")