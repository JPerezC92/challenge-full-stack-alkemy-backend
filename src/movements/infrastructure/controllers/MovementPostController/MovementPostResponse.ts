import { StatusCodes } from "http-status-codes";

import {
  JsendStatus,
  JsendSuccess,
} from "../../../../shared/infrastructure/endpointResponse/Jsend";
import { RequestSuccess } from "../../../../shared/infrastructure/endpointResponse/RequestSuccess";

export class MovementPostResponse implements RequestSuccess {
  status: JsendStatus.success;
  statusCode: StatusCodes.CREATED;
  data: null;

  constructor() {
    this.status = JsendStatus.success;
    this.statusCode = StatusCodes.CREATED;
    this.data = null;
  }

  public json(): JsendSuccess<this["data"]> {
    return { status: this.status, data: this.data };
  }
}
