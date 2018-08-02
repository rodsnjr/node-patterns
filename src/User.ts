import { IsLength, IsEmail, IsDate } from "validator.ts/decorator/Validation";

export class User {
 
    @IsLength(4, 20)
    name: string;
 
    password: string;
 
    @IsEmail()
    email: string;

    @IsDate()
    createDate: Date;
 
}
