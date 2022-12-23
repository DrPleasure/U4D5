// ******************************************* BOOKS RELATED ENDPOINTS ***********************************

/* ********************************************** BOOKS CRUD ENDPOINTS ***********************************

1. CREATE --> POST http://localhost:3001/books/ (+body)
2. READ --> GET http://localhost:3001/books/ (+ optional query params)
3. READ (single book) --> GET http://localhost:3001/books/:bookId
4. UPDATE (single book) --> PUT http://localhost:3001/books/:bookId (+ body)
5. DELETE (single book) --> DELETE http://localhost:3001/books/:bookId

*/
import multer from "multer"
import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import fs from "fs"
import httpErrors from "http-errors"
import { checksProductsSchema, triggerBadRequest } from "./validator.js"
import sharp from "sharp"

const { NotFound, Unauthorized, BadRequest } = httpErrors

const productRouter = express.Router()

const productsJSONPATH = join(dirname(fileURLToPath(import.meta.url)), "products.json")

const anotherStupidMiddleware = (req, res, next) => {
  console.log("I am a stupid middleware")
  next()
}

const getProducts = () => JSON.parse(fs.readFileSync(productsJSONPATH))
const writeProducts = productsArray => fs.writeFileSync(productsJSONPATH, JSON.stringify(productsArray))

const getReviews = () => JSON.parse(fs.readFileSync(productsJSONPATH))
const writeReviews = reviewsArray => fs.writeFileSync(productsJSONPATH, JSON.stringify(reviewsArray))


var upload = multer({ storage: storage }).single("demo_image");


var storage = multer.diskStorage({   
  destination: function(req, file, cb) { 
     cb(null, './uploads');    
  }, 
  filename: function (req, file, cb) { 
     cb(null , file.originalname);   
  }
});

productRouter.post("/productId/image", (req, res) => {
    upload(req, res, (err) => {
     if(err) {
       res.status(400).send("Something went wrong!");
     }
     res.send(req.file);
   });
 });

  productRouter.get('/?category', (req, res) => {
    // Get the value of the 'category' query parameter
    const category = req.query.category;
    
 // Filter the products by category
 const filteredProducts = products.filter(product => product.category === category);
  
 // Return the filtered products
 res.send(filteredProducts);

    // Your code to filter the products by category goes here
  });
  

  

productRouter.post("/", checksProductsSchema, triggerBadRequest, (req, res, next) => {
  try {
    const newProduct = { ...req.body, createdAt: new Date(), id: uniqid(), updatedAt: new Date() }

    const productsArray = getProducts()

    productsArray.push(newProduct)

    writeProducts(productsArray)

    res.status(201).send({ id: newProduct.id })
  } catch (error) {
    next(error) // with the next(error) I can send this error to the error handlers
  }
})

productRouter.post("/:productId/:reviews",  triggerBadRequest, (req, res, next) => {
  try {
    const newReview = { ...req.body, id: uniqid(), createdAt: new Date() }

    const reviewsArray = getReviews()

    reviewsArray.push(newReview)

    writeReviews(reviewsArray)

    res.status(201).send({ id: newReview.id })
  } catch (error) {
    next(error) // with the next(error) I can send this error to the error handlers
  }
})

productRouter.get("/:productId/:reviews", anotherStupidMiddleware, (req, res, next) => {
    try {
        const products = getProducts()
        const product = products.find(product => product.id === req.params.productId)
        if (product) {
          res.send(product.reviews)
        } else {
          // next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
          next(NotFound(`Product with id ${req.params.productId} not found!`)) // --> err object {status: 404, message: `Book with id ${req.params.bookId} not found!` }
          // next(BadRequest("message")) // --> err object {status: 400, message: `message` }
          // next(Unauthorized("message")) // --> err object {status: 401, message: `message`}
        }
      } catch (error) {
        next(error)
      }
    })

productRouter.get("/", anotherStupidMiddleware, (req, res, next) => {
  try {
    // throw new Error("KABOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM")
    const productsArray = getProducts()
    if (req.query && req.query.category) {
      const filteredProducts = productsArray.filter(product => product.category === req.query.category)
      res.send(filteredProducts)
    } else {
      res.send(productsArray)
    }
  } catch (error) {
    next(error)
  }
})

productRouter.get("/:productId", (req, res, next) => {
  try {
    const products = getProducts()
    const product = products.find(product => product.id === req.params.productId)
    if (product) {
      res.send(product)
    } else {
      // next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
      next(NotFound(`Product with id ${req.params.productId} not found!`)) // --> err object {status: 404, message: `Book with id ${req.params.bookId} not found!` }
      // next(BadRequest("message")) // --> err object {status: 400, message: `message` }
      // next(Unauthorized("message")) // --> err object {status: 401, message: `message`}
    }
  } catch (error) {
    next(error)
  }
})

productRouter.put("/:productId", (req, res, next) => {
  try {
    const products = getProducts()

    const index = products.findIndex(product => product.id === req.params.productId)
    if (index !== -1) {
      const oldProduct = products[index]

      const updatedProduct = { ...oldProduct, ...req.body, updatedAt: new Date() }

      products[index] = updatedProduct

      writeProducts(products)
      res.send(updatedProduct)
    } else {
      next(NotFound(`Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productRouter.delete("/:productId", (req, res, next) => {
  try {
    const products = getProducts()

    const remainingProducts = products.filter(product => product.id !== req.params.productId)

    if (products.length !== remainingProducts.length) {
      writeProducts(remainingProducts)
      res.status(204).sendProduct
    } else {
      next(NotFound(`Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default productRouter