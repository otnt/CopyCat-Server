# CopyCat Server

## How to use
1.(run this ONCE)

`mongod` Make sure MongoDB is running at 127.0.0.1:27017

`cd database`

`node test_populate.js`

This will populate some test data to MongoDB `test` database.

2.In root folder, `node server.js` to run server

# API
## **GET /promos/hot**

Fetch popular resources from server. By default, this api gets most recent popular resources, with number equals to `count`.
  
*  **URL Params**

|    |    |
---- |-----
|`count` <br><br> *optional* | Specifies the number of records to retrieve. Must be less than or equal to 200. Defaults to 20.  <br><br> **Example Values:** 5|
| `sinceId` <br><br> *optional* |Returns results with an ID greater than (that is, more recent than) the specified ID. <br><br> **Example Values:** 123|
|`maxId`<br><br>*optional*| Returns results with an ID less than (that is, older than) or equal to the specified ID.<br><br> **Example Values:** 234|


* **Example Request:**
`GET https://www.copycat.com/api/v0/promos/hot?sinceId=123&maxId=234`

* **Success Response:**
  
  A successful response will return a list of `Album` model, with the `photoIdList` field in `Album` is populated with `_id`, `imageUrl` and `ownerId` (at most 10 `Photo` are populated for each album).
  
  * **Code:** 200 <br />
    **Content:** 
```JSON
[
   {
      "_id":"56ca8bbed79c8f1f31cde91e",
      "name":"nature",										                         
      "imageUrl":"https://s3.amazonaws.com/copycatimage/cmu.jpg",
      "ownerId":"56ca8bbed79c8f1f31cde918",
      "__v":0,
      "tagList":[
         "wonderful",
         "great",
         "amazing"
      ],
      "photoIdList":[
         {
            "_id":"56ca8bbed79c8f1f31cde919",
            "imageUrl":"https://s3.amazonaws.com/copycatimage/elephant.jpg",
            "ownerId":"56ca8bbed79c8f1f31cde918"
         }
      ]
   }
]
```
 
* **Error Response:**
  
  * **Code:** 401 Unauthorized
  **Content:** None
  
  * **Code:** 403 Forbidden
  **Content:** None
  
  * **Code:** 404 Not Found
  **Content:** None 
  
   * **Code:** 410 Gone
  **Content:** 
  ```
  {error: "Please use most updated api version: v2}
  ```
  
  * **Code:** 429 Too Many Requests
  **Content:** None

