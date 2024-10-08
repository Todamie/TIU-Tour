/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

new window['WebXRPolyfill']();
var mat4 = Marzipano.dependencies.glMatrix.mat4;
var viewLeft = null;
var viewRight = null;
var layerLeft = null;
var layerRight = null;

(function() {
  
  var enterVrElement = document.querySelector("#enter-vr");
  var noVrElement = document.querySelector("#no-vr");

  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Grab elements from DOM.
  var panoElement = document.querySelector('#pano');
  var sceneNameElement = document.querySelector('#titleBar .sceneName');
  var sceneListElement = document.querySelector('#sceneList');
  var sceneElements = document.querySelectorAll('#sceneList .scene');
  var sceneListToggleElement = document.querySelector('#sceneListToggle');
  var autorotateToggleElement = document.querySelector('#autorotateToggle');
  var fullscreenToggleElement = document.querySelector('#fullscreenToggle');

  let xrSession = null;
  let xrRefSpace = null;
  // WebGL scene globals.
  let gl = null;
  let xr = navigator.xr;
  var stage = new Marzipano.WebGlStage({ xrCompatible: true });
  panoElement.appendChild(stage.domElement());
  Marzipano.registerDefaultRenderers(stage);

  function updateSize() {
    let canvas = document.getElementsByTagName('canvas')[0];
      stage.setSize({
          width: canvas.clientWidth * window.devicePixelRatio,
          height: canvas.clientHeight * window.devicePixelRatio
      });
  }
  updateSize();
  window.addEventListener('resize', updateSize);


  // Detect desktop or mobile mode.
  if (window.matchMedia) {
    var setMode = function() {
      if (mql.matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
    setMode();
    mql.addListener(setMode);
  } else {
    document.body.classList.add('desktop');
  }

  // Detect whether we are on a touch device.
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  // Use tooltip fallback mode on IE < 11.
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // Viewer options.
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  // Initialize viewer.
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

  // Create scenes.
  var scenes = data.scenes.map(function(data) {
    var urlPrefix = "tiles";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
    var geometry = new Marzipano.CubeGeometry(data.levels);

    var limiter = Marzipano.RectilinearView.limit.traditional(3 * data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

    viewLeft = new WebVrView();
    viewRight = new WebVrView();

    layerLeft = createLayer(stage, viewLeft, geometry, 'left', source);
    layerRight = createLayer(stage, viewRight, geometry, 'right', source);

    stage.addLayer(layerLeft);
    stage.addLayer(layerRight);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    // Create link hotspots.
    data.linkHotspots.forEach(function(hotspot) {
      var element = createLinkHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create info hotspots for images.
    data.infoHotspots.forEach(function(hotspot) {
      var element = createInfoHotspotElement(hotspot);

     if (hotspot.text.includes("<img")) {
    element.classList.add("image-hotspot");
    }
    // Create info hotspots for video.
    if (hotspot.text.includes("<video")) {
    element.classList.add("video-hotspot");
    }

      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create custom hotspots.
    //if(data.customHotspots) {
      data.customHotspots.forEach(function(hotspot) {
        var element = createCustomHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });
    //}

    // Create info hotspots for video.
    /*data.infoHotspots.forEach(function(hotspot) {
      var element = createInfoHotspotElement(hotspot);
    if (hotspot.text.includes("<video")) {
    element.classList.add("video-hotspot");
    }

      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });*/

    // Create info-images hotspots.
    /*data.infoHotspots.forEach(function(hotspot) {
      var element = createInfoHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });*/



    /*// Create video hotspots.
    if(data.frameHotspots) {
      data.frameHotspots.forEach(function(hotspot) {
        var element = createFrameHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch }, { perspective: { radius: hotspot.radius, extraTransforms: `rotateX(${hotspot.rotateX ?? 0}deg) rotateY(${hotspot.rotateY ?? 0}deg) rotateZ(${hotspot.rotateZ ?? 0}deg)` }});
      });
    }*/

    return {
      data: data,
      scene: scene,
      view: view
    };
  });

  // Set up autorotate, if enabled.
  var autorotate = Marzipano.autorotate({
    yawSpeed: 0.1,
    targetPitch: 0,
    targetFov: Math.PI/2
  });
  if (data.settings.autorotateEnabled) {
    autorotateToggleElement.classList.add('enabled');
  }

  // Set handler for autorotate toggle.
  autorotateToggleElement.addEventListener('click', toggleAutorotate);

  // Set up fullscreen mode, if supported.
  if (screenfull.enabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    fullscreenToggleElement.addEventListener('click', function() {
      screenfull.toggle();
    });
    screenfull.on('change', function() {
      if (screenfull.isFullscreen) {
        fullscreenToggleElement.classList.add('enabled');
      } else {
        fullscreenToggleElement.classList.remove('enabled');
      }
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // Set handler for scene list toggle.
  sceneListToggleElement.addEventListener('click', toggleSceneList);

  // Start with the scene list open on desktop.
  // if (!document.body.classList.contains('mobile')) {
  //   showSceneList();
  // }

  // Set handler for scene switch.
  scenes.forEach(function(scene) {
    var el = document.querySelector('#sceneList .scene[data-id="' + scene.data.id + '"]');
    el.addEventListener('click', function() {
      switchScene(scene);
      // On mobile, hide scene list after selecting a scene.
      if (document.body.classList.contains('mobile')) {
        hideSceneList();
      }
    });
  });

  // DOM elements for view controls.
  var viewUpElement = document.querySelector('#viewUp');
  var viewDownElement = document.querySelector('#viewDown');
  var viewLeftElement = document.querySelector('#viewLeft');
  var viewRightElement = document.querySelector('#viewRight');
  var viewInElement = document.querySelector('#viewIn');
  var viewOutElement = document.querySelector('#viewOut');

  // Dynamic parameters for controls.
  var velocity = 0.2;
  var friction = 3;

  // Associate view controls with elements.
  var deviceOrientationControlMethod = new DeviceOrientationControlMethod();
  var controls = viewer.controls();
  controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(viewUpElement,     'y', -velocity, friction), true);
  controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(viewDownElement,   'y',  velocity, friction), true);
  controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(viewLeftElement,   'x', -velocity, friction), true);
  controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement,  'x',  velocity, friction), true);
  controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(viewInElement,  'zoom', -velocity, friction), true);
  controls.registerMethod('outElement',   new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom',  velocity, friction), true);
  controls.registerMethod('deviceOrientation',   deviceOrientationControlMethod);

  function sanitize(s) {
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  }

  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    updateSceneName(scene);
    updateSceneList(scene);
    updateButtonColor(scene);
  }

  function updateSceneName(scene) {
    sceneNameElement.innerHTML = sanitize(scene.data.name);
  }

  function updateSceneList(scene) {
    for (var i = 0; i < sceneElements.length; i++) {
      var el = sceneElements[i];
      //var bl = buttonsElements[i];
      if (el.getAttribute('data-id') === scene.data.id) {
        el.classList.add('current');
        //bl.classList.add('current');
      } else {
        el.classList.remove('current');
        //buttonsElements[i].classList.remove('current');
      }
    }
  }

  function updateButtonColor(scene) {
    var buttons = document.querySelectorAll('.custom-button');
    buttons.forEach(function(button) {
        var buttonIds = button.getAttribute('data-id').split(' '); // Разделение строки data-id по пробелам
        if (buttonIds.includes(scene.data.id)) { // Проверка, содержит ли массив идентификаторов кнопки идентификатор сцены
            button.classList.add('current');
        } else {
            button.classList.remove('current');
        }
    });
}



  function showSceneList() {
    sceneListElement.classList.add('enabled');
    sceneListToggleElement.classList.add('enabled');
  }

  function hideSceneList() {
    sceneListElement.classList.remove('enabled');
    sceneListToggleElement.classList.remove('enabled');
  }

  function toggleSceneList() {
    sceneListElement.classList.toggle('enabled');
    sceneListToggleElement.classList.toggle('enabled');
  }

  function startAutorotate() {
    if (!autorotateToggleElement.classList.contains('enabled')) {
      return;
    }
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function toggleAutorotate() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    } else {
      autorotateToggleElement.classList.add('enabled');
      startAutorotate();
    }
  }

  function createLinkHotspotElement(hotspot) {

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    // Create image element.
    var icon = document.createElement('img');
    icon.src = 'images/link.png';
    icon.classList.add('link-hotspot-icon');

    // Set rotation transform.
    var transformProperties = [ '-ms-transform', '-webkit-transform', 'transform' ];
    for (var i = 0; i < transformProperties.length; i++) {
      var property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    var tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot) {

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    // Create hotspot/tooltip header.
    var header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    // Create image element.
    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    var icon = document.createElement('img');
    icon.src = '../img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    // Create title element.
    var titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    var title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    // Create close element.
    var closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    var closeIcon = document.createElement('img');
    closeIcon.src = '../img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    // Construct header element.
    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    // Create text element.
    var text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    // Place header and text into wrapper element.
    wrapper.appendChild(header);
    wrapper.appendChild(text);

    // Create a modal for the hotspot content to appear on mobile mode.
    var modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    var toggle = function() {
        wrapper.classList.toggle('visible');
        modal.classList.toggle('visible');

        var videoWrapper = wrapper.querySelector('video');
        var videoModal = modal.querySelector('video');
        var video = videoWrapper || videoModal;

        if (video) {
            videoModal.pause();
            videoWrapper.pause();
        }
    };

    // Show content when hotspot is clicked.
    wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

    // Hide content when close icon is clicked.
    modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  function createCustomHotspotElement(hotspot) {
  //console.log(hotspot.type);
    var wrapper = document.createElement('div');

    switch (hotspot.type) {
      case 1:
        wrapper.setAttribute("id", "expand");
        wrapper.innerHTML = `
            <div class="title">${hotspot.title}</div>
            <img class="icon" src="../img/human.png" >
            <p>${hotspot.text}</p>
          `;
        break;
      case 2:
        wrapper.setAttribute("id", "textInfo");
        wrapper.innerHTML = `
            <div class="hotspot">
              <div class="out"></div>
              <div class="in"></div>
            </div>
            <div class="tooltip-content">
              <p>${hotspot.text}</p>
            </div>
          `;
        break;
      case 3:
        wrapper.setAttribute("id", "reveal");
        wrapper.innerHTML = `
            <img src="images/photo.png">
            <div class="reveal-content">
              <img src="${hotspot.image}">
              <p>${hotspot.text}</p>
            </div>
          `;
        break;
      case 4:
        wrapper.setAttribute("id", "rotate-hotspot");
        wrapper.innerHTML = `
            <div class="rotate-img"></div>
            <div class="rotate-content">
              <h1>${hotspot.title}</h1>
              <p>${hotspot.text}</p>
            </div>
          `;
        break;
      case 5:
        wrapper.setAttribute("id", "info");
        wrapper.innerHTML = `
            <div class="icon_wrapper" onclick="this.parentElement.classList.toggle('expanded')">
              <div class="icon">
                <div id="inner_icon" class="inner_icon">
                  <div class="icon1"></div>
                  <div class="icon2"></div>
                </div>
              </div>
            </div>
            <div class="tip">
              <p>${hotspot.title}</p>
            </div>
            <div class="content">
            <div class="image-wrapper">
              <img src="${hotspot.image}">
            </div>
              <div class="content-form">
                <p>${hotspot.text}</p>
                <div>
                  <input id="text" type="text" placeholder="Поле ввода">
                </div>
                <p>${hotspot.subtext}</p>
              </div>
              <div class="button_wrapper">
                <button class="close" onclick="this.closest('#info').classList.toggle('expanded')">Закрыть</button>
              </div>
            </div>
          `;
        break;
      case 6:
        wrapper.setAttribute("id", "tooltip");
        wrapper.innerHTML = `
            <div class="out">
              <div class="in">
                <div class="image"></div>
              </div>
            </div>
            <div class="tip">
              <p>${hotspot.title}</p>
              <img src="${hotspot.image}">
            </div>
          `;
        break;
      case 7:
        wrapper.setAttribute("id", "hintspot");
        wrapper.setAttribute("data-hint", hotspot.title);
        wrapper.classList.add('hint--right', 'hint--info', 'hint--bounce');
        wrapper.innerHTML = `
            <a target="_blank">
              <img src="../img/hotspot.png" >
            </a>
          `;
        wrapper.addEventListener('click', function() {
          switchScene(findSceneById(hotspot.target));
        });
        break;
      default:
        break;
    }
    return wrapper;
  }

  function createFrameHotspotElement(hotspot) {
    var wrapper = document.createElement('div');
    wrapper.setAttribute("id", "iframespot");

    switch (hotspot.type) {
      case 1:
        if(hotspot.icon) {
          wrapper.classList.add('iframespot-icon');
          wrapper.innerHTML = `<img class="icon" src="images/y-icon.png">`;

          var modal = document.createElement('div');
          modal.innerHTML = `<iframe id="youtube" src="https://www.youtube.com/embed/${hotspot.url}?autoplay=0&autohide=1&controls=1&loop=0&modestbranding=0&rel=0&showinfo=0&hd=1&vq=hd720" frameborder="0" allowfullscreen></iframe>`;
          modal.classList.add('iframespot-modal');
          document.body.appendChild(modal);

          var toggle = function() {
            modal.classList.toggle('visible');
          };
          wrapper.addEventListener('click', toggle);
          modal.addEventListener('click', toggle);
        } else {
          wrapper.innerHTML = `<iframe id="youtube" width="${hotspot.width}" height="${hotspot.height ?? '320'}" src="https://www.youtube.com/embed/${hotspot.url}?rel=0&amp;controls=0&amp;showinfo=0&amp;" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
      case 2:
        wrapper.innerHTML = `
          <video
            class="video-js vjs-big-play-centered"
            controls
            preload="auto"
            poster="${hotspot.posterurl}"
            data-setup="{}"
          >
            <source src="${hotspot.videourl.split('|')[0]}" type="video/mp4" />
            <source src="${hotspot.videourl.split('|')[1]}" type="video/webm" />
          </video>
        `;
        break;
      case 3:
        wrapper.innerHTML = `<iframe width="${hotspot.width}" height="${hotspot.height ?? '320'}" src="https://yandex.ru/map-widget/v1/-/CBB2U4SioC" frameborder="1" allowfullscreen="true" style="position:relative;"></iframe>`;
        break;
      case 4:
          if(hotspot.icon) {
            wrapper.classList.add('iframespot-icon');
            wrapper.innerHTML = `<img class="icon" src="../img/r-icon.png">`;

            var modal = document.createElement('div');
            modal.innerHTML = `<iframe id="youtube" class="video-modal" src="//rutube.ru/play/embed/${hotspot.url}?bmstart=0&quality=1&platform=someplatform" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowfullscreen></iframe>`;
            modal.classList.add('iframespot-modal');
            document.body.appendChild(modal);

            var toggle = function() {
              modal.classList.toggle('visible');
              if(!modal.classList.contains('visible')) {
                var player = modal.querySelector('.video-modal');
                  player.contentWindow.postMessage(JSON.stringify({
                      type: 'player:pause',
                      data: {}
                  }),
                '*');
              }
            };
            wrapper.addEventListener('click', toggle);
            modal.addEventListener('click', toggle);
          } else {
            wrapper.innerHTML = `<iframe id="youtube" width="${hotspot.width}" height="${hotspot.height ?? '320'}" src="https://www.youtube.com/embed/${hotspot.url}?rel=0&amp;controls=0&amp;showinfo=0&amp;" frameborder="0" allowfullscreen></iframe>`;
          }
          break;
      default:
        break;
    }

    return wrapper;
  }

  // Prevent touch and scroll events from reaching the parent element.
  function stopTouchAndScrollEventPropagation(element, eventList) {
    var eventList = [ 'touchstart', 'touchmove', 'touchend', 'touchcancel',
                      'wheel', 'mousewheel' ];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  }

  function findSceneById(id) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  function findSceneDataById(id) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }

  // Display the initial scene.
  switchScene(scenes[0]);

  // GYROSCOPE
  var enabled = false;
  var toggleElement = document.getElementById('toggleDeviceOrientation');

  function requestPermissionForIOS() {
    window.DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          enableDeviceOrientation()
        }
      }).catch((e) => {
        console.error(e)
      })
  }

  function enableDeviceOrientation() {
    deviceOrientationControlMethod.getPitch(function (err, pitch) {
      if (!err) {
        scenes[0].view.setPitch(pitch);
      }
    });
    controls.enableMethod('deviceOrientation');
    enabled = true;
    toggleElement.className = 'enabled';
  }

  function enable() {
    if (window.DeviceOrientationEvent) {
      if (typeof (window.DeviceOrientationEvent.requestPermission) == 'function') {
        requestPermissionForIOS()
      } else {
        enableDeviceOrientation()
      }
    }
  }

  function disable() {
    controls.disableMethod('deviceOrientation');
    enabled = false;
    toggleElement.className = '';
  }

  function toggle() {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  }

  function initXR() {
    console.log('xr')
    // Is WebXR available on this UA?
    if (xr) {
        // If the device allows creation of exclusive sessions set it as the
        // target of the 'Enter XR' button.
        xr.isSessionSupported('immersive-vr').then((supported) => {
            if (supported) {
                // Updates the button to start an XR session when clicked.
                enterVrElement.addEventListener('click', onButtonClicked);
                enterVrElement.textContent = 'Войти в VR';
                enterVrElement.disabled = false;
                enterVrElement.style.display =  'block';
                noVrElement.style.display = 'none';
            }else{
                enterVrElement.style.display = 'none';
                noVrElement.style.display = 'block';
            }
        }).catch((error) => console.log(error));
    }
  }

  function onButtonClicked() {
    if (!xrSession) {
        xr.requestSession('immersive-vr').then(onSessionStarted);
    } else {
        xrSession.end();
    }
  }

  async function onSessionStarted(session) {
      xrSession = session;
      enterVrElement.textContent = 'Exit VR';

      // Listen for the sessions 'end' event so we can respond if the user
      // or UA ends the session for any reason.
      session.addEventListener('end', onSessionEnded);

      // Create a WebGL context to render with, initialized to be compatible
      // with the XRDisplay we're presenting to.
      gl = stage.webGlContext();
      if (!gl) return;
      await gl.makeXRCompatible();
      // Use the new WebGL context to create a XRWebGLLayer and set it as the
      // sessions baseLayer. This allows any content rendered to the layer to
      // be displayed on the XRDevice.
      session.updateRenderState({ baseLayer: new window['XRWebGLLayer'](session, gl) });

      // Get a reference space, which is required for querying poses. In this
      // case an 'local' reference space means that all poses will be relative
      // to the location where the XRDevice was first detected.
      session.requestReferenceSpace('local').then((refSpace) => {
          xrRefSpace = refSpace;

          // Inform the session that we're ready to begin drawing.
          session.requestAnimationFrame(onXRFrame);
      });
  }

  function onSessionEnded(event) {
      xrSession = null;
      enterVrElement.textContent = 'Войти в VR';

      // In this simple case discard the WebGL context too, since we're not
      // rendering anything else to the screen with it.
      gl = null;
  }

  function render() {
    var frameData = new VRFrameData;
    vrDisplay.getFrameData(frameData);
  
    // Update the view.
    // The panorama demo at https://github.com/toji/webvr.info/tree/master/samples
    // recommends computing the view matrix from `frameData.pose.orientation`
    // instead of using `frameData.{left,right}ViewMatrix.
    if (frameData.pose.orientation) {
      mat4.fromQuat(pose, frameData.pose.orientation);
      mat4.invert(pose, pose);
  
      mat4.copy(proj, frameData.leftProjectionMatrix);
      mat4.multiply(proj, proj, pose);
      viewLeft.setProjection(proj);
  
      mat4.copy(proj, frameData.rightProjectionMatrix);
      mat4.multiply(proj, proj, pose);
      viewRight.setProjection(proj);
    }
  
    // Render and submit to WebVR display.
    stage.render();
    vrDisplay.submitFrame();
  
    // Render again on the next frame.
    vrDisplay.requestAnimationFrame(render);
  }

  function onXRFrame(time, frame) {
    let session = frame.session;

    // Inform the session that we're ready for the next frame.
    session.requestAnimationFrame(onXRFrame);

    // Get the XRDevice pose relative to the reference space we created
    // earlier.
    let xrpose = frame.getViewerPose(xrRefSpace);

    // Getting the pose may fail if, for example, tracking is lost. So we
    // have to check to make sure that we got a valid pose before attempting
    // to render with it. If not in this case we'll just leave the
    // framebuffer cleared, so tracking loss means the scene will simply
    // disappear.
    if (xrpose) {
        let glLayer = session.renderState.baseLayer;

        if (!gl) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

        let { w, x, y, z } = xrpose.transform.inverse.orientation;
        mat4.fromQuat(pose, [x, y, z, w]);

        for (let view of xrpose.views) {
            let viewport = glLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            if (view.eye === 'left') {
                mat4.copy(proj, view.projectionMatrix);
                mat4.multiply(proj, proj, pose);
                viewLeft.setProjection(proj);
            }

            if (view.eye === 'right') {
                mat4.copy(proj, view.projectionMatrix);
                mat4.multiply(proj, proj, pose);
                viewRight.setProjection(proj);
            }
        }
        stage.render();
    }
  }
  function createLayer(stage, view, geometry, eye, source) {

      var textureStore = new Marzipano.TextureStore(source, stage);
      var layer = new Marzipano.Layer(source, geometry, view, textureStore);

      layer.pinFirstLevel();

      return layer;
  }

  var proj = mat4.create();
  var pose = mat4.create(); 

  initXR();

  toggleElement.addEventListener('click', toggle);

  if (!window.DeviceOrientationEvent) {
     toggleElement.style.display = 'none';
  }





})();















