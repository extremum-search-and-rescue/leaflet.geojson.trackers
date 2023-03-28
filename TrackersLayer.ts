namespace L { 
    export interface TrackersLayerOptions extends L.GeoJsonLayerOptions {
        arrowTimeoutSeconds?: number
    }
    export class TrackerLayerOptions implements TrackerLayerOptions {
        arrowTimeoutSeconds: number = 600
        icons: Array<string> = ['gis-trackers-flag', 'gis-trackers-arrow']
        refreshIntervalSeconds: number = 15
        onEachFeature: (feature: GeoJSON.Feature<GeoJSON.Geometry, any>, layer: L.Polyline | L.TrackersMarker, parentLayer: L.TrackersLayer)=> void = L.TrackersLayer.onEachFeature
    }

    export class TrackersLayer extends L.GeoJsonLayer {
        override options: TrackersLayerOptions;
        _base: null
        constructor(url: string, options: L.TrackersLayerOptions) {
            options = { ... new TrackerLayerOptions(), ...options };
            super(url, options);
        }

        override afterInit(map: L.Map) {
            this._map = map;
            const icons = this.options.icons;
            for (let i = 0; i < icons.length; i++) {
                for (let c = 0; c < 7; c++) { 
                    L.trackersMarker()._loadImage(`${icons[i]}:${c}:dark`);
                    L.trackersMarker()._loadImage(`${icons[i]}:${c}:light`);
                }
            }
        }
        static onEachFeature (feature: GeoJSON.Feature<GeoJSON.Geometry,any>, layer: L.Polyline | L.TrackersMarker, parentLayer: L.TrackersLayer) {
            if(feature.geometry.type === 'LineString')
            {
                layer.options.color = feature.properties.color;
            }
        }
        pointToLayer (this: L.TrackersLayer, feature: GeoJSON.Feature<GeoJSON.Point,any>, latlng: L.LatLng) {
          //  const expiresAt = new Date() - this.options.arrowTimeoutSeconds * 1000;
            const self = this;
            const expiresAt = new Date().valueOf() - 600 * 1000;
            const isArrow = feature.properties.direction && (feature.properties.timestamp > expiresAt);
            const iconClassName = isArrow
                ? 'gis-trackers-arrow'
                : 'gis-trackers-flag';
            if (!isArrow) delete feature.properties.direction;

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
                })
            });
            const backend = Gis.Site.BackendAddress();
            let popupContent = `${feature.properties.name} скачать трек: ` +
                `<br/><a href="${backend}/v2/other/onlinemonitor/exporttrackasgpx/${feature.properties.id}.gpx">отображаемый</a>` +
                `<br/><a href="${backend}/v2/other/onlinemonitor/exportrawtrackasgpx/${feature.properties.id}.gpx">исходный</a>`

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

    export function trackersLayer (url: string, options: L.TrackersLayerOptions) {
        return new L.TrackersLayer(url, options);
    }
}