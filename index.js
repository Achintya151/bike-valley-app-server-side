const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8xqwoju.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
    try {
        const bikesCollection = client.db('bikeValley').collection('bikes');
        const bikeCategoriesCollection = client.db('bikeValley').collection('bikeCategories');
        const bookingCollection = client.db('bikeValley').collection('booking');
        const usersCollection = client.db('bikeValley').collection('users');


        app.get('/bikes', async (req, res) => {
            const query = {};
            const categories = await bikesCollection.find(query).toArray();
            res.send(categories);
        })

        app.get('/bikesbyemail/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const bikes = await bikesCollection.find(query).toArray();
            res.send(bikes);
        })

        app.get('/bikes/advertised', async (req, res) => {
            const query = { isAdvertised: true }
            const bikes = await bikesCollection.find(query).toArray();
            res.send(bikes);
        })

        app.get('/bikes/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category };
            const cursor = await bikesCollection.find(query).toArray();
            res.send(cursor);
        })

        app.post('/bikes', async (req, res) => {
            const product = req.body;
            const result = await bikesCollection.insertOne(product);
            res.send(result);
        })

        app.put('/bikes/advertised/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    isAdvertised: true
                }
            }
            const result = await bikesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await bikesCollection.deleteOne(filter)
            res.send(result)
        })

        app.get('/bikecategories', async (req, res) => {
            const query = {}
            const cursor = await bikeCategoriesCollection.find(query).toArray();
            res.send(cursor);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const booking = await bookingCollection.find(query).toArray();
            res.send(booking);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = {
                buyerName: booking.buyerName,
                email: booking.email,
                itemId: booking.itemId
            }

            const alreadyBooked = await bookingCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You have already booked ${booking.itemName}`
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/usersbyemail/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const users = await usersCollection.findOne(query);
            res.send({ users })
        })

        app.get('/users', async (req, res) => {
            const role = req.headers.role;
            const query = { role: role };
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers)
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = {
                email: user.email
            }
            const alreadyAdded = await usersCollection.find(query).toArray();

            if (alreadyAdded.length) {
                return res.send({ acknowledged: false })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, option);
            res.send(result)
        })

        app.put('/users/verified/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    sellerVerified: true
                }
            }
            const user = await usersCollection.updateOne(filter, updatedDoc, options)

            res.send(user)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter)
            res.send(result);
        })
    }
    finally {

    }

}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('bike valley server is running');
})

app.listen(port, () => console.log(`Bike valley running on port ${port}`))