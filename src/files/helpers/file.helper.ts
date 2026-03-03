import { BadRequestException } from "@nestjs/common"
import { randomUUID } from "crypto"

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) return callback(new BadRequestException('File is empty'), false)
    const fileExtension = file.mimetype.split('/')[1]
    const validExtensions = ['jpg', 'png', 'jpeg', 'webp']
    if (validExtensions.includes(fileExtension)) {
        return callback(null, true)
    }

    callback(new BadRequestException('File type is not valid'), false)
}

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(new BadRequestException('File is empty'), false)
    const fileExtension = file.mimetype.split('/')[1]
    const fileName = `${randomUUID()}.${fileExtension}`
    callback(null,fileName)
}