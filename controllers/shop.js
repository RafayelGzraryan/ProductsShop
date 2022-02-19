const Product = require('../models/product');
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');
const PdfDocument = require('pdfkit');
const createInvoice = require('../util/invoce');
const { ITEM_PER_PAGE, pageNumbersArray } = require('../util/pagination');

exports.getProducts = (req, res, next) => {
    const pageNumber =  +req.query.page || 1;
    let totalPages;
    let pageArray;
    Product.find()
        .countDocuments()
        .then(totalProduct => {
            totalPages = Math.ceil(totalProduct/ITEM_PER_PAGE);
            pageArray = pageNumbersArray(pageNumber, totalPages);
            return Product.find()
                .skip((pageNumber-1) * ITEM_PER_PAGE)
                .limit(ITEM_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                userName: req.user? req.user.email: '',
                errorMessage: '',
                prodId: '',
                pageArray: pageArray,
                pageNumber: pageNumber,
                lastPage: totalPages
            });
        })
      .catch(err => {
          console.log("Get Products Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
      .then(product => {
        return product.populate('userId')
            .then(popProduct => {
                return res.render('shop/product-detail', {
                    product: product,
                    pageTitle: product.title,
                    path: '',
                    userName: req.user? req.user.email: '',
                    prodUserName: popProduct.userId.email
                });
            });
      })
      .catch(err => {
          console.log("Details Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error)
          // Product.find()
          //     .then(products => {
          //         res.status(422).render('shop/product-list', {
          //             prods: products,
          //             pageTitle: 'All Products',
          //             path: '/products',
          //             errorMessage: "Can't display details right now, try later",
          //             prodId: prodId
          //         });
          //     });
      });
};

exports.getIndex = (req, res, next) => {
    const pageNumber = +req.query.page || 1;
    let totalPages;
    let pageArray;
    Product.find().countDocuments().then(totalProduct => {
        totalPages = Math.ceil(totalProduct/ITEM_PER_PAGE);
        pageArray = pageNumbersArray(pageNumber, totalPages);
        return Product.find()
            .skip((pageNumber-1) * ITEM_PER_PAGE)
            .limit(ITEM_PER_PAGE);
        })
        .then((products) => {
          res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            userName: req.user? req.user.email: '',
            pageArray: pageArray,
            pageNumber: pageNumber,
            lastPage: totalPages
          });
      })
      .catch(err => {
          console.log("Get Index Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.getCart = (req, res, next) => {
    return req.user
        .populate("cart.items.productId")
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
                userName: req.user.email
            });
        })
        .catch(err => {
            console.log("Get Cart Error: ", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product
      .findById(prodId)
      .then(product => {
          return req.user.addToCart(product)
      })
      .then(() => {
          res.redirect("/cart")
      })
      .catch(err => {
          console.log("Post Cart Error", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteFromCart(prodId)
      .then(() => {
          console.log("deleted")
          res.redirect("/cart")
      })
      .catch(err => {
          console.log("Delete Error: ", err.message);
          const error = new Error(err);
          error.httpSattusCode = 500;
          return next(error);
      });
};

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render("shop/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
                userName: req.user.email,
                orders: orders
            })
        })
        .catch(err => {
            console.log("Get Order Error: ", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        })
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return {product: { ...item.productId._doc }, quantity: item.quantity}
            })
            const order = new Order({
                products: products,
                user: {
                    name: user.name,
                    userId: user
                }
            });
            return order.save();
        })
        .then(() => {
            req.user.clearCart();
            return res.redirect("/orders");
       })
       .catch(err => {
           console.log("Post Order Error: ", err.message);
           const error = new Error(err);
           error.httpSattusCode = 500;
           return next(error);
       });
};

exports.getCheckout = (req, res, next) => {
    return req.user
        .populate("cart.items.productId")
        .then(user => {
            const products = user.cart.items;
            console.log(products);
            let total = 0;
            products.forEach(p => {
                total += p.quantity * p.productId.price
            })
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products: products,
                userName: req.user.email,
                totalSum: total
            });
        })
        .catch(err => {
            console.log("Checkout Error: ", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if(!order) {
                return next(new Error('No Order Found'));
            }
            if(req.user._id.toString() !== order.user.userId.toString()) {
                return next(new Error('Unauthorized'))
            }
            createInvoice(req, res, order);
        })
        .catch(err => next(err));
};

