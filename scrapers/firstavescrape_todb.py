import requests
from bs4 import BeautifulSoup
from datetime import datetime
import psycopg2
import json

# Database connection
conn = psycopg2.connect(
    dbname="tcup",
    user="aschaaf",
    password="notthesame",  # Replace with your actual password
    host="localhost"
)
cursor = conn.cursor()

# Counters for added and skipped events
added_count = 0
skipped_count = 0

# Function to insert event data into the shows table with duplicate check
def insert_event_to_shows(event_details):
    global added_count, skipped_count

    if event_details['start']:
        try:
            # Duplicate check for shows
            duplicate_check_query = """
                SELECT 1 FROM "shows"
                WHERE venue = %s AND start = %s
            """
            cursor.execute(duplicate_check_query, (
                event_details['Venue'],
                event_details['start']
            ))

            if cursor.fetchone() is None:
                insert_query = """
                    INSERT INTO "shows" (start, venue, bands, event_link)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(insert_query, (
                    event_details['start'],
                    event_details['Venue'],
                    event_details['bands'],
                    event_details['Event Link']
                ))
                conn.commit()
                added_count += 1
                print(f"Inserted event: {event_details['bands']}")
            else:
                skipped_count += 1
                print(f"Duplicate event found: {event_details['bands']}, skipping insertion.")
        except Exception as e:
            conn.rollback()
            print(f"Error inserting event {event_details['bands']}: {e}")
    else:
        skipped_count += 1
        print(f"Skipping event due to missing start: {event_details}")

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()
            if ':' in time_str:
                hour, minute = time_str[:-2].split(':')
            else:
                hour = time_str[:-2]
                minute = '00'
            hour = int(hour) % 12
            if 'PM' in time_str:
                hour += 12
            return f"{hour:02}:{minute}"
        return '00:00'
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'

# Function to get event time from the event's individual page
def get_event_time(event_url):
    print(f"Fetching event time from: {event_url}")
    response = requests.get(event_url)
    if response.status_code == 200:
        event_soup = BeautifulSoup(response.content, 'html.parser')
        show_details = event_soup.find('div', class_='show_details text-center')
        if show_details:
            for item in show_details.find_all('div', class_='col-6 col-md'):
                header = item.find('h6')
                if header and "Show Starts" in header.get_text(strip=True):
                    time_tag = item.find('h2')
                    time_text = time_tag.get_text(strip=True) if time_tag else 'N/A'
                    print(f"Found Show Starts time: {time_text}")
                    return convert_time_to_24_hour_format(time_text)
    print("Could not find Show Starts time.")
    return 'N/A'            

# Function to fetch and extract social media links for a specific band
def get_links_for_band(band_element):
    links = {}
    social_links_section = band_element.find('div', class_='col-md-auto social_links_col')

    if social_links_section:
        social_items = social_links_section.find_all('a', class_='social_icon')
        for item in social_items:
            link = item.get('href')
            platform = item.get('title', '').lower()

            if not platform:
                platform = item.find('i')['class'][0] if item.find('i') else ''

            if platform:
                platform = platform.replace('zocial-', '')

            if link:
                links[platform] = link
                print(f"Found {platform} link for specific band: {link}")
    return links

# Function to get band names and individual social links from the event page
def get_bands_with_links_from_event_page(event_url):
    bands_with_links = []
    print(f"Fetching band names and links from: {event_url}")
    response = requests.get(event_url)

    if response.status_code == 200:
        event_soup = BeautifulSoup(response.content, 'html.parser')
        
        performer_items = event_soup.find_all('div', class_='performer_list_item')
        
        for item in performer_items:
            band_name_element = item.find('div', class_='performer_content_col')
            if band_name_element:
                band = band_name_element.find('h2')
                if band:
                    band_name = band.get_text(strip=True)
                    social_links = get_links_for_band(item)
                    bands_with_links.append((band_name, social_links))
                    print(f"Band found: {band_name} with links: {social_links}")
    else:
        print(f"Failed to retrieve band data from {event_url}. Status code: {response.status_code}")

    return bands_with_links

# Function to insert band and social links into the bands table with duplicate check
def insert_band_to_bands(band_name, social_links):
    try:
        duplicate_check_query = """
            SELECT 1 FROM "bands" WHERE band = %s
        """
        cursor.execute(duplicate_check_query, (band_name,))
        
        if cursor.fetchone() is None:
            insert_query = """
                INSERT INTO "bands" (band, social_links)
                VALUES (%s, %s)
            """
            cursor.execute(insert_query, (band_name, json.dumps(social_links)))
            conn.commit()
            print(f"Inserted band: {band_name}")
        else:
            print(f"Duplicate band found: {band_name}, skipping insertion.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting band {band_name}: {e}")

# Function to fetch and process events from the given URL
def fetch_and_process_events(url):
    global added_count, skipped_count

    print(f"Sending request to {url}...")
    response = requests.get(url)

    if response.status_code == 200:
        print("Request successful. Parsing shows...")
        soup = BeautifulSoup(response.content, 'html.parser')

        for show in soup.find_all('div', class_='show_list_item'):
            date_container = show.find('div', class_='date_container')
            month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
            day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
            
            month_mapping = {
                "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
                "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
                "Nov": "11", "Dec": "12"
            }
            month_number = month_mapping.get(month, "N/A")
            year = 2024 if month_number in ["11", "12"] else 2025

            event_date = f"{year}-{month_number}-{int(day):02d}"
            print(f"Extracted date: {event_date}")

            venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
            event_link = show.find('a')['href'] if show.find('a') else None
            event_url = event_link if event_link and event_link.startswith('http') else f"https://first-avenue.com{event_link}" if event_link else 'N/A'

            event_time = get_event_time(event_url)
            try:
                start_datetime = datetime.strptime(f"{event_date} {event_time}", "%Y-%m-%d %H:%M")
                print(f"Combined start datetime: {start_datetime}")
            except ValueError as e:
                print(f"Error combining date and time: {e}")
                start_datetime = None

            # Process each band individually with their links
            bands_with_links = get_bands_with_links_from_event_page(event_url)

            event_details = {
                'start': start_datetime,
                'Venue': venue_name,
                'bands': ', '.join([band[0] for band in bands_with_links]),
                'Event Link': event_url
            }
            insert_event_to_shows(event_details)

            for band_name, social_links in bands_with_links:
                insert_band_to_bands(band_name, social_links)

    else:
        print(f"Failed to retrieve data from {url}. Status code: {response.status_code}")

# List of URLs for different months
urls = [
    'https://first-avenue.com/shows',  # URL for November
    'https://first-avenue.com/shows/?post_type=event&start_date=20241201',  # URL for December
    'https://first-avenue.com/shows/?post_type=event&start_date=20250101',  # URL for January
    'https://first-avenue.com/shows/?post_type=event&start_date=20250201',  # URL for February
    'https://first-avenue.com/shows/?post_type=event&start_date=20250301',  # URL for March
    'https://first-avenue.com/shows/?post_type=event&start_date=20250401',  # URL for April
    'https://first-avenue.com/shows/?post_type=event&start_date=20250501',  # URL for May
    'https://first-avenue.com/shows/?post_type=event&start_date=20250601',  # URL for June
    'https://first-avenue.com/shows/?post_type=event&start_date=20250701',  # URL for July
    'https://first-avenue.com/shows/?post_type=event&start_date=20250801',  # URL for August
]

# Cycle through the URLs
for url in urls:
    fetch_and_process_events(url)

# Close the database connection
cursor.close()
conn.close()

# Print summary of added and skipped events
print(f"All events processed. Added: {added_count}, Skipped (duplicates and missing start): {skipped_count}.")