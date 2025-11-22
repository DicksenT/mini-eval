import {Pool} from 'pg'
const pool = new Pool({connectionString: process.env.DATABASE_URL})

export const submissionRepository={
    async createSubmission(code: string, language: string, submission_id: string){
        const result = await pool.query(
            'INSERT INTO submission (submission_id, code, language, status) VALUES ($1, $2, $3, $4) RETURNING submission_id',
            [submission_id, code, language, 'Pending'] 
        )
        return result.rows[0]
    },
    async getStatus(submission_id: string){
        const result = await pool.query(
            'SELECT * from submission where submission_id=$1',
            [submission_id]
        )
        return result.rows[0]
    },
    async updateStatus(submission_id: string, status: string){
        await pool.query(
            'UPDATE submission SET status=$1 WHERE submission_id=$2',
            [status, submission_id]
        )
    },
    async addJobId(submission_id: string, job_id: string){
        await pool.query(
            'UPDATE submission SET job_id=$2 WHERE submission_id=$1',
            [submission_id, job_id]
        )
    },
    async addResult(submission_id:string, codeResult: string | string[]){
        const result = await pool.query(
            'UPDATE submission SET result=$2 WHERE submission_id=$1',
            [submission_id, codeResult]
        )
        return result.rows[0]
    }
}