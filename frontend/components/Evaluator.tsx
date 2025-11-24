'use client'
import { pollCode, postCode } from "@/utils/api"
import { useEffect, useState } from "react"

export const Evaluator = ()=>{
    const [code, setCode] = useState<string>('')
    const [submissionId, setSubmissionId] = useState<string>('')
    const [language, setLanguage] = useState<string>('JavaScript')
    const [result, setResult] = useState<string>('')

    async function submitCode() {
        const id = await postCode(code, language)
        setSubmissionId(id)
        console.log(submissionId)
    }

    useEffect(() =>{

        if(!submissionId) return
                console.log('useeffect' + submissionId)
        const timer = setInterval(async()=>{
            const res = await pollCode(submissionId)
            console.log(res?.status)
            if(res?.status === 'Completed'){
                setResult(res.result)
                clearInterval(timer)
            }
        },1000)
    }, [submissionId])

    return(
        <div>
         <textarea value={code} onChange={(e) => setCode(e.currentTarget.value)}/>
         <button type="submit" onClick={submitCode}>Submit</button>
         {result && 
         <pre>
            Output: {result}    
        </pre>}
        </div>
    )
}