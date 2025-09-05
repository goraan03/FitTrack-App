import { Request, Response, Router } from "express";
import { IUserService } from "../../Domain/services/users/IUserService";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class UserController {
  private router: Router;
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.router = Router();
    this.userService = userService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/users",
      authenticate,
      authorize("admin"),
      this.korisnici.bind(this)
    );
  }

  private async korisnici(req: Request, res: Response): Promise<void> {
    try {
      const korisniciPodaci: UserDto[] = await this.userService.getSviKorisnici();
      res.status(200).json(korisniciPodaci);
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error)?.message ?? "Internal error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}