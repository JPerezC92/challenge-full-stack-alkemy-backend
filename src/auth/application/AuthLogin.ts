import { UseCase } from "../../shared/domain/UseCase";
import { UuidGenerator } from "../../shared/domain/UuidGenerator";
import { User } from "../../users/domain/User";
import { UsersRepository } from "../../users/domain/UsersRepository";
import { AccessCredentials } from "../domain/AccessCredentials";
import { AuthAccessPayload } from "../domain/AuthAccessPayload";
import { AuthRefreshPayload } from "../domain/AuthRefreshPayload";
import { InvalidCredentials } from "../domain/InvalidCredentials";
import { PasswordEncryptor } from "../domain/PasswordEncryptor";
import { TokenEncoder } from "../domain/TokenEncryptor";

type Input = Pick<User, "email" | "password">;

interface Output extends AccessCredentials {
  user: User;
}

export const AuthLogin: (props: {
  passwordEncryptor: PasswordEncryptor;
  tokenAccessEncoder: TokenEncoder<AuthAccessPayload>;
  tokenRefreshEncoder: TokenEncoder<AuthRefreshPayload>;
  usersRepository: UsersRepository;
  uuidGenerator: UuidGenerator;
}) => UseCase<Promise<Output>, Input> = ({
  passwordEncryptor,
  tokenAccessEncoder,
  tokenRefreshEncoder,
  usersRepository,
  uuidGenerator,
}) => {
  return {
    execute: async ({ email, password }) => {
      const user = await usersRepository.findByEmail(email);

      if (!user) throw new InvalidCredentials();

      const isValidPassword = await passwordEncryptor.compare(
        password,
        user.password
      );

      if (!isValidPassword) throw new InvalidCredentials();

      const accessToken = tokenAccessEncoder.encode({
        email: user.email,
        id: user.id,
      });

      const refreshToken = tokenRefreshEncoder.encode({
        id: uuidGenerator.generate(),
        email: user.email,
      });

      user.updateRefreshToken(refreshToken);

      await usersRepository.update(user);

      return { accessToken, refreshToken, user };
    },
  };
};
