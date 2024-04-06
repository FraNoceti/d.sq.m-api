import Joi from "joi";

export const trsansactionSchema = Joi.object({
  currency: Joi.string().max(3),
  totalAmount: Joi.number().precision(3),
  email: Joi.string().email().optional(),
});

export const previewSchema = Joi.object({
  currency: Joi.string().max(3),
  totalAmount: Joi.number().precision(3),
});
