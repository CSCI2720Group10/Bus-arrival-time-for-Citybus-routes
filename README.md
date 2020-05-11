# Bus-arrival-time-for-Citybus-routes


2 Modes of Access:

1.User

User view: top 5 locations with most comments (e.g. bar chart) 

2.Admins

Admin view: top 5 active users with comments and favourites (e.g. bar chart) 

Data Source:
https://data.gov.hk/en-data/dataset/ctb-eta-transport-realtime-eta

Data Schema Plan:
1. Location
- locId : number
- Latitude: number
- Longitude: number
- name : String
- Buses arrival time: timestamp
- routeId: number
2. User
- userId: Number 
- userName: String      
- Password: String
- fav_locId : number  
- fav_routeId: number
- SearchHistory: String
- Status: number
3. Route
- routeId: number
- locId: number
- arrived_time: timestamp
- start_locId: number
- end_locId: number
- stopCount: number
4. Route-Stop
- data{routeId, dir, seq, locId }
5. Comment
- commentId: number
- userId: number
- content: String
- locId: number 
- time: timestamp

APIs to be used:
- Google Maps	- Route Data		- Bus Stop Data
- Bus Stop List of specific Route data 		- Estimated Time of Arrival (ETA) data 


# Deadline: 15 May 2020 (Fri)
---
