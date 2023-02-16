require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

app.use(express.json())

//import do model
const User = require('./model/User')


//Rota inicial
app.get('/', (req, res) => {

    res.status(200).json({mensagem: "Bem vindo ao app da XP"})
} )

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.set("strictQuery", false)
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.xtrtmh3.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(3000)
    console.log("Conexão realizada com sucesso!")
}).catch((err)=> console.log(err))

app.post("/auth/register", async(req, res) => {
    const {name, email, password, confirmPass} = req.body

    //verificacoes se o campo esta vazio
    if(!name){
        return res.status(422).json({mensagem: "Nome obrigatório!"})
    }
    if(!email){
        return res.status(422).json({mensagem: "E-mail obrigatório!"})
    }
    if(!password){
        return res.status(422).json({mensagem: "A senha é obrigatória!"})
    }
    if(password !== confirmPass ){
        return res.status(422).json({mensagem: "As senhas não conferem"})
    }

    //verificar se o usuario ja existe
    const userExists = await User.findOne({email: email})
    if(userExists){
        return res.status(422).json({mensagem: "Usuário ja existe"})
    }

    //criptografar a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //criar usuário no banco de dados
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try {
        await user.save()
        res.status(201).json({mensagem: "Usuário criado com sucesso!"})
    } catch (err) {
        console.log(err)
    }
} )

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    if(!email){
        return res.status(422).json({mensagem: "E-mail obrigatório!"})
    }
    if(!password){
        return res.status(422).json({mensagem: "A senha é obrigatória!"})
    }

    //verifica se o usuario nao existe
    const user = await User.findOne({email: email})
    if(!user) {
        return res.status(404).json({mensagem: "Usuário não existe"})
    }
    //verificar se a senha esta correta
    const checkPassword = await bcrypt.compare(password, user.password)
    if(!checkPassword){
        return res.status(422).json({mensagem: "Senha incorreta!"})
    }

} )

