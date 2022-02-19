const { validationResult } = require('express-validator/check');
const Product = require('../models/product');
const deleteFile = require('../util/file');
const { ITEM_PER_PAGE, pageNumbersArray } = require('../util/pagination');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    userName: req.user.email,
    editing: false,
    hasError: false,
    errorMessage: "",
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if(!image) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          userName: req.user.email,
          editing: false,
          hasError: true,
          errorMessage: 'Attached file is not an image',
          product: {
              title: title,
              price: price,
              description: description
          },
          validationErrors: errors.array()
      });
  }
  const imageUrl = image.path;

  if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          userName: req.user.email,
          editing: false,
          hasError: true,
          errorMessage: errors.array()[0].msg,
          product: {
              title: title,
              price: price,
              description: description
          },
          validationErrors: errors.array()
      });
  }

  const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user
  });
  product.save()
      .then(() => res.redirect('/'))
      .catch(err => {
          console.log("Post Add Product Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;;
  Product
      .findById(prodId)
      .then(product => {
        if (!product) {
          return res.redirect('/');
        }
        res.render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          userName: req.user.email,
          editing: editMode,
          errorMessage: "",
          product: product,
          validationErrors: []
        });
      })
      .catch(err => {
          console.log("Get Edit Product Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          userName: req.user.email,
          editing: true,
          errorMessage: errors.array()[0].msg,
          product: {
              title: updatedTitle,
              price: updatedPrice,
              description: updatedDesc,
              _id: prodId
          },
          validationErrors: errors.array()
      });
  }
  if (!image) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          userName: req.user.email,
          editing: true,
          hasError: true,
          errorMessage: 'Attached file is not an image',
          product: {
              title: updatedTitle,
              price: updatedPrice,
              description: updatedDesc,
              _id: prodId
          },
          validationErrors: errors.array()
      });
  }
  return Product
      .findById({_id: prodId})
      .then((product) => {
          deleteFile(product.imageUrl);
          product.title = updatedTitle;
          product.price = updatedPrice;
          product.description = updatedDesc;
          product.imageUrl = image.path;
          product.save()
              .then(() => {
                  console.log("Updated")
                  res.redirect('/admin/products');
              });
      })
      .catch(err => {
          console.log("Update Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.getProducts = (req, res, next) => {
    const pageNumber = +req.query.page || 1;
    let totalPages;
    let pageArray;
    Product.find({userId: req.user._id}).countDocuments().then(totalProduct => {
        totalPages = Math.ceil(totalProduct/ITEM_PER_PAGE);
        pageArray = pageNumbersArray(pageNumber, totalPages);
        return Product.find({userId: req.user._id})
            .skip((pageNumber-1) * ITEM_PER_PAGE)
            .limit(ITEM_PER_PAGE);
    })
      .then(products => {
        res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products',
          userName: req.user.email,
          userId: req.user._id,
          pageArray: pageArray,
          pageNumber: pageNumber,
          lastPage: totalPages
        });
      })
      .catch(err => {
          console.log("Admin Products Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product
      .findOneAndDelete({_id: prodId, userId: req.user._id})
      .then((product) => {
          if(!product) {
              return next(new Error('Product not found'))
          }
          //deleteFile(product.imageUrl);
          res.status(200).json({message: 'Success'});
      })
      .catch(err => {
          res.status(500).json({message: 'Deleting product failed!'})
      });
};

