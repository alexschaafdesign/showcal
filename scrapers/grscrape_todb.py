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
    
    events_data.append(event_details)

# Set up PostgreSQL connection
conn = psycopg2.connect(
    dbname="venues",  # Database name
    user="aschaaf",   # Database username
    password="notthesame",  # Database password
    host="localhost",  # Database host
    port="5432"  # PostgreSQL default port
)

cursor = conn.cursor()

# Function to insert event into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "Show Calendar" (venue, headliner, date, time, support)
        VALUES (%s, %s, %s, %s, %s)
    """
    
    date_str = f"{event_details['date']} {current_year}"
    time_str = event_details['time']
    
    try:
        # Adjust the time format parsing to expect 24-hour format
        start_time = datetime.datetime.strptime(f"{date_str} {time_str}", "%a %b %d %Y %I:%M %p")
        
        # Format the date as MM/DD/YYYY
        formatted_date = start_time.strftime('%m/%d/%Y')
        formatted_time = start_time.strftime('%H:%M')
        
        # Insert the event into the database
        cursor.execute(insert_query, (
            event_details['venue'],
            event_details['name'],
            formatted_date,
            formatted_time,
            event_details['support']
        ))
        conn.commit()
        print(f"Inserted event: {event_details['name']} on {formatted_date} at {time_str}")
    
    except ValueError as e:
        print(f"Skipping event due to date/time format issue: {event_details}. Error: {e}")

# Insert all extracted events into the database
for event in events_data:
    insert_event(event)

# Close the database connection
cursor.close()
conn.close()
print("All events processed and added to the database.")