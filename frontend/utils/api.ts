export async function postCode(code: string, language: string): Promise<string>{
    const res = await fetch('http://localhost:8080/code/create',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({code, language})
        }
    )
    const data = await res.json()
    return data?.submission_id

}

export async function pollCode(submissionId: string) {
    const res = await fetch(`http://localhost:8080/code/poll/${submissionId}`,{cache: 'no-store'})
    const data = await res.json()
    return data
}