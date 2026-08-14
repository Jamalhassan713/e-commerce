import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { User, UserType } from "../model";


@Injectable()
export class UserRepository extends BaseRepository<UserType> {
    constructor(
        @InjectModel(User.name) private readonly UserModel: Model<UserType>
    ) {
        super(UserModel)
    }
}