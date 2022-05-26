import { NextFunction, Request, Response } from "express";

import { TypeOrmMovementsRepository } from "../../../../movements/infrastructure/movements.repository";
import { Uow } from "../../../../shared/infrastructure/database/uow";
import { ExceptionListener } from "../../../../shared/infrastructure/ExceptionListener";
import { BudgetCalculateBalance } from "../../../application/BudgetCalculateBalance";
import { BudgetBalanceGetResponse } from "./BudgetBalanceGetResponse";

export const BudgetBalanceGetController = async (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  try {
    const uow = Uow();

    const budgetCalculateBalance = BudgetCalculateBalance({
      movementsRepository: TypeOrmMovementsRepository({ db: uow.connection() }),
    });

    const balance = await budgetCalculateBalance.execute();

    const budgetBalanceGetResponse = new BudgetBalanceGetResponse(balance);

    return res
      .status(budgetBalanceGetResponse.statusCode)
      .json(budgetBalanceGetResponse.json());
  } catch (error) {
    const exceptionListener = ExceptionListener();
    const requestError = exceptionListener.onException(error as Error);

    return res.status(requestError.statusCode).json(requestError.json());
  }
};
