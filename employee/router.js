const express = require("express")
const router = express.Router()
const { signup, login } = require("./controller")
const { employeeAuthentication } = require("../authentication")
const { employeeAuthorization } = require("../authorization")

router.post('/login', login)

router.use(employeeAuthentication)

router.post('/signup', employeeAuthorization('admin', 'manager'), signup)

module.exports = router