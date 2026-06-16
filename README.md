# Waterbird Counts at Sabaki River Mouth and Mida Creek

This repository contains the source data, export scripts, website, and dashboard for A Rocha Kenya's long-term waterbird monitoring at Sabaki River Mouth and Mida Creek.

## Workflow

The workflow is run with two Quarto scripts:

1. `script/01_data_checks.qmd`
   Checks the raw spreadsheet before export.

2. `script/02_export_outputs.qmd`
   Exports Darwin Core files, EML metadata, and dashboard JSON files.

The export script has two main sections:

- `Export DWC`: writes the Darwin Core event table first, including survey metadata and site footprint geometry, then writes the occurrence table with AviList-based taxonomy, and finally writes the generated EML metadata.
- `Export dashboard`: writes the JSON files used by the Vue dashboard.

## Output

### Darwin Core for GBIF

Generated in `data/derived/dwc/`:

- `events_YYYY-MM-DD.csv`: Darwin Core event table
- `occurrences_YYYY-MM-DD.csv`: Darwin Core occurrence table with AviList-aligned taxonomy fields
- `eml-waterbird_counts_sabaki_mida.xml`: generated EML metadata export

### Dashboard export

Generated in `data/derived/dashboard/`:

- `events.json`: dashboard event data
- `occurrences.json`: dashboard occurrence data
- `species_lookup.json`: dashboard taxon lookup
- `summary_cards.json`: dashboard summary values
- `series_year_site.json`: dashboard yearly summaries
- `series_month_site.json`: dashboard monthly summaries
- `species_rankings.json`: dashboard ranking tables
- `metadata.json`: dashboard configuration and filter metadata

### Website

Generated in `docs/` by Quarto.

## R Functions

- `R/load_data.R`: reads raw data and defines output paths
- `R/export_dwc.R`: builds the Darwin Core export object and writes the Darwin Core CSV and EML outputs
- `R/export_dashboard_json.R`: writes dashboard JSON files
- `R/load_helper.R`: loads packages, sets chunk options, and defines the small helper functions used by the Quarto scripts
