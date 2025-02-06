const express = require("express");
const bodyparser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express().use(bodyparser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.listen(process.env.PORT, () => {
    console.log("Webhook is listening");
});

// Webhook verification endpoint
app.get("/webhook", (request, response) => {
    let mode = request.query["hub.mode"];
    let challenge = request.query["hub.challenge"];
    let token = request.query["hub.verify_token"];

    if (mode === "subscribe" && token === mytoken) {
        response.status(200).send(challenge);
    } else {
        response.status(403).send("Forbidden");
    }
});

// Webhook POST endpoint to handle messages
app.post("/webhook", (request, response) => {
    let body_para = request.body;
    console.log(JSON.stringify(body_para, null, 2));

    if (body_para.object) {
        if (body_para.entry &&
            body_para.entry[0].changes[0] &&
            body_para.entry[0].changes[0].value.messages &&
            body_para.entry[0].changes[0].value.messages[0]) {

            let phone_no_id = body_para.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_para.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_para.entry[0].changes[0].value.messages[0].text.body;

            axios({
                method: "POST",
                url: "https://graph.facebook.com/v21.0/" + phone_no_id + "/messages?access_token=" + token,
                data: {
                    messaging_product: "WhatsApp",
                    to: from,
                    text: {
                        body: "Hi, Welcome to Vibha's Chatbot Solution"
                    }
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                console.log("Message sent successfully:", response.data);
            }).catch(error => {
                console.error("Error sending message:", error);
            });

            response.sendStatus(200);
        } else {
            response.sendStatus(404);
        }
    }
});
