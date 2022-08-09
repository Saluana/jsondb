# jsondb
Easy to use API for JSON key/value storage

```
//Create a new db
const myDB = new JsonDB("myDbName", "./folderPath");
myDB.createDB();

//Add an entry to the database
myDB.addEntry({key: "Dogs", value: ["Husky", "Pitbull"]})

//Get an entry from the database
myDB.getEntry("Dogs")

//Remove an entry from the database
myDB.removeEntry("Dogs")

//Update an entry in the database
myDB.updateEntry({key: "Dogs", value: ["Golden Retriever", "Pug"]})

//Get a list of all Key Value pairs based on the value
myDB.addEntry({key: "Hello", value: "world!"})
myDB.addEntry({key: "Goodbye", value: "world!"})
myDB.addEntry({key: "Cya", value: "Later!"})
myDB.getAllByValue("world!") //Returns Hello world! and Goodbye world! as an array with the key and value of all matching items.

//Encrypt the database (Makes it inaccessible until decrypted)
myDB.encrypt("SuperSecretPasswordExample9873!!)

//Decrypt the database and make it accessible again
myDB.decrypt("SuperSecretPasswordExample9873!!")

```

