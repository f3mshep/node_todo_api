const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const validTestId = "5afa1983aca2950c3963665a"
const badValidTestId = "5afa1983aca2950c3963665b";
const todos = [
  { text: "First test" },
  { text: "Second test" },
  { text: "Third test", _id: validTestId }
];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then( () => done());
});

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