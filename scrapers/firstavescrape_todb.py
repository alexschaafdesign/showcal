import requests
from bs4 import BeautifulSoup
import datetime
import psycopg2

# Database connection
conn = psycopg2.connect(
    dbname="venues",
    user="aschaaf",
    password="notthesame",  # replace with your actual password
    host="localhost"
)
cursor = conn.cursor()

# URL of the First Avenue shows page
url = 'https://first-avenue.com/shows/'

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()  # Normalize to uppercase
            if ':' in time_str:  # If time includes minutes
                hour, minute = time_str[:-2].split(':')
            else:  # Only hour specified
                hour = time_str[:-2]
                minute = '00'  # Default minutes to 00
            hour = int(hour) % 12  # Convert to 12-hour format
            if 'PM' in time_str:
                hour += 12  # Convert PM hour to 24-hour format
            return f"{hour:02}:{minute}"  # Return in HH:MM format
        return '00:00'  # Default if no time is found
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'  # Return default time in case of error

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

# Insert event data into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "Show Calendar" (date, venue, headliner, support, time, event_link)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        event_details['Date'],
        event_details['Venue'],
        event_details['Headline'],
        event_details['Support and other info'],
        event_details['Time'],
        event_details['Event Link']
    ))
    conn.commit()

# Send a GET request to the website
print(f"Sending request to {url}...")
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    print("Request successful. Parsing shows...")
    soup = BeautifulSoup(response.content, 'html.parser')

    # Month mapping for conversion
    month_mapping = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
        "Nov": "11", "Dec": "12"
    }

    # Find all shows
    for show in soup.find_all('div', class_='show_list_item'):
        print("Processing a show...")
        # Extract date
        date_container = show.find('div', class_='date_container')
        month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
        day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
        
        # Convert to YYYY-MM-DD format
        month_number = month_mapping.get(month, "N/A")
        event_date = f"2024-{month_number}-{int(day):02d}"  # Format to YYYY-MM-DD
        print(f"Extracted date: {event_date}")

        # Extract the venue name
        venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
        print(f"Extracted venue name: {venue_name}")

        # Extract the band names
        show_name_container = show.find('div', class_='show_name content flex-fill')
        
        # Get event name from the first <h4> tag found
        headline = show_name_container.find('h4').get_text(strip=True) if show_name_container.find('h4') else 'N/A'
        print(f"Extracted headline: {headline}")

        # Extract event link
        event_link = show.find('a')['href'] if show.find('a') else None
        if event_link:
            event_url = event_link if event_link.startswith('http') else f"https://first-avenue.com{event_link}"
        else:
            event_url = 'N/A'  # No link available
            print("No event link found.")

        # Extract event time
        event_time = get_event_time(event_url)

        # Find support bands from both <h5> and <h6> tags
        support_bands = []
        for tag in show_name_container.find_all(['h5', 'h6']):
            support_band = tag.get_text(strip=True)
            support_bands.append(support_band)

        # Join support bands ensuring spaces are added correctly
        support_info = ' & '.join(support_bands) if support_bands else 'N/A'

        # Prepare event details for database insertion
        event_details = {
            'Date': event_date,
            'Venue': venue_name,
            'Headline': headline,
            'Support and other info': support_info,
            'Time': event_time,
            'Event Link': event_url
        }

        # Insert event into the database
        try:
            insert_event(event_details)
            print(f"Inserted event: {headline}")
        except Exception as e:
            print(f"Error inserting event {headline}: {e}")

else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")

# Now scrape for the next month (December)

# URL of the First Avenue shows page
url = 'https://first-avenue.com/shows/?post_type=event&start_date=20241201'

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()  # Normalize to uppercase
            if ':' in time_str:  # If time includes minutes
                hour, minute = time_str[:-2].split(':')
            else:  # Only hour specified
                hour = time_str[:-2]
                minute = '00'  # Default minutes to 00
            hour = int(hour) % 12  # Convert to 12-hour format
            if 'PM' in time_str:
                hour += 12  # Convert PM hour to 24-hour format
            return f"{hour:02}:{minute}"  # Return in HH:MM format
        return '00:00'  # Default if no time is found
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'  # Return default time in case of error

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

