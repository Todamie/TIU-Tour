const scene31 = {
      "id": "scene-31",
      "name": "3 лестница 3 этаж",
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
        }
      ],
      "faceSize": 960,
      "initialViewParameters": {
        "pitch": 0.2,
        "yaw": -0.7,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": [
        {
          "yaw": -1,
          "pitch": -0.2,
          "title": "Рельса Демидова НТЗ, 1905 г.",
          "text": "<img src='imagesArhid/roof/scene31.jpg' style='max-width: 100%; max-height: 80%'>" +
          "<br><img src='imagesArhid/roof/scene311.jpg' style='max-width: 100%; max-height: 80%'>"
        }
      ],
     "customHotspots": [
        {
          "type": 7,
          "yaw": 0.5159905422975193,
          "pitch": 0.2603234315856824,
          "rotation": 0,
          "target": "scene-53",
          "title": "Коридор 3 этажа левое крыло"
        },
        {
          "type": 7,
          "yaw": -1.4,
          "pitch": 0.5,
          "rotation": 0,
          "target": "scene-30",
          "title": "Переход на 3 этаж лестница 3"
        }

      ]
};

export default scene31;