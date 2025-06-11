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

// hardcoded data
let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// API ROUTES

// GET all persons
app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            console.log("Got persons from database:", persons)
            response.json(persons)
        })
})

// GET a single person
app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            console.log("Got person from database:", person)
            response.json(person)
        })
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
    // const id = request.params.id
    // persons = persons.filter(person => person.id !== id)
    // console.log("Deleted person with id: " + id)
    // response.status(204).end()
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const generateID = () => {
    let newId
    do {
        newId = Math.floor(Math.random() * 1_000_000).toString()
    } while (persons.find(person => person.id === newId))
    return newId
}

//POST a new person
app.post('/api/persons', (request, response) => {
    console.log('POST request received')
    const body = request.body

    // Check if the name and number are in the request body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and number are required'
        })
    }

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
})

// Error handling middleware
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// Finally, we need to start our server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})