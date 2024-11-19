import re
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://www.greenroommn.com/events#/events'
driver.get(url)

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'vp-event-card'))
    )
except:
    print("Event cards did not load in time.")

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
event_cards = soup.find_all(class_='vp-event-card')
events_data = []

# Current year for events
current_year = datetime.datetime.now().year

# Loop through each event card to extract details
for card in event_cards:
    event_details = {"venue": "Green Room"}  # Set Venue to "Green Room"
    
    # Extracting event details
    name_tag = card.find(class_='vp-event-name')
    event_details['name'] = name_tag.get_text(strip=True) if name_tag else 'N/A'
    date_tag = card.find(class_='vp-date')
    event_details['date'] = date_tag.get_text(strip=True) if date_tag else 'N/A'
    time_tag = card.find(class_='vp-time')
    event_details['time'] = time_tag.get_text(strip=True) if time_tag else 'N/A'
    support_tag = card.find(class_='vp-support')
    event_details['support'] = support_tag.get_text(strip=True) if support_tag else 'N/A'
    
    # Combine date and time into a single `start` datetime field
    date_str = f"{event_details['date']} {current_year}"
    time_str = event_details['time']
    try:
        # Parse the combined `date` and `time` into a datetime object
        event_details['start'] = datetime.datetime.strptime(f"{date_str} {time_str}", "%a %b %d %Y %I:%M %p")
    except ValueError as e:
        print(f"Skipping event due to date/time format issue: {event_details}. Error: {e}")
        event_details['start'] = None  # Set to None if parsing fails

    events_data.append(event_details)

# Set up PostgreSQL connection
conn = psycopg2.connect(
    dbname="tcup",  # Database name
    user="aschaaf",   # Database username
    password="notthesame",  # Database password
    host="localhost",  # Database host
    port="5432"  # PostgreSQL default port
)

cursor = conn.cursor()

# Check if the table exists; create it if not
cursor.execute("""
    CREATE TABLE IF NOT EXISTS "shows" (
        venue TEXT,
        headliner TEXT,
        start TIMESTAMP,
        support TEXT
    );
""")

# Counters for added and skipped events
added_count = 0
duplicate_count = 0

# Insert events into the database with duplicate check
for event_details in events_data:
    if event_details['start'] is not None:
        # Check for duplicates based on `name` and `start`
        duplicate_check_query = """
            SELECT 1 FROM "shows"
            WHERE headliner = %s AND start = %s
        """
        cursor.execute(duplicate_check_query, (event_details['name'], event_details['start']))
        
        # If no duplicate found, insert the event
        if cursor.fetchone() is None:
            insert_query = """
                INSERT INTO "shows" (venue, headliner, start, support)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                event_details['venue'],
                event_details['name'],
                event_details['start'],
                event_details['support']
            ))
            conn.commit()
            added_count += 1
            print(f"Inserted event: {event_details['name']} on {event_details['start']}")
        else:
            duplicate_count += 1
            print(f"Duplicate event found: {event_details['name']} on {event_details['start']}, skipping insertion.")
    else:
        print(f"Event missing valid start datetime, skipping: {event_details}")

# Close the database connection
cursor.close()
conn.close()

# Print summary of added and skipped events
print(f"All events processed. Added: {added_count}, Duplicates skipped: {duplicate_count}.")