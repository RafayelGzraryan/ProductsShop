const mongoose = require('mongoose');
const Product = require("../models/product");

const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true }
        }]
    }
}, {
    versionKey: false
});

userSchema.methods.addToCart = function(product) {
        const cartProductItem = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartProductItem >= 0) {
            newQuantity = updatedCartItems[cartProductItem].quantity + 1;
            updatedCartItems[cartProductItem].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: product._id,
                quantity: newQuantity
            });
        }
        this.cart = {items: updatedCartItems};
        return this.save();
};
userSchema.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
}

// userSchema.methods.getCarts = function() {
//     const productIds = this.cart.items.map(item => {
//         return item.productId;
//     });
//     return Product .find({_id: {$in: productIds}})
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(item => {
//                             return item.productId.toString() === product._id.toString()
//                         }).quantity
//                     }
//                 })
//             })
//             .catch(err => console.log(err.message))
// }

userSchema.methods.deleteFromCart = function (prodId) {
    const updatedCartItems = [...this.cart.items].filter(item => {
        return item.productId.toString() !== prodId.toString();
    });
    this.cart = {items: updatedCartItems};
    return this.save()
}
userSchema.methods.addOrder = function () {
    //this.cart.items

}

module.exports = mongoose.model("User", userSchema);




// class User {
//     constructor(userName, email, cart, id, orders) {
//         this.name = userName;
//         this.email = email;
//         this.cart = cart; // {items: [{...product1, quantity: 1}, {...product2, quantity: 1}]}
//         this.id = new mongodb.ObjectId(id);
//         this.orders = orders; // {items: [cart1, cart2]}
//     };
//     save() {
//         const db = getDb();
//         return db
//             .collection("users")
//             .insertOne(this)
//             .then(() => console.log("User Created"))
//             .catch(err => console.log(err.message));
//     };

//     getOrder() {
//        const db = getDb();
//        return db.collection("order")
//            .find({'user._id': new mongodb.ObjectId(this.id)})
//            .toArray();
//     };
//
//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this.id),
//                         name: this.name
//                     }
//                 };
//                 return db.collection("order").insertOne(order);
//             })
//             .then(() => {
//                 return db.collection("users").updateOne({_id: this.id}, {$set: {cart: {items: []}}});
//             })
//             .then(result => {
//                 console.log("Order Added");
//                 return result;
//             })
//             .catch(err => console.log(err.message));
//     };
//
//     static findById(userId) {
//        const db = getDb();
//        return db.collection("users").findOne({_id: new mongodb.ObjectId(userId)});
//     };
// }
//
// module.exports = User;