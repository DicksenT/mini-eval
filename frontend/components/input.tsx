'use client'
import { useState } from "react"

export const Input = ()=>{
    const [code, setCode] = useState('')
    return(
         <input type="text" value={code} onChange={(e) => setCode(e.currentTarget.value)}/>
    )
}