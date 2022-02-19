const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

//const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    logger: true,
    debug: true,
    secureConnection: false,
    auth: {
        user: 'rafayelg82project@gmail.com',
        pass: 'rafo8223'
        //api_key: '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'
    }
});

exports.getLogin = (req, res) => {
    let message = req.flash('error');
    if (message.length === 0) {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        userName: '',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            userName: '',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                console.log("No user");
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    userName: '',
                    errorMessage: 'Invalid email or password',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                })
            }
            return bcrypt
                .compare(password, user.password)
                .then(isCorrect => {
                    if (isCorrect) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save((err) => {
                            if(err) {
                                console.log("Save Error : ", err.message);
                            }
                            return res.redirect("/");
                        })
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        userName: '',
                        errorMessage: 'Invalid email or password',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    })
                })
        })
        .catch(err => {
            console.log("Post Login Error:", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        })
};

exports.postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err)
        }
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    console.log(message);
    if (message.length === 0) {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        userName: '',
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            userName: '',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: errors.array()
        });
    }
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: {items: []}
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'rafayelg82project@gmail.com',
                subject: "Sign up succeeded",
                html: '<h1>You successfully signed up!</h1>'
            });
        })
        .then(() => console.log('E-Mail отправлен'))
        .catch(err => {
            console.log("Post Signup Error: ", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        });
};

exports.getResetPassword = (req, res) => {
    let message = req.flash('error');
    if (message.length === 0) {
        message = null;
    }
    res.render('auth/reset-password', {
        path: '/reset-password',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
};

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            return res.redirect('/reset-password');
        }
        const token = buffer.toString('hex');
        const email = req.body.email.toLowerCase();
        User.findOne({email})
            .then(user => {
                if(!user) {
                    req.flash('error', 'No account with that email found!');
                    return res.redirect('/reset-password');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
               return user.save()
                   .then(result => {
                        res.redirect('/');
                        return transporter.sendMail({
                            to: email,
                            from: 'rafayelg82project@gmail.com',
                            subject: "Password reset",
                            html: `
                                <p>You requested to password reset</p>
                                <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password</p>     
                            `
                        });
                   })
                   .then(result => {
                       console.log("Reset E-Mail Sent");
                   })
            })
            .catch(err => {
                console.log("Post Reset Password Error: ", err.message);
                const error = new Error(err);
                error.httpSattusCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: new Date()}})
        .then(user => {
            let message = req.flash('error');
            if (message.length === 0) {
                message = null;
            }
            return res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id,
                resetToken: token,
            });
        })
        .catch(err => {
            console.log("Get New Password Error: ", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        });
};

exports.postUpdatePassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const resetToken = req.body.resetToken;
    let resetUser;
    User.findOne({_id: userId, resetToken: resetToken, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => {
           return res.redirect('/login');
        })
        .catch(err => {
            console.log("Post Update Password Error: ", err.message);
            const error = new Error(err);
            error.httpSattusCode = 500;
            return next(error);
        });

};

