import {Worker, Job} from 'bullmq'
import { submissionRepository } from '../repositories/submissionRepo'
import { sandbox } from '../sandbox'
import { CodeResult } from '../interfaces'

const queueName = 'submissionQueue'

export const submissionWorker = new Worker(queueName, 
    async (job:Job) =>{
        const {code, language, submission_id} = job.data

        await submissionRepository.updateStatus( submission_id,'Running')

        console.log(JSON.stringify({
            level: "info",
            event: "worker_started_job",
            submission_id,
            code_length: code.length
        }));

        const sandboxResult:CodeResult = await sandbox.run(code, language, submission_id)

        await submissionRepository.updateStatus(submission_id, sandboxResult.status)
        await submissionRepository.addResult(submission_id, sandboxResult.output)

        return {message: 'exec finished'}
    },
    {connection:{
        host: 'redis',
        port: 6379
    }},
)  

submissionWorker.on('completed', (job:Job) =>{
    console.log(`Job ${job.id} completed`)
})

submissionWorker.on('failed', async (job, err)=>{
    await submissionRepository.updateStatus(job?.data.submission_id, 'Failed')
    console.error(`job failed`, err)
})