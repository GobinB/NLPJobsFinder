
import pandas as pd

# Read the existing tri-state cities CSV
df = pd.read_csv('Data/tri_state_cities.csv')

# Create remote work location entries
remote_locations = [
    {
        'city': 'Remote',
        'city_ascii': 'Remote',
        'lat': None,
        'lng': None,
        'country': 'United States',
        'iso2': 'US',
        'iso3': 'USA',
        'admin_name': 'Virtual',
        'capital': '',
        'population': None,
        'id': 'REMOTE001'
    },
    {
        'city': 'Virtual',
        'city_ascii': 'Virtual',
        'lat': None,
        'lng': None,
        'country': 'United States',
        'iso2': 'US',
        'iso3': 'USA',
        'admin_name': 'Virtual',
        'capital': '',
        'population': None,
        'id': 'REMOTE002'
    },
    {
        'city': 'Work from Home',
        'city_ascii': 'Work from Home',
        'lat': None,
        'lng': None,
        'country': 'United States',
        'iso2': 'US',
        'iso3': 'USA',
        'admin_name': 'Virtual',
        'capital': '',
        'population': None,
        'id': 'REMOTE003'
    },
    {
        'city': 'Telework',
        'city_ascii': 'Telework',
        'lat': None,
        'lng': None,
        'country': 'United States',
        'iso2': 'US',
        'iso3': 'USA',
        'admin_name': 'Virtual',
        'capital': '',
        'population': None,
        'id': 'REMOTE004'
    },
    {
        'city': 'Hybrid',
        'city_ascii': 'Hybrid',
        'lat': None,
        'lng': None,
        'country': 'United States',
        'iso2': 'US',
        'iso3': 'USA',
        'admin_name': 'Virtual',
        'capital': '',
        'population': None,
        'id': 'REMOTE005'
    }
]

# Convert remote locations to DataFrame
remote_df = pd.DataFrame(remote_locations)

# Concatenate original data with remote locations
combined_df = pd.concat([df, remote_df], ignore_index=True)

# Save the updated dataset
combined_df.to_csv('Data/tri_state_cities_with_remote.csv', index=False)

print(f"Original dataset: {len(df)} locations")
print(f"Added remote options: {len(remote_locations)}")
print(f"Final dataset: {len(combined_df)} locations")