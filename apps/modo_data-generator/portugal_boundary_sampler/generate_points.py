from __future__ import annotations

import argparse
import csv
import difflib
import json
import random
import tempfile
import unicodedata
import urllib.request
from pathlib import Path
from typing import Iterable, Final

import geopandas as gpd
from shapely.geometry import MultiPolygon, Point, Polygon
from shapely.geometry.base import BaseGeometry

# Default datasets hosted on GitHub.
# Source repository: https://github.com/nmota/caop_GeoJSON
DEFAULT_URLS: Final[dict[str, str]] = {
    "municipality": "https://raw.githubusercontent.com/nmota/caop_GeoJSON/master/Portugal_Municipalities.geojson",
    "municipality_mainland": "https://raw.githubusercontent.com/nmota/caop_GeoJSON/master/ContinenteConcelhos.geojson",
    "parish": "https://raw.githubusercontent.com/nmota/caop_GeoJSON/master/ContinenteFreguesias.geojson",
}

NAME_COLUMN_CANDIDATES: Final[tuple[str, ...]] = (
    "municipio",
    "concelho",
    "freguesia",
    "nome",
    "designacao",
    "dicofre",
    "freg",
    "município",
)

PARENT_COLUMN_CANDIDATES: Final[tuple[str, ...]] = (
    "municipio",
    "concelho",
    "município",
)


class BoundarySamplerError(Exception):
    """Raised when the requested administrative boundary cannot be processed."""



def normalize_text(value: str) -> str:
    """
    Normalize text for robust name matching.

    Parameters
    ----------
    value : str
        Input text.

    Returns
    -------
    str
        Uppercase, accent-free, trimmed text.
    """
    if not isinstance(value, str):
        raise TypeError("`value` must be a string.")

    normalized = unicodedata.normalize("NFKD", value)
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return " ".join(without_accents.strip().upper().split())



def resolve_default_url(level: str, mainland_only: bool) -> str:
    """
    Resolve the default GitHub GeoJSON URL for the selected level.

    Parameters
    ----------
    level : str
        Administrative level, either ``municipality`` or ``parish``.
    mainland_only : bool
        Whether to force mainland datasets when available.

    Returns
    -------
    str
        Dataset URL.
    """
    if level == "municipality" and mainland_only:
        return DEFAULT_URLS["municipality_mainland"]

    return DEFAULT_URLS[level]



def download_geojson(url: str, destination_dir: Path | None = None) -> Path:
    """
    Download a GeoJSON file from GitHub.

    Parameters
    ----------
    url : str
        Remote GeoJSON URL.
    destination_dir : Path | None, default=None
        Directory where the file will be saved. If omitted, a temporary
        directory is used.

    Returns
    -------
    Path
        Path to the downloaded file.
    """
    if not isinstance(url, str) or not url.strip():
        raise ValueError("`url` must be a non-empty string.")

    output_dir = destination_dir or Path(tempfile.mkdtemp(prefix="boundary_sampler_"))
    output_dir.mkdir(parents=True, exist_ok=True)

    file_name = url.rstrip("/").split("/")[-1] or "boundaries.geojson"
    output_path = output_dir / file_name

    try:
        with urllib.request.urlopen(url) as response, output_path.open("wb") as file_obj:
            file_obj.write(response.read())
    except Exception as exc:  # pragma: no cover - network-related path
        raise BoundarySamplerError(f"Failed to download dataset from {url!r}: {exc}") from exc

    return output_path



def detect_name_column(gdf: gpd.GeoDataFrame, level: str) -> str:
    """
    Detect the column containing the administrative unit name.

    Parameters
    ----------
    gdf : geopandas.GeoDataFrame
        Boundary dataset.
    level : str
        Administrative level.

    Returns
    -------
    str
        Column name.
    """
    preferred = ["freguesia", "freg"] if level == "parish" else ["municipio", "concelho", "município"]
    candidates = tuple(preferred) + NAME_COLUMN_CANDIDATES
    lowered = {str(col).strip().lower(): str(col) for col in gdf.columns}

    for candidate in candidates:
        if candidate in lowered:
            return lowered[candidate]

    raise BoundarySamplerError(
        "Could not detect the column containing the administrative unit name. "
        f"Available columns: {list(gdf.columns)}"
    )



def detect_parent_column(gdf: gpd.GeoDataFrame, name_column: str) -> str | None:
    """
    Detect the municipality column used to disambiguate parishes.

    Parameters
    ----------
    gdf : geopandas.GeoDataFrame
        Boundary dataset.
    name_column : str
        Name of the primary administrative-name column.

    Returns
    -------
    str | None
        Parent column name, or ``None`` if no suitable column is found.
    """
    lowered = {str(col).strip().lower(): str(col) for col in gdf.columns}

    for candidate in PARENT_COLUMN_CANDIDATES:
        resolved = lowered.get(candidate)
        if resolved is not None and resolved != name_column:
            return resolved

    return None



