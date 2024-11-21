import re
import os
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import psycopg2
from datetime import datetime

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

# Initialize WebDriver
driver = webdriver.Chrome()
url = 'https://331club.com/#calendar'
driver.get(url)

# Click "See all upcoming events" button
try:
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '.more_events a'))
    ).click()
    print("Clicked 'See all upcoming events' button.")
except Exception as e:
    print(f"Error clicking 'See all upcoming events' button: {e}")

# Wait for event cards to load
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'event'))
    )
    print("Event cards loaded.")
except Exception as e:
    print(f"Event cards did not load in time: {e}")

# Extract page source and parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

# Initialize the events_data list
events_data = []

# Find all event cards
events = soup.find_all("div", class_="event")
print(f"Found {len(events)} events.")

# Function to parse the bands field and extract social links
def parse_bands_and_links(p_tag):
    bands = []
    band_links = {}
    for element in p_tag.contents:
        if element.name == "a":  # If it's a hyperlink
            band_name = element.get_text(strip=True)
            band_link = element.get("href", "").strip()
            if is_valid_band_name(band_name):  # Validate the band name
                bands.append(band_name)
                band_links[band_name] = band_link  # Map band name to its link
            else:
                print(f"Skipping invalid band name: {band_name}")
        elif element.string and element.string.strip():  # If it's plain text
            band_name = element.string.strip()
            if is_valid_band_name(band_name):  # Validate the band name
                bands.append(band_name)
                band_links[band_name] = None  # No link available
            else:
                print(f"Skipping invalid band name: {band_name}")
    return clean_band_list(bands), band_links

# Helper function to clean band names
def clean_band_list(bands):
    cleaned_bands = []
    for band in bands:
        # Skip entries that look like time strings (e.g., "9:30 pm")
        if re.match(r"^\d{1,2}:\d{2}\s?(am|pm)?$", band, re.IGNORECASE):
            print(f"Skipping time entry in bands: {band}")
            continue
        # Clean up band name (e.g., remove unnecessary quotes or brackets)
        cleaned_band = band.strip("\"'")
        cleaned_bands.append(cleaned_band)
    return cleaned_bands

# Helper function to validate band names
def is_valid_band_name(band_name):
    # List of placeholder names to skip
    placeholders = {"tba", "unknown", "n/a", "none"}
    # Normalize the band name to lowercase for comparison
    normalized_band_name = band_name.strip().lower()

    # Ignore empty strings, single characters, numeric entries, or placeholders
    if not band_name or len(band_name) < 2:
        return False
    if band_name.isdigit():  # Skip numeric entries
        return False
    if normalized_band_name in placeholders:  # Skip placeholder names
        print(f"Skipping placeholder band name: {band_name}")
        return False
    return True

# Process each event card
for event in events:
    event_details = {}

    # Extract the event date
    date_tag = event.find("div", class_="event-date")
    if date_tag:
        try:
            month_text = date_tag.find("span", class_="month").get_text(strip=True)
            day_text = date_tag.find("span", class_="date").get_text(strip=True)
            month_mapping = {
                "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
                "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
                "Nov": "11", "Dec": "12"
            }
            month = month_mapping.get(month_text, "N/A")
            year = "2024" if month in ["11", "12"] else "2025"
            event_details['date'] = f"{year}-{month}-{int(day_text):02d}"
            print(f"Extracted date: {event_details['date']}")
        except Exception as e:
            print(f"Error parsing date: {e}")
            event_details['date'] = "N/A"
    else:
        event_details['date'] = "N/A"
        print("No date found for this event.")

    # Set the venue
    event_details['venue'] = "331 Club"

