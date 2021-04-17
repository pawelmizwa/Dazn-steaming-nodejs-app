import { Response, Request } from "express";
import { DbClient } from "general/clients/mongodb";

export function loginUserController(dbClient: DbClient) {
  return async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const user = await dbClient.getUser({ email });

    if (!user) {
      res.send("invalid username or password");
      return;
    }

    if (password !== user.password) {
      res.send("invalid username or password");
      return;
    }
    req.session!.user = email;
    res.redirect("/home");
  };
}
