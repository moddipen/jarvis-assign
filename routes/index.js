const express = require("express");
const router = express.Router();
const maxHour = 8;
let assignedRequest = [];
let assignedHour = 0;
let butlerRequests = [];

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Jarvis" });
});

const findByValue = (array, value, key) => {
  let data =
    array.find(
      arr => +arr[key] === value && !assignedRequest.includes(arr.requestId)
    ) || null;
  if (data) {
    assignedHour += value;
    butlerRequests.push(data.requestId);
    assignedRequest.push(data.requestId);
    if (value !== 1 && assignedHour !== maxHour) {
      return findByValue(array, maxHour - assignedHour, key);
    } else {
      return butlerRequests;
    }
  } else {
    if (value !== 1) {
      return findByValue(array, value - 1, key);
    } else {
      return butlerRequests;
    }
  }
};

/** POST assign butler. */
router.post("/assign", async (req, res, next) => {
  let requests = req.body;
  let butlers = [];
  await requests.map(client => {
    if (!assignedRequest.includes(client.requestId)) {
      butlerRequests = [];
      butlerRequests.push(client.requestId);
      assignedRequest.push(client.requestId);
      assignedHour = 0;
      assignedHour += +client.hours;
      let hour = maxHour - +client.hours;
      if (hour) {
        let data = findByValue(requests, hour, "hours");
        if (data) {
          butlers.push({
            requests: data
          });
        }
      }
    }
  });

  const response = {
    butlers: butlers,
    spreadClientIds: [...new Set(requests.map(item => item.clientId))]
  };

  return res.json(response);
});

module.exports = router;
