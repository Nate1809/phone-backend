require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')

const app = express()
const cors = require('cors') // for cross-origin resource sharing (this means we can access the server from another domain)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('dist')) // this makes it so that we can access the files in the dist folder

// Logging middleware using morgan
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// API ROUTES

// GET all persons
app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      console.log('Got persons from database:', persons)
      response.json(persons)
    })
})

// GET a single person
app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      console.log('Got person from database:', person)
      response.json(person)
    })
    .catch(error => next(error))
})

// GET info about the phonebook
app.get('/info', (request, response) => {
  Person.collection
    .countDocuments()
    .then(numEntries => {
      console.log(`Phonebook has info for ${numEntries} people`)
      response.send(
        `<p>Phonebook has info for ${numEntries} people</p>
                        <p>${new Date()}</p>`
      )
    }
    )
})

// DELETE a person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//POST a new person
app.post('/api/persons', (request, response, next) => {
  console.log('POST request received')
  const body = request.body

  // Check if the name and number are in the request body
  // if (!body.name || !body.number) {
  //     return response.status(400).json({
  //         error: 'name and number are required'
  //     })
  // }

  // // Check if the name already exists
  // if (persons.find(person => person.name === body.name)) {
  //     return response.status(400).json({
  //         error: 'name must be unique'
  //     })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => {
      console.log('Person saved to database')
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

//Update single person
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(400).end()
      }

      person.name = name
      person.number = number
      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

// Error handling middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

// Finally, we need to start our server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})