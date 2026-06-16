# Load packages -----------------------------------------------------------

library(cli)
library(DT)
library(htmltools)
library(knitr)

knitr::opts_chunk$set(
  fig.width = 10,
  fig.height = 5,
  fig.align = "center"
)

# Helper functions --------------------------------------------------------

show_table <- function(x, caption = NULL, page_length = 10) {
  DT::datatable(
    x,
    caption = caption,
    options = list(pageLength = page_length, scrollX = TRUE),
    rownames = FALSE
  )
}

show_check <- function(x, ok = "No issues found.") {
  if (nrow(x) == 0) {
    htmltools::div(class = "check-ok", ok)
  } else {
    show_table(x)
  }
}

stop_if_issues <- function(x, message, strict = FALSE) {
  if (strict && nrow(x) > 0) {
    cli::cli_abort(message)
  }
}

load_helper <- function() {
  invisible(TRUE)
}
