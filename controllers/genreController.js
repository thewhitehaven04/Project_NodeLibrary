const asyncHandler = require('express-async-handler');
const Genre = require('../models/genre');
const Book = require('../models/book');

const validator = require('express-validator');
const body = validator.body;
const validationResult = validator.validationResult;

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genreList = await Genre.find().exec();
  res.render('genre_list', { title: 'Genres', genres: genreList });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_detail', {
    title: 'Genre Detail',
    genre: genre,
    genre_books: booksInGenre,
  });

  res.render('genre_detail', { title: 'Genre Details' });
});

// Display Genre create form on GET.
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
});

// Handle Genre create on POST.
exports.genre_create_post = [
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res) => {
  const [genreToDelete, booksWithGivenGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);

  if (genreToDelete === null) res.redirect('/catalog/genre');

  res.render('genre_delete', {
    title: `Delete Genre`,
    genre: genreToDelete,
    genre_books: booksWithGivenGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, booksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);

  if (booksWithGenre.length === 0) {
    await Genre.findByIdAndRemove(req.params.id);
    res.redirect('/catalog/genres');
  }
  res.render('genre_delete', {
    title: `Delete Genre`,
    genre: genre,
    genre_books: booksWithGenre,
  });
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);

  if (genre === null) {
    const err = new Error();
    err.status = 404;
    return next(err);
  }

  res.render('genre_form', {
    title: 'Update genre',
    genre: genre,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Genre must be at least 1 character long'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Update genre',
        genre: new Genre({ ...req.params }),
        errors: errors.array(),
      });
      return;
    }

    const updatedGenre = new Genre({ name: req.body.name, _id: req.params.id });
    await Genre.findByIdAndUpdate(req.params.id, updatedGenre, {});
    res.redirect('/catalog/genres');
  }),
];
