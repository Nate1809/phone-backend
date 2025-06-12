const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://galloguzman:${password}@cluster0.2z7ka1y.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

// return all persons
if (process.argv.length === 3) {
  console.log('phonebook:')
  // fetch objects from database
  Person
    .find({})
    .then(result => {
      result.forEach(person => {
        console.log(person.name + ' ' + person.number)
      })
      mongoose.connection.close()
    })
}

// add a new person
if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number
  })

  person.save().then(() => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}



