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


About This Project

Group Members (Group 10)
Kwan Tsz Fung		        1155078864
Lee Kwan Hung		        1155108603
Wong Ching Yeung Wallace 	1155093534
Choi Chun Wa                    1155094180

Workload distribution
Kwan Tsz Fung: user action# 4, 6, admin action# 1, 2, 3, charting statistics in admin view
Lee Kwan Hung: user action# 1, 3, admin action# 1, 2, 3, 5, non-user action#1, 2, charting statistics in user view
Wong Ching Yeung Wallace: user action# 2, 3, 4, 5 admin action# 4, user-location , googleMap application
Choi Chun Wa: report writing, Restful API design, Interface Design, Programme Code structure Editing
Together: Debug, design different schemas, demo practice

"How to"
Login page:
-sign in form (sign in as user)
-sign up link
-admin login link (sign in as admin)
-About this Proj

Sign in as User:
-Home Page
(Showing overall locations and separate view locations with comments in map)
(Showing the nearby location for target location)
-Location
(List locations in table, Search locations)
-See Favourite Locations
(List favourite locations in table)
-See Top 5 Locations
(Bar Chart and Pie Chart showing locations with most comments)
-Username at top right corner
(With a dropdown "Logout" which will return to Login Page)

Sign in as Admin:
-Home Page
(A welcome notice and a flush data function)
-Location
(Create, Retrieve, Update and Delete operations of location data)
-User
(Create, Retrieve, Update and Delete operations of user data)
-Create Location Data
(Import location data by uploading a format-satisfying .csv file)
-Top 5 Users
(Showing top 5 active users with most comments and most favourite locations in two bar charts)
-Logout
(Return to Login Page)

Data Schemas
Location	
locId: String
name: String
latitude: Number
longitude: Number
Route	
routeId: String
stopCount: Number
dir: String
locInfo: {loc: ObjectId to Location, seq: Number}
User	
userId: Number
username: String
password: String
fav_locId: Array of String
commentNum: Number
favLocNum: Number
homeLoc: {latitude: Numebr, longitude: Number}
Comment	
commentId: Number
userId: Number
username: String
content: String
locId: String
time: String
Technologies and Libraries
Why NodeJS + ajax + MongoDB(mongoose)?

advantages	disadvantages
nodejs and mongoose look like javascript language which is easy to code	data redundancy may occur in the collection which wastes the memory
MongoDB is newly developed that I can check the data in the community app with only a few clicks	There is no foreign key in MongoDB which is hard to connect two databases for finding the location
MongoDB is easy to set-up especially for the Newby	
MongoDB has a flexible data type collection	


We have read the article in http://www.cuhk.edu.hk/policy/academichonesty carefully.
Return to Login Page

