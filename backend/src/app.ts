import  express  from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import submissionRoute from './routes/submissionRoutes'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/code', submissionRoute)

export default app