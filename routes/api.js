import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

/* User Routes */
router.get("/profile", [authMiddleware], ProfileController.index);
router.put("/profile/:id", [authMiddleware], ProfileController.update);

/* News Routes */
router.get("/news", [authMiddleware], NewsController.index);
router.get("/news/:id", [authMiddleware], NewsController.show);
router.post("/news", [authMiddleware], NewsController.store);
router.put("/news/:id", [authMiddleware], NewsController.update);
router.delete("/news/:id", [authMiddleware], NewsController.delete);

export default router;
