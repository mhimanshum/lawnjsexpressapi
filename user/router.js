const express = require("express")
const router = express.Router()
const { signup, login, getMe } = require("./controller")
const { userAuthentication } = require("../authentication")


router.post('/signup', signup)
  .post('/login', login)

router.use(userAuthentication)

router
  .get("/profile", getMe)

module.exports = router