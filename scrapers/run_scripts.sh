#!/bin/bash

# Initialize an empty variable to store the summary output
summary=""

# Run each scraper and append its output to the summary
summary+=$(python3 firstavescrape_todb.py)
summary+="\n"
summary+=$(python3 pilllarscrape_todb.py)
summary+="\n"
summary+=$(python3 grscrape_todb.py)
summary+="\n"
summary+=$(python3 undergroundscrape_todb.py)
summary+="\n"
summary+=$(python3 331scrape_todb.py)
summary+="\n"
summary+=$(python3 berlin_todb.py)
summary+="\n"
summary+=$(python3 whitesquirrel.py)
summary+="\n"
summary+=$(python3 zhorascrape_todb.py)
summary+="\n"
summary+=$(python3 mortimersscrape_todb.py)
summary+="\n"
summary+=$(python3 dayblockscrape.py)
summary+="\n"
summary+=$(python3 hookandladder.py)


# Wait for all scripts to finish
wait

# Output the summary in an alert
osascript -e "display notification \"$summary\" with title \"Scraper Summary\""
echo -e "$summary"
echo "All scripts have completed."