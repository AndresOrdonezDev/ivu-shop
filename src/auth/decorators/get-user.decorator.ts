import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { User } from "../entities/users.entity";


export const GetUser = createParamDecorator(
    (data,ctx:ExecutionContext)=>{
        const req = ctx.switchToHttp().getRequest()
        const user = req.user
        if (!user)
            throw new InternalServerErrorException('User not found in request')
        
        return data ? user[data] : user
    }
)