import { Request, Response } from "express";
import { submissionSchema } from "../schemas/submissionSchemas";
import { submissionService } from "../services/submissionService";

export async function executeCode(req: Request, res: Response){
    try{
        const validated = submissionSchema.parse(req.body)
        const result = await submissionService.register(validated.code, validated.language)
        res.status(200).json(result)
    }catch(e){
        res.status(400).json({message: e instanceof Error ? e.message : e})
    }
}

export async function pollCode(req:Request, res: Response){
    try{
        const {id} = req.params
        const result = await submissionService.polling(id!)
        res.status(200).json(result)
    }catch(e){
        res.status(400).json({message: e instanceof Error ? e.message : e})
    }
}

export function healthCheck(req:Request, res:Response){
    res.status(200).json({message: 'Healthy'})
}