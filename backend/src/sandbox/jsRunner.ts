import {VM} from 'vm2'
import { CodeResult } from '../interfaces'

export async function jsRunner(code:string, submission_id: string): Promise<CodeResult>{
    let logs:string[] = []
    const sandbox = {
        timeout: 10000,
        sandbox:{
            console:{
                log: (...args:string[]) => logs.push(args.join(" "))
            },
            _shouldStop: false
        }
    }
    const vm = new VM(sandbox)
    try{
        const lines = code.trim().split('\n')

        const last = lines.pop()
        const body = lines.join('\n')
        const asyncIIFE = 
        `(async() =>{
            let _result;
            _result = (function(){
                ${body}
                return ${last}
            })()
            return _result
        })()`
        const result = await Promise.race([
            vm.run(asyncIIFE),
            new Promise((_, reject) =>{
                setTimeout(() => reject(new Error('Timeout exceeded')), 10000)
                
            })
        ])
        const output =
            logs.length > 0
            ? logs.join("\n")
            : result === undefined
            ? ""
            : typeof result === "object"
            ? JSON.stringify(result)
            : String(result);

        return {
            status: 'Completed',
            output
        }
    }catch(err){
        console.error(JSON.stringify({
            level: "error",
            event: "sandbox_failure",
            submission_id,
            message: err instanceof Error ? err.message : 'Failed'
        }));

        return{
            status: 'Failed',
            output: err instanceof Error ? err.message : 'Failed'
        }
    }
}