# Extract bands and time
p_tag = event.find("p")
if p_tag:
    try:
        # Extract and clean time from the last line
        full_text = p_tag.get_text(separator="\n", strip=True).split("\n")
        print(f"Raw full_text from <p>: {full_text}")  # Debug: log raw text

        # Match the last line for time using regex
        time_match = re.search(r'(\d{1,2}(:\d{2})?\s?[ap]\.?m\.?)', full_text[-1], re.IGNORECASE)
        if time_match:
            event_time = time_match.group(0).lower()
            event_time = re.sub(r'\.(?=m)', '', event_time)  # Remove extra dots (e.g., "p.m.")
            full_text.pop()  # Remove the time from the bands list
            event_details['time'] = event_time
            print(f"Extracted time: {event_details['time']}")
        else:
            event_details['time'] = "N/A"
            print("No valid time found in this event.")

        # Parse bands and links
        bands, band_links = parse_bands_and_links(p_tag)
        event_details['bands'] = bands
        event_details['band_links'] = band_links
        print(f"Extracted bands: {event_details['bands']}")
    except Exception as e:
        print(f"Error parsing bands and time: {e}")
        event_details['bands'] = []
        event_details['band_links'] = {}
        event_details['time'] = "N/A"
else:
    event_details['bands'] = []
    event_details['band_links'] = {}
    event_details['time'] = "N/A"
    print("No <p> tag found for this event.")

    # Combine date and time
    try:
        if event_details['date'] != "N/A" and event_details['time'] != "N/A":
            event_details['start'] = datetime.strptime(
                f"{event_details['date']} {event_details['time']}",
                "%Y-%m-%d %I:%M %p"
            )
            print(f"Combined start datetime: {event_details['start']}")
        else:
            event_details['start'] = None
            print("Skipping event due to missing date or time.")
    except ValueError as e:
        print(f"Error combining date and time for event: {e}")
        event_details['start'] = None

    # Add event details to the list
    events_data.append(event_details)

# Connect to PostgreSQL and process events_data
try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST
    )
    cursor = conn.cursor()

    # Create tables if they don't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shows (
            id SERIAL PRIMARY KEY,
            venue TEXT,
            start TIMESTAMP,
            bands TEXT[],  -- Store bands as an array
            event_link TEXT
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bands (
            id SERIAL PRIMARY KEY,
            band TEXT,  -- Individual band name
            social_links TEXT,  -- Social media link for the band
            show_id INTEGER REFERENCES shows(id)
        );
    """)

    # Insert events and bands with debug logs
    for event in events_data:
        print(f"Processing event: {event}")  # Log the full event details

        if event['start']:
            try:
                # Insert the show
                print(f"Inserting show: {event['venue']} on {event['start']}")
                cursor.execute("""
                    INSERT INTO shows (venue, start, bands, event_link)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (event['venue'], event['start'], event['bands'], event.get('event_link', '')))
                show_id = cursor.fetchone()[0]
                print(f"Inserted show ID: {show_id}")

                # Insert or update bands
                for band in event['bands']:
                    social_link = event['band_links'].get(band)
                    social_link = json.dumps({"url": social_link}) if social_link else json.dumps(None)

                    # Check if the band exists
                    cursor.execute("SELECT id, social_links FROM bands WHERE band = %s;", (band,))
                    existing_band = cursor.fetchone()
                    if existing_band:
                        print(f"Band {band} already exists.")
                        existing_band_id, existing_social_links = existing_band
                        # Update social_links if necessary
                        if existing_social_links is None and social_link != json.dumps(None):
                            print(f"Updating social links for band: {band}")
                            cursor.execute("""
                                UPDATE bands
                                SET social_links = %s
                                WHERE id = %s;
                            """, (social_link, existing_band_id))
                            print(f"Updated social links for band: {band}")
                    else:
                        print(f"Inserting new band: {band}")
                        cursor.execute("""
                            INSERT INTO bands (band, social_links, show_id)
                            VALUES (%s, %s, %s);
                        """, (band, social_link, show_id))
                        print(f"Inserted new band: {band}")
            except Exception as e:
                print(f"Error inserting show or bands: {e}")
        else:
            print("Skipping event with no valid start time.")

    # Commit changes to the database
    try:
        conn.commit()
        print("Database updated successfully.")
    except Exception as e:
        print(f"Error committing changes: {e}")
except Exception as e:
    print(f"Database error: {e}")
finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
    print("Database connection closed.")