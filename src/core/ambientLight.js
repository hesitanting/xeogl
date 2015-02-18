"use strict";

/**
 A light source of fixed intensity and color that affects all associated {{#crossLink "GameObject"}}GameObjects{{/crossLink}}
 equally.

 <ul>

 <li>AmbientLights are grouped, along with other light source types, within
 {{#crossLink "Lights"}}Lights{{/crossLink}} components, which are associated
 with {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.</li>

 <li>Within XEO Engine's Phong shading calculations, AmbientLight {{#crossLink "AmbientLight/ambient:property"}}ambient{{/crossLink}} is
 multiplied by {{#crossLink "Material"}}Material{{/crossLink}} {{#crossLink "Material/ambient:property"}}{{/crossLink}}.</li>

 <li>Ambient lighting may be toggled for specific {{#crossLink "GameObject"}}GameObjects{{/crossLink}} via
 the {{#crossLink "Modes/ambient:property"}}{{/crossLink}} property on associated {{#crossLink "Modes"}}{{/crossLink}} components.</li>

 </ul>

 <img src="http://www.gliffy.com/go/publish/image/7092465/L.png"></img>

 ### Example

 The example below creates a {{#crossLink "GameObject"}}{{/crossLink}} that has a {{#crossLink "Geometry"}}{{/crossLink}},
 a {{#crossLink "Material"}}{{/crossLink}}, and a {{#crossLink "Lights"}}{{/crossLink}} that has an {{#crossLink "AmbientLight"}}{{/crossLink}}.


 ```` javascript
 var scene = new XEO.Scene();

 var material = new XEO.Material(scene, {
    ambient: [0.3, 0.3, 0.3],
    diffuse: [1, 1, 1],
    specular: [1.1, 1],
    shininess: 30
 });

 // Within XEO Engine's lighting calculations, the AmbientLight's
 // ambient color will be multiplied by the Material's ambient color

 var ambientLight = new XEO.AmbientLight(scene, {
    ambient: [0.7, 0.7, 0.7]
 });

 var lights = new XEO.Lights(scene, {
    lights: [
        ambientLight
    ]
 });

 var geometry = new XEO.Geometry(scene);  // Defaults to a 2x2x2 box

 var object = new XEO.GameObject(scene, {
    lights: lights,
    material: material,
    geometry: geometry
});

 ````

 As with all components, we can observe and change properties on AmbientLights like so:

 ````Javascript

 var handle = ambientLight.on("ambient", // Attach a change listener to a property
 function(value) {
        // Property value has changed
    });

 ambientLight.ambient = [0.6, 0.6, 0.6]; // Fires the change listener

 ambientLight.off(handle); // Detach the change listener
 ````

 @class AmbientLight
 @module XEO
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}}, creates this AmbientLight within the
 default {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted
 @param [cfg] {*} AmbientLight configuration
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}}, generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this AmbientLight.
 @param [cfg.ambient=[0.7, 0.7, 0.8]] {Array(Number)} The color of this AmbientLight.
 @extends Component
 */
XEO.AmbientLight = XEO.Component.extend({

    className: "XEO.AmbientLight",

    type: "light",

    _init: function (cfg) {
        this.mode = "ambient";
        this.ambient = cfg.ambient;
    },

    /**
     The color of this AmbientLight.

     Fires an {{#crossLink "AmbientLight/ambient:event"}}{{/crossLink}} event on change.

     @property ambient
     @default [0.7, 0.7, 0.8]
     @type Array(Number)
     */
    set ambient(value) {
        value = value || [ 0.7, 0.7, 0.8 ];
        this._core.ambient = value;
        this._renderer.imageDirty = true;

        /**
         Fired whenever this AmbientLight's {{#crossLink "AmbientLight/ambient:property"}}{{/crossLink}} property changes.

         @event ambient
         @param value The property's new value
         */
        this.fire("ambient", value);
    },

    get ambient() {
        return this._core.ambient;
    },

    _getJSON: function () {
        return {
            color: this.color
        };
    }
});
