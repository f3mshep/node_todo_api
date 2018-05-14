const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  const db = client.db("TodoApp");

  db.collection("Todos").findOneAndUpdate({ _id: new ObjectID("5af9c17a9a17132e8361c5f0") },
    {
      $set: {
        completed: true
      }
    },
    {
      returnOriginal: false
    }
  ).then(doc => {
    console.log(doc)
  })

  db
    .collection("Users")
    .findOneAndUpdate({ _id: new ObjectID("5af9b7f172c33c045c05177f") },
      {
        $set: {
          name: "Alexandra"
        }
      }
  );

  db
    .collection("Users")
    .findOneAndUpdate({ _id: new ObjectID("5af9b7f172c33c045c05177f") },
    {$inc: {
      age: 1
    }}
  );

  client.close();
});
