var express = require("express");
var router = express.Router();
var productHelper = require("../helper/product-helper");
const { body, validationResult } = require("express-validator");
const path = require("path");
var db = require("../config/connection");
const ObjectId = require('mongodb').ObjectId;
const adminCredentials = {
  username: "admin",
  password: "admin123"
};
function verifyAdmin(req, res, next) {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}
router.get("/login", (req, res) => {
  res.render("admin/login",{admin:true}); // Render the login page
});
router.get("/logout", (req, res) => {
  req.session.adminLoggedIn = false;
  res.redirect("/admin/login");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    req.session.adminLoggedIn = true; // Set a session variable to track admin login status
    res.redirect("/admin"); // Redirect to the admin dashboard or products page
  } else {
    res.render("admin/login", { error: "Invalid username or password" }); // Show error if login fails
  }
});

// GET all products
router.get("/",verifyAdmin, async (req, res, next) => {
  try {
    let result = await productHelper.getAllproduct();
    res.render("admin/view-product", { result, admin: true });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET add product page
router.get("/add-product",verifyAdmin, (req, res) => {
  res.render("admin/add-product");
});

// POST add product
router.post("/add-product", verifyAdmin,(req, res, next) => {
  try {
    productHelper.addProduct(req.body, (id) => {
      let image = req.files.Image;
      let imagePath = path.join(
        __dirname,
        "../public/product-images",
        `${id}.jpg`
      );

      image.mv(imagePath, (err) => {
        if (err) {
          return next(err); // Pass errors to the error handler
        }
        res.redirect("/admin/");
      });
    });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET delete product
router.get("/delete-product/:id", verifyAdmin,async (req, res, next) => {
  try {
    let proId = req.params.id;
    await productHelper.deleteProduct(proId);
    res.redirect("/admin/");
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET edit product page
router.get("/edit-product/:id",verifyAdmin, async (req, res, next) => {
  try {
    let product = await productHelper.getproduct(req.params.id);
    res.render("admin/edit-product", { product ,admin:true });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// POST edit product
router.post("/edit-product/:id", verifyAdmin,(req, res, next) => {
  try {
    let id = req.params.id;
    productHelper
      .updateProduct(id, req.body)
      .then(() => {
        if (req.files && req.files.Image) {
          let image = req.files.Image;
          let imagePath = path.join(
            __dirname,
            "../public/product-images",
            `${id}.jpg`
          );

          image.mv(imagePath, (err) => {
            if (err) {
              return next(err); // Pass errors to the error handler
            }
            res.redirect("/admin/");
          });
        } else {
          res.redirect("/admin/");
        }
      })
      .catch(next);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

router.get("/orders",verifyAdmin, async (req, res, next) => {
  try {
   
      console.log("called")
    const ordersCollection = await db.get().collection("orders");

    const orders = await ordersCollection.find().toArray();
    console.log(orders);
    res.render("admin/orders", { orders,admin:true });
  } catch (err) {
    next(err); // Handle errors appropriately
  } 
});
router.get('/orders/:id',verifyAdmin, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await db.get().collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return res.status(404).send('Order not found');
    }
    res.render('admin/orderdetails', { order,admin:true });
  } catch (err) {
    next(err); // Handle errors appropriately
  }
});
module.exports = router;
