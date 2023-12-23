/**
 * Dependencies
 */
require("dotenv").config() // this is how we make use of our .env variables
require("./config/db") // bring in our db config
const express = require("express")
const morgan = require("morgan") // logger
const methodOverride = require("method-override")

const app = express();
const { PORT = 3013 } = process.env; 

// Bring in our model
const Book = require("./models/Book")

/**
 * Middleware
 */
// app.use((req, res, next) => {
//     console.log("this is middleware")
//     next()
// })
app.use(morgan("dev")) // logging
app.use(express.urlencoded({ extended: true })) // body parser this is how we get access to req.body
app.use(methodOverride("_method")) // Lets us use DELETE PUT HTTP verbs 
/**
 * Routes & Router
 * INDUCES
 */

// Index - GET render all of the books
app.get("/books", async (req, res) => {
    // find all of the books
    let books = await Book.find({})

    // render all of the books to index.ejs
    res.render("index.ejs", {
        books: books.reverse()
    })
})

// New - GET for the form to create a new book
app.get("/books/new", (req, res) => {
    // render the create form
    res.render("new.ejs")
})

// DELETE
app.delete("/books/:id", async (req, res) => {
    try {
        // Find a book and then delete
        let deletedBook = await Book.findByIdAndDelete(req.params.id)
        // console.log(deletedBook)
        // redirect back to the index
        res.redirect("/books")
        
    } catch (error) {
        res.status(500).send("something went wrong when deleting")
    }
})

// UPDATE
app.put("/books/:id", async (req, res) => {
    
    try {
        // handle our checkbox
        if (req.body.completed === "on") {
            req.body.completed = true
        } else {
            req.body.completed = false
        }
        // Then find by id and update with the req.body
        // findByIdAndUpdate - id , data to update, options
        let updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        )
    
        // redirect to the show route with the updated book
        res.redirect(`/books/${updatedBook._id}`)
        
    } catch (error) {
        res.send("something went wrong in this route")        
    }
})

// Create - POST
app.post("/books", async (req, res) => {
    try {
        if (req.body.completed === "on") {
            // if checked
            req.body.completed = true
        } else {
            // if not checked
            req.body.completed = false
        }
    
        let newBook = await Book.create(req.body)
        res.redirect("/books")

    } catch (err) {
        res.send(err)
    }
})

// EDIT
app.get("/books/edit/:id", async (req, res) => {
    try {
        // find the book to edit
        let foundBook = await Book.findById(req.params.id)
        res.render("edit.ejs", {
            book: foundBook
        })
    } catch (error) {
        res.send("hello from the error")
    }
})

// Show - GET rendering only one book
app.get("/books/:id", async (req, res) => {
    // find a book by _id
    let foundBook = await Book.findById(req.params.id) // the request params object

    // render show.ejs with the foundBook
    res.render("show.ejs", {
        book: foundBook
    })
})
/**
 * Server listener
 */
app.listen(PORT, () => console.log(`Listening to the sounds of ${PORT}`))