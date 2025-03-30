const bcrypt = require("bcrypt");
var db = require("../config/connection");
const { response } = require("../app");
const { resolve } = require("promise");
const ObjectId = require('mongodb').ObjectId;
const Promise = require('promise'); // Ensure this line is correct



var objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_LuN1reTIjKClL6",
  key_secret: "jS3RtqGOn0JgIVPvQUDswVzv",
});
module.exports = {
  doSignup: (userdata) => {
    return new Promise(async (resolve, reject) => {
      userdata.Password = await bcrypt.hash(userdata.Password, 10);
      db.get()
        .collection("user")
        .insertOne(userdata)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },
  doLogin: (userdata) => {
    let response = {};
    let loginstatus = false;
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection("user")
        .findOne({ Email: userdata.Email });
      if (user) {
        bcrypt.compare(userdata.Password, user.Password).then((status) => {
          if (status) {
            console.log("logged");
            response.user = user;
            response.status = status;
            resolve(response);
          } else {
            console.log("failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("failed");
        resolve({ status: false });
      }
    });
  },
  addCart: (proid, userid) => {
    console.log(proid);
    let cartob = {
      item: new objectId(proid),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userob = await db
        .get()
        .collection("cart")
        .findOne({ user: new objectId(userid) });
      if (userob) {
        let prod = userob.products.findIndex(
          (product) => product.item == proid
        );
        if (prod != -1) {
          db.get()
            .collection("cart")
            .updateOne(
              {
                user: new objectId(userid),
                "products.item": new objectId(proid),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => resolve(response));
        } else {
          db.get()
            .collection("cart")
            .updateOne(
              { user: new objectId(userid) },
              {
                $push: { products: cartob },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartobject = {
          user: new objectId(userid),
          products: [cartob],
        };
        console.log(cartobject.products);
        db.get()
          .collection("cart")
          .insertOne(cartobject)
          .then(() => {
            resolve();
          });
      }
    });
  },

  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection("cart")
        .aggregate([
          {
            $match: { user: new objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      if (cartItems.length === 0) {
        console.log("No items in the cart.");
        resolve([]);
        return;
      }
      resolve(cartItems);
    });
  },

  cartCount: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("entered the function")
        let count=0
        let cart = await db
        .get()
        .collection("cart")
        .findOne({ user: new objectId(userid) });
        // console.log(cart.products[0].quantity)

      
      if (cart.products.length >0) {
        
        cart.products.forEach(element => {
          console.log(element.quantity)
          count+=element.quantity
        });
      
      }else{
        count=0
      }
      resolve(count);
      } catch (error) {
        reject(error)
        console.log(error)
      }
    
   
      
    });
  },
  changeProductQuantity: (details) => {
    // Convert count and quantity to integers
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    console.log(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.quantity <= 0) {
        // Prevent decrementing the count if it would go below zero
        reject({ error: "Invalid operation: count cannot be negative" });
        return;
      }

      db.get()
        .collection("cart")
        .findOne({
          _id: new objectId(details.cart),
          "products.item": new objectId(details.product),
        })
        .then((cart) => {
          const product = cart.products.find(
            (p) => p.item.toString() === details.product
          );

          if (product) {
            let newQuantity = product.quantity + details.count;

            if (newQuantity <= 0) {
              // If quantity is zero or negative, remove the product from the cart
              db.get()
                .collection("cart")
                .updateOne(
                  { _id: new objectId(details.cart) },
                  {
                    $pull: {
                      products: { item: new objectId(details.product) },
                    },
                  }
                )
                .then(() => resolve({ status: true, removed: true }))
                .catch((err) =>
                  reject({ error: "Database operation failed", details: err })
                );
            } else {
              // If quantity is positive, update it
              db.get()
                .collection("cart")
                .updateOne(
                  {
                    _id: new objectId(details.cart),
                    "products.item": new objectId(details.product),
                  },
                  { $set: { "products.$.quantity": newQuantity } }
                )
                .then(() => resolve({ status: true, removed: false }))
                .catch((err) =>
                  reject({ error: "Database operation failed", details: err })
                );
            }
          } else {
            reject({ error: "Product not found in cart" });
          }
        })
        .catch((err) =>
          reject({ error: "Database query failed", details: err })
        );
    });
  },

  totalprice: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection("cart")
        .aggregate([
          {
            $match: { user: new objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    { $toInt: "$quantity" },
                    { $toInt: "$product.Price" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      if (total && total.length > 0 && total[0].total) {
        resolve(total[0].total);
      } else {
        reject({ error: "Total not found or invalid" });
      }
    });
  },
  placeOrder: (order, products, total) => {
    console.log(total)
    return new Promise((resolve, reject) => {
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let cartob = {
        delivarydetails: {
          address: order.address,
          pincode: order.pincode,
          mobile: order.mobile,
        },
        user: new objectId(order.userId),
        paymentmethod: order["payment-method"],
        products: products,
        totalprice: total,
        Date: new Date(),
        status: status,
      };

      db.get()
        .collection("orders")
        .insertOne(cartob)
        .then((response) => {
          db.get()
            .collection("cart")
            .deleteOne({ user: new objectId(order.userId) });
          resolve(response.insertedId);
        });
    });
  },
  productlist: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      try{
        let cart = await db
        .get()
        .collection("cart")
        .findOne({ user: new objectId(userId) });
      resolve(cart.products);
      }catch(err)
      {
        resolve([])
      }
      
    });
  },
  vieworders: (userid) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection("orders")
        .find({ user: new objectId(userid) })
        .toArray();
      resolve(order);
    });
  },
  generaterazorpar: (orderid, total) => {
    console.log("orderis" + orderid);
    console.log(total+"kk");
    return new Promise((resolve, reject) => {
      var options = {
        amount: total*100,
        currency: "INR",
        receipt: "" + orderid,
      };
      instance.orders.create(options, function (err, order) {
        console.log(order);
        resolve(order);
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
      const { createHmac } = await import("node:crypto");
      const secret = "jS3RtqGOn0JgIVPvQUDswVzv";
      const hash = createHmac("sha256", secret)
        .update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        )
        .digest("hex");
      console.log(hash);
      if (hash == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
    
  },
  changepaymentstatus: (orderid) => {
    console.log(orderid);
    return new Promise((resolve, reject) => {
      db.get()
        .collection("orders")
        .updateOne(
          { _id: new objectId(orderid) },
          {
            $set: { status: "placed" },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  getProductById: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection('products')
        .findOne({ _id: new ObjectId(productId) })
        .then(product => resolve(product))
        .catch(err => reject(err));
    });
  },
  getProductAi: (resp) => {
    console.log(resp);
    let age;
    let gender;
  
    return new Promise((resolve, reject) => {
      // Loop through resp and get the first item (assuming resp is an array)
      for (const item of resp) {
        // Only set the age and gender once, from the first valid item
        if (item.age && item.gender) {
          age = item.age;
          gender = item.gender;
          break; // Exit loop after finding the first valid item
        }
      }
  
      if (age === undefined || gender === undefined) {
        reject("Age or gender not found in the response.");
        return;
      }
  
      // Round age and convert it to a string
      age = Math.round(age);
      age = age.toString();
      console.log("Age: " + age);
      console.log("Gender: " + gender);
      console.log("Executing the query...");
  
      db.get().collection('products')
  .find({ 
    gender: "male",  // Match products where gender is male
    age: { $exists: true }  // Ensure age field exists, if needed
  })
  .toArray()
  .then((products) => {
    console.log("Filtered Products: ", products);
    resolve(products);
  })
  .catch((err) => {
    console.error("Error fetching products:", err);
    reject(err);
  });
    
    });
  },
  searchContent: (value) => {
    console.log(value);
    return new Promise(async (resolve, reject) => {
        console.log("search reached");
        try {
            // Ensure that `find()` returns a promise, and await the result
            const result = await db.get().collection('products').find({
                $text: { $search: value }
            }).toArray();
            
            console.log(result); // Display the result
            resolve(result); // Resolve the promise with the result
        } catch (error) {
            console.log(error);
            reject(error); // Reject the promise if an error occurs
        }
    });
}

  
   
 
};
