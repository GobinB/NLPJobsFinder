import pandas as pd

# Read the CSV file
df = pd.read_csv('Data/worldcities.csv')

# Filter for the three specified states
selected_states = ['Kentucky', 'Indiana', 'Ohio']
tri_state_cities = df[df['admin_name'].isin(selected_states)]

# Save to new CSV
tri_state_cities.to_csv('Data/tri_state_cities.csv', index=False)

print(f"Original dataset: {len(df)} cities")
print(f"Tri-state cities dataset: {len(tri_state_cities)} cities")
print("\nFirst few tri-state cities:")
print(tri_state_cities[['city', 'admin_name', 'lat', 'lng', 'population']].head())