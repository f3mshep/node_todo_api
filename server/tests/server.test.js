const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const { User } = require('./../models/user');
const {todos, populateTodos, validTestId, badValidTestId, populateUsers, users} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

//todos

describe("POST /todos", () => {
  const token = users[0].tokens[0].token;
  it('should create a new todo', done => {
    const text = 'Todo test string';
    request(app)
      .post('/todos')
      .set('x-auth', token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err)

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e)=> done(e));
      });
  })

  it('should not create a todo with invalid data', (done) => {

    request(app)
      .post('/todos')
      .set('x-auth', token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)

        Todo.find().then(todos => {
          expect(todos.length).toBe(3)
          done();
        }).catch(e => done(e));
      });
  });
});

describe("GET /todos", ()=>{
  const token = users[0].tokens[0].token;
  it('should get all todos', (done)=>{
    request(app)
      .get('/todos')
      .set('x-auth',token)
      .expect(200)
      .expect(res => {
        expect(res.body.length).toBe(2)
      })
      .end(done)
  });
});

describe("GET /todos/:id", () => {
  const token = users[0].tokens[0].token;
  const todoId = todos[0]._id
  console.log(todoId)
  it('should return the specified todo', (done)=> {
    request(app)
      .get(`/todos/${todoId}`)
      .set('x-auth', token)
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it('should not return another user\'s todo', (done) => {
    const unownedTodoId = todos[2]._id
    request(app)
      .get(`/todos/${unownedTodoId}`)
      .set('x-auth', token)
      .expect(404)
      .end(done);
  });
  it('should return an error if the ID is invalid', (done)=> {
    request(app)
      .get(`/todos/bad_id`)
      .set('x-auth', token)
      .expect(400)
      .expect((res) =>{
        expect(res.body.error).toBe("Invalid Id");
      })
      .end(done);
  });
  it('should return an error if the document cannot be found', (done)=> {
    request(app)
      .get(`/todos/${badValidTestId}`)
      .set('x-auth', token)
      .expect(404)
      .expect((res)=> {
        expect(res.body.error).toBe("Object not found");
      })
      .end(done);
  })
});

describe("PATCH /todos/:id", () => {
  const userTwoToken = users[1].tokens[0].token

  it("should return the updated todo", (done)=>{
    request(app)
      .patch(`/todos/${validTestId}`)
      .set('x-auth', userTwoToken)
      .send({ text: "updated third test", completed: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe("updated third test");
      })
      .end(done);
  });
  it("should not update another user's todo", (done) => {
    request(app)
      .patch(`/todos/${todos[0]._id}`)
      .set('x-auth', userTwoToken)
      .send({ text: "updated third test", completed: true })
      .expect(404)
      .end(done);
  });
  it("should not update prohibited fields", (done)=>{
    request(app)
      .patch(`/todos/${validTestId}`)
      .set("x-auth", userTwoToken)
      .send({ text: "updated third test", _id: 123, completed: "haha" })
      .expect(200)
      .expect(res => {
        Todo.findById(validTestId).then(todo => {
            expect(todo.completed).toBe(true);
            expect(todo._id).toBe(validTestId);
          }, err => console.log(err));
      })
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  const userTwoToken = users[1].tokens[0].token
  it("should delete the todo from the database and return doc", (done)=>{
    request(app)
      .delete(`/todos/${validTestId}`)
      .set('x-auth', userTwoToken)
      .expect(200)
      .expect((res)=> {
        expect(res.body.todo._id).toBe(validTestId)
      })
      .end((err, res)=> {
        if (err) return done(err);
        Todo.findById(validTestId)
          .then((todo) => {
            expect(todo).toNotExist()
            done();
        }).catch(e => done(e));
      });
  });
  it("should not delete another user's todo", (done) => {
    request(app)
      .delete(`/todos/${todos[0]._id}`)
      .set('x-auth', userTwoToken)
      .expect(404)
      .end(done);
  });
  it("should return a 400 if invalid ID", (done)=>{
    request(app)
      .delete(`/todos/bad_id`)
      .set("x-auth", userTwoToken)
      .expect(400)
      .end(done);
  });
  it("should return a 404 if the document is not found", (done)=>{
    request(app)
      .delete(`/todos/${badValidTestId}`)
      .set("x-auth", userTwoToken)
      .expect(404)
      .end(done);
  });
});

//users

describe('GET /users/me', () => {
  it('should return user if authenticated', (done)=> {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res)=> {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done)=> {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res)=>{
      expect(res.body.error).toBe("Authentication Required");
    })
    .end(done)
  });
});

describe('POST /users', ()=>{
  it('should create a user', (done)=>{
    const email = 'example@example.com'
    const password = 'password'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) return done(err)
        User.findOne({email}).then(user => {
          expect(user).toExist()
          expect(user.password).toNotBe(password)
          done();
        });
      });

  });
  it('should return validation error if invalid request', (done)=>{
    const email = "safeemail@example.com";
    const password = 'p';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  });
  it('should not create user if email in use', (done)=>{
    const email = users[0].email;
    const password = 'password';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  });
});

describe('POST /users/login', ()=> {
  it("should login user and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[1]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should reject invalid login', (done)=>{
    const email = "superb@gmail.com"
    const password = "badpassword"
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res)=>{
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done)
  });
});

describe("DELETE /users/me/token", ()=>{
  it("should log out the appropriate user", (done)=>{
    const token = users[0].tokens[0].token
    const userId = users[0]._id
    request(app)
      .delete('/users/me/token')
      .set('x-auth',token)
      .expect(200)
      .end((err, res) => {
        if (err){
          return done(err);
        }
        User.findById(userId)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      })
  })
});