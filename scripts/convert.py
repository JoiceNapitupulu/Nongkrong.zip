import csv
import json

csv_file = r"d:\DummyProject\Nongkrong.zip\detail_tempat_nongkrong.csv"
json_file = r"d:\DummyProject\Nongkrong.zip\src\places.json"

data = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Convert longitude and latitude to float if they exist
        try:
            row['longitude'] = float(row['longitude'])
            row['latitude'] = float(row['latitude'])
        except ValueError:
            pass
        data.append(row)

with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully converted {len(data)} places to {json_file}")
