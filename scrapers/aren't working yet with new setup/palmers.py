import re
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime
from selenium.webdriver.chrome.options import Options
from dateutil.parser import parse
import time
from selenium.common.exceptions import TimeoutException

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Initialize WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=chrome_options)
driver.delete_all_cookies()
url = 'https://palmers-bar.com/?view=calendar&month=11-2024'

# Retry logic for loading the page
retry_count = 5
timeout = 90

for attempt in range(retry_count):
    try:
        driver.get(url)
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'yui3-calendar-row'))
        )
        print("Event calendar loaded successfully.")
        break
    except TimeoutException:
        print(f"Attempt {attempt + 1} failed: Timeout occurred while loading calendar.")
        if attempt < retry_count - 1:
            time.sleep(5)
        else:
            print("Event calendar did not load in time after multiple attempts.")
            driver.quit()
            exit()
    except Exception as e:
        print(f"Attempt {attempt + 1} failed: {e}")
        if attempt < retry_count - 1:
            time.sleep(5)
        else:
            print("Event calendar did not load in time.")
            driver.quit()
            exit()

# Parse the page source
soup = BeautifulSoup(driver.page_source, 'html.parser')
events_data = []

calendar_body = soup.find("div", class_="yui3-u-1")
if calendar_body:
    weeks = calendar_body.find_all("tr", class_="yui3-calendar-row")
    print(f"Found {len(weeks)} week rows in the calendar.")

    for week in weeks:
        days = week.find_all("td", class_=lambda x: x and "yui3-calendar-day" in x)
        print(f"Found {len(days)} days in this week.")

        for day in days:
            # Check if day has an event
            if "has-event" in day.get("class", []):
                print("Found a day with events.")
                
                # Locate the event list within the day
                event_list = day.find("ul", class_="itemlist itemlist--iseventscollection")
                if event_list:
                    event_items = event_list.find_all("li", class_="item")
                    print(f"Found {len(event_items)} events on this day.")
                    
                    for event_item in event_items:
                        link_tag = event_item.find("a", class_="item-link", href=True)
                        if link_tag:
                            event_url = link_tag['href']
                            full_event_url = f"https://palmers-bar.com{event_url}"
                            print(f"Found event URL: {full_event_url}")

                            # Navigate to individual event page
                            driver.get(full_event_url)
                            WebDriverWait(driver, 30).until(
                                EC.presence_of_element_located((By.CLASS_NAME, 'sqs-events-collection-item'))
                            )
                            print(f"Loaded event page: {full_event_url}")

                            # Parse the event page for details
                            event_soup = BeautifulSoup(driver.page_source, 'html.parser')
                            event_details = {'venue': "Palmer's Bar", 'event_link': full_event_url}

                            # Extract bands
                            title_tag = event_soup.find("h1", class_="eventitem-title")
                            if title_tag:
                                event_details['bands'] = title_tag.get_text(strip=True)
                                print(f"Extracted band name: {event_details['bands']}")
                            else:
                                print("Band title not found.")
                                event_details['bands'] = "N/A"
                            
                            # Extract date and time
                            date_time_main_container = event_soup.find("div", class_="eventitem-column-meta")
                            if date_time_main_container:
                                date_time_container = date_time_main_container.find("ul", class_="eventitem-meta event-meta event-meta-date-time-container")
                                if date_time_container:
                                    date_tag = date_time_container.find("time", class_="event-date")
                                    time_tag = date_time_container.find("time", class_="event-time-12hr-start")

                                    if date_tag and time_tag:
                                        date_text = date_tag.get("datetime", "")
                                        time_text = time_tag.get_text(strip=True)
                                        date_time_text = f"{date_text} {time_text}"
                                        print(f"Raw date and time text: {date_time_text}")
                                        try:
                                            event_datetime = parse(date_time_text)
                                            event_details['start'] = event_datetime
                                            print(f"Parsed start datetime: {event_details['start']}")
                                        except (ValueError, TypeError) as e:
                                            print(f"Error parsing date and time for event: {date_time_text} - {e}")
                                            event_details['start'] = None
                                    else:
                                        print("Time or date tag not found.")
                                        event_details['start'] = None
                                else:
                                    print("Date and time container not found.")
                                    event_details['start'] = None
                            else:
                                print("Top-level date and time container not found.")
                                event_details['start'] = None

                            # Add parsed event to events_data
                            events_data.append(event_details)
                            print(f"Parsed event details: {event_details}")
                else:
                    print("Event list not found in the day with 'has-event' class.")
else:
    print("Calendar tbody not found.")

# Print out all events data collected
print("\nAll collected events data from Palmers site:")
for event in events_data:
    print(event)

# Connect to the PostgreSQL database
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST
    )
    cursor = conn.cursor()
    print("Connected to the database.")
except Exception as e:
    print(f"Failed to connect to the database: {e}")
    exit()

# Insert events into the database
for event in events_data:
    bands = event['bands']
    if bands:
        for band in bands.split(','):
            band = band.strip()
            cursor.execute("SELECT id FROM bands WHERE band = %s", (band,))
            existing_band = cursor.fetchone()

            if not existing_band:
                cursor.execute("INSERT INTO bands (band) VALUES (%s) RETURNING id", (band,))
                band_id = cursor.fetchone()[0]
                print(f"Inserted new band: {band} with id {band_id}")
            else:
                print(f"Band already exists: {band}")

        cursor.execute("""
            INSERT INTO shows (venue, bands, event_link, start)
            VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING
        """, (event['venue'], event['bands'], event['event_link'], event['start']))
        print(f"Inserted show for bands {bands} at venue {event['venue']} with start time {event['start']}")

# Commit changes and close the connection
conn.commit()
cursor.close()
conn.close()
print("Database insertion complete.")

# Close the driver
driver.quit()