const fetch = require('node-fetch')

async function xiaoduCommand(text, headers) {
    await fetch('https://dueros-h2.baidu.com/dlp/controller/send_to_server', {
        method: 'POST',
        body: JSON.stringify(
            {
                "to_server": {
                    "header": {
                        "dialogRequestId": "",
                        "messageId": "346f9d85-0a84-441b-a966-005b4c7cd58c",
                        "name": "LinkClicked",
                        "namespace": "dlp.screen"
                    },
                    "payload": {
                        "initiator": {
                            "type": "USER_CLICK"
                        },
                        "token": "",
                        "url": `dueros://server.dueros.ai/query?q=${encodeURIComponent(text)}`
                    }
                },
                "uuid": headers.uuid
            }
        ),
        headers
    })
}

module.exports = function (RED) { // RED  可以对node-red 进行访问

    function xiaoduNode(config) {
        RED.nodes.createNode(this, config); // 节点本身就会对调用该函数，包括节点输入的属性
        var node = this;
        node.on('input', function (msg) {
            this.status({ fill: "blue", shape: "ring", text: "正在发送命令" });
            xiaoduCommand(msg.payload.trim(), JSON.parse(config.headers)).then(() => {
                this.status({ fill: "green", shape: "ring", text: "命令发送成功" });
                node.send([{ payload }, null]);
            }).catch((payload) => {
                this.status({ fill: "red", shape: "ring", text: "命令发送失败" });
                node.send([null, { payload }]);
            })
        });
    }
    RED.nodes.registerType("xiaodu-box", xiaoduNode);
}