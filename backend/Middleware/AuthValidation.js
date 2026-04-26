const Joi = require('joi');

//SignUp validations
const signupValidation = (req, res, next) =>{
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
        role: Joi.string().valid('student', 'admin').optional(),
    })

    const {error} = schema.validate(req.body); // schema will validate all inputs

    if(error) {
        return res.status(400).json({message: "Bad Request", error })
    }
    next();
}

//Login validations
const loginValidation = (req, res, next) =>{
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
    })

    const {error} = schema.validate(req.body); // schema will validate all inputs

    if(error) {
        return res.status(400).json({message: "Bad Request", error })
    }
    next();
}

module.exports = {
    loginValidation,
    signupValidation,
}