def validate_polygon_geometry(geometry: BaseGeometry) -> Polygon | MultiPolygon:
    """
    Validate that the selected geometry is polygonal.

    Parameters
    ----------
    geometry : BaseGeometry
        Geometry to validate.

    Returns
    -------
    Polygon | MultiPolygon
        Polygonal geometry.
    """
    if geometry is None or geometry.is_empty:
        raise BoundarySamplerError("The selected boundary has an empty geometry.")

    if isinstance(geometry, (Polygon, MultiPolygon)):
        return geometry

    raise BoundarySamplerError(
        f"Expected a polygonal geometry, got {geometry.geom_type!r} instead."
    )



def suggest_names(name: str, available_names: Iterable[str], limit: int = 10) -> list[str]:
    """
    Suggest nearby names when an exact match is not found.

    Parameters
    ----------
    name : str
        Requested name.
    available_names : Iterable[str]
        Available names.
    limit : int, default=10
        Maximum number of suggestions.

    Returns
    -------
    list[str]
        Similar names.
    """
    choices = list(dict.fromkeys(str(item) for item in available_names))
    normalized_lookup = {normalize_text(choice): choice for choice in choices}
    close_keys = difflib.get_close_matches(
        normalize_text(name),
        list(normalized_lookup.keys()),
        n=limit,
        cutoff=0.55,
    )
    return [normalized_lookup[key] for key in close_keys]



def load_boundary_dataset(path: Path) -> gpd.GeoDataFrame:
    """
    Read a boundary dataset from disk.

    Parameters
    ----------
    path : Path
        Path to a GeoJSON file.

    Returns
    -------
    geopandas.GeoDataFrame
        Loaded dataset.
    """
    if not path.exists():
        raise FileNotFoundError(f"Boundary file not found: {path}")

    gdf = gpd.read_file(path)

    if gdf.empty:
        raise BoundarySamplerError("The boundary dataset is empty.")

    if gdf.crs is None:
        raise BoundarySamplerError(
            "The boundary dataset has no CRS information, so reprojection is not safe."
        )

    return gdf



def select_boundary(
    gdf: gpd.GeoDataFrame,
    name: str,
    level: str,
    parent_municipality: str | None = None,
) -> tuple[gpd.GeoDataFrame, str, str | None]:
    """
    Select an administrative unit by name, optionally filtered by municipality.

    Parameters
    ----------
    gdf : geopandas.GeoDataFrame
        Full boundary dataset.
    name : str
        Municipality or parish name.
    level : str
        Administrative level.
    parent_municipality : str | None, default=None
        Municipality name used to disambiguate parish names.

    Returns
    -------
    tuple[geopandas.GeoDataFrame, str, str | None]
        Selected records, detected name column, and detected parent column.
    """
    name_column = detect_name_column(gdf, level=level)
    parent_column = detect_parent_column(gdf, name_column=name_column)

    normalized_target = normalize_text(name)
    selected = gdf[gdf[name_column].astype(str).map(normalize_text) == normalized_target].copy()

    if parent_municipality is not None and parent_column is not None:
        normalized_parent = normalize_text(parent_municipality)
        selected = selected[
            selected[parent_column].astype(str).map(normalize_text) == normalized_parent
        ].copy()

    if selected.empty:
        suggestions = suggest_names(name=name, available_names=gdf[name_column].astype(str).tolist())
        suggestion_text = f" Suggested names: {suggestions}" if suggestions else ""
        raise BoundarySamplerError(
            f"Could not find {level!r} named {name!r} in column {name_column!r}.{suggestion_text}"
        )

    if level == "parish" and parent_municipality is None and parent_column is not None:
        distinct_parents = selected[parent_column].astype(str).dropna().unique().tolist()
        if len(distinct_parents) > 1:
            raise BoundarySamplerError(
                f"Parish {name!r} exists in multiple municipalities: {distinct_parents}. "
                "Please pass `--parent-municipality` to disambiguate."
            )

    return selected, name_column, parent_column



