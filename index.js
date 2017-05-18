
const {vk} = require("./vkConnector");
const config = require("./config");

vk.longpoll.on("message", (msg) => {
    if (msg.flags.indexOf('outbox') !== -1) {
        return;
    }
    vk.api.messages.getHistory({user_id: msg.user})
        .then((doc) => {
            (0 === doc.in_read) ? msg.send(config.message) : false;
        })
        .catch(console.error);
});
