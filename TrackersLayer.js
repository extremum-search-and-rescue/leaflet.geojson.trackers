var L;
(function (L) {
    class TrackersMarker extends L.CircleMarker {
        _loadImage(name) {
            const colors = [
                '#FF0804',
                '#FF9104',
                '#FFFA04',
                '#34FF04',
                '#04FCFF',
                '#0428FF',
                '#F704FF',
            ];
            const iconClassName = name || this.options.iconClassName;
            const parts = iconClassName.split(':');
            const fillColor = colors[parseInt(parts[1]) - 1];
            const strokeColor = parts[2] === 'light' ? 'black' : 'white';
            const shadowColor = parts[2] === 'light' ? 'white' : 'black';
            if (ImageCache[iconClassName])
                return;
            const isArrow = parts[0] === 'gis-trackers-arrow';
            ImageCache[iconClassName] = new Image(18, 18);
            let blob = new Blob([
                isArrow
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><path fill="${fillColor}" stroke="${strokeColor}" d="M.7 15.5L6 1.5l5.3 14H.7Z" width="12" height="16"/></svg>` :
                    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><path fill="${fillColor}" stroke="${strokeColor}" d="M10.46 5.36l3.29 3.14H3.5v-7h10.25l-3.3 3.14-.38.36.39.36z"/><path fill="${shadowColor}" d="M4 9h11l1 1H4V9z" /><path fill="${shadowColor}" d="M4 10h1v6H4zM4 2h8.5l-1.06 1H4V2zM4 3h1v5H4z"/><path stroke="${strokeColor}" d="M3.5 1v15" /></svg>`
            ], { type: "image/svg+xml" });
            ImageCache[iconClassName].src = URL.createObjectURL(blob);
            ImageCache[iconClassName].onload = function () {
                URL.revokeObjectURL(ImageCache[iconClassName].src);
            };
        }
        onAdd(map) {
            super.onAdd(map);
            this._map = map;
            this._renderer = map.getRenderer(this);
            const theme = this._map.options.baseLayerTheme;
            this._loadImage(`${this.options.iconClassName}:${theme}`);
            return this;
        }
        getRadius() {
            return this._radius;
        }
        _updatePath() {
            if (!this._map)
                return;
            if (!this._renderer._bounds.intersects(this._pxBounds))
                return;
            const theme = this._map.options.baseLayerTheme;
            const iconClassName = this.options.iconClassName;
            const icon = ImageCache[`${iconClassName}:${theme}`];
            if (!icon)
                return;
            const zoom = this._map.getZoom();
            const p = this._point.round();
            this._renderer._ctx.save();
            this._renderer._ctx.translate(p.x, p.y);
            const timeFmt = this.feature.properties.timeFmt;
            if (zoom >= 12) {
                let text = zoom < 14
                    ? this.feature.properties.name
                    : `${this.feature.properties.name} ${timeFmt}`;
                if (text) {
                    this._renderer._ctx.fillStyle = theme === 'dark' ? 'white' : 'black';
                    this._renderer._ctx.fillText(text, icon.width / 2, 4);
                }
            }
            this._renderer._ctx.rotate(this.feature.properties.direction * Math.PI / 180);
            this._renderer._ctx.drawImage(icon, -icon.width / 2, -icon.height / 2, icon.width, icon.height);
            this._renderer._ctx.restore();
        }
    }
    L.TrackersMarker = TrackersMarker;
    function trackersMarker(latlng, options) {
        return new L.TrackersMarker(latlng, options);
    }
    L.trackersMarker = trackersMarker;
    class TrackersLayer extends L.GeoJsonLayer {
        constructor() {
            super(...arguments);
            this.options = {
                arrowTimeoutSeconds: 600,
                icons: ['gis-trackers-flag', 'gis-trackers-arrow'],
                refreshIntervalSeconds: 15,
                onEachFeature: L.TrackersLayer.onEachFeature
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhY2tlcnNMYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRyYWNrZXJzTGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxDQUFDLENBbUtWO0FBbktELFdBQVUsQ0FBQztJQUlQLE1BQWEsY0FBZSxTQUFRLENBQUMsQ0FBQyxZQUFZO1FBTzlDLFVBQVUsQ0FBRSxJQUFhO1lBQ3JCLE1BQU0sTUFBTSxHQUFrQjtnQkFDMUIsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUzthQUNaLENBQUE7WUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDekQsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzdELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzdELElBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztnQkFBRSxPQUFPO1lBRXJDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxvQkFBb0IsQ0FBQztZQUNsRCxVQUFVLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTdDLElBQUksSUFBSSxHQUFHLElB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