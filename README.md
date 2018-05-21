# node_todo_api
Node TODO API

I created this API in Express to learn about how to use a MongoDB database with Express. This application features a 'roll your own' 
JWT authentication/authorization system. Here are the endpoints:

### Static
**GET /**

Returns JSON containing info and basic usage.

---
### Users
**POST /users**

Creates a new user. Requires a JSON body in the request that includes an email and a password. Returns JSON containing the new user
and an x-auth header that contains a JWT used for authenication and authorization purposes.

*example request*

```json
{
  "email": "testing123@fmail.com",
  "password": "Correct Horse Battery Staple"
}
```
*example response*

```json
{
    "_id": "5b03489bbb34770c41b8b2cb",
    "email": "testing123@fmail.com"
}
```
---

**POST /users/login**

Login to an existing account. Requires a JSON body containing a username and a password. If successful, returns JSON containing email and password of the user. Header contains the x-auth token.

*example request*

```json
{
  "email": "testing123@fmail.com",
  "password": "Correct Horse Battery Staple"
}
```

*example response*

```json
{
    "_id": "5b03489bbb34770c41b8b2cb",
    "email": "testing123@fmail.com"
}
```

Response headers contain x-auth token.

---

**GET /users/me**

Requires x-auth token in headers. Returns JSON containing information about the logged-in user.

---

**DELETE /users/me/token**

Logs out the specified user. Requires appropriate x-auth token. 


---

### Todos

**GET /todos**

Returns all todo's belong to current user. Requires appropriate x-auth header.

---

**GET /todos/:id**

Returns indicated todo if it belongs to current user. Requires appropriate x-auth header.

---

**POST /todos**

Create a new todo for current user. Requires a valid x-auth header.

*example request*

```json
{
    "completed": false,
    "text": "Charge phone!",
}
```

*example response*

{
    "completed": false,
    "completedAt": null,
    "_id": "5b02fdb8280cec06443d1b9f",
    "text": "Charge phone!",
    "_creator": "5aff158cf9399208f54cd7b3",
    "__v": 0
}
---


**PATCH /todos/:id**

Update the specified todo with new parameters that belongs to current user. Requires an appropriate x-auth header.

*example request*

```json
{
    "completed": false,
    "text": "Charge phone!",
}
```

*example response*

```json
  "todo": {
      "completed": true,
      "completedAt": 1526943346074,
      "_id": "5b034e3cbb34770c41b8b2d0",
      "text": "Charge phone!",
      "_creator": "5b03489bbb34770c41b8b2cb",
      "__v": 0
  }
```


---

**DELETE /todos/:id**

Deletes the specified todo that belongs to the currently logged in user. Appropriate x-auth header required.
