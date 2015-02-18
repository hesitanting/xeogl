"use strict";

/**
 A group of light sources to apply to associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 A Lights may contain a virtually unlimited number of three types of light source:

 <ul>
 <li>{{#crossLink "AmbientLight"}}AmbientLight{{/crossLink}}s, which are fixed-intensity and fixed-color, and
 affect all the {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally,</li>
 <li>{{#crossLink "PointLight"}}PointLight{{/crossLink}}s, which emit light that
 originates from a single point and spreads outward in all directions, and </li>
 <li>{{#crossLink "DirLight"}}DirLight{{/crossLink}}s, which illuminate all the
 {{#crossLink "GameObject"}}GameObjects{{/crossLink}} equally from a given direction</li>
 </ul>

 Within XEO Engine's <a href="http://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a> reflection model, the ambient,
 diffuse and specular components of light sources are multiplied by the
 {{#crossLink "Material/ambient:property"}}{{/crossLink}}, {{#crossLink "Material/diffuse:property"}}{{/crossLink}} and
 {{#crossLink "Material/specular:property"}}{{/crossLink}} properties on associated  {{#crossLink "Material"}}Materials{{/crossLink}}.


 <img src="http://www.gliffy.com/go/publish/image/7092459/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}{{/crossLink}} that has a {{#crossLink "Geometry"}}{{/crossLink}},
 a {{#crossLink "Material"}}{{/crossLink}} and a {{#crossLink "Lights"}}{{/crossLink}}. The {{#crossLink "Lights"}}{{/crossLink}}
 contains an {{#crossLink "AmbientLight"}}{{/crossLink}}, a {{#crossLink "DirLight"}}{{/crossLink}} and a {{#crossLink "PointLight"}}{{/crossLink}}.


 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient:    [0.3, 0.3, 0.3],
    diffuse:    [0.7, 0.7, 0.7],
    specular:   [1. 1, 1],
    shininess:  30
 });

 // Within XEO Engine's lighting calculations, the AmbientLight's ambient color
 // will be multiplied by the Material's ambient color, while the DirLight and PointLight's
 // diffuse and specular colors will be multiplied by the Material's diffuse and specular colors

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
 });

 var dirLight = new XEO.DirLight(scene, {
    dir:        [-1, -1, -1],
    diffuse:    [0.5, 0.7, 0.5],
    specular:   [1.0, 1.0, 1.0],
    space:      "view"
 });

 var pointLight = new XEO.PointLight(scene, {
        pos: [0, 100, 100],
        diffuse: [0.5, 0.7, 0.5],
        specular: [1.0, 1.0, 1.0],
        constantAttenuation: 0,
        linearAttenuation: 0,
        quadraticAttenuation: 0,
        space: "view"
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight,
        dirLight,
        pointLight
    ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
 });
 ````

 @class Lights
 @constructor
 @module XEO
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Lights in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Lights.
 @extends Component
 */
XEO.Lights = XEO.Component.extend({

    className: "XEO.Lights",

    type: "lights",

    _init: function (cfg) {

        this._lights = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        this.lights = cfg.lights;
    },

    set lights(value) {

        var light;

        // Unsubscribe from events on old lights        
        for (var i = 0, len = this._lights.length; i < len; i++) {
            light = this._lights[i];
            light.off(this._dirtySubs[i]);
            light.off(this._destroyedSubs[i]);
        }

        this._lights = [];
        this._dirtySubs = [];
        this._destroyedSubs = [];

        var lights = [];
        var self = this;

        for (var i = 0, len = value.length; i < len; i++) {

            light = value[i];

            if (XEO._isString(light)) {

                // ID given for light - find the light component

                var id = light;
                light = this.components[id];
                if (!light) {
                    this.error("Light not found for ID: '" + id + "'");
                    continue;
                }
            }

            if (light.type != "light") {
                this.error("Component is not a light: '" + light.id + "'");
                continue;
            }

            this._lights.push(light);

            this._dirtySubs.push(light.on("dirty",
                function () {
                    self.fire("dirty", true);
                }));

            this._destroyedSubs.push(light.on("destroyed",
                function () {
                    var id = this.id; // Light ID
                    for (var i = 0, len = self._lights.length; i < len; i++) {
                        if (self._lights[i].id == id) {
                            self._lights = self._lights.slice(i, i + 1);
                            self._dirtySubs = self._dirtySubs.slice(i, i + 1);
                            self._destroyedSubs = self._destroyedSubs.slice(i, i + 1);
                            self.fire("dirty", true);
                            self.fire("lights", self._lights);
                            return;
                        }
                    }
                }));

            lights.push(light);
        }

        this.fire("dirty", true);
        this.fire("lights", this._lights);
    },

    get lights() {
        return this._lights.slice(0, this._lights.length);
    },

    _compile: function () {
        var lights = [];
        for (var i = 0, len = this._lights.length; i < len; i++) {
            lights.push(this._lights[i]._core)
        }
        var core = {
            type: "lights",
            lights: lights,
            hash: this._makeHash(lights)
        };
        this._renderer.lights = core;
    },

    _makeHash: function (lights) {
        if (lights.length == 0) {
            return "";
        }
        var parts = [];
        var light;
        for (var i = 0, len = lights.length; i < len; i++) {
            light = lights[i];
            parts.push(light.mode);
            if (light.specular) {
                parts.push("s");
            }
            if (light.diffuse) {
                parts.push("d");
            }
            parts.push((light.space == "world") ? "w" : "v");
        }
        return parts.join("");
    },

    _getJSON: function () {
        var lightIds = [];
        for (var i = 0, len = this._lights.length; i < len; i++) {
            lightIds.push(this._lights[i].id);
        }
        return {
            lights: lightIds
        };
    }
});