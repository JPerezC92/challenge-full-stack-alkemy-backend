import { NextFunction, Request, Response } from "express";
import Joi from "joi";

import { BadRequest } from "../../../../shared/infrastructure/requestErrors/BadRequest";
import { parseBearerToken } from "../../../../shared/infrastructure/utils/parseBearerToken";
import { BudgetMovementType } from "../../../domain/BudgetMovementType";
import { MovementCreateDto } from "../../dto/MovementCreate.dto";

interface Schema {
  body: MovementCreateDto;
  headers: { authorization: string };
}

const validationSchema = Joi.object<Schema>({
  headers: { authorization: Joi.string().required() },
  body: {
    amount: Joi.number().min(0).required(),
    concept: Joi.string().max(250).required(),
    type: Joi.string()
      .lowercase()
      .valid(
        BudgetMovementType.EXPENSE.toLowerCase(),
        BudgetMovementType.INCOME.toLowerCase()
      )
      .required(),
    date: Joi.date().required(),
  },
});

export const MovementPostValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = validationSchema.validate({
    body: req.body,
    headers: { authorization: req.headers.authorization },
  });

  if (error || !value) {
    const badRequest = new BadRequest(error?.message);
    return res.status(badRequest.statusCode).json(badRequest.json());
  }

  req.body.movementCreateDto = new MovementCreateDto(value.body);
  req.body.accessToken = parseBearerToken(value.headers.authorization);

  return next();
};