# Insert event data into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "Show Calendar" (date, venue, headliner, support, time, event_link)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        event_details['Date'],
        event_details['Venue'],
        event_details['Headline'],
        event_details['Support and other info'],
        event_details['Time'],
        event_details['Event Link']
    ))
    conn.commit()

# Send a GET request to the website
print(f"Sending request to {url}...")
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    print("Request successful. Parsing shows...")
    soup = BeautifulSoup(response.content, 'html.parser')

    # Month mapping for conversion
    month_mapping = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
        "Nov": "11", "Dec": "12"
    }

    # Find all shows
    for show in soup.find_all('div', class_='show_list_item'):
        print("Processing a show...")
        # Extract date
        date_container = show.find('div', class_='date_container')
        month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
        day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
        
        # Convert to YYYY-MM-DD format
        month_number = month_mapping.get(month, "N/A")
        event_date = f"2024-{month_number}-{int(day):02d}"  # Format to YYYY-MM-DD
        print(f"Extracted date: {event_date}")

        # Extract the venue name
        venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
        print(f"Extracted venue name: {venue_name}")

        # Extract the band names
        show_name_container = show.find('div', class_='show_name content flex-fill')
        
        # Get event name from the first <h4> tag found
        headline = show_name_container.find('h4').get_text(strip=True) if show_name_container.find('h4') else 'N/A'
        print(f"Extracted headline: {headline}")

        # Extract event link
        event_link = show.find('a')['href'] if show.find('a') else None
        if event_link:
            event_url = event_link if event_link.startswith('http') else f"https://first-avenue.com{event_link}"
        else:
            event_url = 'N/A'  # No link available
            print("No event link found.")

        # Extract event time
        event_time = get_event_time(event_url)

        # Find support bands from both <h5> and <h6> tags
        support_bands = []
        for tag in show_name_container.find_all(['h5', 'h6']):
            support_band = tag.get_text(strip=True)
            support_bands.append(support_band)

        # Join support bands ensuring spaces are added correctly
        support_info = ' & '.join(support_bands) if support_bands else 'N/A'

        # Prepare event details for database insertion
        event_details = {
            'Date': event_date,
            'Venue': venue_name,
            'Headline': headline,
            'Support and other info': support_info,
            'Time': event_time,
            'Event Link': event_url
        }

        # Insert event into the database
        try:
            insert_event(event_details)
            print(f"Inserted event: {headline}")
        except Exception as e:
            print(f"Error inserting event {headline}: {e}")

else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")

# Now scrape for the next month (January)

# URL of the First Avenue shows page
url = 'https://first-avenue.com/shows/?post_type=event&start_date=20250101'

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()  # Normalize to uppercase
            if ':' in time_str:  # If time includes minutes
                hour, minute = time_str[:-2].split(':')
            else:  # Only hour specified
                hour = time_str[:-2]
                minute = '00'  # Default minutes to 00
            hour = int(hour) % 12  # Convert to 12-hour format
            if 'PM' in time_str:
                hour += 12  # Convert PM hour to 24-hour format
            return f"{hour:02}:{minute}"  # Return in HH:MM format
        return '00:00'  # Default if no time is found
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'  # Return default time in case of error

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

# Insert event data into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "Show Calendar" (date, venue, headliner, support, time, event_link)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        event_details['Date'],
        event_details['Venue'],
        event_details['Headline'],
        event_details['Support and other info'],
        event_details['Time'],
        event_details['Event Link']
    ))
    conn.commit()

