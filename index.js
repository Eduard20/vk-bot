
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
    recursiveFunc(arr[0], def, 0);
    recursiveFunc(arr[1], def, 1)
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
        .catch(console.log);
});

const recursiveFunc = (id, offset, num) => {
    return new Promise ((resolve, reject) => {
        vk.api.groups.getMembers({group_id: id, offset})
            .then(doc => {
                if (!_.isEmpty(doc.items)) {
                    _.each(doc.items, one => {
                       array[num].items.push(one);
                    });
                    offset +=1000;
                    recursiveFunc(id, offset, num)
                        .then(resolve)
                        .catch(reject);
                    return;
                }
                return resolve(array);
            })
            .catch(reject)
    })

};