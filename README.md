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


Functions:
User:
Registration: 
registration_name:  		if succeed, return user_name (send to user) and user_id ( send to server)
registration_password:	hashed after sign up and send to database

Login:
login_name 			if succeed, return status: 1(Logged In)
login_password		compare to the hash

Comment on Location:
add_comment:
del_comment:

Estimated Time of Arrival:

Search:
Search Loc_name		return routeId,  start_loc_name, end_loc_name
Search Route Id		return loc_name, locId(hidden)

Favorite (Location, Route):
add_favourite_loc
add_favourite_route
del_favourite_loc
del_favourite_route

Logout		if succeed, return status: 0 (Logged Out)


Admins:
(access by the URL get virtual path)
CRUD actions
Create/Read/Update/Delete

URL Path:
GET /user/...
GET /admin/...



# Deadline: 15 May 2020 (Fri)
---
