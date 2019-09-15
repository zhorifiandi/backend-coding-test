# Endpoint List

Here, we define list of endpoints that available on this service.

## Get Rides

```bash
GET 'http://localhost:8010/rides?page=2&per_page=3'
```
Params:
- page - Integer - Represents a page of records you want to fetch (Default: 1)
- per_page - Integer - Represents a number of elements contained on a page (Default: 5)

## Get Ride  by Id

```bash
GET 'http://localhost:8010/rides/:id'
```
Params:
- id - Integer - Ride's id you want to fetch

## Create Ride


```bash
POST 'http://localhost:8010/rides' -H 'Content-Type: application/json'
```
Body:
```json
{
	"start_lat": 45,
	"start_long": 45,
	"end_lat": -45,
	"end_long": 0,
	"rider_name": "Takeshi Yamamoto",
	"driver_name": "Kojiro Yamamoto",
	"driver_vehicle": "Supra X"
}
```
