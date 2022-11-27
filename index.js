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


        app.get('/bikes', async (req, res) => {
            const query = {};
            const categories = await bikesCollection.find(query).toArray();
            res.send(categories);
        })

        app.get('/bikes/:category', async (req, res) => {
            const category = req.params.category;
            console.log(category);
            const query = { category: category };
            const cursor = await bikesCollection.find(query).toArray();
            res.send(cursor);
        })

        app.get('/bikecategories', async (req, res) => {
            const query = {}
            const cursor = await bikeCategoriesCollection.find(query).toArray();
            res.send(cursor);
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
    }
    finally {

    }

}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('bike valley server is running');
})

app.listen(port, () => console.log(`Bike valley running on port ${port}`))