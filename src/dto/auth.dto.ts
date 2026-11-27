import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),

    password: Joi.string()
        .min(8)
        .max(50)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required',
        }),
});

export const registerSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.empty': 'Name cannot be empty',
            'any.required': 'Name is required',
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),

    password: Joi.string()
        .min(8)
        .max(50)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required',
        }),

    age: Joi.number()
        .integer()
        .min(1)
        .optional(),
});