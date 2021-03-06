import { NextFunction, Request, Response } from "express";

import { AuthAccessPayload } from "../../../../auth/domain/AuthAccessPayload";
import { Uow } from "../../../../shared/infrastructure/database/uow";
import { MovementQuery } from "../../../application/MovementQuery";
import { MovementGetDto } from "../../dto/MovementGet.dto";
import { TypeOrmMovementsRepository } from "../../movements.repository";
import { MovementsGetResponse } from "./MovementsGetResponse";

export const MovementGetController = async (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  const movementGetDto = req.body.movementGetDto as MovementGetDto;
  const accessPayload = req.body.accessPayload as AuthAccessPayload;
  const uow = Uow();

  const movementQuery = MovementQuery({
    movementsRepository: TypeOrmMovementsRepository({ db: uow.connection() }),
  });

  const { movementList, pages } = await uow.transactional(
    async () =>
      await movementQuery.execute({
        limit: movementGetDto.limit,
        page: movementGetDto.page,
        order: movementGetDto.order,
        movementType: movementGetDto.movementType,
        userId: accessPayload.id,
      })
  );

  const movementsGetResponse = new MovementsGetResponse({
    movementList,
    pages,
  });

  return res
    .status(movementsGetResponse.statusCode)
    .json(movementsGetResponse.json());
};
