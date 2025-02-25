import { userInfo } from "os"
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import express, {Request, Response } from 'express'

const app = express()
app.use(express.json())

app.get("/users", async (req: Request, res: Response) => {
    try {
        const users = await AppDataSource.manager.find(User);

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        return res.status(200).json({ message: "List of users", users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/user/:id', async (req: Request, res: Response) => {
    try{
        const userID = Number(req.params.id)

        if(isNaN(userID)){
            return res.status(400).json({msg: 'invalid user id'})
        }

        const user = await AppDataSource.manager.findOneBy(User, {
            id: userID
        })

        if(!user){
            return res.status(404).json({msg: `user id: ${userID} cant be found`})
        }

        return res.status(200).json({msg: 'User found', user})

    }
    catch(err){
        console.error("Error fetching user:", err);
        return res.status(500).json({msg: 'Internal server error'})
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, age } = req.body;

        // Validate input data
        if (!firstName || !lastName || !age) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Create user instance
        const user = AppDataSource.manager.create(User, { firstName, lastName, age });

        // Save user
        await AppDataSource.manager.save(user);

        res.status(201).json({ message: "User created", user });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.put("/user/:id", async (req: Request, res: Response) => {
    try { 
        const userRepository = AppDataSource.getRepository(User)
        const userID = Number(req.params.id)

        if(isNaN(userID)){
            return res.status(400).json({msg: 'no user can be found'})
        }

        const userToUpdate = await userRepository.findOneBy({
            id: userID
        })

        if(!userToUpdate){
            return res.status(404).json({msg: 'no user can be found'})
        }
        
        Object.assign(userToUpdate, req.body)

        await userRepository.save(userToUpdate)

        return res.status(200).json({ message: `user ${userID} updated.`, newUser: userToUpdate})
     } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal server error" });
     }
})

app.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const userId = Number(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await userRepository.remove(user);

        res.status(200).json({ message: "User has been removed" });
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000')
})






