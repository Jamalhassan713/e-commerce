import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "./base.repository";
import { BlackListToken, BlackListTokenType } from "../model";
import { Model } from "mongoose";



@Injectable()
export class BlackListTokenRepository extends BaseRepository<BlackListTokenType> {
    constructor(
        @InjectModel(BlackListToken.name) private readonly BlackListTokenModel: Model<BlackListTokenType>
    ) {
        super(BlackListTokenModel)
    }
}