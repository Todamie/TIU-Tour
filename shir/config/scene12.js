const scene12 = {
      "id": "scene-12",
      "name": "Переход между первым и вторым холлом лаборатории",
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
        "yaw": 3.076248120213477,
        "pitch": 0.1861696727681732,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": [
        {
          "yaw": -2.868133071348062,
          "pitch": 0.7044594377191267,
          "title": "Верстаки",
          "text": "<img src='images/scene12.jpg' style='max-width: 100%; max-height: 80%'>"
        }
      ],
     "customHotspots": [
        {
          "type": 7,
          "yaw": -1.5604224034982703,
          "pitch": 0.2373901268305314,
          "rotation": 0,
          "target": "scene-11",
          "title": "Первый холл лаборатории"
        },
        {
          "type": 7,
          "yaw": 1.5604224034982703,
          "pitch": 0.4,
          "rotation": 0,
          "target": "scene-35",
          "title": "Второй холл лаборатории"
        }
      ]
};

export default scene12;