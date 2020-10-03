# Monthly waterbird count: Sabaki River Mouth and Mida Creek

Raphaël Nussbaumer<sup>1</sup>, Kirao Lennox <sup>1</sup>, Colin Jackson <sup>1</sup>

[1]: A Rocha Kenya, Watamu, Kenya

**Corresponding author**: Raphaël Nussbaumer (raphael.nussbaumer@arocha.org)

---

## Data Licences
This work is licensed under a *Creative Commons Attribution Non Commercial (CC-BY-NC) 4.0 License*.


## Description
Every months since 2000, [A Rocha Kenya](https://www.arocha.or.ke/) has been monitoring waterbird at two key sites on the Coast of Kenya: Sabaki river mouth ([3°10'03.4"S 40°08'41.7"E](https://goo.gl/maps/RVFBvT526bkHLsTw5)) and Mida Creek ([3°20'07.2"S 39°58'26.4"E](https://goo.gl/maps/dRP9xsPXoa4EhNwp6)) since 2000.

***Table 1**: Summary  statistics of the counts.*
|site     |Mida Creek |Sabaki |
|:--------|:----------|:------|
|Number of surveys (events) |86         |96     |
|Number of Species Recorded    |78         |105    |
|Number of observations    |1'782       |3'539   |
|Number of individual seen    |265'402     |402'184 |

**Aim and objective:**
- Monitoring waterbird population at this two keys migratory stopover site and wintering site. 
- Assess short and long-term trend of waders. 
- Learn seasonality patterns in arrival and departure,
- Study the impact of climate change, habitat change, habitat change, human disturbance.

**Link to other organism**:
- [International Waterbird Census](http://iwc.wetlands.org/) (coordinated by [Wetlands International](https://www.wetlands.org/)) 
- [Coordinated Waterbird Counts (CWAC)](http://cwac.birdmap.africa/)
- [the Ramsar Convention on Wetlands](https://www.ramsar.org/), 
- [the Agreement on the Conservation of African-Eurasian Migratory Waterbirds (AEWA)](https://www.unep-aewa.org/)

**Type of data**
This dataset is published as a [Darwin Core Archive](https://dwc.tdwg.org/) using a [sampling event dataset](https://www.gbif.org/sampling-event-data) type.

**Data structure**

The metadata and data are generated with [a Rmarkdown file](scripts/generate_gbif_files.html) based on the spreadsheet used to entered data. This script produces two table file: [`events.csv`](data/events.csv) records informations related to the overall surveys and [`occurences.csv`](data/occurences.csv) contains information about the individual counts. 

***Table 2**: Events (surveys) table structure.*
|type  |language |license  |rightsHolder  |ownerInstitutionCode |eventID |samplingProtocol |sampleSizeValue |sampleSizeUnit |samplingEffort |eventDate  |eventTime |locationID |continent |country |countryCode |county |locality   | decimalLatitude| decimalLongitude|dynamicProperties|
|:-----|:--------|:----------------------------------------------------------|:-------------|:--------------------|:-------------|:----------------|:---------------|:--------------|:--------------|:----------|:---------|:----------|:---------|:-------|:-----------|:------|:----------|---------------:|----------------:|:----------|

***Table 3**: Occurences (counts) table structure.*
|basisOfRecord    |eventID       |occurrenceID          | individualCount|taxonID |scientificName        |kingdom  |phylum   |class |takonRank |scientificNameAuthorship |vernacularName         |occurrenceRemarks |
|:----------------|:-------------|:---------------------|---------------:|:-------|:---------------------|:--------|:--------|:-----|:---------|:------------------------|:----------------------|:-----------------|


## Geographic coverage

Located on the coast of Kenya, Sabaki River Mouth and Mida Creek represents key hotspot for waterbird, specially for wintering and migrating waders. 
[to be written: general context on the coast, ecoregion]

[![Figure 1](data/locations.png)](data/locations.geojson)

***Figure 1**: Map showing the path followed during the transect and the area covered by the count for Sabaki river mouth (north) and Mida Creek (South). This geospatial dataset is available in [this repository](data/locations.geojson) as a geojson file.*


### Sabaki River Mouth
IBA: [6409](http://datazone.birdlife.org/site/factsheet/6409)

Sabaki River Mouth is where the Athi-Galana-Sabaki river system empties into the Indian Ocean some 5 km north of Malindi. Due to the combined action of ocean currents and freshwater flow from the highlands bringing high levels of silt, a diverse array of habitats have been formed. These include open sandy beach, sandbanks, mudflats, salt marsh, vegetated and bare sand dunes, seasonal and permanent fresh water pools, mangroves, grassland and coastal scrub. Since the mid-1970s a high level of silt deposition has taken place that has extended the river mouth into the ocean and created the wide, open mud and sand flats which are the key attraction for large numbers of waders. Until c. 2000 there was only some degraded patches of mangrove forest slightly upstream. With the siltation, however, conditions became ideal for mangroves to become established and an area of over 12 ha of mangrove forest has grown on the northern banks of the river mouth. Seasonal wetlands form during seasons of good rain on the extension of low sand dunes between the beach and the old, high sand dunes and provide breeding habitat for some birds such as Black-winged Stilts. The sandflats and beach are regularly used as a roost for often large numbers of gulls and terns which forage out at sea and come to the relative safety of the river mouth to rest.

A series of high (up to c. 25 m) wind-blown sand dunes extend about five km north and three km south of the river. These dunes form an important aquifer and as a result among the dunes are pools and wells of fresh water filtered by the sand and separ

"Sabaki" is the name of the final few kilometres of the river that starts in the Ngong Hills west of Nairobi as the Athi River and is known as the Galana River through Ukambani and Tsavo East National Park. At its mouth it is c. 150 m wide broadening



### Mida Creek
IBA: [6406](http://datazone.birdlife.org/site/factsheet/6406)
[to be written: CJ]
high diversity of mangrove forests species and fish species

### Bounding box
The bounding box is **-3.3495° to -3.1522° latitude** and **39.9617° to 40.1525° longitude**.


## Taxonomic coverage

The Ramsar Convention on Wetlands defined waterbird as any "species of bird that are ecologically dependent on wetlands". This term is further precised in the second edition of Waterfowl Population Estimates, as all species of the families Gaviidae, Podicipedidae, Pelecanidae, Phalacrocoracidae, Anhingidae, Ardeidae, Balaenicipitidae, Scopidae, Ciconiidae, Threskiornithidae, Phoenicopteridae, Anhimidae, Anatidae, Pedionomidae, Gruidae, Aramidae, Rallidae, Heliornithidae, Eurypygidae, Jacanidae, Rostratulidae, Dromadidae, Haematopodidae, Ibidorhynchidae, Recurvirostridae, Burhinidae, Glareolidae, Charadriidae, Scolopacidae, Thinocoridae, Laridae, Sternidae and Rynchopidae.

Taxon are recorded at the species level with the exeption of the Heuglin's Gull (*larus fuscus heuglini*) and Baltic Gull (*larus fuscus fuscus*). During some counts, specie level was possible, and the identification was done as slash (e.g. Lesser/Greater Sand Plover), genus, family, order or even as *Aves sp.*.

The extend of our dataset contains **107** species recorded and **6** other taxons (subspecies, family, slash etc.) belonging to **22** families.

The `taxonID` used is the species code from the [eBird/Clements Checklist of Birds of the World: v2019](https://www.birds.cornell.edu/clementschecklist/download/)


### Taxonomic ranks

**Kingdom**: *Animalia* (animals)

**Phylum**: Chordata

**Class**: *Aves* (birds)

**Families**: *Scolopacidae* (Sandpipers and Allies), *Laridae* (Gulls, Terns and Skimmers), *Charadriidae* (Plovers and Lapwings), *Phoenicopteridae* (Flamingos), *Dromadidae* (Crab-plover), *Anatidae* (Ducks and Geese), *Glareolidae* (Coursers and Pratincoles), *Accipitridae* (Hawks, Vultures, Buzzards, Eagles and Allies), *Threskiornithidae* (Ibises and Spoonbills), *Ardeidae* (Herons, Egrets and Bitterns), *Ciconiidae* (Storks), *Pelecanidae* (Pelicans), *Recurvirostridae* (Stilts and Avocets), *Haematopodidae* (Oystercatchers), *Alcedinidae* (Kingfishers), *Burhinidae* (Thick-knees), *Phalacrocoracidae* (Cormorants), *Pandionidae* (Ospreys), *Rostratulidae* (Painted-snipes), *Balaenicipitidae* (Shoebill), *Jacanidae* (Jacanas), *Rallidae* (Rails, Crakes and Gallinules)



## Temporal coverage

The temporal coverage is **1998-10-29 - 2020-09-16**.

![Figure 2](data/coverage_Sabaki.png)

***Figure 2**: Coverage of the counts performed at Sabaki River Mouth per year and month. The colorscale indicate the number of species recorded in each counts.*

![Figure 3](data/coverage_Mida%20Creek.png)

***Figure 3**: Coverage of the counts performed at Mida Creek per year and month. The colorscale indicate the number of species recorded in each counts.*


## Keywords
bird, waterbird, [...]

## Associated parties

[Possible Role:
Author
Content Provider
Custodian Steward	
Distributor	
Editor
Metadata Provider
Originator
Owner
Point Of Contact
Principal Investigator
Processor
Publisher
User	
Programmer
Curator
]


### Content providers

The counts are organized by A Rocha Kenya. 
The (incompmlete) list of participants includes: Alasdair Lindop, Alber Baya, Alex Mwalim, Ameline Nussbaumer, Amina simba, Andrew Kinzer, Apolloh James, Benjamin Suluby, Chris Halliwell, Colin Jackson, Daniel Kazungu, Dena Elijah, Dixon, Edwin, Eric Thuranira, Erick Karisa Menza, Francis Kazungu, Frank, Freshly Tsofa, Harry Mjambili, Hilary Mwachia, Israel Lemako, Jan Van Beck, Job Aben, Jonathan Furaha, Joseph Ojuja, Judith Adhiambo, Juma Badi, Kate England, Kibwana Ali, Kirao Lennox, Kirao Mwari, Lydia Kayaa, Lynton Baird, Marissa, Martilda Munga, Melisa, Michael Kadenge, Monica Njambi, Mustafa Adamjee, Patrick Kaingu, Pauline Kasungu, Peter Musembi, Peter Ndurya, Raphaël Nussbaumer, Rehema, Saddam Kailo, Salim Abdallah, Sam Oldland, Sammy Kenga, Samuel Mwen, Ted Nanninga, Timothy mweri.



## Project data

### Project title
Waterbird counts 

### Identifier

### Description

### Funding

### Study Area Description

### Design Description




## Sampling Methods

### Study extent

### Sampling Description
- how the count were performed
scopes, number fo people, writting in notebook and converting to excel spreasdsheet. etc...

### Quality control
R script?

### Step Description
https://a-rocha-kenya.github.io/Waterbird-counts-Sabaki-Mida/scripts/generate_gbif_files




## Citations

### Citations
[auto generated]


## External Links
- Github: https://github.com/A-Rocha-Kenya/Waterbird-counts-Sabaki-Mida
- Script: https://a-rocha-kenya.github.io/Waterbird-counts-Sabaki-Mida/scripts/generate_gbif_files
- Shiny App: https://rafnuss.shinyapps.io/water_bird_count/


## Additional Metadata

*Date created:* 2020-10-03