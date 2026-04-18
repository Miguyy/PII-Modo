# Portugal Boundary Sampler

Small Python utility to generate random geographic points inside a Portuguese administrative boundary.

It supports:
- **municipality** selection by name
- **parish** selection by name
- optional parish disambiguation with `--parent-municipality`
- reading boundaries directly from **GitHub**
- exporting points to **CSV** and **GeoJSON**
- exporting the selected boundary to **GeoJSON**

## Source datasets

The script is configured to use the public repository below by default:
- `nmota/caop_GeoJSON`

Default URLs used by the script:
- Municipalities, Portugal: `https://raw.githubusercontent.com/nmota/caop_GeoJSON/master/Portugal_Municipalities.geojson`
- Municipalities, mainland only: `https://raw.githubusercontent.com/nmota/caop_GeoJSON/master/ContinenteConcelhos.geojson`
- Parishes, mainland only: `https://raw.githubusercontent.com/nmota/caop_GeoJSON/master/ContinenteFreguesias.geojson`

## Installation

Create a virtual environment and install the dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # Linux / macOS
# .venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
```

## Examples

### 1. Generate 100 points inside Coimbra municipality

```bash
python generate_points.py \
  --name Coimbra \
  --level municipality \
  --n-points 100 \
  --output-dir output_coimbra
```

### 2. Generate 250 points inside Braga municipality, mainland only

```bash
python generate_points.py \
  --name Braga \
  --level municipality \
  --n-points 250 \
  --mainland-only \
  --output-dir output_braga
```

### 3. Generate 50 points inside the parish of Alvalade in Lisboa

```bash
python generate_points.py \
  --name Alvalade \
  --level parish \
  --parent-municipality Lisboa \
  --n-points 50 \
  --output-dir output_alvalade
```

### 4. Use your own GeoJSON file instead of the default GitHub source

```bash
python generate_points.py \
  --name Aveiro \
  --level municipality \
  --n-points 80 \
  --local-file /path/to/boundaries.geojson \
  --output-dir output_aveiro
```

## Output files

For a selection like `Coimbra`, the script writes:
- `COIMBRA_points.csv`
- `COIMBRA_points.geojson`
- `COIMBRA_boundary.geojson`
- `COIMBRA_metadata.json`

The CSV includes:
- `point_id`
- `selected_name`
- `administrative_level`
- `parent_municipality`
- `longitude`
- `latitude`

## Notes

- The script samples points in the **source projected CRS** and only then reprojects them to the output CRS. This gives a better spatial distribution than sampling directly in longitude/latitude.
- Default output CRS is **EPSG:4326**.
- Parish support uses a mainland default dataset because the GitHub repository is organized in multiple files for different regions.
