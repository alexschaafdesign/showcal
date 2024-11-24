import psycopg2

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

def insert_show(cursor, venue_id, bands, start, event_link, flyer_image):
    """Insert a show into the database or return the ID of an existing show."""
    # Attempt to insert the show
    cursor.execute("""
        INSERT INTO shows (venue_id, bands, start, event_link, flyer_image)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT ON CONSTRAINT unique_show DO NOTHING
        RETURNING id;
    """, (venue_id, bands, start, event_link, flyer_image))
    show_id = cursor.fetchone()

    if show_id:  # New show was inserted
        return show_id[0], True

    # If no ID is returned, fetch the existing show_id
    cursor.execute("""
        SELECT id FROM shows WHERE venue_id = %s AND start = %s;
    """, (venue_id, start))
    show_id = cursor.fetchone()

    if not show_id:
        raise ValueError(f"Failed to find or insert show: venue_id={venue_id}, start={start}")

    return show_id[0], False  # Existing show was found

def insert_band(cursor, band_name):
    """Insert a band into the database or return the ID of an existing band."""
    # Attempt to insert the band
    cursor.execute("""
        INSERT INTO bands (band)
        VALUES (%s)
        ON CONFLICT (band) DO NOTHING
        RETURNING id;
    """, (band_name,))
    band_id = cursor.fetchone()

    if band_id:  # New band was inserted
        return band_id[0], True

    # If no ID is returned, fetch the existing band_id
    cursor.execute("SELECT id FROM bands WHERE band = %s;", (band_name,))
    band_id = cursor.fetchone()

    if not band_id:
        raise ValueError(f"Failed to find or insert band: {band_name}")

    return band_id[0], False  # Existing band was found

def link_band_to_show(cursor, band_id, show_id):
    """Link a band to a show in the show_bands table."""
    cursor.execute("""
        INSERT INTO show_bands (band_id, show_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING;
    """, (band_id, show_id))