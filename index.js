// const MongoClient = require('mongodb').MongoClient
// let url = "mongodb://localhost:27017/"

// MongoClient.connect(url,(err,db) =>{
//     if(err) throw err
//     // console.log("Database Create!");
//     // db.close();
//     let dbo = db.db("mydb");
//     // dbo.createCollection("customers", (err, res) =>{
//     //     if(err) throw err
//     //     console.log("collection create")
//     //     db.close();
//     // })
//     let myobj = { name: "Company Inc", address: "Highway 37" };
//     dbo.collection("customers").insertOne(myobj, (err, res) =>{
//         if (err) throw err;
//         console.log("1 document inserted");
//         db.close();
//       });
// })