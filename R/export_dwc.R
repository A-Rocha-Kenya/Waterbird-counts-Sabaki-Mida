# Load packages -----------------------------------------------------------

library(tidyverse)
library(readr)
library(xml2)
library(glue)
library(scales)
library(stringr)
library(lubridate)
library(jsonlite)

# Build and optionally write Darwin Core export ---------------------------

export_dwc <- function(
  data_objects,
  excluded_export_records = NULL,
  export_date = Sys.Date(),
  write_files = FALSE
) {
  list2env(data_objects, envir = environment())

  summary_table <- bind_rows(
    counts |> mutate(site_original = site),
    counts |> mutate(site_original = site, site = "Combined")
  ) |>
    group_by(site) |>
    summarise(
      n_survey = n_distinct(date, site_original),
      n_taxon = n_distinct(common_name),
      n_observation = n(),
      n_individual = sum(count, na.rm = TRUE),
      .groups = "drop"
    )

  if (is.null(excluded_export_records)) {
    excluded_missing_count <- counts |>
      filter(is.na(count)) |>
      transmute(site, date, common_name, reason = "Missing count")

    excluded_missing_name <- counts |>
      filter(is.na(common_name)) |>
      transmute(site, date, common_name, reason = "Missing common_name")

    excluded_duplicate_observation <- counts |>
      add_count(date, site, common_name, name = "n_observation") |>
      filter(n_observation > 1) |>
      transmute(site, date, common_name, reason = "Duplicate date + site + common_name")

    excluded_export_records <- bind_rows(
      excluded_missing_count,
      excluded_missing_name,
      excluded_duplicate_observation
    ) |>
      distinct()
  }

  counts_export <- counts |>
    anti_join(
      excluded_export_records |> select(site, date, common_name),
      by = c("site", "date", "common_name")
    )

  species_recorded <- counts |>
    group_by(common_name) |>
    summarise(
      n_observation = n(),
      n_individual = sum(count, na.rm = TRUE),
      first_observation = min(date),
      last_observation = max(date),
      .groups = "drop"
    ) |>
    mutate(
      common_name_key = stringr::str_to_lower(stringr::str_squish(common_name))
    ) |>
    left_join(species_lookup, by = "common_name_key") |>
    arrange(desc(n_individual))

  family_recorded <- species_recorded |>
    group_by(family) |>
    summarise(
      family_english = first(family_english),
      n_taxon = n(),
      n_observation = sum(n_observation),
      n_individual = sum(n_individual, na.rm = TRUE),
      .groups = "drop"
    ) |>
    arrange(desc(n_individual))

  survey_dates <- counts |>
    distinct(site, date) |>
    mutate(
      year = year(date),
      month = month(date),
      month_label = factor(month.abb[month], levels = month.abb),
      site = factor(site, levels = c("Sabaki", "Mida Creek"))
    )

  temporal_summary <- survey_dates |>
    group_by(site) |>
    summarise(
      first_survey = min(date),
      last_survey = max(date),
      n_survey = n(),
      n_year = n_distinct(year),
      peak_month = month.abb[which.max(tabulate(month, nbins = 12))],
      .groups = "drop"
    )

  content_providers <- counts$participants |>
    toString() |>
    strsplit(",") |>
    unlist() |>
    trimws() |>
    unique() |>
    purrr::discard(~ .x == "") |>
    (\(initials) participants_list$Name[match(initials, participants_list$Initial)])() |>
    unique() |>
    purrr::discard(is.na) |>
    sort() |>
    toString()

  events <- counts_export |>
    group_by(date, site) |>
    summarise(
      start_time = first(start_time),
      end_time = first(end_time),
      coverage = first(coverage),
      method = first(method),
      water = first(water),
      tidal = first(tidal),
      weather = first(weather),
      disturbed = first(disturbed),
      participants = first(participants),
      .groups = "drop"
  ) |>
    left_join(locations_list, by = c("site" = "site_name")) |>
    left_join(locations_geometry, by = c("site" = "site_name")) |>
    transmute(
      eventID = paste(format(date, "%Y%m%d"), if_else(site == "Sabaki", "sabaki", "mida"), sep = "_"),
      samplingProtocol = "Water Bird Count",
      sampleSizeValue = as.numeric(difftime(end_time, start_time, units = "mins")),
      sampleSizeUnit = "minutes",
      samplingEffort = coverage,
      eventDate = as.character(date),
      eventTime = format(start_time, "%H:%M"),
      locationID = site,
      continent = "Africa",
      country = "Kenya",
      countryCode = "KE",
      county = case_when(
        site == "Mida Creek" ~ "Kilifi",
        site == "Sabaki" ~ "Tana River"
      ),
      locality = site,
      decimalLatitude = latitude,
      decimalLongitude = longitude,
      geodeticDatum = "WGS84",
      dynamicProperties = pmap_chr(
        list(method, water, tidal, weather, disturbed, coverage, participants),
        \(method, water, tidal, weather, disturbed, coverage, participants) {
          props <- list(
            method = na_if(method, ""),
            water = na_if(water, ""),
            tidal = na_if(tidal, ""),
            weather = na_if(weather, ""),
            disturbed = na_if(disturbed, ""),
            coverage = na_if(coverage, ""),
            participants = na_if(participants, "")
          ) |>
          purrr::discard(is.na)

          if (length(props) == 0) "" else jsonlite::toJSON(props, auto_unbox = TRUE)
        }
      )
    )

  occurrences <- counts_export |>
    left_join(species_lookup_join, by = "common_name_key") |>
    left_join(avilist_lookup, by = "taxon_id") |>
    transmute(
      basisOfRecord = "HumanObservation",
      eventID = paste(format(date, "%Y%m%d"), if_else(site == "Sabaki", "sabaki", "mida"), sep = "_"),
      occurrenceID = paste(eventID, taxon_id, sep = "_"),
      individualCount = count,
      taxonID = taxon_id,
      scientificName = coalesce(avilist_scientific_name, scientific_name_source),
      scientificNameAuthorship = avilist_scientific_name_authorship,
      kingdom = "Animalia",
      phylum = "Chordata",
      class = "Aves",
      order = avilist_order,
      family = avilist_family,
      genus = avilist_genus,
      taxonRank = coalesce(avilist_taxon_rank, taxon_rank_source),
      vernacularName = vernacular_name_source,
      occurrenceRemarks = case_when(
        quality != "" & comment != "" ~ paste(quality, comment, sep = " | "),
        quality != "" ~ quality,
        comment != "" ~ comment,
        TRUE ~ ""
      )
    )

  publication_year <- format(export_date, "%Y")
  latest_export_stem <- as.character(export_date)

  bounding_box <- tibble(
    west = min(locations_list$longitude),
    east = max(locations_list$longitude),
    north = max(locations_list$latitude),
    south = min(locations_list$latitude)
  )

  dataset_summary <- list(
    n_survey_combined = summary_table$n_survey[summary_table$site == "Combined"],
    n_survey_mida = summary_table$n_survey[summary_table$site == "Mida Creek"],
    n_survey_sabaki = summary_table$n_survey[summary_table$site == "Sabaki"],
    n_taxon_combined = summary_table$n_taxon[summary_table$site == "Combined"],
    n_observation_combined = summary_table$n_observation[summary_table$site == "Combined"],
    n_individual_combined = summary_table$n_individual[summary_table$site == "Combined"],
    n_species = species_recorded |> filter(taxon_rank == "Species") |> nrow(),
    n_other_taxa = species_recorded |> filter(taxon_rank != "Species") |> nrow(),
    n_family = nrow(family_recorded),
    first_date = min(counts$date),
    last_date = max(counts$date)
  )

  events_dashboard <- events |>
    mutate(
      site = locationID,
      year = lubridate::year(eventDate),
      month = lubridate::month(eventDate),
      monthLabel = month.abb[month],
      samplingMinutes = sampleSizeValue,
      eventDate = as.character(eventDate)
    ) |>
    select(
      eventID,
      eventDate,
      year,
      month,
      monthLabel,
      site,
      locality,
      county,
      decimalLatitude,
      decimalLongitude,
      samplingMinutes,
      samplingEffort,
      eventTime,
      dynamicProperties
    )

  occurrences_dashboard <- occurrences |>
    mutate(
      taxonKey = if_else(is.na(taxonID) | taxonID == "", vernacularName, taxonID)
    ) |>
    select(
      occurrenceID,
      eventID,
      taxonKey,
      taxonID,
      scientificName,
      taxonRank,
      vernacularName,
      individualCount,
      occurrenceRemarks
    )

  species_lookup_dashboard <- occurrences_dashboard |>
    distinct(taxonKey, taxonID, scientificName, taxonRank, vernacularName) |>
    left_join(
      species_lookup |>
        select(common_name_key, family, family_english, taxon_id),
      by = c("taxonID" = "taxon_id")
    ) |>
    left_join(
      avilist_lookup |>
        select(
          taxon_id,
          avilist_sequence,
          avilist_order,
          avilist_scientific_name,
          avilist_vernacular_name
        ),
      by = c("taxonID" = "taxon_id")
    ) |>
    mutate(
      displayScientificName = coalesce(avilist_scientific_name, scientificName),
      displayVernacularName = coalesce(avilist_vernacular_name, vernacularName),
      family = coalesce(family, "Unassigned"),
      family_english = coalesce(family_english, "Unassigned")
    ) |>
    arrange(is.na(avilist_sequence), avilist_sequence, displayVernacularName, displayScientificName)

  dashboard_occurrences_joined <- occurrences_dashboard |>
    left_join(
      events_dashboard |>
        select(eventID, eventDate, year, month, monthLabel, site),
      by = "eventID"
    ) |>
    left_join(
      species_lookup_dashboard |>
        select(
          taxonKey,
          family,
          family_english,
          avilist_sequence,
          avilist_order,
          displayScientificName,
          displayVernacularName
        ),
      by = "taxonKey"
    ) |>
    mutate(
      isIdentified = !str_detect(coalesce(taxonRank, ""), regex("family|order|slash", ignore_case = TRUE)) &
        !str_detect(coalesce(vernacularName, ""), regex("unidentified|sp\\.?$", ignore_case = TRUE))
    )

  summary_cards <- list(
    events = nrow(events_dashboard),
    taxa = n_distinct(occurrences_dashboard$taxonKey),
    observations = nrow(occurrences_dashboard),
    individuals = sum(occurrences_dashboard$individualCount, na.rm = TRUE),
    firstDate = as.character(min(events_dashboard$eventDate)),
    lastDate = as.character(max(events_dashboard$eventDate)),
    sites = sort(unique(events_dashboard$site))
  )

  series_year_site <- dashboard_occurrences_joined |>
    group_by(site, year) |>
    summarise(
      observations = n(),
      individuals = sum(individualCount, na.rm = TRUE),
      taxa = n_distinct(taxonKey),
      .groups = "drop"
    ) |>
    arrange(site, year)

  series_month_site <- dashboard_occurrences_joined |>
    group_by(site, month, monthLabel) |>
    summarise(
      observations = n(),
      individuals = sum(individualCount, na.rm = TRUE),
      taxa = n_distinct(taxonKey),
      .groups = "drop"
    ) |>
    arrange(site, month)

  species_rankings <- dashboard_occurrences_joined |>
    group_by(
      taxonKey,
      taxonID,
      scientificName,
      vernacularName,
      displayScientificName,
      displayVernacularName,
      taxonRank,
      family,
      family_english,
      avilist_sequence,
      avilist_order
    ) |>
    summarise(
      observations = n(),
      individuals = sum(individualCount, na.rm = TRUE),
      firstDate = min(eventDate),
      lastDate = max(eventDate),
      nEvents = n_distinct(eventID),
      .groups = "drop"
    ) |>
    arrange(is.na(avilist_sequence), avilist_sequence, displayVernacularName, displayScientificName)

  dashboard_metadata <- list(
    exportDate = latest_export_stem,
    siteUrl = site_url,
    dashboardUrl = dashboard_url,
    reportUrl = export_script_url,
    taxonomy = list(
      source = "AviList",
      version = "2025",
      reference = "avilistr::avilist_2025"
    ),
    summaryCards = summary_cards,
    rowCounts = list(
      events = nrow(events_dashboard),
      occurrences = nrow(occurrences_dashboard),
      species = nrow(species_lookup_dashboard)
    ),
    filters = list(
      sites = sort(unique(events_dashboard$site)),
      years = list(
        min = min(events_dashboard$year, na.rm = TRUE),
        max = max(events_dashboard$year, na.rm = TRUE)
      ),
      months = as.list(setNames(seq_len(12), month.abb))
    )
  )

  dwc_objects <- list(
    dwc_dir = dwc_dir,
    dashboard_dir = dashboard_dir,
    counts = counts,
    counts_export = counts_export,
    excluded_export_records = excluded_export_records,
    summary_table = summary_table,
    species_recorded = species_recorded,
    family_recorded = family_recorded,
    survey_dates = survey_dates,
    temporal_summary = temporal_summary,
    content_providers = content_providers,
    events = events,
    occurrences = occurrences,
    export_date = export_date,
    publication_year = publication_year,
    latest_export_stem = latest_export_stem,
    bounding_box = bounding_box,
    dataset_summary = dataset_summary,
    events_dashboard = events_dashboard,
    occurrences_dashboard = occurrences_dashboard,
    species_lookup_dashboard = species_lookup_dashboard,
    summary_cards = summary_cards,
    series_year_site = series_year_site,
    series_month_site = series_month_site,
    species_rankings = species_rankings,
    dashboard_metadata = dashboard_metadata
  )

  if (write_files) {
    export_dwc_csv(dwc_objects)
    export_dwc_eml(data_objects, dwc_objects)
  }

  dwc_objects
}

