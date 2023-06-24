import express from "express";
import { getAccessToken, pollSearch } from "../Controllers/AllController.js";


const router = express.Router();


router.post('/get-token', getAccessToken);
router.get('/pollsearch', pollSearch);


export default router;