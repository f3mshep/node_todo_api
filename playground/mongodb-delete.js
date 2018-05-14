const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  const db = client.db("TodoApp");

  // deleteMany

  db.collection('Todos').deleteMany({text: 'Do the thing'}).then(result => {
    console.log(result)
  })

  //deleteOne

  db.collection('Todos').deleteOne({text: 'feed the fishies'})

  //findOneAndDelete

  db.collection('Todos').findOneAndDelete({completed: true})

  db.collection("Users").deleteOne({ _id: new ObjectID("5af9c4b99a17132e8361c739") });

  db.collection("Users").deleteMany({name: "Alexandra"})

  client.close();
});
