var express = require('express');
var router = express.Router();
const Book = require("../models").Book
const { Op } = require("sequelize");

/* Handler function to wrap each route. 
Code from the Using SQL ORM with Express Workshop, thanks TreeHouse!

*/
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
/* GET home page. redirect to books */
router.get('/', asyncHandler( async (req, res, next) => {
  
  res.redirect("/books")
}));
/**
 * Get book list
 */
router.get('/books', asyncHandler( async (req, res, next) => {
  const books = await Book.findAll({limit: 10})
  const bookNumber = await Book.count()
  const nextPage=  2
  if ( bookNumber - 10 > 0) {
    res.render('index', {books, title: "Book List", nextPage, hasNext: true, hasPrev: false})
  } else {
    res.render('index', {books, title: "Book List", nextPage, hasNext: false, hasPrev: false})
  }
}))


/**
 * Form for creating new books
 */
router.get('/books/new', asyncHandler(async (req, res, next) => {
  res.render('new-book', {article: {}, title: "Enter new book"})
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
      console.log(error)
      book = await Book.build(req.body)
      res.render('new-book', {book, errors: error.errors, title: 'Enter new book'})
    } else {
      throw error
    }
  }
}))
/**
 * Route for individual book
 */
router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id)
  if (book){
    res.render("book", {book, title: book.title})
  } else {
    const err = new Error();
    err.status = 404
    err.message = "Page Not Found"
    next(err)
  }
}))
/**
 * Form for editing books
 */
router.get('/books/:id/edit', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id)
  if (book){
    res.render('update-book', {book, title: "Edit book"})
  } else {
    const err = new Error();
    err.status = 404
    err.message = "Page Not Found"
    next(err)
  }
}))
/**
 * Post method for editing books
 */
router.post('/books/:id', asyncHandler(async (req, res, next) => {
  let book
  try {
    book = await Book.findByPk(req.params.id);
    if (book){
      await book.update(req.body)
      res.redirect('/books/' + book.id)
    }else {
      const err = new Error();
      err.status = 404
      err.message = "Page Not Found"
      next(err)
    }
    
  } catch (error) {
    
    if(error.name === "SequelizeValidationError"){
      //since the book info is already present, no need to build it again...
      res.render('update-book', {book, errors: error.errors, title: 'Edit book'})
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
    const err = new Error();
    err.status = 404
    err.message = "Page Not Found"
    next(err)
  }
}))
/**
 * Add navigation to the book list
 */
 router.get('/books/page/:page', asyncHandler( async (req, res, next) => {
  const offset = (req.params.page * 10) - 10
  let books
  if (Number.isInteger(parseInt(req.params.page))){ 
    books = await Book.findAll({offset:offset, limit: 10})
  } else {
    res.sendStatus(404)
  }
  const bookNumber = await books.length
  const nextPage=  parseInt(req.params.page) + 1
  const lastPage= parseInt(req.params.page) - 1
  if (bookNumber - 10 >=0){
    res.render('index', {books, title: "Book List", nextPage, lastPage, hasPrev: true, hasNext: true})
} else if (bookNumber > 0){
  res.render('index', {books, title: "Book List", nextPage, lastPage, hasPrev: true, hasNext: false})
} else if (isNaN(bookNumber) || bookNumber === 0){
  const err = new Error();
    err.status = 404
    err.message = "Page Not Found"
    next(err)
}
}))
  /**
   * Post method for search form
   */
router.post('/search', asyncHandler(async (req, res) => {
    let query = req.body.search
    if (query){
      res.redirect('/search/'+ query)
    } else{
      res.redirect('/')
    }
  }))

  
  /**
   * Search results
   */
router.get('/search/:query', asyncHandler(async (req, res) => {
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          {title: {[Op.substring]: req.params.query} },
          {author: {[Op.substring]: req.params.query }},
          {genre: {[Op.substring]: req.params.query}},
          {year: req.params.query}
      ]
      }
      
    })
    if (books.length > 0) {
      res.render('searchResults', {books, title: `Search results for: ` + req.params.query.replace("+", " ")})
    } else {
      res.render('searchResults', {title: 'No matches found for: ' + req.params.query})
    }
  }))

  

module.exports = router;
