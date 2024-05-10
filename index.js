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
        const resultCollections = db.collection("Result")

        app.post('/api/User', async (req, res) => {
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

        app.get("/api/User/Fetch", async (req, res) => {
            const cursor = userCollections.find({});
            const allUser = await cursor.toArray();

            res.send({ status: true, data: allUser });
        });

        app.post('/api/User/login', async (req, res) => {
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

        app.post("/api/Question", async (req, res) => {
            const question = req.body;
            console.log(question);
            const result = await questionCollections.insertOne(question);
            res.send(result);
        });
        app.get("/api/Question/Fetch", async (req, res) => {
            const cursor = questionCollections.find({});
            const allQus = await cursor.toArray();
            res.send({ status: true, data: allQus });
        });

        app.get("/api/Question/getByCatName/:category", async (req, res) => {
            const category = req.params.category;
            console.log(category)
            try {
                const cursor = questionCollections.find({ questionCategory: category });
                const question = await cursor.toArray();
                if (question.length === 0) {
                    res.status(404).send({ status: false, message: "Question not found" });
                } else {
                    res.send({ status: true, data: question });
                }
            } catch (error) {
                console.error("Error fetching question:", error);
                res.status(500).send({ status: false, message: "Internal server error" });
            }
        });
        

        app.get("/categories", async (req, res) => {
            const cursor = questionCollections.find({});
            const allCat = await cursor.toArray();

            res.send({ status: true, data: allCat });
        });

        app.post("/api/Result", async (req, res) => {
            try {
                const resultData = req.body; // Assuming the request body contains the data to be inserted
                // You may want to validate resultData before proceeding further
        
                const resultCollections= db.collection("Result");
                const result = await resultCollections.insertOne(resultData);
        
                res.status(201).send({ status: true, message: "Result added successfully", data: result.ops });
            } catch (error) {
                console.error("Error adding result:", error);
                res.status(500).send({ status: false, message: "Internal server error" });
            }
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