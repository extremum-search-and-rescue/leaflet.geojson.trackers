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
            const theme = this._map.options.baseLayerTheme || "light";
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
            const theme = this._map.options.baseLayerTheme || "light";
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
})(L || (L = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhY2tlcnNNYXJrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUcmFja2Vyc01hcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLENBQUMsQ0F3RlY7QUF4RkQsV0FBVSxDQUFDO0lBSVAsTUFBYSxjQUFlLFNBQVEsQ0FBQyxDQUFDLFlBQVk7UUFPOUMsVUFBVSxDQUFDLElBQWE7WUFDcEIsTUFBTSxNQUFNLEdBQWtCO2dCQUMxQixTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2dCQUNULFNBQVM7Z0JBQ1QsU0FBUztnQkFDVCxTQUFTO2FBQ1osQ0FBQTtZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUN6RCxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDN0QsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDN0QsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDO2dCQUFFLE9BQU87WUFFdEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLG9CQUFvQixDQUFDO1lBQ2xELFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFOUMsSUFBSSxJQUFJLEdBQUcs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