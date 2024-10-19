var L;
(function (L) {
    class TrackerLayerOptions {
        constructor() {
            this.arrowTimeoutSeconds = 600;
            this.icons = ['gis-trackers-flag', 'gis-trackers-arrow'];
            this.refreshIntervalSeconds = 15;
            this.onEachFeature = L.TrackersLayer.onEachFeature;
        }
    }
    L.TrackerLayerOptions = TrackerLayerOptions;
    class TrackersLayer extends L.GeoJsonLayer {
        constructor(url, options) {
            options = Object.assign(Object.assign({}, new TrackerLayerOptions()), options);
            super(url, options);
        }
        afterInit(map) {
            this._map = map;
            const icons = this.options.icons;
            for (let i = 0; i < icons.length; i++) {
                for (let c = 0; c < 7; c++) {
                    L.trackersMarker()._loadImage(`${icons[i]}:${c}:dark`);
                    L.trackersMarker()._loadImage(`${icons[i]}:${c}:light`);
                }
            }
        }
        static onEachFeature(feature, layer, parentLayer) {
            if (feature.geometry.type === 'LineString') {
                layer.options.color = feature.properties.color;
            }
        }
        pointToLayer(feature, latlng) {
            const self = this;
            const expiresAt = new Date().valueOf() - 600 * 1000;
            const isArrow = feature.properties.direction && (feature.properties.timestamp > expiresAt);
            const iconClassName = isArrow
                ? 'gis-trackers-arrow'
                : 'gis-trackers-flag';
            if (!isArrow)
                delete feature.properties.direction;
            const radius = Math.min(feature.properties.hdop || 0, 10000);
            const marker = L.trackersMarker(latlng, {
                iconClassName: `${iconClassName}:${feature.properties.colorId}`,
            });
            marker.feature = feature;
            marker.feature.properties.timeFmt = feature.properties.localTime;
            const batteryMsg = feature.properties.battery ? ` ${Math.round(feature.properties.battery)}%` : "";
            const sourceMsg = feature.properties.source ? ` (${feature.properties.source}${batteryMsg})` : "";
            marker.on('mouseover', function () {
                const hdopMsg = feature.properties.hdop ? ` точность ±${Math.round(feature.properties.hdop)} м.` : "";
                const msg = `${feature.properties.name}${sourceMsg} ${feature.properties.localTime}${hdopMsg}`;
                self._map.fire('gis:tooltip', {
                    message: msg,
                    sourceTarget: marker
                });
            });
            const backend = Gis.Site.BackendAddress();
            const popupContent = `${feature.properties.name}${feature.properties.source ? ` (${feature.properties.source})` : ""} скачать трек: ` +
                `<br/><a href="${backend}/v2/other/onlinemonitor/exporttrackasgpx/${feature.properties.id}.gpx">отображаемый</a>` +
                `<br/><a href="${backend}/v2/other/onlinemonitor/exportrawtrackasgpx/${feature.properties.id}.gpx">исходный</a>`;
            marker.bindPopup(L.popup().setContent(popupContent));
            const circle = L.circle(latlng, {
                interactive: false,
                bubblingMouseEvents: false,
                radius: Math.round(radius),
                color: feature.properties.color,
                fillColor: feature.properties.color,
                fillOpacity: 0.05,
                weight: 1
            });
            return L.layerGroup([circle, marker]);
        }
    }
    L.TrackersLayer = TrackersLayer;
    function trackersLayer(url, options) {
        return new L.TrackersLayer(url, options);
    }
    L.trackersLayer = trackersLayer;
})(L || (L = {}));
//# sourceMappingURL=TrackersLayer.js.map