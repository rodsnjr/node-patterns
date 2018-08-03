import { IsEmail, IsDate, MinLength } from "validator.ts/decorator/Validation";

export class User {
 
    @MinLength(3)
    name: string;
    
    @MinLength(3)
    password: string;
 
    @IsEmail()
    email: string;

    @IsDate()
    createDate: string;
 
}
