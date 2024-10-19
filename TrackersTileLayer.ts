namespace L {
    export class TrackersTileLayer extends L.TileGeoJSON<L.Point, L.TrackersLayer> {
        constructor(url: string, options: any, geojsonOptions?: L.GeoJSONOptions & { renderer: L.Renderer }) {
            geojsonOptions = {
                ...{
                    refreshIntervalSeconds: 15,
                    onEachFeature: L.TrackersLayer.onEachFeature,
                }, ...geojsonOptions
            }
            function f(tileUrl: string, opts: L.GeoJsonLayerOptions) {
                return new L.TrackersLayer(tileUrl, opts);
            }
            super(url, options, geojsonOptions, f);
        }

        override onAdd(map: L.Map & Object): this {
            super.onAdd(map);
         
            return this;
        }
        refresh() {
            super.redraw();
        }


        onThemeChanged(data: { new: L.MapContainerTheme, old?: L.MapContainerTheme }): void {

        }
    }

    export function trackersTileLayer(url: string, options: any, geojsonOptions?: L.GeoJSONOptions & { renderer: L.Renderer }) {
        return new L.TrackersTileLayer(url, options, geojsonOptions);
    }
}