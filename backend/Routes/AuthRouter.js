const { signUp, login} = require('../Controller/AuthController');
const { signupValidation, loginValidation } = require('../Middleware/AuthValidation');

const router = require('express').Router();


router.post('/signUp', signupValidation, signUp);
router.post('/login', loginValidation, login);
module.exports = router;