def generate_points_within_geometry(
    geometry: Polygon | MultiPolygon,
    n_points: int,
    seed: int | None = 42,
) -> list[Point]:
    """
    Generate random points uniformly inside a polygonal geometry.

    Sampling is done in the source projected CRS. This avoids distortions that
    would occur if sampling were done directly in longitude/latitude.

    Parameters
    ----------
    geometry : Polygon | MultiPolygon
        Polygon or multipolygon boundary.
    n_points : int
        Number of points to generate.
    seed : int | None, default=42
        Random seed.

    Returns
    -------
    list[Point]
        Generated points.
    """
    if not isinstance(n_points, int) or n_points <= 0:
        raise ValueError("`n_points` must be a positive integer.")

    if seed is not None and not isinstance(seed, int):
        raise TypeError("`seed` must be an integer or None.")

    rng = random.Random(seed)
    min_x, min_y, max_x, max_y = geometry.bounds

    generated_points: list[Point] = []
    max_attempts = max(10_000, n_points * 2_000)
    attempts = 0

    while len(generated_points) < n_points and attempts < max_attempts:
        x_coord = rng.uniform(min_x, max_x)
        y_coord = rng.uniform(min_y, max_y)
        candidate = Point(x_coord, y_coord)

        if geometry.contains(candidate):
            generated_points.append(candidate)

        attempts += 1

    if len(generated_points) < n_points:
        raise BoundarySamplerError(
            f"Only generated {len(generated_points)} out of {n_points} requested points. "
            "This usually happens when the geometry is very fragmented or very small."
        )

    return generated_points



def build_points_geodataframe(
    points: list[Point],
    source_crs: str,
    output_crs: str,
    name: str,
    level: str,
    parent_municipality: str | None = None,
) -> gpd.GeoDataFrame:
    """
    Build a GeoDataFrame from generated points and reproject it.

    Parameters
    ----------
    points : list[Point]
        Generated points.
    source_crs : str
        CRS used during sampling.
    output_crs : str
        CRS for output, usually ``EPSG:4326``.
    name : str
        Selected administrative unit name.
    level : str
        Administrative level.
    parent_municipality : str | None, default=None
        Parent municipality, when applicable.

    Returns
    -------
    geopandas.GeoDataFrame
        Output points.
    """
    records = {
        "selected_name": [name] * len(points),
        "administrative_level": [level] * len(points),
        "parent_municipality": [parent_municipality] * len(points),
        "point_id": list(range(1, len(points) + 1)),
    }

    gdf_points = gpd.GeoDataFrame(records, geometry=points, crs=source_crs)
    return gdf_points.to_crs(output_crs)



def save_points_to_csv(points_gdf: gpd.GeoDataFrame, output_path: Path) -> None:
    """
    Save points to CSV with longitude and latitude columns.

    Parameters
    ----------
    points_gdf : geopandas.GeoDataFrame
        Points in ``EPSG:4326`` or another geographic CRS.
    output_path : Path
        Destination CSV path.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(
            [
                "point_id",
                "selected_name",
                "administrative_level",
                "parent_municipality",
                "longitude",
                "latitude",
            ]
        )

        for row in points_gdf.itertuples(index=False):
            writer.writerow(
                [
                    row.point_id,
                    row.selected_name,
                    row.administrative_level,
                    row.parent_municipality,
                    row.geometry.x,
                    row.geometry.y,
                ]
            )



def save_points_to_geojson(points_gdf: gpd.GeoDataFrame, output_path: Path) -> None:
    """
    Save generated points to GeoJSON.

    Parameters
    ----------
    points_gdf : geopandas.GeoDataFrame
        Output points.
    output_path : Path
        Destination GeoJSON path.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    points_gdf.to_file(output_path, driver="GeoJSON")



