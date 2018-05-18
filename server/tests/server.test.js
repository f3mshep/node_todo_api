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

  it('should create a new todo', done => {
    const text = 'Todo test string'

    request(app)
      .post('/todos')
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
  it('should get all todos', (done)=>{
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(3)
      })
      .end(done)
  });
});

describe("GET /todos/:id", () => {
  it('should return the specified todo', (done)=> {
    request(app)
      .get(`/todos/${validTestId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(validTestId);
      })
      .end(done);
  });
  it('should return an error if the ID is invalid', (done)=> {
    request(app)
      .get(`/todos/bad_id`)
      .expect(400)
      .expect((res) =>{
        expect(res.body.error).toBe("Invalid Id");
      })
      .end(done);
  });
  it('should return an error if the document cannot be found', (done)=> {
    request(app)
      .get(`/todos/${badValidTestId}`)
      .expect(404)
      .expect((res)=> {
        expect(res.body.error).toBe("Object not found");
      })
      .end(done);
  })
});

describe("PATCH /todos/:id", () => {
  it("should return the updated todo", (done)=>{
    request(app)
      .patch(`/todos/${validTestId}`)
      .send({ text: "updated third test", completed: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe("updated third test");
      })
      .end(done);
  });
  it("should not update prohibited fields", (done)=>{
    request(app)
      .patch(`/todos/${validTestId}`)
      .send({ text: "updated third test", _id: 123, completed: "haha" })
      .expect(200)
      .expect((res) => {
        Todo.findById(validTestId)
          .then((todo) => {
            expect(todo.completed).toBe(true);
            expect(todo._id).toBe(validTestId);
          }, err => console.log(err))
      })
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should delete the todo from the database and return doc", (done)=>{
    request(app)
      .delete(`/todos/${validTestId}`)
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
  it("should return a 400 if invalid ID", (done)=>{
    request(app)
      .delete(`/todos/bad_id`)
      .expect(400)
      .end(done)
  });
  it("should return a 404 if the document is not found", (done)=>{
    request(app)
      .delete(`/todos/${badValidTestId}`)
      .expect(404)
      .end(done)
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
    const email = "safeemail@example.com"
    const password = 'p'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  });
  it('should not create user if email in use', (done)=>{
    const email = users[0].email
    const password = 'password'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  });
});