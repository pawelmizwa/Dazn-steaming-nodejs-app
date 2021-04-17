import { Response, NextFunction, Request } from "express";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.session!.user === undefined) {
    res.status(404).send("You're not allowed to view this content! please log in first!");
    return;
  }
  next();
};
