import { Request, Response } from "express";

import { Uow } from "../../../../shared/infrastructure/database/uow";
import { ExceptionListener } from "../../../../shared/infrastructure/ExceptionListener";
import { JsUuidGenerator } from "../../../../shared/infrastructure/JsUuidGenerator";
import { UnprocessableEntity } from "../../../../shared/infrastructure/requestErrors/UnprocessableEntity";
import { TypeOrmUsersRepository } from "../../../../users/infrastructure/TypeOrmUsers.repository";
import { AuthLogin } from "../../../application/AuthLogin";
import { InvalidCredentials } from "../../../domain/InvalidCredentials";
import { AuthLoginDto } from "../../dto/AuthLogin.dto";
import { AuthAccessTokenEncoder } from "../../service/AuthAccessTokenEncoder";
import { AuthRefreshTokenEncoder } from "../../service/AuthRefreshTokenEncoder";
import { BcryptPasswordEncryptor } from "../../service/BcryptPasswordEncryptor";
import { AuthLoginPostResponse } from "./AuthLoginPostResponse";

export const AuthLoginPostController = async (req: Request, res: Response) => {
  try {
    const authLoginDto = req.body as AuthLoginDto;
    const uow = Uow();

    const authLogin = AuthLogin({
      usersRepository: TypeOrmUsersRepository({ db: uow.connection() }),
      passwordEncryptor: BcryptPasswordEncryptor(),
      tokenAccessEncoder: AuthAccessTokenEncoder(),
      tokenRefreshEncoder: AuthRefreshTokenEncoder(),
      uuidGenerator: JsUuidGenerator(),
    });

    const { accessToken, refreshToken, user } = await uow.transactional(
      async () => await authLogin.execute(authLoginDto)
    );

    const authLoginPostResponse = new AuthLoginPostResponse({
      accessToken,
      refreshToken,
      user,
    });

    return res
      .status(authLoginPostResponse.statusCode)
      .json(authLoginPostResponse.json());
  } catch (error) {
    const exceptionListener = ExceptionListener({
      [`${InvalidCredentials.name}`]: UnprocessableEntity,
    });

    const exceptionResponse = exceptionListener.onException(error as Error);

    return res
      .status(exceptionResponse.statusCode)
      .json(exceptionResponse.json());
  }
};