# Send a GET request to the website
print(f"Sending request to {url}...")
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    print("Request successful. Parsing shows...")
    soup = BeautifulSoup(response.content, 'html.parser')

    # Month mapping for conversion
    month_mapping = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
        "Nov": "11", "Dec": "12"
    }

    # Find all shows
    for show in soup.find_all('div', class_='show_list_item'):
        print("Processing a show...")
        # Extract date
        date_container = show.find('div', class_='date_container')
        month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
        day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
        
        # Convert to YYYY-MM-DD format
        month_number = month_mapping.get(month, "N/A")
        event_date = f"2024-{month_number}-{int(day):02d}"  # Format to YYYY-MM-DD
        print(f"Extracted date: {event_date}")

        # Extract the venue name
        venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
        print(f"Extracted venue name: {venue_name}")

        # Extract the band names
        show_name_container = show.find('div', class_='show_name content flex-fill')
        
        # Get event name from the first <h4> tag found
        headline = show_name_container.find('h4').get_text(strip=True) if show_name_container.find('h4') else 'N/A'
        print(f"Extracted headline: {headline}")

        # Extract event link
        event_link = show.find('a')['href'] if show.find('a') else None
        if event_link:
            event_url = event_link if event_link.startswith('http') else f"https://first-avenue.com{event_link}"
        else:
            event_url = 'N/A'  # No link available
            print("No event link found.")

        # Extract event time
        event_time = get_event_time(event_url)

        # Find support bands from both <h5> and <h6> tags
        support_bands = []
        for tag in show_name_container.find_all(['h5', 'h6']):
            support_band = tag.get_text(strip=True)
            support_bands.append(support_band)

        # Join support bands ensuring spaces are added correctly
        support_info = ' & '.join(support_bands) if support_bands else 'N/A'

        # Prepare event details for database insertion
        event_details = {
            'Date': event_date,
            'Venue': venue_name,
            'Headline': headline,
            'Support and other info': support_info,
            'Time': event_time,
            'Event Link': event_url
        }

        # Insert event into the database
        try:
            insert_event(event_details)
            print(f"Inserted event: {headline}")
        except Exception as e:
            print(f"Error inserting event {headline}: {e}")

else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")

    # Now scrape for the next month (February)

# URL of the First Avenue shows page
url = 'https://first-avenue.com/shows/?post_type=event&start_date=20250201'

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()  # Normalize to uppercase
            if ':' in time_str:  # If time includes minutes
                hour, minute = time_str[:-2].split(':')
            else:  # Only hour specified
                hour = time_str[:-2]
                minute = '00'  # Default minutes to 00
            hour = int(hour) % 12  # Convert to 12-hour format
            if 'PM' in time_str:
                hour += 12  # Convert PM hour to 24-hour format
            return f"{hour:02}:{minute}"  # Return in HH:MM format
        return '00:00'  # Default if no time is found
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'  # Return default time in case of error

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

# Insert event data into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "Show Calendar" (date, venue, headliner, support, time, event_link)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        event_details['Date'],
        event_details['Venue'],
        event_details['Headline'],
        event_details['Support and other info'],
        event_details['Time'],
        event_details['Event Link']
    ))
    conn.commit()

# Send a GET request to the website
print(f"Sending request to {url}...")
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    print("Request successful. Parsing shows...")
    soup = BeautifulSoup(response.content, 'html.parser')

    # Month mapping for conversion
    month_mapping = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
        "Nov": "11", "Dec": "12"
    }

    # Find all shows
    for show in soup.find_all('div', class_='show_list_item'):
        print("Processing a show...")
        # Extract date
        date_container = show.find('div', class_='date_container')
        month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
        day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
        
        # Convert to YYYY-MM-DD format
        month_number = month_mapping.get(month, "N/A")
        event_date = f"2024-{month_number}-{int(day):02d}"  # Format to YYYY-MM-DD
        print(f"Extracted date: {event_date}")

        # Extract the venue name
        venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
        print(f"Extracted venue name: {venue_name}")

        # Extract the band names
        show_name_container = show.find('div', class_='show_name content flex-fill')
        
        # Get event name from the first <h4> tag found
        headline = show_name_container.find('h4').get_text(strip=True) if show_name_container.find('h4') else 'N/A'
        print(f"Extracted headline: {headline}")

        # Extract event link
        event_link = show.find('a')['href'] if show.find('a') else None
        if event_link:
            event_url = event_link if event_link.startswith('http') else f"https://first-avenue.com{event_link}"
        else:
            event_url = 'N/A'  # No link available
            print("No event link found.")

        # Extract event time
        event_time = get_event_time(event_url)

        # Find support bands from both <h5> and <h6> tags
        support_bands = []
        for tag in show_name_container.find_all(['h5', 'h6']):
            support_band = tag.get_text(strip=True)
            support_bands.append(support_band)

        # Join support bands ensuring spaces are added correctly
        support_info = ' & '.join(support_bands) if support_bands else 'N/A'

        # Prepare event details for database insertion
        event_details = {
            'Date': event_date,
            'Venue': venue_name,
            'Headline': headline,
            'Support and other info': support_info,
            'Time': event_time,
            'Event Link': event_url
        }

        # Insert event into the database
        try:
            insert_event(event_details)
            print(f"Inserted event: {headline}")
        except Exception as e:
            print(f"Error inserting event {headline}: {e}")

