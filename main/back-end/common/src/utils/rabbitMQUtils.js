const amqp = require("amqplib");
const config = require("./config");

/**
 * @return an object with the connection and channel fields
 * */
const getMQClient = async () => {
    const connection = await amqp.connect(config["RABBIT_MQ_URL"]).then(connection => connection);
    const channel = await connection.createChannel().then(channel => channel);
    console.log("connected to Rabbit MQ");
    return { connection: connection, channel: channel };
};

// hard-coding exchange/queue options to prevent declaring different options in assertions
const exchange = {
    name: "mern-microservice-practice",
    options: {
        durable: true
    }
};

const queues = {
    logs: {
        name: "logs",
        options: {
            exclusive: false,
            durable: true
        }
    }
};

const keys = {
    generalLogs: "logs.#",
    userLogs: "logs.user",
    errorLogs: "logs.error"
};

exports.getMQClient = getMQClient;
exports.exchange = exchange;
exports.queues = queues;
exports.keys = keys;
