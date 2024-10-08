 const scene11 = {
      "id": "scene-11",
      "name": "Первый холл лаборатории",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1488,
      "initialViewParameters": {
        "yaw": 0.6343631189451671,
        "pitch": 0.06409135499392882,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": [
        {
          "yaw": -2.6637543538879225,
          "pitch": 0.3676575224910934,
          "title": "",
          "text": "<img src='images/scene11.jpg' style='max-width: 100%; max-height: 80%'>"
        },
        {
          "yaw": -0.09887641331808084,
          "pitch": 0.23317843676882966,
          "title": "История Школы инженерного резерва",
          "text": "Команда \"Neftegaz Engineering\" в рамках международных соревнований Formula Student разрабатывала гоночные болиды, это один из них. Команда принимала участия в соревнованиях в Китае, Германии, Италии и др. Впоследствии выходцы из этой команды стали инициаторами создания Школы инженерного резерва."
        }
      ],
     "customHotspots": [
        {
          "type": 7,
          "yaw": 1.453278184019542,
          "pitch": 0.21613847226604577,
          "rotation": 0,
          "target": "scene-12",
          "title": "Переход между первым и вторым холлом лаборатории"
        },
        {
          "type": 7,
          "yaw": 2.042246606825624,
          "pitch": -0.011392888119511113,
          "rotation": 0,
          "target": "scene-13",
          "title": "Вход на 2ую лестницу 1 этаж"
        },
        {
          "type": 7,
          "yaw": -1.7393225541895916,
          "pitch": 0.23545597094686777,
          "rotation": 0,
          "target": "scene-8",
          "title": "Первый холл лаборатории"
        }
      ]
};

export default scene11;