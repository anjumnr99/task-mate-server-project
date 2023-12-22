const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7nwjyzo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    
    const taskCollection = client.db("taskMateDB").collection("tasks");

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log('jwt', token);
      res.send({ token });
    });

    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Forbidden Access' })
      }
    
      const token = req.headers.authorization.split(' ')[1];
      console.log('Token:', req.headers.authorization);
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next();
      })
    
    };
    
    
    app.post('/tasks', async (req, res) => {
      const newTask = req.body;
      console.log(newTask);
      const result = await taskCollection.insertOne(newTask);
      res.send(result)
    });

    app.get('/tasks', async (req, res) => {
      console.log(req.query.email);
      const email = req.query.email;
      const query = { user_email: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/tasks/:id', async (req, res) => {
      const ids = req.params.id;
      const query = { _id: new ObjectId(ids) }
      const result = await taskCollection.findOne(query)
      res.send(result)
    });

    app.put('/task/update/:id', async (req, res) => {
      const ids = req.params.id;
      const filter = { _id: new ObjectId(ids) };
      const options = { upsert: true };
      const updatedTask = req.body;
      const product = {
        $set: {
          task_priority: updatedTask.task_priority,
          task_title: updatedTask.task_title,
          task_deadlines: updatedTask.task_deadlines,
          task_description: updatedTask.task_description,
          user_name: updatedTask.user_name,
          user_email: updatedTask.user_email

        }
      }

      const result = await taskCollection.updateOne(filter, product, options);
      res.send(result)

    })





    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Task Mate is running')
})


app.listen(port, () => {
  console.log(`Task Mate listening on port ${port}`)
})