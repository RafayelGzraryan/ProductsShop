const { check } = require('express-validator/check');
const User = require('../models/user');

// exports.productValidation = () => {
//     return [
//         check('title', "Please enter the correct Title")
//             .isString()
//             .isLength({min: 3, max: 20})
//             .trim(),
//         check('imageUrl')
//             .isURL()
//             .withMessage("Please enter the valid URL address"),
//         check('price')
//             .isNumeric()
//             .withMessage('Тhe Price should be numbers'),
//         check('description')
//             .isLength({min: 5, max: 200})
//             .withMessage('Description mast contains 5 - 200 characters')
//     ];
// };
//
// exports.signupCheck = () => {
//     return [
//         check('email')
//             .isEmail()
//             .withMessage('Please, enter the valid email')
//             .normalizeEmail()
//             .custom((value, {req}) => {
//                 return User.findOne({email: value})
//                     .then(user => {
//                         if(user) {
//                             return Promise.reject('E-Mail exist already, please pick a different one')
//                         }
//                     });
//             }),
//         check('password', 'Password enter password with contains only numbers and text and at list 5 characters')
//             .isLength({min: 5})
//             .isAlphanumeric()
//             .trim(),
//         check('confirmPassword')
//             .trim()
//             .custom((value, {req}) => {
//                 if(value !== req.body.password) {
//                     throw new Error('Password have to match');
//                 }
//                 return true;
//             })
//     ];
// }
// exports.loginCheck = () => {
//     return [
//         check('email', 'Please, enter the valid email')
//             .isEmail()
//             .normalizeEmail(),
//         check('password', "Password has to be valid")
//             .isLength({min: 5})
//             .isAlphanumeric()
//             .trim()
//     ]
// }

module.exports = {
    loginValidation: [
        check('email', 'Please, enter the valid email')
            .isEmail()
            .normalizeEmail(),
        check('password', "Password has to be valid")
            .isLength({min: 5})
            .isAlphanumeric()
            .trim()
    ],
    signupValidation: [
        check('email')
            .isEmail()
            .withMessage('Please, enter the valid email')
            .normalizeEmail()
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .then(user => {
                        if(user) {
                            return Promise.reject('E-Mail exist already, please pick a different one')
                        }
                    });
            }),
        check('password', 'Password enter password with contains only numbers and text and at list 5 characters')
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        check('confirmPassword')
            .trim()
            .custom((value, {req}) => {
                if(value !== req.body.password) {
                    throw new Error('Password have to match');
                }
                return true;
            })
    ],
    productValidation: [
        check('title', "Please enter the correct Title")
            .isString()
            .isLength({min: 3, max: 20})
            .trim(),
        // check('image')
        //     .isURL()
        //     .withMessage("Please enter the valid URL address"),
        check('price')
            .isNumeric()
            .withMessage('Тhe Price should be numbers'),
        check('description')
            .isLength({min: 5, max: 200})
            .withMessage('Description mast contains 5 - 200 characters')
    ]
};