else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")

    # Now scrape for the next month (March)

# URL of the First Avenue shows page
url = 'https://first-avenue.com/shows/?post_type=event&start_date=20250301'

# Function to convert time to 24-hour format
def convert_time_to_24_hour_format(time_str):
    try:
        if 'AM' in time_str or 'PM' in time_str:
            time_str = time_str.strip().upper()  # Normalize to uppercase
            if ':' in time_str:  # If time includes minutes
                hour, minute = time_str[:-2].split(':')
            else:  # Only hour specified
                hour = time_str[:-2]
                minute = '00'  # Default minutes to 00
            hour = int(hour) % 12  # Convert to 12-hour format
            if 'PM' in time_str:
                hour += 12  # Convert PM hour to 24-hour format
            return f"{hour:02}:{minute}"  # Return in HH:MM format
        return '00:00'  # Default if no time is found
    except Exception as e:
        print(f"Error converting time '{time_str}': {e}")
        return '00:00'  # Return default time in case of error

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

# Insert event data into the database
def insert_event(event_details):
    insert_query = """
        INSERT INTO "Show Calendar" (date, venue, headliner, support, time, event_link)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        event_details['Date'],
        event_details['Venue'],
        event_details['Headline'],
        event_details['Support and other info'],
        event_details['Time'],
        event_details['Event Link']
    ))
    conn.commit()

# Send a GET request to the website
print(f"Sending request to {url}...")
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    print("Request successful. Parsing shows...")
    soup = BeautifulSoup(response.content, 'html.parser')

    # Month mapping for conversion
    month_mapping = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
        "Nov": "11", "Dec": "12"
    }

    # Find all shows
    for show in soup.find_all('div', class_='show_list_item'):
        print("Processing a show...")
        # Extract date
        date_container = show.find('div', class_='date_container')
        month = date_container.find(class_='month').get_text(strip=True) if date_container.find(class_='month') else 'N/A'
        day = date_container.find(class_='day').get_text(strip=True) if date_container.find(class_='day') else 'N/A'
        
        # Convert to YYYY-MM-DD format
        month_number = month_mapping.get(month, "N/A")
        event_date = f"2024-{month_number}-{int(day):02d}"  # Format to YYYY-MM-DD
        print(f"Extracted date: {event_date}")

        # Extract the venue name
        venue_name = show.find('div', class_='venue_name').get_text(strip=True) if show.find('div', class_='venue_name') else 'N/A'
        print(f"Extracted venue name: {venue_name}")

        # Extract the band names
        show_name_container = show.find('div', class_='show_name content flex-fill')
        
        # Get event name from the first <h4> tag found
        headline = show_name_container.find('h4').get_text(strip=True) if show_name_container.find('h4') else 'N/A'
        print(f"Extracted headline: {headline}")

        # Extract event link
        event_link = show.find('a')['href'] if show.find('a') else None
        if event_link:
            event_url = event_link if event_link.startswith('http') else f"https://first-avenue.com{event_link}"
        else:
            event_url = 'N/A'  # No link available
            print("No event link found.")

        # Extract event time
        event_time = get_event_time(event_url)

        # Find support bands from both <h5> and <h6> tags
        support_bands = []
        for tag in show_name_container.find_all(['h5', 'h6']):
            support_band = tag.get_text(strip=True)
            support_bands.append(support_band)

        # Join support bands ensuring spaces are added correctly
        support_info = ' & '.join(support_bands) if support_bands else 'N/A'

        # Prepare event details for database insertion
        event_details = {
            'Date': event_date,
            'Venue': venue_name,
            'Headline': headline,
            'Support and other info': support_info,
            'Time': event_time,
            'Event Link': event_url
        }

        # Insert event into the database
        try:
            insert_event(event_details)
            print(f"Inserted event: {headline}")
        except Exception as e:
            print(f"Error inserting event {headline}: {e}")

else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")


# Close the database connection
cursor.close()
conn.close()
print("All events processed and added to the database.")