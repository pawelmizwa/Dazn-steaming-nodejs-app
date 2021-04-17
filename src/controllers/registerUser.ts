import { Response, Request } from "express";
import { DbClient } from "general/clients/mongodb";
import { v4 as uuid } from "uuid";

export function registerUserController(dbClient: DbClient) {
  return async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await dbClient.getUser({ email });

    if (doesUserExitsAlreay) {
      res.send("A user with that email already exits please try another one!");
      return;
    }
    const user = await dbClient.addUser({ userId: uuid(), email, password });
    console.log(user);
    res.status(200).send("registered account!");
  };
}
