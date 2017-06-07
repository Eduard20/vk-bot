
const {vk} = require("./vkConnector");
const config = require("./config");
const _ = require("underscore");


const array = {
    0 : {
        items : []
    },
    1: {
        items : []
    }
};

vk.longpoll.on("message", (msg) => {
    if (msg.flags.indexOf('outbox') !== -1) {
        return;
    }
    let groups = msg.text.split(" ");
    let arr = groups.map(one => {
        let array = one.split("/");
        return array[array.length - 1];
    });
    const result = [];
    const def = 0;
    recursiveFunc(arr[0], def, 0, msg);
    recursiveFunc(arr[1], def, 1, msg)
        .then(doc => {
            _.each(doc[0].items, one => {
                _.find(doc[1].items, sec => {
                    if (one === sec) {
                        result.push(one);
                    }
                })
            });
            const percent = result.length * 100/doc[0].items.length;
            array[0].items = [];
            array[1].items = [];
            msg.send(`${percent}%`)
        })
        .catch((err) => {
            console.log(err);
            msg.send(`Пожалуйста введите две ссылки на паблик 
            пример : vk.com/group1 vk.com/group2`)
        });
});

const recursiveFunc = (id, offset, num, msg) => {
    return new Promise ((resolve, reject) => {
        vk.api.groups.getMembers({group_id: id, offset})
            .then(doc => {
                if (!_.isEmpty(doc.items)) {
                    _.each(doc.items, one => {
                       array[num].items.push(one);
                    });
                    const prcnt = array[num].items.length * 100/doc.count;
                    msg.send(`${id}:${prcnt}%`);
                    offset +=1000;
                    recursiveFunc(id, offset, num, msg)
                        .then(resolve)
                        .catch(reject);
                    return;
                }
                return resolve(array);
            })
            .catch(reject)
    })

};
