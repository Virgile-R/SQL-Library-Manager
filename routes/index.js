var express = require('express');
var router = express.Router();
const Book = require("../models").Book

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}
/* GET home page. */
router.get('/', asyncHandler( async (req, res, next) => {
  res.redirect("/books")
}));
/**
 * Get book list
 */
router.get('/books', asyncHandler( async (req, res, next) => {
  const books = await Book.findAll()
  res.render('index', {books, title: "Book List"})
}))
/**
 * Form for creating new books
 */
router.get('/books/new', asyncHandler(async (req, res, next) => {
  res.render('newbook', {article: {}, title: "Enter new book"})
}))

/**
 * Post method for creating books
 */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book
  try {
    const book = await Book.create(req.body)
    res.redirect('/books/' + book.id)
  } catch (error) {
    if(error.name === "SequelizeValidationError"){
      book = await Book.build(req.body)
      res.render('newbook', {book, errors: error.errors, title: 'Enter new book'})
    }
  }
}))
/**
 * Route for individual book
 */
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  if (book){
    res.render("book", {book, title: book.title})
  } else {
    res.sendStatus(404)
  }
}))
/**
 * Form for editing books
 */
router.get('/books/:id/edit', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  if (book){
    res.render('bookEdit', {book, title: "Edit book"})
  } else {
    res.sendStatus(404)
  }
}))
/**
 * Post method for editing books
 */
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book
  try {
    book = await Book.findByPk(req.params.id);
    if (book){
      await book.update(req.body)
      res.redirect('/books/' + book.id)
    }else {
      res.sendStatus(404)
    }
    
  } catch (error) {
    
    if(error.name === "SequelizeValidationError"){
      
      book = await Book.build(req.body)
      res.render('bookEdit', {book, errors: error.errors, title: 'Edit book'})
    } else {
      throw error
    }
  }
}))


/**
 * Post method for deleting books
 */
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  if (book){
    
    await book.destroy()
    res.redirect("/")
  } else {
    
    res.sendStatus(404)
  }
  
}))
module.exports = router;
