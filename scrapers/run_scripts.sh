#!/bin/bash
python3 firstavescrape_todb.py
python3 pilllarscrape_todb.py
python3 grscrape_todb.py

wait

echo "All scripts have completed."