var express = require("express");
var router = express.Router();
var productHelper = require("../helper/product-helper");
var userhelper = require("../helper/user-helpers");
const { body, validationResult } = require("express-validator");

// Middleware to check if user is logged in

const verifyLogged = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.Loggedin) {
    next();
  } else {
    console.log("User not logged in");
    res.status(401).json({ loggedIn: false }); // Respond with JSON indicating not logged in
  }
};

// GET home page
router.get("/", async (req, res, next) => {
  try {
    let user = req.session.user;
    let coun = null;
    if (user) {
      coun = await userhelper.cartCount(user._id);
    }
    let data = await productHelper.getAllproduct();
    res.render("user/view-products", { data, user, coun });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET login page
router.get("/login", (req, res) => {
  res.render("user/login");
});

// GET signup page
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

// POST signup
router.post("/signup", (req, res) => {
  userhelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response) {
      req.session.user = response;
      req.session.user.Loggedin = true;
      res.render("user/login");
    } else {
      alert("Failed to Signup");
      res.render("/signup");
    }

    // console.log(response)
  });
});

// POST login
router.post("/login", async (req, res, next) => {
  try {
    let response = await userhelper.doLogin(req.body);
    if (response.status) {
      req.session.user = response.user;
      req.session.user.Loggedin = true;
      res.redirect("/");
    } else {
      req.session.userLoginerr = "Invalid username or password";
      res.redirect("/login");
    }
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET cart

router.get("/cart/:id", verifyLogged, async (req, res, next) => {
  try {
    console.log("cart itm caled");
    await userhelper.addCart(req.params.id, req.session.user._id);
    res.json({ status: true });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET view cart
router.get("/view-cart", verifyLogged, async (req, res, next) => {
  try {
    let products = await userhelper.getCart(req.session.user._id);
    let total = await userhelper.totalprice(req.session.user._id);
    
    res.render("user/view-cart", {
      products,
      user: req.session.user._id,
      total,
    });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// POST change product quantity
router.post("/change-product-quantity", async (req, res, next) => {
  try {
    let response = await userhelper.changeProductQuantity(req.body);
    response.total = await userhelper.totalprice(req.body.user);
    res.json(response);
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET logout
router.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

// GET place order
router.get("/place-order", verifyLogged, async (req, res, next) => {
  try {
    let total = await userhelper.totalprice(req.session.user._id);
    res.render("user/place-order", { total, user: req.session.user });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// POST place order
router.post("/place-order", verifyLogged,async (req, res, next) => {
  try {
    let products = await userhelper.productlist(req.body.userId);
    let total = await userhelper.totalprice(req.body.userId);
    let orderid = await userhelper.placeOrder(req.body, products, total);
    if (req.body["payment-method"] === "COD") {
      res.json({ codsuccess: true });
    } else {
      let response = await userhelper.generaterazorpar(orderid, total);
      res.json(response);
    }
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// GET order success
router.get("/order-success", verifyLogged,(req, res) => {
  res.render("user/order-success", { user: req.session.user });
});

// GET order
router.get("/order", verifyLogged, async (req, res, next) => {
  try {
    let orders = await userhelper.vieworders(req.session.user._id);
    
    // Extract product IDs from orders
    let productIds = orders.flatMap(order => order.products.map(p => p.item));
    
    // Pass orders and product IDs to the view
    res.render("user/order", { orders, productIds ,user:req.session.user});
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});
router.get('/viewproduct/:productId',verifyLogged, async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await userhelper.getProductById(productId);
    console.log(product)
    if (product) {
      res.render('user/product-details', { product ,user:req.session.user});
    } else {
      res.status(404).send('Product not found');
    }
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});
// POST verify payment
router.post("/verify-payment", verifyLogged,async (req, res, next) => {
  try {
    await userhelper.verifyPayment(req.body);
    await userhelper.changepaymentstatus(req.body["order[receipt]"]);
    res.json({ status: true });
  } catch (err) {
    console.log(err);
    res.json({ status: false });
  }
});

module.exports = router;
