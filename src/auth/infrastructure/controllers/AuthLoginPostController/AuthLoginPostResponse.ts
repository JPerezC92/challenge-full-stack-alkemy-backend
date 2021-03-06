import { StatusCodes } from "http-status-codes";

import {
  JsendStatus,
  JsendSuccess,
} from "../../../../shared/infrastructure/endpointResponse/Jsend";
import { RequestSuccess } from "../../../../shared/infrastructure/endpointResponse/RequestSuccess";
import { User } from "../../../../users/domain/User";
import { UserDomainToEndpoint } from "../../../../users/infrastructure/mappers/UserDomainToEndpoint";
import { AccessCredentials } from "../../../domain/AccessCredentials";
import { UserEndpointDto } from "../../dto/UserEndpointDto";

export class AuthLoginPostResponse implements RequestSuccess {
  status: JsendStatus.success;
  statusCode: number;
  data: AccessCredentials & { user: UserEndpointDto };

  constructor(props: AccessCredentials & { user: User }) {
    this.status = JsendStatus.success;
    this.statusCode = StatusCodes.OK;
    this.data = {
      accessToken: props.accessToken,
      refreshToken: props.refreshToken,
      user: UserDomainToEndpoint(props.user),
    };
  }

  json(): JsendSuccess<this["data"]> {
    return {
      status: this.status,
      data: this.data,
    };
  }
}
