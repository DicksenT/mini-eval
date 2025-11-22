import {Queue} from 'bullmq'

const queueName = 'submissionQueue'

export const submissionQueue = new Queue(queueName, {
    connection:{
        host: 'redis',
        port: 6379
    }
})