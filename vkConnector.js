
const VK = require('vk-io');
const config = require("./config");

let vk = new VK(config.vkConf);

vk.longpoll.start()
    .then(() => {
        console.log('Long Poll запущен');
    })
    .catch((error) => {
        console.error(error);
    });

module.exports = {vk};