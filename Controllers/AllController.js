import { CronJob } from "cron";
import axios from "axios";
import Tokens from "../Model/Token.js";

var job = new CronJob("*/1 * * * *", () => {
  Tokens.updateOne({}, { $unset: { sessionToken: 1 } }).exec();
  // console.log("first")
});
job.start();

export const getAccessToken = async (req, res) => {
  try {
    const options = {
      method: "POST",
      url: "https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "f571456fc6msh99ccc4937766211p1cb810jsn9362856f689f",
        "X-RapidAPI-Host": "skyscanner-api.p.rapidapi.com",
      },
      data: {
        query: {
          market: "UK",
          locale: "en-GB",
          currency: "EUR",
          queryLegs: [
            {
              originPlaceId: { iata: "LHR" },
              destinationPlaceId: { iata: "DXB" },
              date: {
                year: 2023,
                month: 9,
                day: 20,
              },
            },
          ],
          cabinClass: "CABIN_CLASS_ECONOMY",
          adults: 2,
          childrenAges: [3, 9],
        },
      },
    };

    const response = await axios.request(options);
    const data = response.data.sessionToken;
    console.log(data);

    const existingToken = await Tokens.findOne({});
    if (existingToken) {
        
      existingToken.sessionToken = data;
      await existingToken.save();
      return res.send("Token is updated successfully.");
    }

    const token = new Tokens({
      sessionToken: data,
    });
    await token.save();
    return res.send("Token saved successfully.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error occurred while saving the token.");
  }
};

export const pollSearch = async (req, res) => {
  try {
    const { _id } = req.body;
    const token = await Tokens.find({ _id }).exec();
    const sessionToken = token[0].sessionToken;
    const options = {
      method: "GET",
      url: `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/poll/${sessionToken}`,
      headers: {
        "X-RapidAPI-Key": "f571456fc6msh99ccc4937766211p1cb810jsn9362856f689f",
        "X-RapidAPI-Host": "skyscanner-api.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    console.log(response.data);
    return res.send(response.data);
  } catch (error) {
    console.error(error);
  }
};
