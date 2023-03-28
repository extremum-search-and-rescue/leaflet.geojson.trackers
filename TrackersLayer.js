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
            marker.on('mouseover', function () {
                self._map.fire('gis:tooltip', {
                    message: `${feature.properties.name} ${feature.properties.localTime} точность ±${Math.round(feature.properties.hdop)} м.`,
                    sourceTarget: marker
                });
            });
            const backend = Gis.Site.BackendAddress();
            let popupContent = `${feature.properties.name} скачать трек: ` +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhY2tlcnNMYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRyYWNrZXJzTGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxDQUFDLENBaUZWO0FBakZELFdBQVUsQ0FBQztJQUlQLE1BQWEsbUJBQW1CO1FBQWhDO1lBQ0ksd0JBQW1CLEdBQVcsR0FBRyxDQUFBO1lBQ2pDLFVBQUssR0FBa0IsQ0FBQyxtQkFBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO1lBQ2xFLDJCQUFzQixHQUFXLEVBQUUsQ0FBQTtZQUNuQyxrQkFBYSxHQUFpSSxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQTtRQUMvSyxDQUFDO0tBQUE7SUFMWSxxQkFBbUIsc0JBSy9CLENBQUE7SUFFRCxNQUFhLGFBQWMsU0FBUSxDQUFDLENBQUMsWUFBWTtRQUc3QyxZQUFZLEdBQVcsRUFBRSxPQUErQjtZQUNwRCxPQUFPLG1DQUFTLElBQUksbUJBQW1CLEVBQUUsR0FBSyxPQUFPLENBQUUsQ0FBQztZQUN4RCxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFUSxTQUFTLENBQUMsR0FBVTtZQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2RCxDQUFDLENBQUMs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