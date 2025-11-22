import { submissionQueue } from "../queue/queue"
import { submissionRepository } from "../repositories/submissionRepo"

export const submissionService ={
    async register(code: string, language: string){
        const submission_id = crypto.randomUUID()
        const result = await submissionRepository.createSubmission(code, language, submission_id)
        const job = await submissionQueue.add('run', {code, language, submission_id})
        console.log(JSON.stringify({
            level: "info",
            event: "submission_received",
            submission_id
        }));
        return result
    },
    async polling(id: string){
        const result = await submissionRepository.getStatus(id)
        return result.status === 'Completed' ?  result : result.status
    }
}