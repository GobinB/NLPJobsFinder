import re
import json
import sys
from location_parser import LocationParser

# Initialize the location parser
parser = LocationParser()

def load_json_data(file_path):
    # Load JSON data from file
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

def search_by_location(data, location_input):
    location_input = location_input.lower()
    matching_items = []
    
    for item in data:
        location_text = item.get('location', '').lower()
        
        # Check for direct match using regex
        if re.search(rf'\b{re.escape(location_input)}\b', location_text):
            matching_items.append({
                "company": item.get("name"),
                "location": item.get("location"),
                "description": item.get("description")
            })
            continue
        
        # Use the LocationParser to parse locations if no direct match
        parsed_locations = parser.parse_location(item.get('location', ''))
        
        if (
            location_input in [loc.lower() for loc in parsed_locations.get("countries", [])] or 
            location_input in [loc.lower() for loc in parsed_locations.get("cities", [])] or 
            location_input in [loc.lower() for loc in parsed_locations.get("custom_terms", [])]
        ):
            matching_items.append({
                "company": item.get("name"),
                "location": item.get("location"),
                "description": item.get("description")
            })
    
    return matching_items

if __name__ == "__main__":
    # Command-line argument for location input
    location_input = sys.argv[1] if len(sys.argv) > 1 else ""
    
    # Load company data
    data = load_json_data('/home/ahmedabdullahi/NLPJobsFinder/backend/data/companies.json')
    
    # Get matching items based on location
    results = search_by_location(data, location_input)
    
    # Output results as JSON
    print(json.dumps(results))