# Export Darwin Core CSV --------------------------------------------------

export_dwc_csv <- function(dwc_objects, dwc_dir = dwc_objects$dwc_dir) {
  dir.create(dwc_dir, recursive = TRUE, showWarnings = FALSE)

  event_path <- file.path(dwc_dir, paste0("events_", dwc_objects$export_date, ".csv"))
  occurrence_path <- file.path(dwc_dir, paste0("occurrences_", dwc_objects$export_date, ".csv"))

  readr::write_csv(dwc_objects$events, event_path, na = "")
  readr::write_csv(dwc_objects$occurrences, occurrence_path, na = "")

  invisible(c(events = event_path, occurrences = occurrence_path))
}

# XML helpers -------------------------------------------------------------

read_eml_safely <- function(path) {
  eml_lines <- readLines(path, warn = FALSE)
  eml_lines <- gsub(
    "&(?!(amp;|lt;|gt;|quot;|apos;|#))",
    "&amp;",
    eml_lines,
    perl = TRUE
  )
  read_xml(paste(eml_lines, collapse = "\n"))
}

set_node_text <- function(doc, xpath, value) {
  node <- xml_find_first(doc, xpath)
  xml_set_text(node, value)
}

set_para_text <- function(doc, xpath, value) {
  node <- xml_find_first(doc, xpath)
  xml_remove(xml_contents(node))
  xml_set_text(node, value)
}

