
import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

// In-memory storage for users and providers
interface User {
    id: number;
    username: string;
    email: string;
    fullname: string;
    subscribedProvider?: number;
}

interface Provider {
    id: number;
    name: string;
    charge: number;
}

interface Reading {
    units: number;
    time: string;
}

interface Meter {
    id: number;
    userId: number;//task5 --1)
    name: string;
    readings: Reading[];
}


/*1. Create APIs for Providers create, get all, update and delete
provider will
```js
    const provider = { "id" : "provider-name", "charge": 10}
```*/
let users: User[] = [];
let providers: Provider[] = [
    { id: 1, name: "Electro", charge: 5 },
    { id: 2, name: "Magneto", charge: 10 }
];
let meters: Meter[] = [];
let userIdCounter = 1;//task5--1)
let providerIdCounter = providers.length + 1;//task5--1)
let meterIdCounter = 1;

//############################### TASK-1 ###############################//

// Route to check the status of the server
app.get('/status', (req: Request, res: Response) => {
    res.json({ status: "Up and Running" });
});

// Create a new user
app.post('/users', (req: Request, res: Response) => {
    const newUser: User = {
        id: userIdCounter++,
        username: req.body.username,
        email: req.body.email,
        fullname: req.body.fullname
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Return a user by id
app.get('/users/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Update a user by id
app.put('/users/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.fullname = req.body.fullname || user.fullname;
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Delete a user by id
app.delete('/users/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.json({ message: 'User successfully deleted' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});
//################################### TASK-2 ###############################################//
// Get all providers
app.get('/providers', (req: Request, res: Response) => {
    res.json(providers);
});

// Create a new provider
app.post('/providers', (req: Request, res: Response) => {
    const newProvider: Provider = {
        id: providerIdCounter++,
        name: req.body.name,
        charge: req.body.charge
    };
    providers.push(newProvider);
    res.status(201).json(newProvider);
});

// Update a provider by id
app.put('/providers/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const provider = providers.find(p => p.id === id);
    if (provider) {
        provider.name = req.body.name || provider.name;
        provider.charge = req.body.charge || provider.charge;
        res.json(provider);
    } else {
        res.status(404).json({ message: 'Provider not found' });
    }
});

// Delete a provider by id
app.delete('/providers/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const providerIndex = providers.findIndex(p => p.id === id);
    if (providerIndex !== -1) {
        providers.splice(providerIndex, 1);
        res.json({ message: 'Provider successfully deleted' });
    } else {
        res.status(404).json({ message: 'Provider not found' });
    }
});
// ##################################### TASK-3 ############################################//
//  Create APIs for user subscribing to providers `user can choose any one provider`
app.post('/users/:id/subscribe', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const providerId = req.body.providerId;
    const user = users.find(u => u.id === userId);
    const providerExists = providers.some(p => p.id === providerId);

    if (user && providerExists) {
        user.subscribedProvider = providerId;
        res.json(user);
    } else {
        res.status(404).json({ message: 'User or Provider not found' });
    }
});
// ##################################### TASK-4 #####################################//
// Create a new meter
app.get('/meters', (req: Request, res: Response) => {
    const newMeter: Meter = {
        id: meterIdCounter++,
        userId: req.body.userId,
        name: req.body.name,
        readings: []
    };
    meters.push(newMeter);
    res.status(201).json(newMeter);
});

// APT to store meter readings
app.post('/meters/:id/readings', (req: Request, res: Response) => {
    const meterId = parseInt(req.params.id);
    const meter = meters.find(m => m.id === meterId);

    if (!meter) {
        res.status(404).json({ message: 'Meter not found' });
        return;
    }

    const newReading: Reading = {
        units: req.body.units,
        time: req.body.time
    };
    meter.readings.push(newReading);
    res.status(201).json(newReading);
});

// Get all meter readings
app.get('/meters/:id/readings', (req: Request, res: Response) => {
    const meterId = parseInt(req.params.id);
    const meter = meters.find(m => m.id === meterId);

    if (!meter) {
        res.status(404).json({ message: 'Meter not found' });
        return;
    }

    res.json(meter.readings);
});
// ######################################## TASK-5 ###################################//
// Get all readings of a given user ID
app.get('/users/:id/meters/readings', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const userMeters = meters.filter(m => m.userId === userId);

    if (userMeters.length === 0) {
        res.status(404).json({ message: 'No meters found for this user' });
        return;
    }

    const readings = userMeters.flatMap(m => m.readings);
    res.json(readings);
});

// Get bill for a given user ID
app.get('/users/:id/bill', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const provider = providers.find(p => p.id === user.subscribedProvider);

    if (!provider) {
        res.status(404).json({ message: 'Provider not found' });
        return;
    }

    const userMeters = meters.filter(m => m.userId === userId);

    if (userMeters.length === 0) {
        res.status(404).json({ message: 'No meters found for this user' });
        return;
    }

    const totalUnits = userMeters.flatMap(m => m.readings).reduce((sum, reading) => sum + reading.units, 0);
    const amount = totalUnits * provider.charge;

    res.json({ user_id: userId, amount });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
