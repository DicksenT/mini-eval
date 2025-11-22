import { CodeResult } from "../interfaces"
import { jsRunner } from "./jsRunner"

export const sandbox={
    async run(code: string, language: string,submission_id: string): Promise<CodeResult>{
        let result
        console.log(JSON.stringify({
            level: "info",
            event: "sandbox_execution",
            language,
            submission_id
        }));
        switch(language){
            case 'JavaScript':
                result = await jsRunner(code, submission_id)
        }
        return result!
    }
}