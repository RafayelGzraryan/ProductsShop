const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    versionKey: false
})

module.exports = mongoose.model("Product", productSchema);



// const getDb = require("../util/database").getDb;
// const mongodb = require("mongodb");
//
// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id): null;
//         this.userId = new mongodb.ObjectId(userId);
//     }
//     save() {
//         const db = getDb();
//         if(this._id) {
//             return db.collection("product").updateOne({_id: this._id}, {$set: this})
//         }
//         return db.collection("product")
//             .insertOne(this)
//             .then(()=> console.log("Product Added"))
//             .catch(err => console.log(err));
//     };
//     static fetchAll() {
//         const db = getDb();
//         return db.collection("product").find().toArray();
//     };
//     static findById(prodId) {
//         const db = getDb();
//         return db.collection("product").find({_id: new mongodb.ObjectId(prodId)}).next();
//     };
//     static deleteById(prodId) {
//         const db = getDb();
//         return db
//             .collection("product")
//             .findOneAndDelete({_id: new mongodb.ObjectId(prodId)})
//             .then(product => {
//                 return db
//                     .collection("users")
//                     .findOne({_id: product.value.userId})
//                     .then(user => {
//                         const newItems = user.cart.items.filter(item => {
//                             return item.productId.toString() !== product.value._id.toString();
//                         });
//                         return db.collection("users").updateOne({_id: user._id}, {$set: {cart: {items: newItems}}})
//                             .then(() => console.log("updated"));
//                     });
//             })
//             .then(result => {
//                 return result;
//             })
//             .catch(err => console.log(err.message));
//     };
// }
//
// module.exports = Product;
//
//
