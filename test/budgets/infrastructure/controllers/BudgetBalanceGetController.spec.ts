import request from "supertest";

import app from "../../../../src/app";
import * as AuthAccessTokenEncoder from "../../../../src/auth/infrastructure/service/AuthAccessTokenEncoder";
import { Budget } from "../../../../src/budgets/domain/Budget";
import { BudgetBalanceGetResponse } from "../../../../src/budgets/infrastructure/controllers/BudgetBalanceGetController/BudgetBalanceGetResponse";
import * as TypeOrmMovementsRepository from "../../../../src/movements/infrastructure/movements.repository";
import { budgetBalancePath } from "../../../../src/routes/budgets.routes";
import { mainRouterPath } from "../../../../src/routes/loadApiEndpoints";
import { InternalServerError } from "../../../../src/shared/infrastructure/requestErrors/InternalServerError";
import { MockMovementsRepository } from "../../../movements/fixtures/MockMovementsRepository";
import { movementMockList } from "../../../movements/fixtures/movementMockList";

jest
  .spyOn(TypeOrmMovementsRepository, "TypeOrmMovementsRepository")
  .mockImplementationOnce(MockMovementsRepository)
  .mockImplementationOnce(() => {
    throw new Error();
  });

jest.spyOn(AuthAccessTokenEncoder, "AuthAccessTokenEncoder").mockReturnValue({
  decode: jest.fn().mockReturnValue({ id: "123", email: "user@example.com" }),
  encode: jest.fn(),
});

describe(`GET ${mainRouterPath}${budgetBalancePath}`, () => {
  test("should execute the request successfully", async () => {
    const response = await request(app)
      .get(`${mainRouterPath}${budgetBalancePath}`)
      .auth("token", { type: "bearer" })
      .send();

    const budgetBalanceGetResponse = new BudgetBalanceGetResponse(
      new Budget({ movementsList: movementMockList }).calculateBalance()
    );

    expect(response.status).toBe(budgetBalanceGetResponse.statusCode);
    expect(response.body).toEqual(budgetBalanceGetResponse.json());
  });

  test("should return an internal server error response", async () => {
    const response = await request(app)
      .get(`${mainRouterPath}${budgetBalancePath}`)
      .auth("token", { type: "bearer" })
      .send();

    const internalServerError = new InternalServerError();

    expect(response.status).toBe(internalServerError.statusCode);
    expect(response.body).toEqual(internalServerError.json());
  });
});
