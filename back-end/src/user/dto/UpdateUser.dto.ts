import { PartialType } from "@nestjs/mapped-types";
import { CreatedUserDto } from "./CreateUser.dto";

export class UpdateUserDto extends PartialType(CreatedUserDto) {}