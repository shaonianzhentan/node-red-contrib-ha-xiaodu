const fetch = require('node-fetch')
const FormData = require('form-data')
const { v4: uuidv4 } = require('uuid')

module.exports = class {
    constructor(node) {
        this.node = node
    }

    status(text) {
        this.node.status({ fill: "green", shape: "ring", text })
    }

    // 自动发现配置
    discovery() {
        
    }

    // 单命令执行
    async xiaoduBox(text, headers) {
        await fetch('https://dueros-h2.baidu.com/dlp/controller/send_to_server', {
            method: 'POST',
            body: JSON.stringify(
                {
                    "to_server": {
                        "header": {
                            "dialogRequestId": "",
                            "messageId": uuidv4(),
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

    // 多命令执行
    async xiaoduCommand(query, botId, cookie) {
        this.status('获取Token信息')
        let tokenInfo = await fetch('https://dueros.baidu.com/dbp/bot/getnametokeninfo', {
            method: 'GET',
            headers: {
                cookie
            }
        }).then(res => res.json())
        let { status, data } = tokenInfo
        if (status == 200) {
            const { accessToken } = data
            console.log(accessToken)
            this.status('开始发送命令')
            const postData = {
                "event": {
                    "header": {
                        "namespace": "ai.dueros.device_interface.text_input",
                        "name": "TextInput",
                        "messageId": uuidv4(),
                        "dialogRequestId": uuidv4()
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
            let body = new FormData()
            body.append('metadata', Buffer.from(JSON.stringify(postData)), {
                contentType: 'application/json',
            })
            const res = await fetch('https://dueros-h2-dbp.baidu.com/dcs/v1/events', {
                method: 'POST',
                body,
                headers: {
                    'authorization': `Bearer ${accessToken}`,
                    'dueros-device-id': '123456'
                }
            }).then(res => res.text())
            // console.log(res)
            const list = []
            res.split('--___dueros_dcs_v1_boundary___\r\n').forEach(ele => {
                const arr = ele.split('\r\n')
                if (arr.length > 0) {
                    // JSON文件
                    if (arr[0].includes('Content-Disposition: form-data; name="metadata"')) {
                        arr[0] = arr[1] = ''
                        const jsonData = JSON.parse(arr.join(''))
                        list.push(jsonData)
                    }
                    else if (arr[0].includes('Content-Type: application/octet-stream')) {
                        // 音频文件
                        arr[0] = arr[1] = arr[2] = ''
                        // console.log(arr.join(''))
                    }
                }
            })
            return list
        }
    }

}