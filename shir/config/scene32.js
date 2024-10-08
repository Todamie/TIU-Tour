const scene32 = {
      "id": "scene-32",
      "name": "Лестница переход",
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
        "yaw": -0.41228929732507247,
        "pitch": -0.07330119041115957,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": [],
     "customHotspots": [
        {
          "type": 7,
          "yaw": -0.17076354513555891,
          "pitch": 0.5353032778156646,
          "rotation": 0,
          "target": "scene-33",
          "title": "Лестница 1 этаж"
        },
        {
          "type": 7,
          "yaw": 0.19278476160514657,
          "pitch": -0.056840694339106435,
          "rotation": 0,
          "target": "scene-31",
          "title": "Лестница 2 этаж"
        }
      ]
};

export default scene32;