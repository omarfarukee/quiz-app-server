require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const { default: mongoose } = require("mongoose");
const cors = require("cors");
app.use(cors())
  
app.use(express.json());
  
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xdpsuxi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
const run = async () => {
    try {
        const db = client.db("quiz-app");
        const userCollections = db.collection("User")
        const questionCollections = db.collection("Question")

        app.post('/create-user', async (req, res) => {
            try {

                const { pass,phoneNumber } = req.body;
                const existingUser = await userCollections.findOne({ $or: [ { pass }, { phoneNumber }] });
                if (existingUser) {
                    let errorMessage = '';
                    if (existingUser.phoneNumber === phoneNumber) {
                        errorMessage = 'phone Number is already exists';
                    } else if (existingUser.pass === pass) {
                        errorMessage = 'Password is already exists, please set unique password';
                    } 
                    return res.status(400).json({ error: errorMessage });
                }

                const newUser = req.body
                const result = await userCollections.insertOne(newUser);
                console.log(newUser)
                res.status(201).json({ message: 'User created successfully',result, user:newUser  });
            } catch (error) {
                console.error('Error creating user:', error);
                res.status(500).send('Error creating user: ' + error.message);
            }
        })

        app.post('/user-login', async (req, res) => {
            try {
                const { phoneNumber, pass } = req.body;
                const user = await userCollections.findOne({ phoneNumber });
                if (!user) {
                    return res.status(401).json({ error: 'Invalid phone number' });
                }
                if (user.pass !== pass) {
                    return res.status(401).json({ error: 'Invalid password' });
                }
                res.status(200).json({ message: 'Login successful', user: user });
            } catch (error) {
                console.error('Error logging in:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.post("/create-question", async (req, res) => {
            const question = req.body;
            console.log(question);
            const result = await questionCollections.insertOne(question);
            res.send(result);
        });

        app.get("/categories", async (req, res) => {
            const cursor = questionCollections.find({});
            const allCat = await cursor.toArray();

            res.send({ status: true, data: allCat });
        });

    }
    finally {

    }
}
run().catch((err) => console.log(err));
app.get("/", (req, res) => {
    res.send("quiz-server runnig sunccessfully");
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});