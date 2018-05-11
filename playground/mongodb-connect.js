const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client)=>{
  if (err){
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // db.collection('Todos').insertOne({
  //   text: "Do the thing",
  //   completed: false
  // }, (err, res)=> {
  //   if (err) {
  //     return console.log('Unable to insert ', err)
  //   }

  //   console.log(res.ops)
  // });

  db.collection('Users').insertOne({
    name: "The Nameless One",
    age: 9999,
    location: "Sigil"
  }, (err, res) => {
    if (err) {
      return console.log('Unable to insert', err);
    };

    console.log(res.ops);
  });

  client.close();
});

