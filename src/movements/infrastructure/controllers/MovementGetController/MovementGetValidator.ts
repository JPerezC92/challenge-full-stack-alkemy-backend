import { NextFunction, Request, Response } from "express";
import Joi from "joi";

import { BadRequest } from "../../../../shared/infrastructure/requestErrors/BadRequest";
import { parseBearerToken } from "../../../../shared/infrastructure/utils/parseBearerToken";
import { BudgetMovementType } from "../../../domain/BudgetMovementType";
import { OrderType } from "../../../domain/OrderType";
import { MovementGetDto } from "../../dto/MovementGet.dto";

interface Schema {
  query: {
    page: number;
    limit: number;
    order: OrderType;
    "movement-type"?: BudgetMovementType;
  };
  headers: { authorization: string };
}

export const validatorSchema = Joi.object<Schema>({
  query: {
    page: Joi.number().positive(),
    limit: Joi.number().positive(),
    order: Joi.string().valid(OrderType.ASC, OrderType.DESC),
    "movement-type": Joi.string().valid(
      BudgetMovementType.INCOME,
      BudgetMovementType.EXPENSE
    ),
  },
  headers: { authorization: Joi.string().required() },
});

export const MovementGetValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = validatorSchema.validate({
    query: req.query,
    headers: { authorization: req.headers.authorization },
  });

  if (error || !value) {
    const badRequest = new BadRequest(error?.message);
    return res.status(badRequest.statusCode).json(badRequest.json());
  }

  req.body.movementGetDto = new MovementGetDto({
    limit: value.query.limit,
    page: value.query.page,
    order: value.query.order,
    movementType: value.query?.["movement-type"],
  });

  req.body.accessToken = parseBearerToken(value.headers.authorization);

  return next();
};
