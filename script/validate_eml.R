library(xml2)
library(here)
library(cli)

eml_file <- here("data", "derived", "dwc", "eml-waterbird_counts_sabaki_mida.xml")
xsd_file <- here("data", "raw", "eml.xsd")

cli::cli_alert_info("Checking XML well-formedness with xml2")
eml_doc <- xml2::read_xml(eml_file)
cli::cli_alert_success("xml2 parsed the EML file")

root <- xml2::xml_find_first(eml_doc, "/*")
schema_location <- xml2::xml_attr(root, "schemaLocation")

if (xml2::xml_attr(root, "xmlns:eml") != "https://eml.ecoinformatics.org/eml-2.2.0") {
  cli::cli_abort("The EML root does not use the GBIF metadata profile namespace.")
}

if (!grepl("https://rs.gbif.org/schema/eml-gbif-profile/1.3/eml.xsd", schema_location, fixed = TRUE)) {
  cli::cli_abort("The EML root does not point to the GBIF metadata profile schema.")
}

paragraphs_with_children <- xml2::xml_find_all(eml_doc, "//*[local-name()='para'][*]")

if (length(paragraphs_with_children) > 0) {
  cli::cli_abort(c(
    "GBIF profile check failed: paragraph elements must use plain text here.",
    "x" = "Remove inline child elements such as {.code <ulink>}, {.code <emphasis>}, {.code <email>}, or {.code <citetitle>} from {.code <para>}."
  ))
}

cli::cli_alert_success("GBIF profile checks passed for root schema and plain-text paragraphs")

cli::cli_alert_info("Checking XML well-formedness with xmllint")
xmllint_status <- system2("xmllint", c("--noout", eml_file))

if (!identical(xmllint_status, 0L)) {
  cli::cli_abort("xmllint reported a parsing error.")
}

cli::cli_alert_success("xmllint accepted the EML file")

if (file.exists(xsd_file)) {
  cli::cli_alert_info("Checking XML schema validity with local XSD")
  xsd_doc <- xml2::read_xml(xsd_file)

  if (!xml2::xml_validate(eml_doc, xsd_doc)) {
    cli::cli_abort("Schema validation failed against {.file {xsd_file}}.")
  }

  cli::cli_alert_success("Schema validation passed")
} else {
  cli::cli_alert_warning("No local XSD found at {.file {xsd_file}}. Only well-formedness was checked.")
}
