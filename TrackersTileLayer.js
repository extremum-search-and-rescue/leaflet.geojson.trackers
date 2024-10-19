var L;
(function (L) {
    class TrackersTileLayer extends L.TileGeoJSON {
        constructor(url, options, geojsonOptions) {
            geojsonOptions = Object.assign({
                refreshIntervalSeconds: 15,
                onEachFeature: L.TrackersLayer.onEachFeature,
            }, geojsonOptions);
            function f(tileUrl, opts) {
                return new L.TrackersLayer(tileUrl, opts);
            }
            super(url, options, geojsonOptions, f);
        }
        onAdd(map) {
            super.onAdd(map);
            return this;
        }
        refresh() {
            super.redraw();
        }
        onThemeChanged(data) {
        }
    }
    L.TrackersTileLayer = TrackersTileLayer;
    function trackersTileLayer(url, options, geojsonOptions) {
        return new L.TrackersTileLayer(url, options, geojsonOptions);
    }
    L.trackersTileLayer = trackersTileLayer;
})(L || (L = {}));
//# sourceMappingURL=TrackersTileLayer.js.map