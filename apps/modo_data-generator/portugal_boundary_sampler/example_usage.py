from __future__ import annotations

from pathlib import Path

from generate_points import run_generation


def main() -> None:
    """Generate an example dataset for Coimbra municipality."""
    artifacts = run_generation(
        name="Coimbra",
        level="municipality",
        n_points=25,
        output_dir=Path("example_output"),
        mainland_only=False,
        seed=123,
    )

    for label, path in artifacts.items():
        print(f"{label}: {path}")


if __name__ == "__main__":
    main()
