import { NextFunction, Request, Response } from "express";

import { Uow } from "../../../../shared/infrastructure/database/uow";
import { ExceptionListener } from "../../../../shared/infrastructure/ExceptionListener";
import { JsUuidGenerator } from "../../../../shared/infrastructure/JsUuidGenerator";
import { Conflict } from "../../../../shared/infrastructure/requestErrors/Conflict";
import { TypeOrmUsersRepository } from "../../../../users/infrastructure/TypeOrmUsers.repository";
import { AuthRegister } from "../../../application/AuthRegister";
import { UserAlreadyExists } from "../../../domain/UserAlreadyExists";
import { UserCreateDto } from "../../dto/UserCreate.dto";
import { AuthAccessTokenEncoder } from "../../service/AuthAccessTokenEncoder";
import { AuthRefreshTokenEncoder } from "../../service/AuthRefreshTokenEncoder";
import { BcryptPasswordEncryptor } from "../../service/BcryptPasswordEncryptor";
import { AuthRegisterPostResponse } from "./AuthRegisterPostResponse";

export const AuthRegisterPostController = async (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  try {
    const userCreateDto = req.body as UserCreateDto;
    const uow = Uow();

    const authRegister = AuthRegister({
      usersRepository: TypeOrmUsersRepository({ db: uow.connection() }),
      passwordEncryptor: BcryptPasswordEncryptor(),
      tokenAccessEncoder: AuthAccessTokenEncoder(),
      tokenRefreshEncoder: AuthRefreshTokenEncoder(),
      uuidGenerator: JsUuidGenerator(),
    });

    const { accessToken, refreshToken, user } = await uow.transactional(
      async () => await authRegister.execute({ ...userCreateDto })
    );

    const authRegisterGetResponse = new AuthRegisterPostResponse({
      accessToken,
      refreshToken,
      user,
    });

    return res
      .status(authRegisterGetResponse.statusCode)
      .json(authRegisterGetResponse.json());
  } catch (error) {
    const exceptionListener = ExceptionListener({
      [`${UserAlreadyExists.name}`]: Conflict,
    });

    const errorResponse = exceptionListener.onException(error as Error);

    return res.status(errorResponse.statusCode).json(errorResponse.json());
  }
};
