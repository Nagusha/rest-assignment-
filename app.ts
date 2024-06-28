
import express, { Request, Response, NextFunction } from "express";
import rateLimit from 'express-rate-limit';


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
    userId: number;
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
    { id: 1, name: "Nagusha", charge: 5 },
    { id: 2, name: "Bhavani", charge: 10 }
];
let meters: Meter[] = [
    //{ id: 5, userId: 2840, name: 'Nagu'}
];
let userIdCounter = 1;
let providerIdCounter = providers.length + 1;
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
    res.send('User created successfully');
});

// Return a user by id
app.get('/users/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (user) {
        res.send(user);
    } else {
        res.send('User not found' );
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
        res.json({ message: 'User not found' });
    }
});

// Delete a user by id
app.delete('/users/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.send({ message: 'User successfully deleted' });
    } else {
        res.send({ message: 'User not found' });
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
    res.json(newProvider);
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
        res.json({ message: 'Provider not found' });
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
        res.json({ message: 'Provider not found' });
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
        res.json({ message: 'User or Provider not found' });
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
    res.json(newMeter);
});

// APT to store meter readings
app.post('/meters/:id/readings', (req: Request, res: Response) => {
    const meterId = parseInt(req.params.id);
    const meter = meters.find(m => m.id === meterId);

    if (!meter) {
        res.json({ message: 'Meter not found' });
        return;
    }

    const newReading: Reading = {
        units: req.body.units,
        time: req.body.time
    };
    meter.readings.push(newReading);
    res.json(newReading);
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
        res.json({ message: 'No meters found for this user' });
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
        res.json({ message: 'User not found' });
        return;
    }

    const provider = providers.find(p => p.id === user.subscribedProvider);

    if (!provider) {
        res.json({ message: 'Provider not found' });
        return;
    }

    const userMeters = meters.filter(m => m.userId === userId);

    if (userMeters.length === 0) {
        res.json({ message: 'No meters found for this user' });
        return;
    }

    const totalUnits = userMeters.flatMap(m => m.readings).reduce((sum, reading) => sum + reading.units, 0);
    const amount = totalUnits * provider.charge;

    res.json({ user_id: userId, amount });
});

/*app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});*/
//-----------------------------------ASSIGMENT-2---------------------------------//

//################################ TASK-1 ######################################//
const admin = "Nagu2840";
const validAdmin = (req: Request, res: Response, next: NextFunction) => {
    const admindata = req.headers['admin'];
    if (admindata && admindata === admin) {
        next();
    } else {
        res.status(403).send('Admin access required');
    }
};

//############################### TASK-2 ##################################//
const userAuth = (req: Request, res: Response, next: NextFunction) => {
    // Dummy user authentication middleware for illustration purposes
    next();
};

app.get('/user/:id/consumption', userAuth, (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const days = parseInt(req.query.days as string, 10);

    const consumptionData = [
        { date: '2024-06-21', units: 10 },
        { date: '2024-06-14', units: 15 }
    ];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filteredConsumption = consumptionData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate;
    });

    res.json(filteredConsumption);
});

//############################## TASK-3 ###########################//
app.get('/user/:id/bill', userAuth, (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    const readings = [
        { date: '2024-01-01', units: 100 },
        { date: '2024-01-15', units: 180 },
        { date: '2024-01-31', units: 200 }
    ];

    const filteredReadings = readings.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });

    const totalUnits = filteredReadings.reduce((sum, record) => sum + record.units, 0);
    const amount = totalUnits * 0.1;

    res.json({ userId, startDate, endDate, amount });
});

//################################### TASK - 4 ######################################//
app.get('/user/:id/best-provider', userAuth, (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);

    const providers = [
        { name: 'Nagulu', costPerUnit: 0.1 },
        { name: 'Bhavani', costPerUnit: 0.09 },
        { name: 'Karthik', costPerUnit: 0.11 }
    ];

    const pastUsage = 1000;

    const providerCosts = providers.map(provider => ({
        provider: provider.name,
        cost: pastUsage * provider.costPerUnit
    }));

    const topProviders = providerCosts.sort((a, b) => a.cost - b.cost).slice(0, 3);
    res.json(topProviders);
});

//#################################### TASK -5 ##########################################//
app.get('/users', (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const users = [
        { id: 1, name: 'Bhavani' },
        { id: 2, name: 'Charan' },
        { id: 3, name: 'Ajay' },
        { id: 4, name: 'Vijay' },
        { id: 5, name: 'Vidhya' },
        { id: 6, name: 'Viyshu' },
        { id: 7, name: 'Srivani' }
    ];

    const paginatedUsers = users.slice(offset, offset + limit);
    res.json(paginatedUsers);
});

//#################################### TASK -6 #################################//
interface UserDTO {
    id: number;
    name: string;
    email: string;
}

app.get('/users/:id', userAuth, (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);

    const user = {
        id: 1,
        name: 'nagu1',
        email: 'nagu1@gmail.com',
        password: 'naguu12'
    };

    const userDTO: UserDTO = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    res.json(userDTO);
});

//##################################### TASK -7 #################################//
const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10, 
    message: 'Too many requests'
});

app.use(limiter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});