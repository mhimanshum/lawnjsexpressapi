const { prisma } = require("../db");
const { catchAsyncError, ServerError } = require("../error");
const { signupValidate, loginValidate } = require("./validator");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


exports.signup = catchAsyncError(async (req, res, next) => {

  signupValidate(req.body)

  if (req.employee.role === 'manager') {
    req.body.role = undefined
  }

  bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
    if (err) {
      console.error(err)
      return next(new ServerError(500, "password hash failed"))
    }
    req.body.password = hash
    try {
      const employee = await prisma.emploies.create({
        data: req.body,
      })
      employee.password = undefined
      res.json({
        message: 'employee created successfully',
        employee
      })
    } catch (e) {
      if (e.code === 'P2002') {
        return next(new ServerError(400, `email id '${req.body.email}' already exists, use another email`))
      }
      return next(new ServerError(400, e.message))
    }
  });
})

exports.login = catchAsyncError(async (req, res, next) => {

  loginValidate(req.body)

  const employee = await prisma.emploies.findUnique({
    where: {
      email: req.body.email,
    },
  })
  if (!employee) {
    return next(new ServerError(404, "employee does not exists"))
  }

  if (!await bcrypt.compare(req.body.password, employee.password)) {
    return next(new ServerError(403, "wrong password supplied"))
  }

  const token = jwt.sign(
    { id: employee.id, email: employee.email, name: employee.name, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_TOKEN_VALIDITY }
  );

  res.json({ token })
})