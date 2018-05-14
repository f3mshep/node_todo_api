const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  const db = client.db("TodoApp");

  // db.collection('Todos').insertOne({
  //   text: "Do the thing",
  //   completed: false
  // }, (err, res)=> {
  //   if (err) {
  //     return console.log('Unable to insert ', err)
  //   }

  //   console.log(res.ops)
  // });

  db.collection("Todos").count().then((count)=>{
    console.log("Todo total count:", count);
  }, err => {
    console.log("It's broken:", err)
  });

  db.collection("Users").find({name: "Alexandra"}).toArray().then(users=>{
    console.log(users)
  }, err=>{
    console.log("Something went wrong:", err)
  })

  client.close();
});
