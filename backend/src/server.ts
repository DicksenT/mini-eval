import app from "./app";

app.listen(process.env.PORT || 8080, () =>{
    console.log(`Server is running, listening to port ${process.env.PORT || 8080}`)
})