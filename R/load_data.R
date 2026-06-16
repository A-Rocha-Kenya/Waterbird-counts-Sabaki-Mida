# Load packages -----------------------------------------------------------

library(tidyverse)
library(readxl)
library(avilistr)
library(sf)

# Load data ---------------------------------------------------------------

load_data <- function() {
  root_dir <- here::here()
  data_file <- file.path(root_dir, "data", "raw", "water_bird_count_data.xlsx")

  counts_raw <- read_xlsx(
    data_file,
    sheet = "Main",
    col_types = c(
      "text", "numeric", "text", "text", "date",
      "date", "date", "text", "text", "text",
      "text", "text", "text", "text", "text"
    )
  ) |>
    replace_na(list(
      quality = "",
      coverage = "",
      method = "",
      water = "",
      weather = "",
      disturbed = "",
      tidal = "",
      participants = "",
      comment = ""
    ))

  sabaki_counts <- counts_raw |>
    filter(site %in% c("Sabaki", "Sabaki (North)", "Sabaki (South)")) |>
    group_by(date) |>
    mutate(
      start_time = min(start_time),
      end_time = max(end_time)
    ) |>
    group_by(date, common_name) |>
    summarise(
      count = sum(count),
      quality = first(quality),
      site = "Sabaki",
      start_time = first(start_time),
      end_time = first(end_time),
      coverage = first(coverage),
      method = first(method),
      water = first(water),
      tidal = first(tidal),
      weather = first(weather),
      disturbed = first(disturbed),
      participants = first(participants),
      comment = first(comment),
      .groups = "drop"
    )

  counts <- counts_raw |>
    filter(site == "Mida Creek") |>
    bind_rows(sabaki_counts) |>
    mutate(
      common_name_key = stringr::str_to_lower(stringr::str_squish(common_name))
    )

  species_lookup <- read_xlsx(data_file, sheet = "Species") |>
    mutate(
      common_name_key = stringr::str_to_lower(stringr::str_squish(common_name))
    )

  species_lookup_join <- species_lookup |>
    rename(
      scientific_name_source = scientific_name,
      vernacular_name_source = common_name,
      taxon_rank_source = taxon_rank
    )

  avilist_lookup <- avilistr::avilist_2025 |>
    filter(!is.na(Species_code_Cornell_Lab)) |>
    distinct(Species_code_Cornell_Lab, .keep_all = TRUE) |>
    transmute(
      taxon_id = Species_code_Cornell_Lab,
      avilist_sequence = Sequence,
      avilist_order = Order,
      avilist_family = Family,
      avilist_family_english = Family_English_name,
      avilist_scientific_name = Scientific_name,
      avilist_genus = stringr::word(Scientific_name, 1),
      avilist_scientific_name_authorship = Authority,
      avilist_taxon_rank = stringr::str_to_title(Taxon_rank),
      avilist_vernacular_name = English_name_AviList
    )

  locations_geometry <- sf::st_read(
    file.path(root_dir, "assets", "locations.geojson"),
    quiet = TRUE
  ) |>
    sf::st_zm(drop = TRUE, what = "ZM") |>
    mutate(
      site_name = case_when(
        stringr::str_detect(Name, "Mida") ~ "Mida Creek",
        stringr::str_detect(Name, "Sabaki") ~ "Sabaki"
      ),
      geometry_role = case_when(
        sf::st_geometry_type(geometry) == "POLYGON" ~ "counting_area",
        sf::st_geometry_type(geometry) == "LINESTRING" ~ "counting_path"
      ),
      geometry_wkt = sf::st_as_text(geometry)
    ) |>
    sf::st_drop_geometry() |>
    select(site_name, geometry_role, geometry_wkt) |>
    tidyr::pivot_wider(
      names_from = geometry_role,
      values_from = geometry_wkt
    )

  list(
    root_dir = root_dir,
    data_file = data_file,
    assets_dir = file.path(root_dir, "assets"),
    dwc_dir = file.path(root_dir, "data", "derived", "dwc"),
    dashboard_dir = file.path(root_dir, "data", "derived", "dashboard"),
    eml_template_file = file.path(root_dir, "data", "raw", "eml-waterbird_counts_sabaki_mida_template.xml"),
    eml_output_file = file.path(root_dir, "data", "derived", "dwc", "eml-waterbird_counts_sabaki_mida.xml"),
    site_url = "https://a-rocha-kenya.github.io/Waterbird-counts-Sabaki-Mida/",
    export_script_url = "https://a-rocha-kenya.github.io/Waterbird-counts-Sabaki-Mida/script/02_export_outputs.html",
    notebook_url = "https://github.com/A-Rocha-Kenya/Waterbird-counts-Sabaki-Mida/blob/master/assets/Notebook_Instruction.pdf",
    dashboard_url = "https://a-rocha-kenya.github.io/Waterbird-counts-Sabaki-Mida/dashboard/",
    counts_raw = counts_raw,
    sabaki_counts = sabaki_counts,
    counts = counts,
    species_lookup = species_lookup,
    species_lookup_join = species_lookup_join,
    avilist_lookup = avilist_lookup,
    locations_list = read_xlsx(data_file, sheet = "Sites") |> filter(site_name %in% c("Sabaki", "Mida Creek")),
    locations_geometry = locations_geometry,
    participants_list = read_xlsx(data_file, sheet = "Participants")
  )
}
