# Load packages -----------------------------------------------------------

library(jsonlite)

# Export JSON -------------------------------------------------------------

export_dashboard_json <- function(dwc_objects, dashboard_dir = dwc_objects$dashboard_dir) {
  dir.create(dashboard_dir, recursive = TRUE, showWarnings = FALSE)

  paths <- c(
    events = file.path(dashboard_dir, "events.json"),
    occurrences = file.path(dashboard_dir, "occurrences.json"),
    species_lookup = file.path(dashboard_dir, "species_lookup.json"),
    summary_cards = file.path(dashboard_dir, "summary_cards.json"),
    series_year_site = file.path(dashboard_dir, "series_year_site.json"),
    series_month_site = file.path(dashboard_dir, "series_month_site.json"),
    species_rankings = file.path(dashboard_dir, "species_rankings.json"),
    metadata = file.path(dashboard_dir, "metadata.json")
  )

  write_json(dwc_objects$events_dashboard, paths[["events"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$occurrences_dashboard, paths[["occurrences"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$species_lookup_dashboard, paths[["species_lookup"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$summary_cards, paths[["summary_cards"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$series_year_site, paths[["series_year_site"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$series_month_site, paths[["series_month_site"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$species_rankings, paths[["species_rankings"]], auto_unbox = TRUE, pretty = TRUE, na = "null")
  write_json(dwc_objects$dashboard_metadata, paths[["metadata"]], auto_unbox = TRUE, pretty = TRUE, na = "null")

  invisible(paths)
}
