"""
Module to produce sample user location records for the demo dataset.

Contains a curated mapping of Portuguese cities to their latitude/longitude
and a helper to create randomized user-location records referencing those
coordinates. Useful for populating maps or location-based features in the
frontend mock.
"""

import json
import random
from pathlib import Path

country = "Portugal"


def _point_in_polygon(x, y, poly):
    """Ray casting algorithm for point-in-polygon.

    poly: list of (x, y) pairs where x=lon, y=lat
    """
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        intersect = ((yi > y) != (yj > y)) and (
            x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi
        )
        if intersect:
            inside = not inside
        j = i
    return inside


def _bbox(poly):
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    return min(xs), min(ys), max(xs), max(ys)


def _sample_point_in_polygon(poly, attempts=200):
    minx, miny, maxx, maxy = _bbox(poly)
    for _ in range(attempts):
        x = random.uniform(minx, maxx)
        y = random.uniform(miny, maxy)
        if _point_in_polygon(x, y, poly):
            return y, x  # return (lat, lon)
    # fallback to centroid (avg of vertices)
    avgx = sum(p[0] for p in poly) / len(poly)
    avgy = sum(p[1] for p in poly) / len(poly)
    return avgy, avgx


def _load_municipalities(geojson_path: Path):
    if not geojson_path.exists():
        return []
    data = json.loads(geojson_path.read_text(encoding="utf-8"))
    municipalities = []
    for feat in data.get("features", []):
        props = feat.get("properties", {})
        name = props.get("Concelho") or props.get("MUNICIPIO") or props.get("MUNICIPIO")
        geom = feat.get("geometry", {})
        gtype = geom.get("type")
        coords = geom.get("coordinates") or []
        polys = []
        # GeoJSON coords are [lon, lat]
        if gtype == "Polygon":
            # take the exterior ring (first)
            ring = coords[0]
            poly = [(pt[0], pt[1]) for pt in ring]
            polys.append(poly)
        elif gtype == "MultiPolygon":
            for poly_coords in coords:
                ring = poly_coords[0]
                poly = [(pt[0], pt[1]) for pt in ring]
                polys.append(poly)
        if name and polys:
            municipalities.append({"name": name, "polygons": polys})
    return municipalities


# Determine path to bundled GeoJSON
BASE_DIR = Path(__file__).resolve().parent
GEOJSON_PATH = BASE_DIR / "portugal_boundary_sampler" / "Portugal_Municipalities.geojson"
_MUNIS = _load_municipalities(GEOJSON_PATH)


def generate_location_data():
    """Create a random user location record.

    If the municipalities GeoJSON is available, pick a random municipality and
    sample a random point inside one of its polygons. Otherwise fall back to a
    small set of fixed cities.
    """
    id_utilizador = random.randint(1, 20)
    if _MUNIS:
        muni = random.choice(_MUNIS)
        poly = random.choice(muni["polygons"])
        lat, lon = _sample_point_in_polygon(poly)
        cidade = muni["name"].title()
    else:
        # fallback mapping (kept small)
        mapping = {
            "Lisboa": (38.7169, -9.1399),
            "Porto": (41.1496, -8.611),
            "Coimbra": (40.2056, -8.419),
            "Faro": (37.0194, -7.9304),
            "Braga": (41.5454, -8.4265),
            "Aveiro": (40.6405, -8.6538),
            "Évora": (38.5716, -7.9135),
        }
        cidade = random.choice(list(mapping.keys()))
        lat, lon = mapping[cidade]

    return {
        "id_utilizador": id_utilizador,
        "pais": country,
        "cidade": cidade,
        "latitude": float(lat),
        "longitude": float(lon),
    }


for _ in range(20):
    print(generate_location_data())