def export_boundary_geojson(boundary_gdf: gpd.GeoDataFrame, output_path: Path, output_crs: str) -> None:
    """
    Export the selected boundary as a GeoJSON file.

    Parameters
    ----------
    boundary_gdf : geopandas.GeoDataFrame
        Selected boundary records.
    output_path : Path
        Destination GeoJSON path.
    output_crs : str
        Desired output CRS.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    boundary_gdf.to_crs(output_crs).to_file(output_path, driver="GeoJSON")



def run_generation(
    name: str,
    level: str,
    n_points: int,
    output_dir: Path,
    parent_municipality: str | None = None,
    data_url: str | None = None,
    local_file: Path | None = None,
    mainland_only: bool = False,
    output_crs: str = "EPSG:4326",
    seed: int | None = 42,
) -> dict[str, str]:
    """
    Run the full workflow: load boundaries, select one area, generate points, export files.

    Parameters
    ----------
    name : str
        Municipality or parish name.
    level : str
        Administrative level: ``municipality`` or ``parish``.
    n_points : int
        Number of points to generate.
    output_dir : Path
        Output directory.
    parent_municipality : str | None, default=None
        Parent municipality used for parish disambiguation.
    data_url : str | None, default=None
        GeoJSON URL to download. If omitted, a default GitHub dataset is used.
    local_file : Path | None, default=None
        Local GeoJSON file. Overrides ``data_url`` when provided.
    mainland_only : bool, default=False
        Use mainland-only municipality boundaries when possible.
    output_crs : str, default='EPSG:4326'
        CRS used in outputs.
    seed : int | None, default=42
        Random seed.

    Returns
    -------
    dict[str, str]
        Paths of the generated artifacts.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = output_dir / "data_cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    boundary_path: Path
    if local_file is not None:
        boundary_path = local_file
    else:
        resolved_url = data_url or resolve_default_url(level=level, mainland_only=mainland_only)
        boundary_path = download_geojson(url=resolved_url, destination_dir=cache_dir)

    boundary_gdf = load_boundary_dataset(boundary_path)
    selected_boundary, _, _ = select_boundary(
        gdf=boundary_gdf,
        name=name,
        level=level,
        parent_municipality=parent_municipality,
    )

    geometry = validate_polygon_geometry(selected_boundary.geometry.union_all())
    source_crs = str(boundary_gdf.crs)

    sampled_points = generate_points_within_geometry(
        geometry=geometry,
        n_points=n_points,
        seed=seed,
    )
    points_gdf = build_points_geodataframe(
        points=sampled_points,
        source_crs=source_crs,
        output_crs=output_crs,
        name=name,
        level=level,
        parent_municipality=parent_municipality,
    )

    safe_name = normalize_text(name).replace(" ", "_")
    csv_path = output_dir / f"{safe_name}_points.csv"
    points_geojson_path = output_dir / f"{safe_name}_points.geojson"
    boundary_geojson_path = output_dir / f"{safe_name}_boundary.geojson"
    metadata_path = output_dir / f"{safe_name}_metadata.json"

    save_points_to_csv(points_gdf=points_gdf, output_path=csv_path)
    save_points_to_geojson(points_gdf=points_gdf, output_path=points_geojson_path)
    export_boundary_geojson(
        boundary_gdf=selected_boundary,
        output_path=boundary_geojson_path,
        output_crs=output_crs,
    )

    metadata = {
        "name": name,
        "level": level,
        "parent_municipality": parent_municipality,
        "n_points": n_points,
        "output_crs": output_crs,
        "seed": seed,
        "source_boundary_file": str(boundary_path),
        "source_boundary_crs": source_crs,
        "mainland_only": mainland_only,
    }
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "csv": str(csv_path),
        "points_geojson": str(points_geojson_path),
        "boundary_geojson": str(boundary_geojson_path),
        "metadata": str(metadata_path),
        "source_boundary_file": str(boundary_path),
    }



def build_argument_parser() -> argparse.ArgumentParser:
    """
    Build the command-line argument parser.

    Returns
    -------
    argparse.ArgumentParser
        Configured parser.
    """
    parser = argparse.ArgumentParser(
        description=(
            "Generate random geographic points inside a Portuguese municipality or parish "
            "using GeoJSON boundaries downloaded from GitHub."
        )
    )
    parser.add_argument("--name", required=True, help="Municipality or parish name to select.")
    parser.add_argument(
        "--level",
        choices=("municipality", "parish"),
        default="municipality",
        help="Administrative level to use.",
    )
    parser.add_argument(
        "--parent-municipality",
        default=None,
        help="Municipality used to disambiguate parish names.",
    )
    parser.add_argument(
        "--n-points",
        type=int,
        default=100,
        help="Number of points to generate.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible output.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output"),
        help="Directory where CSV, GeoJSON, and metadata files will be saved.",
    )
    parser.add_argument(
        "--output-crs",
        default="EPSG:4326",
        help="CRS used in exported files. EPSG:4326 is longitude/latitude.",
    )
    parser.add_argument(
        "--data-url",
        default=None,
        help="Custom GeoJSON URL. When omitted, a default GitHub dataset is used.",
    )
    parser.add_argument(
        "--local-file",
        type=Path,
        default=None,
        help="Local GeoJSON file. Overrides --data-url when provided.",
    )
    parser.add_argument(
        "--mainland-only",
        action="store_true",
        help=(
            "Use a mainland-only municipality dataset. This is useful when you want "
            "Continental Portugal only."
        ),
    )
    return parser



def main() -> None:
    """CLI entrypoint."""
    parser = build_argument_parser()
    args = parser.parse_args()

    artifacts = run_generation(
        name=args.name,
        level=args.level,
        n_points=args.n_points,
        output_dir=args.output_dir,
        parent_municipality=args.parent_municipality,
        data_url=args.data_url,
        local_file=args.local_file,
        mainland_only=args.mainland_only,
        output_crs=args.output_crs,
        seed=args.seed,
    )

    print("Generated files:")
    for label, path in artifacts.items():
        print(f"- {label}: {path}")


if __name__ == "__main__":
    main()
