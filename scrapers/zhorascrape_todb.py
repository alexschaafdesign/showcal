import re
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"  # replace with your database username
DB_PASSWORD = "notthesame"  # replace with your database password
DB_HOST = "localhost"  # or use your database host if it's hosted remotely

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://dice.fm/venue/zhora-darling-ql9y'
driver.get(url)

# Click "See all upcoming events" button
try:
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '.more_events a'))
    ).click()
except:
    print("The 'See all upcoming events' button was not found or clickable.")

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'event'))
    )
except:
    print("Event cards did not load in time.")

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Find all event cards
events = soup.find_all("div", class_="event")
events_data = []

# Loop through each event block
for event in events:
    # Initialize a dictionary to store the event details for each event
    event_details = {}

    # Find the event date within the top-level event class
    date_tag = event.find("div", class_="event-date")
    if date_tag:
        month_text = date_tag.find("span", class_="month").get_text(strip=True)
        day_text = date_tag.find("span", class_="date").get_text(strip=True)
        
        month_mapping = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
            "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
            "Nov": "11", "Dec": "12"
        }
        month = month_mapping.get(month_text, "N/A")
        year = "24" if month in ["11", "12"] else "25"
        event_details['date'] = f"{month}/{day_text}/{year}"
    else:
        event_details['date'] = 'N/A'

    # Set the venue for the event
    event_details['venue'] = "331 Club"

    # Find the event-content div within each event
    event_content = event.find("div", class_="event-content")
    if not event_content:
        continue  # Skip if no event-content is found

    # Find the columns div within event-content
    columns_div = event_content.find("div", class_="columns")
    if not columns_div:
        continue  # Skip if there are no event columns found

    # Loop through each column in columns_div to get individual events
    for column in columns_div.find_all("div", class_="column"):
        # Extract main event name and supporting acts
        p_tag = column.find("p")
        if p_tag:
            full_text = p_tag.get_text(separator="\n", strip=True).split("\n")

            # The first line is the main event name
            event_details['name'] = full_text[0].strip()

            # Check if there's a time in the last line
            time_match = re.search(r'(\d{1,2}(:\d{2})?\s?[ap]m)', full_text[-1], re.IGNORECASE)
            if time_match:
                event_time = time_match.group(0).lower()
                if ':' not in event_time:
                    event_time = event_time.replace("am", ":00 am").replace("pm", ":00 pm")
                else:
                    event_time = re.sub(r'(\d+:\d{2})\s?(am|pm)', r'\1 \2', event_time)
                event_details['time'] = event_time
                # Remove time from the last line if it's there
                full_text[-1] = re.sub(r'(\d{1,2}(:\d{2})?\s?[ap]m)', '', full_text[-1], flags=re.IGNORECASE).strip()
            else:
                event_details['time'] = 'N/A'

            # If there are additional lines, they are considered supporting acts
            if len(full_text) > 1:
                event_details['support'] = ', '.join(full_text[1:]).strip()
            else:
                event_details['support'] = 'N/A'
        else:
            event_details['name'] = "N/A"
            event_details['time'] = "N/A"
            event_details['support'] = "N/A"

        # Append the event to events_data
        events_data.append(event_details.copy())  # Use `.copy()` to avoid overwriting data in subsequent loops

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST
)
cursor = conn.cursor()

# Check if the table exists; create it if not
cursor.execute("""
    CREATE TABLE IF NOT EXISTS shows (
        venue TEXT,
        name TEXT,
        date TEXT,
        time TEXT,
        support TEXT
    );
""")

# Fetch existing events to avoid duplicates
cursor.execute("SELECT name, date, time FROM shows")
existing_events = set(cursor.fetchall())

# Update rows_to_add to include all columns
rows_to_add = [
    (
        event['venue'],
        event['name'],  # Assuming this is equivalent to 'headliner'
        event['date'],
        event['time'],
        event['support'],
        event.get('event_link', ''),  # Add a default empty string if key is missing
        event.get('flyer_image', ''),
        event.get('other_info', '')
    )
    for event in events_data
    if (event['name'], event['date'], event['time']) not in existing_events
]

# Insert new events into the database
if rows_to_add:
    # Correct INSERT statement based on the columns in shows
    insert_query = """
    INSERT INTO "shows" (venue, headliner, date, time, support, event_link, flyer_image, other_info)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""
    cursor.executemany(insert_query, rows_to_add)
    conn.commit()
    print(f"{len(rows_to_add)} new events added to the database.")
else:
    print("No new events to add. All entries are duplicates.")

# Close the database connection
cursor.close()
conn.close()

# Show notification when done
os.system('osascript -e \'display notification "331 Scrape finished!" with title "331 Scrape finished"\'')