* **Notes:**

	Please refer to [Twitter's timeline api design](https://dev.twitter.com/rest/public/timelines).

## **GET /promos/editor**

Fetch the most recent editor's choice. This api could also get a specific editor's choice by passing an ID.
  
*  **URL Params**

|    |    |
---- |-----
| `id` <br><br> *optional* |Return editor's choice with this `id`. <br><br> **Example Values:** 123|
 

* **Example Request:**
`GET https://www.copycat.com/api/v0/promos/editor?id=123`

* **Success Response:**
  
  A successful response will return a list of `Album` model, with the `photoIdList` field in `Album` is populated with `_id`, `imageUrl` and `ownerId` (at most 10 `Photo` are populated for each album).
  
  * **Code:** 200 <br />
    **Content:** 
```JSON
{
   "_id":"56ca8bbed79c8f1f31cde922",
   "name":"editor choice test",
   "__v":0,
   "albumIdList":[
      {
         "_id":"56ca8bbed79c8f1f31cde91f",
         "name":"documentary",
         "imageUrl":"https://s3.amazonaws.com/copycatimage/cmu.jpg",
         "ownerId":"56ca8bbed79c8f1f31cde918",
         "__v":0,
         "tagList":[
            "wonderful",
            "great",
            "amazing"
         ],
         "photoIdList":[
            "56ca8bbed79c8f1f31cde91c",
            "56ca8bbed79c8f1f31cde91b"
         ]
      }
   ]
}
```
 
* **Error Response:**
   
  * **Code:** 401 Unauthorized
  **Content:** None
  
  * **Code:** 403 Forbidden
  **Content:** None
  
  * **Code:** 404 Not Found
  **Content:** None 
  
   * **Code:** 410 Gone
  **Content:** 
  ```
  {error: "Please use most updated api version: v2}
  ```
  
  * **Code:** 429 Too Many Requests
  **Content:** None

* **Notes:**
None.

## **GET /albums/:id**

Fetch an album with specific ID.
  
*  **URL Params**
None.

* **Example Request:**
`GET https://www.copycat.com/api/v0/promos/albums/56ca8bbed79c8f1f31cde91e`

* **Success Response:**
  
  A successful response will return an `Album` model, with the `photoIdList` field in `Album` is populated with `_id`, `imageUrl` and `ownerId` (at most 10 `Photo` are populated).
  
  * **Code:** 200 <br />
    **Content:** 
```JSON
{
   "_id":"56ca8bbed79c8f1f31cde91e",
   "name":"nature",
   "imageUrl":"https://s3.amazonaws.com/copycatimage/cmu.jpg",
   "ownerId":"56ca8bbed79c8f1f31cde918",
   "__v":0,
   "tagList":[
      "wonderful",
      "great",
      "amazing"
   ],
   "photoIdList":[
      {
         "_id":"56ca8bbed79c8f1f31cde919",
		    "imageUrl":"https://s3.amazonaws.com/copycatimage/elephant.jpg",
         "ownerId":"56ca8bbed79c8f1f31cde918"
      }
   ]
}
```
 
* **Error Response:**
  
  * **Code:** 401 Unauthorized
  **Content:** None
  
  * **Code:** 403 Forbidden
  **Content:** None
  
  * **Code:** 404 Not Found
  **Content:** None 
  
   * **Code:** 410 Gone
  **Content:** 
  ```
  {error: "Please use most updated api version: v2}
  ```
  
  * **Code:** 429 Too Many Requests
  **Content:** None

* **Notes:**
None.

## **GET /photos/:id**

Fetch a photo with specific ID.
  
*  **URL Params**
None.

* **Example Request:**
`GET https://www.copycat.com/api/v0/photos/56ca8bbed79c8f1f31cde919`

* **Success Response:**
  
   A successful response will return a `Photo` model.
  
  * **Code:** 200 <br />
    **Content:** 
```JSON
[
   {
      "_id":"56ca8bbed79c8f1f31cde919",
      "imageUrl":"https://s3.amazonaws.com/copycatimage/elephant.jpg",
      "ownerId":"56ca8bbed79c8f1f31cde918",
      "__v":0,
      "tagList":[
         "cool",
         "awesome",
         "interesting"
      ]
   }
]
```
 
* **Error Response:**
  
  * **Code:** 401 Unauthorized
  **Content:** None
  
  * **Code:** 403 Forbidden
  **Content:** None
  
  * **Code:** 404 Not Found
  **Content:** None 
  
   * **Code:** 410 Gone
  **Content:** 
  ```
  {error: "Please use most updated api version: v2}
  ```
  
  * **Code:** 429 Too Many Requests
  **Content:** None

* **Notes:**
None.

# **Model**

## **Album**
|     |       |
------|--------
|name <br><br> *required*| type : string <br><br> Name of album.|
|imageUrl <br><br> *required*| type : string <br><br> Image URL of cover of album.|
|photoIdList<br><br>*optional*| type : [ObjectId] <br><br> Reference list to all photos in album.
|ownerId<br><br>*required*|type : ObjectId <br><br> Reference to creator.
|tagList<br><br>*optional*|type : [string] <br><br> A list of tags.

## **Photo**
|     |       |
------|--------
|imageUrl <br><br> *required*| type : string <br><br> Image URL of photo.|
|referenceId<br><br>*optional*| type : ObjectId <br><br> Reference to template.
|ownerId<br><br>*required*|type : ObjectId <br><br> Reference to creator.
|tagList<br><br>*optional*|type : [string] <br><br> A list of tags.

## **User**
|     |       |
------|--------
|name <br><br> *required*| type : string <br><br> Name of user.|
