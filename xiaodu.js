const fetch = require('node-fetch')
const FormData = require('form-data')

function xiaoduCommand(query, botId, token) {
    return new Promise((resolve, reject) => {
        let obj = {
            "event": {
                "header": {
                    "namespace": "ai.dueros.device_interface.text_input",
                    "name": "TextInput",
                    "messageId": "21623f0f-c8ce-45ca-8bd2-cf2785c5054d",
                    "dialogRequestId": "e7295ade-7317-4f4d-9433-d479d67a1b97"
                },
                "payload": {
                    "query": query
                }
            },
            "debug": {
                "bot": {
                    "id": botId
                },
                "device_mode": "show",
                "simulator": true
            },
            "clientContext": [
                {
                    "header": {
                        "namespace": "ai.dueros.device_interface.location",
                        "name": "GpsState"
                    },
                    "payload": {
                        "longitude": 121.3355694153401,
                        "latitude": 31.12794963850454,
                        "geoCoordinateSystem": "BD09LL"
                    }
                },
                {
                    "header": {
                        "namespace": "ai.dueros.device_interface.screen",
                        "name": "ViewState"
                    },
                    "payload": {
                        "token": "",
                        "offsetInMilliseconds": 8261,
                        "playerActivity": "FINISHED",
                        "voiceId": 0
                    }
                }
            ]
        }

        // let blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
        let formData = new FormData()
        formData.append('metadata', Buffer.from(JSON.stringify(obj)), {
            contentType: 'application/json',
        })

        fetch('https://dueros-h2-dbp.baidu.com/dcs/v1/events', {
            method: 'POST',
            body: formData,
            headers: {
                'authorization': `Bearer ${token}`,
                'dueros-device-id': '123456'
            }
        }).then(res => res.text()).then(res => {
            let resArr = []
            let arr = res.split('--___dueros_dcs_v1_boundary___\r\n')
            arr.forEach(ele => {
                arr = ele.split('\r\n')
                if (arr.length > 0 && arr[0].trim() == 'Content-Disposition: form-data; name="metadata"') {
                    arr[0] = arr[1] = ''
                    resArr.push(JSON.parse(arr.join('')))
                }
            })
            resolve(resArr)
        }).catch(reject)
    })

}

module.exports = function (RED) { // RED  可以对node-red 进行访问

    function xiaoduNode(config) {
        RED.nodes.createNode(this, config); // 节点本身就会对调用该函数，包括节点输入的属性
        var node = this;
        node.on('input', function (msg) {
            Promise.all(msg.payload.split(',').map(ele => xiaoduCommand(ele.trim(), config.botId, config.token))).then(() => {
                this.status({ fill: "green", shape: "ring", text: "命令发送成功" });
                node.send([{
                    payload: arguments
                }, null]);
            }).catch(() => {
                this.status({ fill: "red", shape: "ring", text: "命令发送失败" });
            })
        });

    }
    RED.nodes.registerType("xiaodu", xiaoduNode);
}