# Export EML --------------------------------------------------------------

export_dwc_eml <- function(
  data_objects,
  dwc_objects,
  eml_template_file = data_objects$eml_template_file,
  eml_output_file = data_objects$eml_output_file
) {
  list2env(data_objects, envir = environment())
  list2env(dwc_objects, envir = environment())

  eml <- read_eml_safely(eml_template_file)

  set_node_text(eml, "//*[local-name()='dataset']/*[local-name()='pubDate']", as.character(export_date))
  set_para_text(
    eml,
    "(//*[local-name()='dataset']/*[local-name()='abstract']/*[local-name()='para'])[2]",
    glue::glue(
      "The dataset includes {dataset_summary$n_survey_combined} surveys ({summary_table$n_survey[summary_table$site == 'Mida Creek']} at Mida Creek and {summary_table$n_survey[summary_table$site == 'Sabaki']} at Sabaki River Mouth), {scales::comma(dataset_summary$n_taxon_combined)} recorded taxa, {scales::comma(dataset_summary$n_observation_combined)} observations, and {scales::comma(dataset_summary$n_individual_combined)} individuals counted."
    )
  )
  set_para_text(
    eml,
    "(//*[local-name()='dataset']/*[local-name()='abstract']/*[local-name()='para'])[5]",
    "The metadata and data are generated from the field spreadsheet with two Quarto scripts: script/01_data_checks.qmd checks the source data, and script/02_export_outputs.qmd exports the Darwin Core files, EML metadata, and dashboard JSON files."
  )
  set_para_text(
    eml,
    "(//*[local-name()='dataset']/*[local-name()='abstract']/*[local-name()='para'])[6]",
    "The repository is available at https://github.com/A-Rocha-Kenya/Waterbird-counts-Sabaki-Mida/ and the project website is available at https://a-rocha-kenya.github.io/Waterbird-counts-Sabaki-Mida/."
  )
  set_para_text(
    eml,
    "(//*[local-name()='dataset']/*[local-name()='abstract']/*[local-name()='para'])[7]",
    glue::glue(
      "Event table fields: {paste(names(events), collapse = ', ')}."
    )
  )
  set_para_text(
    eml,
    "(//*[local-name()='dataset']/*[local-name()='abstract']/*[local-name()='para'])[8]",
    glue::glue(
      "Occurrence table fields: {paste(names(occurrences), collapse = ', ')}."
    )
  )
  set_node_text(eml, "//*[local-name()='beginDate']/*[local-name()='calendarDate']", as.character(dataset_summary$first_date))
  set_node_text(eml, "//*[local-name()='endDate']/*[local-name()='calendarDate']", as.character(dataset_summary$last_date))
  set_node_text(eml, "//*[local-name()='westBoundingCoordinate']", format(bounding_box$west, scientific = FALSE, trim = TRUE))
  set_node_text(eml, "//*[local-name()='eastBoundingCoordinate']", format(bounding_box$east, scientific = FALSE, trim = TRUE))
  set_node_text(eml, "//*[local-name()='northBoundingCoordinate']", format(bounding_box$north, scientific = FALSE, trim = TRUE))
  set_node_text(eml, "//*[local-name()='southBoundingCoordinate']", format(bounding_box$south, scientific = FALSE, trim = TRUE))
  set_para_text(
    eml,
    "//*[local-name()='taxonomicCoverage']/*[local-name()='generalTaxonomicCoverage']",
    glue::glue(
      "The Ramsar Convention on Wetlands defines waterbirds as any \"species of bird that are ecologically dependent on wetlands\". This term is further refined in the second edition of Waterfowl Population Estimates (Rose, P.M. and Scott, D.A., 1997), as being all species of the families Gaviidae, Podicipedidae, Pelecanidae, Phalacrocoracidae, Anhingidae, Ardeidae, Balaenicipitidae, Scopidae, Ciconiidae, Threskiornithidae, Phoenicopteridae, Anhimidae, Anatidae, Pedionomidae, Gruidae, Aramidae, Rallidae, Heliornithidae, Eurypygidae, Jacanidae, Rostratulidae, Dromadidae, Haematopodidae, Ibidorhynchidae, Recurvirostridae, Burhinidae, Glareolidae, Charadriidae, Scolopacidae, Thinocoridae, Laridae, Sternidae and Rynchopidae.\n\nTaxa are recorded at the species level with the exception of the Heuglin's Gull (Larus fuscus heuglini) and Baltic Gull (Larus fuscus fuscus). Whenever a bird could not be safely identified at the species level, the identification was done as slash taxa, genus, family, order or even as Aves sp.\n\nThe dataset contains {dataset_summary$n_species} species and {dataset_summary$n_other_taxa} taxa at other taxonomic levels (subspecies, family, slash taxa, etc.) belonging to {dataset_summary$n_family} families.\n\nThe taxonomy follows AviList 2025 through the avilistr reference list (avilistr::avilist_2025), and the taxonID uses the corresponding Cornell Lab species code."
    )
  )
  set_node_text(
    eml,
    "(//*[local-name()='distribution']/*[local-name()='online']/*[local-name()='url'])[1]",
    site_url
  )
  set_para_text(
    eml,
    "//*[local-name()='methods']/*[local-name()='methodStep']/*[local-name()='description']/*[local-name()='para']",
    "The conversion to the GBIF standard is performed with a Quarto script."
  )
  set_node_text(
    eml,
    "//*[local-name()='gbif']/*[local-name()='dateStamp']",
    format(as.POSIXct(export_date, tz = Sys.timezone()), "%Y-%m-%dT00:00:00%z") |>
      stringr::str_replace("(\\+|\\-)(\\d{2})(\\d{2})$", "\\1\\2:\\3")
  )
  set_node_text(
    eml,
    "//*[local-name()='gbif']/*[local-name()='citation']",
    glue::glue(
      "Nussbaumer R, Lennox K, Baya A, Gijsbertsen J, Kinzer A, Jackson C ({publication_year}): Waterbird Counts at Sabaki River Mouth and Mida Creek. A Rocha Kenya. Dataset/SamplingEvent. https://doi.org/10.15468/9hs9vv"
    )
  )

  dir.create(dirname(eml_output_file), recursive = TRUE, showWarnings = FALSE)
  write_xml(eml, eml_output_file, options = c("format", "no_declaration"))
  invisible(eml_output_file)
}
