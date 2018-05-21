# node_todo_api
Node TODO API

I created this API in Express to learn about how to use a MongoDB database with Express. This application features a 'roll your own' 
JWT authentication/authorization system. Here are the endpoints:

### Static
**GET /**

Returns JSON containting info and basic usage

---
### Users
**POST /users**

Creates a new user. Requires a JSON body in the request that includes an email and a password. Returns JSON containing the new user
and an x-auth header that contains a JWT used for authenication and authorization purposes.

*example request body:*

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
### Todos

---
