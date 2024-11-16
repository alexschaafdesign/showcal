#!/bin/bash

# Initialize an empty variable to store the summary output
summary=""

# Run each scraper and append its output to the summary
summary+=$(python3 firstavescrape_todb.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_jan.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_feb.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_mar.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_apr.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_may.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_jun.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_jul.py)
summary+="\n"
summary+=$(python3 firstavescrape_todb_aug.py)
summary+="\n"
summary+=$(python3 pilllarscrape_todb.py)
summary+="\n"
summary+=$(python3 grscrape_todb.py)
summary+="\n"
summary+=$(python3 undergroundscrape_todb.py)
summary+="\n"
summary+=$(python3 331scrape_todb.py)

# Wait for all scripts to finish
wait

# Output the summary in an alert
osascript -e "display notification \"$summary\" with title \"Scraper Summary\""
echo -e "$summary"
echo "All scripts have completed."