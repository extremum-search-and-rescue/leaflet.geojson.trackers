const TrackersMarker = L.CircleMarker.extend({
    _loadImage: function (name) {
        const colors = [
            '#FF0804',
            '#FF9104',
            '#FFFA04',
            '#34FF04',
            '#04FCFF',
            '#0428FF',
            '#F704FF',
        ]
        
        const iconClassName = name || this.options.iconClassName;
        const parts = iconClassName.split(':');
        const fillColor = colors[parts[1] - 1];
        const strokeColor = parts[2] === 'light' ? 'black' : 'white';
        const shadowColor = parts[2] === 'light' ? 'white' : 'black';
        if(ImageCache[iconClassName]) return;

        const isArrow = parts[0] === 'gis-trackers-arrow';
        ImageCache[iconClassName] = new Image(18,18);
        
        let blob = new Blob([
            isArrow
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><path fill="${fillColor}" stroke="${strokeColor}" d="M.7 15.5L6 1.5l5.3 14H.7Z" width="12" height="16"/></svg>` :
                `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><path fill="${fillColor}" stroke="${strokeColor}" d="M10.46 5.36l3.29 3.14H3.5v-7h10.25l-3.3 3.14-.38.36.39.36z"/><path fill="${shadowColor}" d="M4 9h11l1 1H4V9z" /><path fill="${shadowColor}" d="M4 10h1v6H4zM4 2h8.5l-1.06 1H4V2zM4 3h1v5H4z"/><path stroke="${strokeColor}" d="M3.5 1v15" /></svg>`
        ],
            { type: "image/svg+xml" });
        ImageCache[iconClassName].src = URL.createObjectURL(blob);
        ImageCache[iconClassName].onload = function() {
            URL.revokeObjectURL(ImageCache[iconClassName].src);
            if (this._map) {
			     this._renderer._updatePath(this);
            }
        };
    },
    onAdd: function(map){
        L.CircleMarker.prototype.onAdd.call(this, map);
        this._map = map;
        const theme = this._map.options.baseLayerTheme;
        this._loadImage(`${this.options.iconClassName}:${theme}`);
    },
    getRadius: function(){
        return this._radius;
    },

    _updatePath: function () {
        if(!this._map) return;
        if(!this._renderer._bounds.intersects(this._pxBounds)) return;
        const theme = this._map.options.baseLayerTheme;
        const iconClassName = this.options.iconClassName;
        const icon = ImageCache[`${iconClassName}:${theme}`];
        if(!icon) return;

        const zoom = this._map.getZoom();
        const p = this._point.round();

        this._renderer._ctx.save();
        this._renderer._ctx.translate(p.x,p.y);
        const timeFmt = this.feature.properties.timeFmt;

        if(zoom>=12) {
            let text = zoom<14
                ? this.feature.properties.name
                : `${this.feature.properties.name} ${timeFmt}`;
            
            if(text) {
                this._renderer._ctx.fillStyle = theme === 'dark' ? 'white' : 'black';
                this._renderer._ctx.fillText(text,icon.width/2, 4);
            }
        }
        this._renderer._ctx.rotate(this.feature.properties.direction * Math.PI / 180);
        this._renderer._ctx.drawImage(icon, - icon.width / 2, - icon.height / 2, icon.width, icon.height);
        this._renderer._ctx.restore();
    },
});
L.trackersMarker = function(latlng, options) {
    return new TrackersMarker(latlng, options);
}

const TrackersLayer = L.GeoJsonLayer.extend({
    options: {
        arrowTimeoutSeconds: 600,
        icons: ['gis-trackers-flag', 'gis-trackers-arrow'],
        refreshIntervalSeconds: 15,
    },
    _base: null,
    afterInit: function(map) {
        const icons = this.options.icons;
        for (let i = 0; i < icons.length; i++) {
            for (let c = 0; c < 7; c++) { 
                L.trackersMarker()._loadImage(`${icons[i]}:${c}:dark`);
                L.trackersMarker()._loadImage(`${icons[i]}:${c}:light`);
            }
        }
    },
    onEachFeature: function (feature, layer) {
        if(feature.geometry.type === 'LineString')
        {
            layer.options.color = feature.properties.color;
        }
    },
    pointToLayer: function (feature, latlng) {
      //  const expiresAt = new Date() - this.options.arrowTimeoutSeconds * 1000;
        const expiresAt = new Date() - 600 * 1000;
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
            map.fire('gis:tooltip', {
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
});

L.trackersLayer = function (url, options) {
    return new TrackersLayer(url, options);
};