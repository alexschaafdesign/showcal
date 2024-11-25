import psycopg2
import json

# Database connection parameters
DB_NAME = "tcup"
DB_USER = "aschaaf"
DB_PASSWORD = "notthesame"
DB_HOST = "localhost"

def connect_to_db():
    """Establish a connection to the database."""
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST
    )

def get_venue_id(cursor, venue_name):
    """Fetch the venue_id for a given venue name."""
    cursor.execute("SELECT id FROM venues WHERE venue = %s", (venue_name,))
    venue_row = cursor.fetchone()
    if not venue_row:
        raise ValueError(f"Venue '{venue_name}' not found in the venues table.")
    return venue_row[0]

def insert_show(cursor, venue_id, bands, start, event_link, flyer_image, allow_update=False):
    """Insert or update a show in the database."""
    try:
        # Attempt to insert the show
        insert_query = """
            INSERT INTO shows (venue_id, bands, start, event_link, flyer_image)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT ON CONSTRAINT unique_show DO NOTHING
            RETURNING id;
        """
        cursor.execute(insert_query, (venue_id, bands, start, event_link, flyer_image))
        result = cursor.fetchone()

        if result:  # New show was inserted
            show_id = result[0]
            print(f"Inserted show with ID: {show_id}")
            return show_id, True

        # If no ID is returned, check for an existing show
        cursor.execute("""
            SELECT id, flyer_image FROM shows WHERE venue_id = %s AND start = %s;
        """, (venue_id, start))
        show_row = cursor.fetchone()

        if not show_row:
            raise ValueError(f"Failed to find or insert show: venue_id={venue_id}, start={start}")

        show_id, existing_flyer = show_row
        if allow_update and not existing_flyer and flyer_image:
            # Update the flyer image if it was missing
            cursor.execute("""
                UPDATE shows SET flyer_image = %s WHERE id = %s;
            """, (flyer_image, show_id))
            print(f"Updated flyer for show ID: {show_id}")
        return show_id, False

    except Exception as e:
        print(f"Error inserting/updating show: {e}")
        raise

def link_band_to_show(cursor, band_id, show_id):
    try:
        insert_query = """
            INSERT INTO show_bands (band_id, show_id)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING;  -- Avoid duplicate entries
        """
        cursor.execute(insert_query, (band_id, show_id))  # Both values must be integers
        print(f"Linked band ID {band_id} to show ID {show_id}")
    except Exception as e:
        print(f"Error linking band ID {band_id} to show ID {show_id}: {e}")
        raise  # Re-raise the exception to propagate the error

def insert_band(cursor, band_name, social_links=None):
    """
    Inserts a band into the bands table or returns the existing band's ID.
    Args:
        cursor: Database cursor.
        band_name (str): Name of the band.
        social_links (dict): Social media links for the band (optional).
    Returns:
        tuple: (int, bool) The ID of the band and whether it was newly inserted.
    """
    try:
        # Check if the band already exists
        duplicate_check_query = "SELECT id FROM bands WHERE band = %s"
        cursor.execute(duplicate_check_query, (band_name,))
        result = cursor.fetchone()

        if result:
            print(f"Band already exists with ID: {result[0]}")
            return result[0], False  # Return the existing band's ID and False for was_inserted

        # Insert the new band
        insert_query = """
            INSERT INTO bands (band, social_links)
            VALUES (%s, %s)
            RETURNING id;
        """
        cursor.execute(insert_query, (band_name, json.dumps(social_links) if social_links else None))
        band_id = cursor.fetchone()[0]
        print(f"Inserted band: {band_name} with ID: {band_id}")
        return band_id, True  # Return the new band's ID and True for was_inserted
    except Exception as e:
        print(f"Error inserting band {band_name}: {e}")
        raise