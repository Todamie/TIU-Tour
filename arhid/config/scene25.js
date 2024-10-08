const scene25 = {
      "id": "scene-25",
      "name": "Конференц-зал",
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
        "yaw": 0.23817509208021903,
        "pitch": -0.02094395102393065,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": [
        {
          "yaw": 0.5,
          "pitch": 0.1,
          "title": "Американский госпиталь Красного Креста, 1919 г.",
          "text": "<video id='hospital' style='width: 100%; height: 80%' controls><source src='imagesArhid/conference/scene25.mp4' type='video/mp4'>"+
            "<source src='imagesArhid/conference/scene25.webm' type='video/webm'></video>"
        }
      ],
     "customHotspots": [
        {
          "type": 7,
          "yaw": -0.7239035184130618,
          "pitch": 0.24019145575036305,
          "rotation": 0,
          "target": "scene-24",
          "title": "Конференц-зал"
        },
        {
          "type": 7,
          "yaw": 0.866244390249765,
          "pitch": 0.2258006981209082,
          "rotation": 0,
          "target": "scene-26",
          "title": "Конференц-зал"
        }
      ]
};

export default scene25;