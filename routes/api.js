import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

/* User Routes */
router.get("/profile", [authMiddleware], ProfileController.index);
router.put("/profile/:id", [authMiddleware], ProfileController.update);

export default router;
